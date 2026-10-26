+++
+++

{% crt() %}
```
                         0xForerunner's Blog
             _~^~^~_                             _~^~^~_
         \) /  o o  \ (/                     \) /  o o  \ (/
           '_   -   _'                         '_   -   _'
           / '-----' \                         / '-----' \
    _~`+~~_            _~`+~~_          _~`+~~_            _~`+~~_
() /  ^ o  \ \/    () /  ^ o  \ \/  () /  ^ o  \ \/    () /  ^ o  \ \/
  '_   V   _'        '_   V   _'      '_   V   _'        '_   V   _'
  | '--.--' <        | '--.--' <      | '--.--' <        | '--.--' <
```
{% end %}

---

![headshot](headshot.jpeg)

# About the Author

I'm a software engineer who mostly writes Rust. These days that means protocol heavy work or blockchain infrastructure, usually somewhere deep inside [reth](https://reth.rs/overview/), [world-chain](https://github.com/worldcoin/world-chain), or [world-id-protocol](https://github.com/worldcoin/world-id-protocol). Before that I built a DeFi lending protocol from scratch, and before *that* I spent ten years as a physicist building particle detectors. The common thread is that I like building things from the ground up and learning whatever I need to along the way.

I live near the mountains in British Columbia, so when I'm not at a computer I'm usually outside: snowboarding, kiteboarding on Howe Sound, mountain biking around Squamish, or running off a cliff with a paraglider. It balances out all the sitting.

---

# How I Work

I learn best by building, and I think the best way to teach is to show someone working code. I've gone from academia to startups to big tech, and in every one of them the hands-on people were the ones who understood things best.

Nearly everything I use and build is open source, and I'd like to keep it that way. Code that's out in the open gets better reviews, better docs, and fewer surprises.

I also like mentoring. I've onboarded people in research labs and on engineering teams, and the main thing I've learned is that patience goes a lot further than cleverness. I'm also one of the few engineers I know who actually enjoys writing documentation.

---

# What I Know

- **Rust & systems:** Rust is my default. I'm also comfortable in C, C++, Go, and TypeScript. I care about code that is fast and hard to break, whether it's a performance-critical service or a small CLI tool.
- **Blockchain:** A lot of work in and around [reth](https://reth.rs/overview/), which underlies [World Chain](https://world.org/world-chain). Smart contracts in Solidity (Ethereum, Optimism, Base) and in Rust with CosmWasm (Cosmos).
- **Zero-knowledge proofs:** Circuits in Noir, Gnark, Circom, and Plonky3. If a problem can be solved with a bit of algebra, I'll probably try.
- **Infrastructure:** Docker, Kubernetes, Terraform, AWS. I have an odd fondness for CI pipelines and will automate anything I have to do twice.
- **Data & simulation:** Monte Carlo models for both particle physics and financial markets, plus some machine learning along the way.

---

# Experience

### Senior Rust Engineer at Tools for Humanity – _World Chain_

> 2024 – Present

- **World Chain:** Built core services and extensions for the OP Stack, including Rollup Boost, P2P Flashblocks propagation, and [World Chain](https://world.org/world-chain) itself. Most of this lives in or alongside the [reth](https://reth.rs/overview/) codebase, including a custom block builder.
- **Smart contracts:** Wrote and maintained audited Solidity contracts deployed on Ethereum mainnet, Base, Optimism, and World Chain, along with the tooling to deploy, configure, and upgrade multi-contract protocols without doing it by hand.
- **Zero-knowledge proofs:** Designed and implemented ZK circuits that let users prove things about their data without revealing it, and integrated them into the World ID Protocol. A lot of the job is translating the cryptography into something that actually runs efficiently on-chain.
- **Infrastructure:** Run Kubernetes clusters and AWS infrastructure for the services above.
- **Mentoring:** Run training sessions and code walkthroughs, and push for thorough reviews and a blameless culture.

### Senior Software Engineer at Cryptech Developments – _Lead engineer on Neptune Protocol_

> 2021 – 2023

- **Neptune:** Designed and built Neptune, a multi-contract lending protocol written in Rust with CosmWasm. As lead developer I owned everything from core logic to gas optimization to getting the code through security audits.
- **Backend:** Built the API and a custom indexer that fed real-time protocol data to the front end.
- **Liquidation bot:** Wrote an autonomous bot that watched the market and liquidated under-collateralized loans.
- **Simulation & testing:** Built Monte Carlo models of market behaviour to tune parameters like collateralization ratios and stress-test extreme scenarios. Set up the test suites and CI that every change had to pass.

### Physics Research – _University of British Columbia & University of Alberta_

> 2011 – 2021

From undergrad through my Ph.D. I worked on neutrino and dark matter experiments. I designed and prototyped particle detectors (including a cryogenic liquid argon detector read out by silicon photomultipliers), built custom electronics like an LED pulser with picosecond timing, and wrote a lot of GEANT4 simulations.

It's closer to software than it sounds. It taught me to program, analyze data, and debug systems where every part can fail. And once you've debugged a sensor array at −110 °C in an underground lab at 3 am, a misbehaving cloud service from a comfy chair doesn't seem so bad.

---

### Side Projects

Programming was a hobby long before it was a job, and it still is. I pick up new languages by building something over a weekend (that's how I got into Rust), and I've published a few Rust crates of my own. Otherwise it's whatever catches my interest: trying out a new ML model, making a game in an engine I don't know, or automating something around the house with a Raspberry Pi.

You can see what I'm working on at [GitHub](https://github.com/0xForerunner). Feel free to reach out.

---

### Education

**Ph.D. in Physics** – University of British Columbia (2016 – 2021)

**B.Sc. in Physics** – University of Alberta (2011 – 2015)
