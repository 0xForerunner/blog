+++
+++

{% <crt> %}
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
{% </crt> %}

---

![headshot](headshot.jpeg)

# About the Author

I'm a software engineer who mostly writes Rust. These days that means protocol-heavy work on blockchain infrastructure, usually somewhere deep inside [reth](https://reth.rs/overview/), [world-chain](https://github.com/worldcoin/world-chain), or [world-id-protocol](https://github.com/worldcoin/world-id-protocol). My zero-knowledge circuits are used in production by millions of people. Before that I was the sole engineer behind a DeFi lending protocol, and before *that* I spent ten years as a physicist building particle detectors, ending with a Ph.D. The common thread is that I like building things from the ground up and learning whatever I need to along the way.

If you just want the highlights, here's my [résumé (PDF)](/resume.pdf). You can reach me at [eric@woolsey.dev](mailto:eric@woolsey.dev).

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
- **Zero-knowledge proofs:** Circuits in Noir, Gnark, Circom, and Plonky3, and zkVMs like SP1 and RISC Zero. If a problem can be solved with a bit of algebra, I'll probably try.
- **Infrastructure:** Docker, Kubernetes, Terraform, AWS. I have an odd fondness for CI pipelines and will automate anything I have to do twice.
- **Data & simulation:** Monte Carlo models for both particle physics and financial markets, plus some machine learning along the way.

---

# Experience

### Senior Protocol Engineer II at Tools for Humanity – _World Chain_

> 2024 – Present

- **World Chain:** Built core services and extensions for the OP Stack, including [Rollup Boost](https://github.com/flashbots/rollup-boost), [P2P Flashblocks propagation](@/blog/p2p-flashblocks/index.md), and [World Chain](https://world.org/world-chain) itself. Most of this lives in or alongside the [reth](https://reth.rs/overview/) codebase: the [World Chain execution client](https://github.com/worldcoin/world-chain), a custom block builder, and the [proof system](https://github.com/worldcoin/world-chain/tree/main/proofs) the protocol depends on. I write about some of it [on this blog](@/contributions/_index.md).
- **Smart contracts:** Wrote and maintained audited Solidity contracts deployed on Ethereum mainnet, Base, Optimism, and World Chain. I also built the deployment tooling that builds, optimizes, configures, deploys, migrates, and interacts with multi-contract protocols, so nobody has to do it by hand.
- **Zero-knowledge proofs:** My ZK circuits are used in production by millions of people. I designed and implemented them to let users prove things about their data without revealing it, and integrated them into the World ID Protocol. I've worked with Noir, Circom, Gnark, Plonky3, SP1, and RISC Zero. A lot of the job is translating the cryptography into something that actually runs efficiently on-chain.
- **Infrastructure:** Run Kubernetes clusters and AWS infrastructure for the services above.
- **Mentoring:** Onboard new hires, which usually means teaching them Rust and a very unfamiliar development environment at the same time. I also run training sessions and code walkthroughs, and push for thorough reviews and a blameless culture.

### Principal Engineer at Cryptech Developments

> 2021 – 2023

- **Neptune:** Designed and built [Neptune](https://app.nept.finance), a multi-contract lending protocol written in Rust with CosmWasm. As the sole protocol engineer, I wrote the smart contracts and liquidation bot, and owned everything from core logic to gas optimization to getting the code through security audits.
- **Whitepaper:** Sole author of the [Neptune Money Market Whitepaper](/neptune-whitepaper.pdf), which describes the protocol's design, including its built-in leveraged investing and a PID-controlled interest rate curve.
- **Backend:** Built the API and a custom indexer that fed real-time protocol data to the front end.
- **Liquidation bot:** Wrote an autonomous bot that watched the market and liquidated under-collateralized loans.
- **Simulation & testing:** Built Monte Carlo models of market behaviour to tune parameters like collateralization ratios and stress-test extreme scenarios. Set up the test suites and CI that every change had to pass.

### Physics Research – _University of British Columbia & University of Alberta_

> 2011 – 2021

From undergrad through my Ph.D. I worked on neutrino and dark matter experiments, mostly designing detectors and writing the simulations that predict their behaviour.

- **Ph.D., UBC – nEXO (2016 – 2021):** For nEXO, a next-generation search for neutrinoless double-beta decay, I designed and prototyped a Cherenkov light detector built from silicon photomultipliers surrounding a cryogenic liquid xenon core. The design depended on modelling the excitation and decay of individual xenon atoms and tracking every photon through the detector, so I built the full GEANT4 Monte Carlo simulation from scratch and used it to optimize the detector geometry. I also wrote custom machine learning algorithms to pick signal out of noise in the large volumes of simulated data and to measure how well the detector would actually perform.
- **Photodetector design, University of Alberta (2015 – 2017):** Designed and simulated a new kind of photodetector. It looks like a photomultiplier tube, but replaces the dynode chain with a silicon photodiode array that detects the electrons ejected from the photocathode directly. I used COMSOL to design the electric field that focuses those electrons and GEANT4 to model the whole device.
- **PINGU / IceCube, University of Alberta (2015 – 2016):** Designed, built, and tested a prototype circuit board that digitally controlled a picosecond LED pulser, used to calibrate the proposed PINGU low-energy neutrino detector.
- **DEAP-3600, University of Alberta (2011 – 2015):** My first research job, on a dark matter detector at SNOLAB. I rewrote a data analysis program for processing and visualizing raw detector data, tested and tuned the signal conditioning electronics on the U of A testbed, simulated the detector in RAT to study its background discrimination, and designed and built a scintillating fibre-optic veto to reject background events in the main vessel. I also helped build the polyethylene dams used in the detector's construction.


---

# Side Projects

Programming was a hobby long before it was a job, and it still is. I pick up new languages by building something over a weekend (that's how I got into Rust), and I've published a few Rust crates of my own. Otherwise it's whatever catches my interest: trying out a new ML model, making a game in an engine I don't know, or automating something around the house with a Raspberry Pi.

You can see what I'm working on at [GitHub](https://github.com/0xForerunner). Feel free to reach out.

---

# Education

**Ph.D. in Physics** – University of British Columbia (2016 – 2021)

**B.Sc. in Physics** – University of Alberta (2011 – 2015)

Funded along the way by an IsoSiM scholarship at UBC, the Queen Elizabeth II Graduate Scholarship, and an NSERC Undergraduate Student Research Award.
