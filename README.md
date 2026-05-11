<div align="center">

<h1>DevOps Maturity Assessment Tool</h1>

<p><strong>An internal Enablis tool for consultants to assess DevOps maturity,<br>track improvement over time, and generate gap analysis reports.</strong></p>

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)
![Dimensions](https://img.shields.io/badge/Dimensions-6-0078d4)
![Sub-Dimensions](https://img.shields.io/badge/Sub--Dimensions-23-0078d4)
![Maturity Levels](https://img.shields.io/badge/Maturity%20Levels-4-6f42c1)

</div>

---

<div align="center">

[Overview](#overview) · [Dimensions](#dimensions) · [Maturity Levels](#maturity-levels) · [Getting Started](#getting-started) · [Consultant Workflow](#consultant-workflow) · [Foundations](#theoretical-foundations)

</div>

---

## Overview

This tool provides a structured, evidence-based framework for assessing a client's DevOps capability across **6 integrated dimensions** and **23 sub-dimensions**. It is designed for use by Enablis consultants as a repeatable, client-facing artefact — from initial baseline through to tracking sustained improvement.

State is stored as plain JSON files, either locally on the consultant's machine or loaded from a previous session, making it straightforward to manage multiple concurrent engagements.

> **Scope:** This tool operates at the **organisation or team level** — it assesses capability, not a specific flow of work. The maturity model and Value Stream Mapping are complementary but distinct tools. See [Scope and Role of This Tool](#scope-and-role-of-this-tool) for details.

---

## Dimensions

The model covers six areas that collectively represent DevOps capability. Each sub-dimension is rated on a four-level scale: **Foundational**, **Improving**, **Accelerating**, and **Leading**.

<details>
<summary><strong>1. Continuous Delivery &amp; Automation</strong> &nbsp;·&nbsp; 4 sub-dimensions</summary>

<br>

Practices that enable fast, repeatable, and low-risk delivery of changes to production.

| Sub-Dimension | DORA Outcomes |
|:---|:---|
| Version Control & Trunk-Based Development | Deployment Frequency, Change Lead Time |
| Continuous Integration & Test Automation | Deployment Frequency, Change Fail Rate |
| Deployment Automation & Release Orchestration | Deployment Frequency, Change Lead Time, Rework Rate |
| Database Change Management | Deployment Frequency, Change Fail Rate |

</details>

<details>
<summary><strong>2. Architecture &amp; Infrastructure</strong> &nbsp;·&nbsp; 4 sub-dimensions</summary>

<br>

Technical foundations that enable independent, small-batch changes while ensuring reliability and scalability. Informed by Conway's Law — system structure should reflect intended team boundaries.

| Sub-Dimension | DORA Outcomes |
|:---|:---|
| Loosely Coupled Architecture | Deployment Frequency, Change Lead Time, Change Fail Rate |
| Cloud & Infrastructure Automation | Change Lead Time, Rework Rate, Organisational Performance |
| Platform Engineering | Change Lead Time, Developer Experience, Organisational Performance |
| Cognitive Load & Team Scope | Change Lead Time, Deployment Frequency, Developer Experience |

</details>

<details>
<summary><strong>3. Lean Flow &amp; Product Management</strong> &nbsp;·&nbsp; 4 sub-dimensions</summary>

<br>

Planning and delivery practices focused on rapid feedback, small batches, limiting work in process, and visualising the end-to-end flow of value.

| Sub-Dimension | DORA Outcomes |
|:---|:---|
| Value Stream Visibility | Change Lead Time, Deployment Frequency, Organisational Performance |
| Working in Small Batches & Limiting WIP | Deployment Frequency, Change Lead Time |
| User-Centric & Hypothesis-Driven Development | Organisational Performance, Product Performance |
| Stable, Prioritised Backlog | Team Productivity, Burnout Reduction, Organisational Performance |

</details>

<details>
<summary><strong>4. Observability, Feedback &amp; Reliability</strong> &nbsp;·&nbsp; 3 sub-dimensions</summary>

<br>

Ensuring systems are measurable, monitored, and capable of rapid recovery.

| Sub-Dimension | DORA Outcomes |
|:---|:---|
| Monitoring & Alerting | Rework Rate, Change Fail Rate, Recovery Time |
| Failure Recovery & Incident Response | Change Fail Rate, Rework Rate, Recovery Time |
| Chaos Engineering & Proactive Resilience | Rework Rate, Organisational Learning, Recovery Time |

</details>

<details>
<summary><strong>5. Security &amp; Compliance</strong> &nbsp;·&nbsp; 3 sub-dimensions</summary>

<br>

Incorporating security throughout the software lifecycle without slowing delivery.

| Sub-Dimension | DORA Outcomes |
|:---|:---|
| Shift-Left Security | Change Fail Rate, Change Lead Time |
| Secure Software Supply Chain | Change Fail Rate, Rework Rate |
| Compliance Automation | Change Lead Time, Organisational Performance |

</details>

<details>
<summary><strong>6. Culture, Learning &amp; Leadership</strong> &nbsp;·&nbsp; 5 sub-dimensions</summary>

<br>

Organisational environment, leadership style, and commitment to continuous learning that underpin high performance and sustained improvement.

| Sub-Dimension | DORA Outcomes |
|:---|:---|
| Westrum Organisational Culture | Change Fail Rate, Rework Rate, Team Performance |
| Transformational Leadership | Productivity, Organisational Performance, Burnout Reduction |
| Team Autonomy & Empowerment | Change Lead Time, Deployment Frequency, Job Satisfaction |
| Continuous Learning & Knowledge Sharing | Organisational Performance, Developer Experience |
| Team Interaction & Dependency Design | Change Lead Time, Deployment Frequency, Organisational Performance |

</details>

---

## Maturity Levels

| Level | Label | Description |
|:---:|:---|:---|
| `1` | **Foundational** | Processes are being established; initial awareness and adoption efforts are underway |
| `2` | **Improving** | Greater consistency and automation; teams actively refine capabilities |
| `3` | **Accelerating** | Advanced automation and collaboration; feedback loops and rapid delivery are emphasised |
| `4` | **Leading** | Continuous improvement is cultural; processes are dynamic, data-driven, and deliver high performance |

---

## Getting Started

### Prerequisites

- **Node.js v18+** — [nodejs.org](https://nodejs.org)

### Running the Tool

```bash
git clone <repository-url>
cd devops-maturity-model
npm install
npm start
```

Open [http://localhost:3131](http://localhost:3131) in your browser.

To use a different port:

```bash
PORT=8080 npm start
```

---

## Scope and Role of This Tool

This tool operates at the **organisation or team level**. It assesses capability — whether a team practises trunk-based development, has effective monitoring, operates with psychological safety, and so on. These capabilities are properties of the team regardless of which value stream is being examined. The model does not assess a specific flow of work; it assesses the team's ability to deliver.

| Tool | Level | Purpose |
|:---|:---|:---|
| **Maturity Assessment** | Organisation / Team | Diagnoses capability gaps across DevOps dimensions |
| **Outcome Mapping** | Engagement | Defines what the client wants to achieve |
| **Value Stream Mapping** | Value Stream | Maps the specific flow of work to surface constraints blocking those outcomes |

The maturity assessment feeds outcome mapping by surfacing where capability is weakest. Outcome mapping then determines which improvements matter most. VSM is a subsequent, separate activity that examines flow for a specific value stream in service of the agreed outcomes.

> The facilitation guide for outcome mapping and VSM is maintained separately.

---

## Consultant Workflow

<details>
<summary><strong>Step 1 &nbsp;—&nbsp; Define the Engagement</strong></summary>

<br>

Enter the client or project name in the **Project** field. Each saved state file is scoped to this label, so keep it consistent across sessions to maintain a coherent history.

</details>

<details>
<summary><strong>Step 2 &nbsp;—&nbsp; Establish Context</strong></summary>

<br>

Gain a broad understanding of the client's delivery organisation — its teams, technology, and delivery practices — before beginning the assessment. Consider using the [DORA Quick Check](https://dora.dev/quickcheck/) as a lightweight warm-up to surface initial perceptions of delivery performance.

</details>

<details>
<summary><strong>Step 3 &nbsp;—&nbsp; Assess Each Sub-Dimension</strong></summary>

<br>

Work through the 23 sub-dimensions with the client team, selecting the maturity level that best reflects current practice. The tool calculates an overall maturity score and percentage as you go.

</details>

<details>
<summary><strong>Step 4 &nbsp;—&nbsp; Generate a Gap Analysis</strong></summary>

<br>

Save the current state and open the **Gap Analysis** report. It shows the current maturity level alongside the next target level for every sub-dimension, with space to document notes. This report gives the client a clear view of their capability landscape and opens the conversation about where improvement effort should be directed.

</details>

<details>
<summary><strong>Step 5 &nbsp;—&nbsp; Move to Outcome Mapping</strong></summary>

<br>

The gap analysis is an input into outcome mapping, not a direct action plan. Use it to inform a structured conversation about what the client wants to achieve. Outcome mapping, VSM, and the improvement cycle that follows are covered in the facilitation guide.

</details>

<details>
<summary><strong>Step 6 &nbsp;—&nbsp; Track Progress Over Time</strong></summary>

<br>

Each time you save state, a timestamped snapshot is stored server-side. Use the **Time Series Graph** to visualise trends across all dimensions between sessions — useful for demonstrating improvement and identifying stagnation or regression over the course of an engagement.

</details>

---

## State Files

Clicking **Save State** downloads a JSON file to the browser and writes a timestamped snapshot to the server's in-memory history. Downloaded files are named `<project>.json` (slugified from the project name) and can be reloaded at any time with **Load State**.

> **Note:** The server holds history in memory — restarting the process clears it. Load a previously saved file at the start of each session to restore the snapshot history for the Time Series Graph.

---

## Customisation

The model's structure is defined in `public/dimensions.json`. Each dimension has a `name`, `description`, and an array of `subDimensions`, each with `levels` and a list of `improves` outcomes. Edit this file to:

- Add, remove, or reorder dimensions or sub-dimensions
- Adjust level descriptions to match client context or industry language
- Add or modify the DORA/outcome `improves` tags

> Changes take effect on the next page load — no rebuild required.

---

## Theoretical Foundations

| Source | Relevance |
|:---|:---|
| [**Accelerate**](https://itrevolution.com/product/accelerate/) — Forsgren, Humble, Kim | Foundation for the four DORA metrics and the capabilities that predict software delivery performance |
| [**DORA Capability Catalog**](https://dora.dev/capabilities/) | Source for technical, process, and cultural capabilities linked to delivery outcomes |
| [**Team Topologies**](https://teamtopologies.com/book) — Skelton, Pais | Informs cognitive load management, team interaction modes, stream-aligned teams, and platform engineering |
| [**The DevOps Handbook**](https://itrevolution.com/product/the-devops-handbook-second-edition/) — Kim, Humble, Debois, Willis, Forsgren | Underpins the three ways: flow, feedback, and continual learning |
| [**Flow Engineering**](https://flowengineering.io/) — Pereira, Davis | Underpins the broader improvement methodology (outcome mapping, VSM, constraint-led iteration) used alongside this tool |
| [**Westrum's Organisational Model**](https://itrevolution.com/articles/westrums-organizational-model-in-tech-orgs/) — Westrum | Defines the generative culture construct used in the Culture dimension |
| **Conway's Law** — Melvin Conway | Informs loosely coupled architecture, team interaction design, and the reverse Conway maneuver |

---

<div align="center">

*Built by Enablis &nbsp;·&nbsp; For internal consultant use*

</div>
