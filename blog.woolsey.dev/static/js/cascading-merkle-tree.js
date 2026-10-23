// Figures for the "Cascading Merkle Tree" post.
// Renders into <figure class="cmt-fig" data-fig="..."> elements.
(() => {
	"use strict";

	const NS = "http://www.w3.org/2000/svg";

	const nextPow2 = (n) => {
		let p = 1;
		while (p < n) p <<= 1;
		return p;
	};
	const log2 = (n) => 31 - Math.clz32(n);

	// Straight ports of semaphore-rs `storage_ops.rs`.
	const indexFromLeaf = (leaf) => leaf + nextPow2(leaf + 1);
	const indexHeightOffset = (h, o) => {
		if (o === 0) return 1 << h;
		const leaf = o << h;
		return (leaf >> h) + nextPow2(leaf + 1);
	};
	// A plain 1-indexed heap of depth `d`.
	const classicIndex = (h, o, d) => (1 << (d - h)) + o;

	// Storage depth for `n` leaves (storage.len() == 2^(depth + 1)).
	const storageDepth = (n) => (n <= 1 ? 0 : log2(nextPow2(n)));

	// Every node is coloured by the power-of-two chunk of the array that it
	// lives in under the cascading layout. Colours follow the node, not the slot.
	const CHUNK_COLORS = ["#e8590c", "#2f9e44", "#1c7ed6", "#ae3ec9", "#0c8599"];
	const colorOf = (h, o) => CHUNK_COLORS[log2(indexHeightOffset(h, o)) % CHUNK_COLORS.length];

	const SUB = "₀₁₂₃₄₅₆₇₈₉";
	const sub = (n) => String(n).split("").map((c) => SUB[+c]).join("");

	function el(tag, attrs, parent, text) {
		const e = document.createElementNS(NS, tag);
		for (const k in attrs) e.setAttribute(k, attrs[k]);
		if (text !== undefined) e.textContent = text;
		if (parent) parent.appendChild(e);
		return e;
	}

	function html(tag, attrs, parent, text) {
		const e = document.createElement(tag);
		for (const k in attrs) e.setAttribute(k, attrs[k]);
		if (text !== undefined) e.textContent = text;
		if (parent) parent.appendChild(e);
		return e;
	}

	function svgRoot(fig, w, h, label) {
		const svg = el("svg", {
			viewBox: `0 0 ${w} ${h}`,
			class: "cmt-svg",
			role: "img",
			"aria-label": label,
		});
		fig.insertBefore(svg, fig.querySelector("figcaption"));
		return svg;
	}

	// ---------------------------------------------------------------------
	// Figure 1: a classic heap layout renumbers everything when it grows.
	// ---------------------------------------------------------------------
	function heapShuffle(fig) {
		const LW = 40, CW = 20, RH = 46, R = 12, TOP = 26;
		const leafY = TOP + 3 * RH;
		const arrY = leafY + 40;
		const svg = svgRoot(fig, 640, arrY + 62, "A classic heap-indexed Merkle tree with 4 leaves, and the same tree after growing to 8 leaves: every array index changes.");

		function panel(x0, d, n, title) {
			const g = el("g", { transform: `translate(${x0} 0)` }, svg);
			const nx = (h, o) => ((o << h) + (1 << h) / 2) * LW;
			const ny = (h) => leafY - h * RH;
			el("text", { x: ((1 << d) * LW) / 2, y: arrY + 56, class: "cmt-title" }, g, title);

			for (let h = d; h >= 1; h--)
				for (let o = 0; o < 1 << (d - h); o++)
					for (const c of [2 * o, 2 * o + 1])
						el("line", { x1: nx(h, o), y1: ny(h), x2: nx(h - 1, c), y2: ny(h - 1), class: "cmt-edge" }, g);

			const cells = el("g", { transform: `translate(${((1 << d) * LW - (2 << d) * CW) / 2} ${arrY})` }, g);
			el("rect", { x: 0, y: 0, width: CW - 2, height: 22, rx: 3, class: "cmt-cell-unused" }, cells);
			el("text", { x: 0 + (CW - 2) / 2, y: 34, class: "cmt-idx" }, cells, "0");

			for (let h = 0; h <= d; h++) {
				for (let o = 0; o < 1 << (d - h); o++) {
					const filled = o << h < n;
					const idx = classicIndex(h, o, d);
					const node = el("g", { class: filled ? "cmt-node" : "cmt-node cmt-empty" }, g);
					el("circle", { cx: nx(h, o), cy: ny(h), r: R, class: "cmt-under" }, node);
					el("circle", { cx: nx(h, o), cy: ny(h), r: R, fill: colorOf(h, o) }, node);
					el("text", { x: nx(h, o), y: ny(h) }, node, idx);

					const cx = idx * CW;
					el("rect", { x: cx, y: 0, width: CW - 2, height: 22, rx: 3, fill: colorOf(h, o), class: filled ? "" : "cmt-empty" }, cells);
					el("text", { x: cx + (CW - 2) / 2, y: 34, class: "cmt-idx" }, cells, idx);
				}
			}
		}

		panel(20, 2, 4, "4 leaves, depth 2");
		panel(300, 3, 5, "push(leaf 4): depth 3");
		el("text", { x: 250, y: TOP + 2 * RH - 8, class: "cmt-arrow" }, svg, "→");
	}

	// ---------------------------------------------------------------------
	// Figure 3: the same tree stored two ways, growing in lockstep.
	// ---------------------------------------------------------------------
	function growWidget(fig) {
		const D = 5;            // pretend this is 30
		const MAX_LEAVES = 16;  // storage grows to depth 4
		const W = 24, ML = 36, RH = 46, TOP = 30, R = 10, CH = 22;
		const leafY = TOP + D * RH;
		const arrY = leafY + 44;
		const VB_W = ML * 2 + (1 << D) * W;
		const VB_H = arrY + CH + 50;

		const nx = (h, o) => ML + ((o << h) + (1 << h) / 2) * W;
		const ny = (h) => TOP + (D - h) * RH;
		const cellX = (i) => ML + i * W;

		const caption = fig.querySelector("figcaption");
		const controls = html("div", { class: "cmt-controls" });
		fig.insertBefore(controls, caption);
		const btnPlay = html("button", { type: "button" }, controls, "▶ Play");
		const btnStep = html("button", { type: "button" }, controls, "push()");
		const btnReset = html("button", { type: "button" }, controls, "Reset");

		// `growth` remembers the most recent time the storage doubled.
		const state = { n: 0, moved: { cascade: 0, classic: 0 }, leaf: null, growth: null, timer: null };
		const panels = [panel("cascade", "Cascading"), panel("classic", "Classic heap")];

		// Everything that changes is drawn inside the SVGs, so the figure never
		// changes height while it animates. This hint is the only text outside.
		const hint = html("p", { class: "cmt-status" }, null, "Click a leaf number to trace its path and Merkle proof. Hover a node to find it in both layouts.");
		fig.insertBefore(hint, caption);

		function panel(mode, title) {
			const wrap = html("div", { class: "cmt-panel" });
			fig.insertBefore(wrap, caption);
			const svg = el("svg", {
				viewBox: `0 0 ${VB_W} ${VB_H}`,
				class: "cmt-svg",
				role: "img",
				"aria-label": `${title} layout of the tree and its backing array.`,
			}, wrap);
			el("text", { x: 6, y: 14, class: "cmt-panel-title" }, svg, title);
			const statsT = el("text", { x: VB_W - 6, y: 14, class: "cmt-panel-stats" }, svg);
			const growthT = el("text", { x: 6, y: 32, class: "cmt-panel-growth" }, svg);
			const traceT = el("text", { x: 6, y: arrY + CH + 40, class: "cmt-panel-trace" }, svg);
			const gVirt = el("g", {}, svg);
			const gEdges = el("g", {}, svg);
			const gNodes = el("g", {}, svg);
			const gLabels = el("g", {}, svg);
			const gBrackets = el("g", {}, svg);
			const gCells = el("g", {}, svg);
			el("text", { x: ML - 4, y: leafY + 26, class: "cmt-leafno-hdr" }, svg, "leaf");
			const gLeafNo = el("g", {}, svg);

			const nodes = new Map();
			const cells = new Map();
			// Index labels are keyed by index, not by node, so that when a layout
			// renumbers the tree each index visibly travels to its new node.
			const labels = new Map();

			const indexOf = (h, o, d) => (mode === "cascade" ? indexHeightOffset(h, o) : classicIndex(h, o, d));

			function upsertNode(h, o) {
				const k = `${h}-${o}`;
				let n = nodes.get(k);
				if (!n) {
					const g = el("g", { class: "cmt-node cmt-new", "data-k": k }, gNodes);
					el("circle", { cx: nx(h, o), cy: ny(h), r: R, class: "cmt-under" }, g);
					el("circle", { cx: nx(h, o), cy: ny(h), r: R, fill: colorOf(h, o) }, g);
					n = { g };
					nodes.set(k, n);
					requestAnimationFrame(() => requestAnimationFrame(() => g.classList.remove("cmt-new")));
				}
				return n;
			}

			function upsertLabel(idx, x, y) {
				let t = labels.get(idx);
				if (!t) {
					t = el("text", { x: 0, y: 0, class: "cmt-label cmt-new" }, gLabels, idx);
					t.style.transform = `translate(${x}px, ${y}px)`;
					labels.set(idx, t);
					requestAnimationFrame(() => requestAnimationFrame(() => t.classList.remove("cmt-new")));
				}
				return t;
			}

			function upsertCell(k, color) {
				let c = cells.get(k);
				if (!c) {
					const g = el("g", { class: "cmt-cellg cmt-new", "data-k": k }, gCells);
					el("rect", { x: 0, y: 0, width: W - 2, height: CH, rx: 3, fill: color }, g);
					const t = el("text", { x: (W - 2) / 2, y: CH / 2 }, g);
					c = { g, t };
					cells.set(k, c);
					requestAnimationFrame(() => requestAnimationFrame(() => g.classList.remove("cmt-new")));
				}
				return c;
			}

			function render() {
				const { n } = state;
				const d = storageDepth(n);
				const seen = new Set();
				const seenLabels = new Set();

				// Trace: the path to the root and the proof siblings.
				const path = new Set(), sibs = new Set();
				if (state.leaf !== null) {
					for (let h = 0; h <= D; h++) path.add(`${h}-${state.leaf >> h}`);
					for (let h = 0; h < D; h++) sibs.add(`${h}-${(state.leaf >> h) ^ 1}`);
				}
				const traceCls = (k) => (path.has(k) ? " cmt-path" : sibs.has(k) ? " cmt-sib" : "");
				const keepNew = (e) => (e.classList.contains("cmt-new") ? " cmt-new" : "");

				// Edges.
				gEdges.replaceChildren();
				for (let h = 1; h <= d; h++)
					for (let o = 0; o < 1 << (d - h); o++)
						for (const c of [2 * o, 2 * o + 1])
							el("line", { x1: nx(h, o), y1: ny(h), x2: nx(h - 1, c), y2: ny(h - 1), class: "cmt-edge" }, gEdges);

				// The virtual part above storage: the spine plus empty subtrees,
				// whose hashes come from the precomputed sparse column.
				gVirt.replaceChildren();
				for (let h = d + 1; h <= D; h++) {
					const kz = `${h - 1}-1`;
					const left = 1 << (h - 1), right = 1 << h;
					el("line", { x1: nx(h, 0), y1: ny(h), x2: nx(h - 1, 0), y2: ny(h - 1), class: "cmt-edge cmt-dashed" }, gVirt);
					el("line", { x1: nx(h, 0), y1: ny(h), x2: nx(h - 1, 1), y2: ny(h - 1), class: "cmt-edge cmt-dashed" }, gVirt);
					el("path", {
						d: `M${nx(h - 1, 1)} ${ny(h - 1)} L${ML + right * W - 3} ${leafY + 8} L${ML + left * W + 3} ${leafY + 8} Z`,
						class: "cmt-ztri" + traceCls(kz),
					}, gVirt);
					el("text", { x: nx(h - 1, 1), y: ny(h - 1) + (leafY - ny(h - 1)) * 0.6, class: "cmt-zlabel" + traceCls(kz) }, gVirt, `Z${sub(h - 1)}`);
					const vg = el("g", { class: "cmt-vnode" + traceCls(`${h}-0`) }, gVirt);
					el("circle", { cx: nx(h, 0), cy: ny(h), r: R, class: "cmt-under" }, vg);
					el("circle", { cx: nx(h, 0), cy: ny(h), r: R }, vg);
				}
				el("text", { x: nx(D, 0), y: ny(D) - R - 6, class: "cmt-rootlabel" }, gVirt, "root");

				// Stored nodes, their index labels, and their array cells.
				for (let h = 0; h <= d; h++) {
					for (let o = 0; o < 1 << (d - h); o++) {
						const k = `${h}-${o}`;
						const filled = o << h < n;
						const idx = indexOf(h, o, d);
						const empty = filled ? "" : " cmt-empty";
						seen.add(k);
						seenLabels.add(idx);

						const node = upsertNode(h, o);
						node.g.setAttribute("class", "cmt-node" + empty + traceCls(k) + keepNew(node.g));

						const lab = upsertLabel(idx, nx(h, o), ny(h));
						lab.style.transform = `translate(${nx(h, o)}px, ${ny(h)}px)`;
						lab.setAttribute("class", "cmt-label" + empty + keepNew(lab));

						const cell = upsertCell(k, colorOf(h, o));
						cell.t.textContent = idx;
						cell.g.style.transform = `translate(${cellX(idx)}px, ${arrY}px)`;
						cell.g.setAttribute("class", "cmt-cellg" + empty + traceCls(k) + keepNew(cell.g));
					}
				}

				// Slot 0: the leaf counter in the cascading layout, wasted in a heap.
				const zero = upsertCell("count", "transparent");
				zero.g.style.transform = `translate(${cellX(0)}px, ${arrY}px)`;
				zero.g.setAttribute("class", "cmt-cellg cmt-count");
				zero.t.textContent = mode === "cascade" ? `n=${n}` : "—";
				seen.add("count");

				for (const [k, v] of nodes) if (!seen.has(k)) { v.g.remove(); nodes.delete(k); }
				for (const [k, v] of cells) if (!seen.has(k)) { v.g.remove(); cells.delete(k); }
				for (const [k, v] of labels) if (!seenLabels.has(k)) { v.remove(); labels.delete(k); }

				// Leaf numbers under the leaf row.
				gLeafNo.replaceChildren();
				for (let o = 0; o < 1 << d; o++)
					el("text", { x: nx(0, o), y: leafY + 26, class: "cmt-leafno" + (o < n ? " cmt-clickable" : ""), "data-k": `0-${o}` }, gLeafNo, o);

				// Brackets under the array: chunks for cascading, rows for a heap.
				gBrackets.replaceChildren();
				for (let k = 0; k <= d; k++) {
					const a = 1 << k, b = (2 << k) - 1;
					const x1 = cellX(a) + 1, x2 = cellX(b) + W - 3, y = arrY + CH + 8;
					el("path", { d: `M${x1} ${y - 3} V${y} H${x2} V${y - 3}`, class: "cmt-bracket" }, gBrackets);
					if (k < 2) continue; // too narrow to label
					const label = mode === "cascade"
						? (k === 2 ? "chunk 2" : `chunk ${k}: spine ${a} + subtree`)
						: (k === d ? "leaves" : `height ${d - k}`);
					el("text", { x: (x1 + x2) / 2, y: y + 14, class: "cmt-bracket-label" }, gBrackets, label);
				}

				// Header and footer text for this layout.
				statsT.textContent = `num_leaves ${n} · len ${2 << d} · moved ${state.moved[mode]}`;
				const g = state.growth;
				growthT.textContent = !g ? ""
					: `Grew ${g.from} → ${g.to} leaves: `
						+ (mode === "cascade" ? `appended ${g.appended} slots, moved 0` : `moved all ${g.moved} entries`);

				traceT.textContent = "";
				if (state.leaf !== null) {
					const L = state.leaf;
					const parts = [];
					for (let h = 0; h <= d; h++) parts.push(indexOf(h, L >> h, d));
					const head = mode === "cascade"
						? `index_from_leaf(${L}) = ${L} + next_pow2(${L + 1}) = ${indexFromLeaf(L)}`
						: `leaf ${L} → 2^${d} + ${L} = ${classicIndex(0, L, d)}`;
					const zs = [];
					for (let h = d; h < D; h++) zs.push(`Z${sub(h)}`);
					traceT.textContent = `${head} · path ${parts.join(" → ")}` + (zs.length ? ` → sparse column ${zs.join(", ")} → root` : " = root");
				}
			}

			function hover(k) {
				for (const m of [nodes, cells]) for (const [kk, v] of m) v.g.classList.toggle("cmt-hover", kk === k);
			}

			return { svg, render, hover };
		}

		function render() {
			for (const p of panels) p.render();
		}

		function push() {
			if (state.n >= MAX_LEAVES) return;
			const before = storageDepth(state.n), after = storageDepth(state.n + 1);
			if (state.n > 0 && after > before) {
				// Every stored node of the old tree gets a new heap index; none move
				// in the cascading layout, which just appends a new chunk.
				const moved = (2 << before) - 1;
				state.moved.classic += moved;
				state.growth = { from: 1 << before, to: 1 << after, appended: 1 << after, moved };
			}
			state.n++;
			render();
		}

		function clear() {
			state.n = 0;
			state.leaf = null;
			state.growth = null;
			state.moved = { cascade: 0, classic: 0 };
			render();
		}

		// Playing loops forever: fill the tree, hold for a moment, start over.
		function tick() {
			if (state.n >= MAX_LEAVES) clear();
			else push();
			state.timer = setTimeout(tick, state.n >= MAX_LEAVES ? 3000 : 1100);
		}

		function stop() {
			clearTimeout(state.timer);
			state.timer = null;
			btnPlay.textContent = "▶ Play";
		}

		function play() {
			if (state.timer) return stop();
			btnPlay.textContent = "❚❚ Pause";
			tick();
		}

		function reset() {
			stop();
			clear();
		}

		btnPlay.addEventListener("click", play);
		btnStep.addEventListener("click", () => { stop(); if (state.n >= MAX_LEAVES) clear(); else push(); });
		btnReset.addEventListener("click", reset);

		// Hover a node to find it in both layouts and both arrays; click a leaf
		// to trace it in both.
		const keyAt = (e) => e.target.closest && e.target.closest("[data-k]")?.getAttribute("data-k");
		for (const p of panels) {
			p.svg.addEventListener("pointerover", (e) => { const k = keyAt(e); for (const q of panels) q.hover(k); });
			p.svg.addEventListener("pointerleave", () => { for (const q of panels) q.hover(null); });
			p.svg.addEventListener("click", (e) => {
				const k = keyAt(e);
				if (!k) return;
				const [h, o] = k.split("-").map(Number);
				if (h !== 0 || o >= state.n) return;
				state.leaf = state.leaf === o ? null : o;
				render();
			});
		}

		render();

		const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (!reduced && "IntersectionObserver" in window) {
			const io = new IntersectionObserver((entries) => {
				if (entries.some((x) => x.isIntersecting)) {
					io.disconnect();
					if (state.n === 0) play();
				}
			}, { threshold: 0.3 });
			io.observe(panels[0].svg);
		}
	}

	// ---------------------------------------------------------------------
	// Figure 2: the cascading indices of an 8-leaf tree and its array.
	// ---------------------------------------------------------------------
	function cascadeIndex(fig) {
		const d = 3, LW = 48, CW = 24, RH = 50, R = 13, TOP = 26, ML = 64;
		const leafY = TOP + d * RH;
		const arrY = leafY + 48;
		const svg = svgRoot(fig, ML * 2 + (1 << d) * LW, arrY + 62, "Cascading indices for an 8-leaf tree. The spine 1, 2, 4, 8 runs up the left edge, and each power-of-two chunk of the array holds one spine node followed by its right subtree.");
		const nx = (h, o) => ML + ((o << h) + (1 << h) / 2) * LW;
		const ny = (h) => leafY - h * RH;
		const cellX = (i) => ML + i * CW;

		for (let h = d; h >= 1; h--)
			for (let o = 0; o < 1 << (d - h); o++)
				for (const c of [2 * o, 2 * o + 1])
					el("line", { x1: nx(h, o), y1: ny(h), x2: nx(h - 1, c), y2: ny(h - 1), class: "cmt-edge" }, svg);

		// The spine: the leftmost path, from leaf 0 to the storage root.
		const spine = [];
		for (let h = 0; h <= d; h++) spine.push(`${nx(h, 0)} ${ny(h)}`);
		el("path", { d: `M${spine.join(" L")}`, class: "cmt-spine" }, svg);
		el("text", { x: nx(1, 0) - 22, y: (ny(1) + ny(2)) / 2, class: "cmt-spine-label" }, svg, "spine");

		for (let h = 0; h <= d; h++) {
			for (let o = 0; o < 1 << (d - h); o++) {
				const node = el("g", { class: "cmt-node" }, svg);
				el("circle", { cx: nx(h, o), cy: ny(h), r: R, class: "cmt-under" }, node);
				el("circle", { cx: nx(h, o), cy: ny(h), r: R, fill: colorOf(h, o) }, node);
				el("text", { x: nx(h, o), y: ny(h) }, node, indexHeightOffset(h, o));
			}
		}
		el("text", { x: ML - 10, y: leafY + 28, class: "cmt-leafno-hdr" }, svg, "leaf");
		for (let o = 0; o < 1 << d; o++)
			el("text", { x: nx(0, o), y: leafY + 28, class: "cmt-leafno" }, svg, o);

		// The array: slot 0 holds the leaf count, then one chunk per spine node.
		el("rect", { x: cellX(0), y: arrY, width: CW - 2, height: 22, rx: 3, class: "cmt-cell-unused" }, svg);
		el("text", { x: cellX(0) + (CW - 2) / 2, y: arrY + 11, class: "cmt-count-label" }, svg, "n");
		for (let h = 0; h <= d; h++) {
			for (let o = 0; o < 1 << (d - h); o++) {
				const i = indexHeightOffset(h, o);
				el("rect", { x: cellX(i), y: arrY, width: CW - 2, height: 22, rx: 3, fill: colorOf(h, o) }, svg);
				el("text", { x: cellX(i) + (CW - 2) / 2, y: arrY + 11, class: "cmt-cell-label" }, svg, i);
			}
		}
		for (let k = 0; k <= d; k++) {
			const a = 1 << k, b = (2 << k) - 1;
			const x1 = cellX(a) + 1, x2 = cellX(b) + CW - 3, y = arrY + 30;
			el("path", { d: `M${x1} ${y - 3} V${y} H${x2} V${y - 3}`, class: "cmt-bracket" }, svg);
			const label = k === 0 ? "" : k === 3 ? "chunk 3: spine 8 + subtree" : `chunk ${k}`;
			el("text", { x: (x1 + x2) / 2, y: y + 14, class: "cmt-bracket-label" }, svg, label);
		}
	}

	const FIGS = { "heap-shuffle": heapShuffle, "cascade-index": cascadeIndex, grow: growWidget };
	for (const fig of document.querySelectorAll("figure.cmt-fig[data-fig]")) {
		const f = FIGS[fig.dataset.fig];
		if (f) f(fig);
	}
})();
