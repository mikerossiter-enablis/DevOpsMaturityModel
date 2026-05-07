<div align="center">

# 🚀 DevOps Maturity Assessment Tool

**Assess. Track. Improve.**

A lightweight, local tool for measuring and driving DevOps adoption across your organisation.

---

[🏁 Getting Started](#getting-started) · [✨ Features](#features) · [⚙️ How It Works](#how-it-works) · [🎛️ Customisation](#customisation)

</div>

## 🤔 Why This Tool?

Most DevOps transformations stall because teams lack a clear picture of where they are and where they need to go. This tool gives you that picture — a structured, data-driven assessment across six integrated dimensions, paired with gap analysis and time-series tracking to keep improvement efforts honest and on course.

It runs locally, stores state as plain JSON files on your machine, and supports multiple projects or organisations — each with their own isolated assessment history.

## ✨ Features

| | |
|---|---|
| 📊 **Multi-Dimensional Assessment** | Evaluate maturity across 6 dimensions and 18 sub-dimensions on a 4-level scale |
| 🗂️ **Project-Based State** | Run the model against different projects or organisations, each with their own saved history |
| 🔍 **Gap Analysis Reports** | Generate printable reports showing current state, target state, and space for action plans |
| 📈 **Time-Series Tracking** | Save snapshots over time and visualise adoption trends on an interactive graph |
| 🎛️ **Fully Customisable** | Modify `dimensions.json` to tailor dimensions, levels, and descriptions to your context |
| 💾 **Local JSON Storage** | State files are plain `.json` files saved to a `states/` directory — easy to inspect, back up, or share |

## 🗂️ Dimensions

The assessment framework covers six areas that collectively represent DevOps capability:

| Dimension | Sub-Dimensions |
|---|---|
| 🔄 **Continuous Delivery & Automation** | Version Control & Trunk-Based Development · CI & Test Automation · Deployment Automation & Release Orchestration · Database Change Management |
| 🏗️ **Architecture & Infrastructure** | Loosely Coupled Architecture · Cloud & Infrastructure Automation · Platform Engineering |
| 📋 **Lean Product Management & Process** | Working in Small Batches & Limiting WIP · User-Centric & Hypothesis-Driven Development · Stable, Prioritised Backlog |
| 🔭 **Observability & Reliability** | Monitoring & Alerting · Failure Recovery & Incident Response · Chaos Engineering / Proactive Resilience |
| 🔒 **Security & Compliance** | Shift-Left Security · Secure Software Supply Chain · Compliance Automation |
| 🤝 **Culture & Leadership** | Westrum Organisational Culture · Transformational Leadership · Team Autonomy & Empowerment |

Each sub-dimension is rated across four maturity levels:

| Level | Description |
|---|---|
| 🔴 **1 — Foundational** | Processes are being established; initial awareness and adoption efforts are underway |
| 🟡 **2 — Improving** | Greater consistency and automation; teams actively refine capabilities |
| 🟢 **3 — Accelerating** | Advanced automation and collaboration; feedback loops and rapid delivery are emphasised |
| 🏆 **4 — Leading** | Continuous improvement is cultural; processes are dynamic, data-driven, and deliver high performance |

## 🏁 Getting Started

### Prerequisites

- **Node.js** (v18 or later) — [nodejs.org](https://nodejs.org)

### Install and Run

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

### First Use

Open the tool and enter the name of the organisation or engagement you're assessing (e.g. `Acme Corp`) in the **Project** field at the top. The tool starts blank — load a previous state file to resume, or start a fresh assessment.

### Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## 💾 State Files

Each time you click **Save State**, two things happen:

1. A JSON file is downloaded to your machine via the browser
2. A timestamped snapshot is written server-side to the `states/` directory (used by the Time Series Graph and Gap Analysis)

Downloaded files are named `<project>-YYYY-MM-DD.json` and can be loaded back at any time using **Load State**. The `states/` directory is excluded from git by default — manage it however suits your workflow.

## ⚙️ How It Works

### 1. 🎯 Select Your Project

Open the tool and enter the name of the project or organisation you're assessing in the **Project** field. Each saved file is self-contained — you can manage multiple projects simply by saving and loading different files.

### 2. 🗺️ Survey Your Baseline

Start by understanding your current DevOps state. Identify the value stream you are assessing — the end-to-end flow of work from idea to customer value — and agree its boundaries with the team before continuing. Consider running the [DORA Quick Check](https://dora.dev/quickcheck/) or a similar questionnaire to establish an initial sense of performance.

### 3. 📊 Assess Each Sub-Dimension

For each of the 18 sub-dimensions, select the maturity level that best reflects your current practice. The tool calculates an overall maturity score and percentage to give you a snapshot of your DevOps posture.

### 4. 🔍 Generate a Gap Analysis

Before generating the report, map the value stream you identified in step 2. Use [Value Stream Mapping](https://flowengineering.io/) to trace the flow of work, surface constraints, and make wait times and handoffs visible. The map gives you the context to interpret the gap analysis meaningfully — bottlenecks and delays often point directly to the sub-dimensions with the lowest maturity scores.

Save your state and open the Gap Analysis report. It shows your current level alongside the next target level for every sub-dimension, with space to document improvement actions — a practical input for your transformation backlog. Use the value stream map to prioritise which gaps will have the greatest impact on flow.

### 5. 🔁 Plan and Iterate

Use a structured improvement approach:

| Step | Action |
|---|---|
| 🧭 **Understand the direction** | Define the broader goal your team is working towards |
| 🔎 **Grasp current condition** | Use the assessment data to identify key constraints |
| 🎯 **Set a target condition** | Pick a short-term milestone that moves you closer |
| 🔄 **Iterate with PDCA cycles** | Run small experiments, check results, adjust |

This aligns with the [Improvement Kata](https://dora.dev/guides/devops-culture-transform/) approach recommended by DORA.

### 6. 📈 Track Progress Over Time

Each time you save, a timestamped snapshot is stored. Use the **Time Series Graph** to visualise adoption trends across all dimensions — spot improvements, stagnation, or regression at a glance.

### 7. 📏 Align with DORA Metrics

Use your assessment alongside the four key DORA metrics to measure real-world delivery performance:

| Metric | What It Measures |
|---|---|
| 🚀 **Deployment Frequency** | How often code reaches production |
| ⏱️ **Lead Time for Changes** | Time from commit to production |
| 💥 **Change Failure Rate** | Percentage of deployments causing failures |
| 🛠️ **Rework Rate** | Speed of recovery from incidents |

### 📚 Further Reading

- [**Westrum Organisational Culture**](https://itrevolution.com/articles/westrums-organizational-model-in-tech-orgs/) — IT Revolution
- [**Accelerate**](https://itrevolution.com/product/accelerate/) — Nicole Forsgren, Jez Humble, Gene Kim
- [**The DevOps Handbook**](https://itrevolution.com/product/the-devops-handbook-second-edition/) — Gene Kim, Jez Humble, Patrick Debois, John Willis, Nicole Forsgren
- [**Team Topologies**](https://teamtopologies.com/book) — Matthew Skelton, Manuel Pais
- [**Flow Engineering**](https://flowengineering.io/) — Steve Pereira, Andrew Davis
- [**DORA Capability Catalog**](https://dora.dev/capabilities/)

## 🎛️ Customisation

The tool's structure is defined in `dimensions.json`. Each dimension has a `name` and an array of `subDimensions`, each containing level descriptions. Modify this file to:

- Add, remove, or reorder dimensions
- Adjust level descriptions to match your organisation's language
- Remove sub-dimensions that don't apply to your context

Changes take effect on the next page load — no rebuild required.
