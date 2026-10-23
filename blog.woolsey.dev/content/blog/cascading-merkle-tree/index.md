+++
authors = ["Eric Woolsey"]
title = "The Cascading Merkle Tree"
description = "A dense, growable, fixed-depth Merkle tree that never moves its data."
draft = false
date = 2026-10-22

[taxonomies]
tags = ["Data Structures", "Merkle Trees", "Rust"]

[extra]
styles = ["css/cascading-merkle-tree.css"]
scripts = ["js/cascading-merkle-tree.js"]
+++

> **📚 Source Code**: This article walks through [the pull request](https://github.com/worldcoin/semaphore-rs/pull/70) that introduced `CascadingMerkleTree`.

The usual way to store a binary tree in an array is a heap. The root goes at index 1, and the children of node *i* go at 2*i* and 2*i* + 1. It's compact and fast, and you never chase a pointer. The catch is that when the tree gets one level taller, every node ends up at a new index.

That's fine for a tree whose size never changes. It's a real problem for a fixed-depth Merkle tree that lives on disk and keeps growing. This post covers a layout where growing the tree just means appending to the array, and explains why that leads to some unusual-looking indices.

## What we want

Sometimes a Merkle tree's depth isn't yours to choose. Whatever consumes the proofs expects a set number of siblings, say 30, and that number holds from the first leaf to the billionth. There's no "small tree for now, bigger tree later".

A depth-30 tree has 2³⁰ leaves and 2³¹ − 1 nodes. With 256-bit (32-byte) hashes, a fully materialized tree comes to about **64 GiB**. Almost all of it is the hash of nothing, hashed with more nothing, all the way up.

So we want:

1. **Fixed depth.** Proofs always have 30 levels.
2. **Dense storage.** A flat array, not a forest of `Box`es. We need fast proofs and fast bulk inserts, and we want to `mmap` the whole thing and pick up right where we left off after a restart.
3. **Growable.** Pay for the leaves we have, not the leaves we might have someday.

The usual compromise gets two out of three. You allocate a dense bottom-left region whose size *you choose up front* and put sparse, pointer-based nodes above it. Pick too small and you spill into the slow part. Pick too large and you're back to paying for nothing.

## Why the heap layout bites

The heap is the obvious way to get dense storage, so let's grow one. If the tree is full and you push one more leaf, the tree needs another level. The old root stops being the root and becomes the left child of a new one. And since a heap index encodes *depth from the top*, every node in the old tree gets a new index.

<figure class="cmt-fig" data-fig="heap-shuffle">
<figcaption>Figure 1. A heap-indexed tree before and after growing by one level. Colors follow each node. Leaf 0 was at index 4 and is now at index 8, and the old root moved from 1 to 2. Nothing stayed put.</figcaption>
</figure>

On a toy tree, that's a shrug. On a memory-mapped file holding tens of millions of hashes, it means rewriting the entire file while everything else waits. That's the kind of operation that looks great in a unit test and much less great on a pager at 3am.

We need a layout where growing the tree means *appending* to the array and nothing else.

## Two observations and one free slot

First, some vocabulary. A node's *height* is how many levels it sits above the leaves, so leaves are at height 0. A *subtree* is a node together with everything below it. Pick a node at height *h* and you've picked a subtree of height *h*: a complete binary tree with 2ʰ leaves of its own, with that node as its root. The whole tree is just the subtree rooted at the top.

**Observation one: emptiness is cheap.** Every empty subtree of height *h* has the same hash. Call it Zₕ. Z₀ is the empty leaf value, and Zₕ₊₁ = hash(Zₕ, Zₕ). We can precompute all 31 of them once (the PR calls this the `sparse_column`). Now suppose our real data fits in a subtree of height *h* in the bottom-left corner. The root of the full depth-30 tree is just that subtree's root hashed against Zₕ, then Zₕ₊₁, and so on up to the top. That's 30 − *h* hashes, and none of it has to be stored.

So we only store the bottom-left subtree. The real question is how to *grow* it.

**Observation two: grow the tree sideways, not downward.** When the stored subtree of height *h* fills up, make it the left child of a new node at height *h* + 1. That new node's right child is a brand-new, empty subtree of height *h*. The leftmost path, from leaf 0 straight up, becomes a *spine*, and each spine node has a perfectly ordinary complete subtree hanging off its right side.

Each of those right subtrees is a complete binary tree, so it gets the textbook heap layout. That raises the question of where the spine node goes.

**The free slot.** A 1-indexed heap of size 2ᵏ stores its nodes in slots 1 through 2ᵏ − 1, and slot 0 goes to waste. Every data structures course has a footnote apologizing for it.

So here's the trick. **Array chunk [2ᵏ, 2ᵏ⁺¹) holds the spine node at height *k* in its wasted slot 0, followed by the heap for its right subtree.** Doubling the array appends exactly one new chunk, which is exactly one new spine node plus its new right subtree. The old chunks never move.

That leaves the very first slot of the whole array, index 0, which nobody wanted. The tree keeps the leaf count there.

```
          8               spine: 1, 2, 4, 8, ...
    4            9
 2     5     10     11
1  3  6  7  12 13 14 15
```

## See it move

The figure plays on its own and loops. Pause it, or push leaves one at a time. The same tree is stored two ways, growing in lockstep: the cascading layout on top and a classic heap below. Every node and its array slot share a color, and hovering over a node highlights it in both layouts. Watch what happens each time the tree passes a power of two. The cascading array just gets longer. In the heap, every index moves to a new node and the whole array shuffles. Click a leaf number to trace its path to the root. The dashed rings mark the siblings that make up its Merkle proof. Above the stored part, the siblings are all Z values from the sparse column, so they cost nothing to read.

<figure class="cmt-fig" data-fig="grow">
<figcaption>Figure 2. The same depth-5 tree (pretend it says 30), stored two ways. Top: the cascading layout, where the array grows by appending and each chunk is one spine node plus one complete subtree. Bottom: a classic heap, where every entry moves each time the tree grows a level. In both, solid nodes are stored in the array, and dashed nodes and triangles are computed from the sparse column.</figcaption>
</figure>

## The arithmetic

With that picture in mind, here are the index functions from [`storage_ops.rs`](https://github.com/worldcoin/semaphore-rs/pull/70/files).

```rust
// leaves are 0 indexed
pub fn index_from_leaf(leaf: usize) -> usize {
    leaf + (leaf + 1).next_power_of_two()
}
```

Leaf *L* lives in the right subtree whose leaves are [2ᵏ⁻¹, 2ᵏ), where 2ᵏ = `next_power_of_two(L + 1)`. That subtree's chunk starts at index 2ᵏ. Its bottom row is the back half of the chunk, starting at 2ᵏ + 2ᵏ⁻¹. Add *L*'s offset within the row, *L* − 2ᵏ⁻¹, and the 2ᵏ⁻¹ terms cancel. What's left is 2ᵏ + *L*. That's why leaf 4 lands at index 8 + 4 = **12**.

```rust
pub fn parent(i: usize) -> usize {
    if i.is_power_of_two() {
        return i << 1;               // spine: go up the spine
    }
    let prev_pow = i.next_power_of_two() >> 1;
    ((i - prev_pow) >> 1) + prev_pow // ordinary heap parent, inside this chunk
}
```

A spine node's parent is the next spine node. Every other node does a normal heap step within its own chunk: subtract the chunk base, shift, then add the base back. `sibling` follows the same pattern, with two edge cases. A spine node's sibling is the root of the right subtree next to it (2*i* + 1). That right subtree's root, in turn, has a spine node as its sibling (*prev_pow* / 2).

A proof walks up through the stored levels using those functions. It then tops off the remaining levels with entries from the sparse column, since everything to the right of the stored region is empty by definition.

## Parallelism, with the borrow checker's blessing

Building a tree from a big batch of leaves is the expensive part, so it should use every core. The layout makes that easy, and Rust makes it safe.

Inside a chunk, the subtree is an ordinary heap, so each row of the subtree is a contiguous slice. Better still, the row of parents sits directly in front of the row of children. For the subtree's local storage, the children at depth *j* occupy [2ʲ, 2ʲ⁺¹), and their parents occupy [2ʲ⁻¹, 2ʲ). A single `split_at_mut` hands us both rows as separate borrows:

```rust
// Iterate over mutable layers of the tree
for current_depth in (1..=depth).rev() {
    let (top, child_layer) = storage.split_at_mut(1 << current_depth);
    let parent_layer = &mut top[(1 << (current_depth - 1))..];

    parent_layer
        .par_iter_mut()
        .enumerate()
        .for_each(|(i, value)| {
            let left = &child_layer[2 * i];
            let right = &child_layer[2 * i + 1];
            *value = H::hash_node(left, right);
        });
}
```

The borrow checker can't prove that `storage[i]` and `storage[2 * i]` never overlap, so naive indexing into one `&mut [Hash]` from many threads won't compile. Nor should it. `split_at_mut` settles the question by construction. `parent_layer` and `child_layer` are two non-overlapping slices, and the compiler knows it. Rayon's `par_iter_mut` then gives each thread exclusive `&mut` access to its own parent slots. Meanwhile the child row is only ever read, so every thread can share it. That's all the synchronization there is: no locks, no atomics, and no `unsafe`. Each row is one parallel pass over two contiguous slices, working from the leaves up to the subtree root.

Filling in the leaves works the same way, with a parallel `zip` of the new leaves into the bottom row. The chunks are built one after another, each with its rows in parallel. Stitching them together along the spine costs one hash per chunk: the previous spine node hashed with the new subtree's root.

## Why it's worth the weirdness

- **Growth is append-only.** When the array fills, `push` extends it to the next power of two with empty values. On an `MmapVec` that means growing the file. Nothing gets rewritten.
- **Parallel by construction.** Bulk construction is one safe, lock-free parallel pass per row, as shown above.
- **SIMD-friendly.** Every row is a contiguous slice, and its parents sit in another contiguous slice right in front of it. Each pass reads adjacent pairs and writes sequentially, which is exactly the access pattern that vectorized and batched hash implementations want.
- **It's still just an array.** State is trivially serialized. A restart is an `mmap` plus an optional `validate()`.
- **You pay for what you use**, rounded up to a power of two. You never pay for 64 GiB of nothing.

## Odds and ends

Slot 0 never holds an actual hash, but the backing array is typed as hashes. So the leaf count is written into the bytes of the first entry with `bytemuck`. If your hash type is smaller than a `usize`, the count doesn't fit, and that panics. The PR has a test named `test_hash_too_small` whose entire job is to make sure it does.

Also, `get_leaf_from_hash` scans leaves from right to left, one chunk at a time. If you're looking up a hash, it's probably one somebody added recently.

**Exercise:** In `get_node`, a request for a node above the stored region with `offset == 0` calls `compute_from_storage_tip` instead of reading the sparse column. Why?
