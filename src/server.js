/*
 * This file is part of the DevOps Maturity Assessment Tool project.
 * Copyright (C) 2026 Mike Rossiter
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({ html: true });
const dimensions = require('../public/dimensions.json');
const app = express();
const PORT = process.env.PORT || 3131;

const STATES_DIR = path.join(__dirname, '..', 'states');
if (!fs.existsSync(STATES_DIR)) fs.mkdirSync(STATES_DIR, { recursive: true });

// In-memory current state for gap analysis — populated on save or load
let currentState = null;
let currentProject = null;

// Auto-load most recent state file on startup so gap analysis works immediately
(function loadLatestState() {
  try {
    const files = fs.readdirSync(STATES_DIR)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();
    if (files.length > 0) {
      const data = JSON.parse(fs.readFileSync(path.join(STATES_DIR, files[0]), 'utf8'));
      currentState = data.state;
      currentProject = data.project || null;
    }
  } catch (e) {}
})();

app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());

app.get('/license', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, '..', 'LICENSE'));
});

// Called when user saves — writes a timestamped snapshot and updates in-memory state
app.post('/save-state', (req, res) => {
  const { state, project } = req.body;
  currentState = state;
  currentProject = project || null;

  const ts = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const filename = `${ts}.json`;
  try {
    fs.writeFileSync(path.join(STATES_DIR, filename), JSON.stringify({
      project: currentProject,
      timestamp: new Date().toISOString(),
      state
    }, null, 2));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Error writing snapshot' });
  }
});

// Called when user loads a file — updates in-memory state only (no new snapshot)
app.post('/set-state', (req, res) => {
  const { state, project } = req.body;
  currentState = state;
  currentProject = project || null;
  res.json({ success: true });
});

// All saved snapshots (for time series graph)
app.get('/state-files', (req, res) => {
  try {
    const files = fs.readdirSync(STATES_DIR)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();
    const result = files.map(filename => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(STATES_DIR, filename), 'utf8'));
        return { filename, timestamp: data.timestamp, project: data.project, state: data.state };
      } catch (e) { return null; }
    }).filter(Boolean);
    res.json(result);
  } catch (e) {
    res.json([]);
  }
});

app.get('/gap-analysis', (req, res) => {
  if (!currentState) {
    return res.send('<h1>Gap Analysis</h1><p>No state loaded. Save or load an assessment first.</p>');
  }

  const selectedLevels = currentState.selectedLevels;
  let totalLevels = 0;
  let totalSubdimensions = 0;
  for (let d in selectedLevels) {
    for (let s in selectedLevels[d]) {
      const val = parseInt(selectedLevels[d][s]);
      if (!isNaN(val) && val > 0) { totalLevels += val; totalSubdimensions++; }
    }
  }
  const averageLevel = totalSubdimensions > 0 ? totalLevels / totalSubdimensions : 0;
  const roundedLevel = Math.round(averageLevel);
  const percentage = totalSubdimensions > 0 ? ((averageLevel / 4) * 100).toFixed(1) : 0;
  const levelDescriptions = { 1: 'Foundational', 2: 'Improving', 3: 'Accelerating', 4: 'Leading' };
  const levelLabel = levelDescriptions[roundedLevel] || 'N/A';
  const projectLabel = currentProject ? `<p class="project-label">Project: <strong>${currentProject}</strong></p>` : '';

  let html = `<!DOCTYPE html><html><head>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">
    <meta charset="utf-8">
    <title>Gap Analysis${currentProject ? ' — ' + currentProject : ''}</title>
    <style>
      body { font-family: Lato, sans-serif; margin: 40px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      th { background-color: #f4f4f4; }
      textarea { width: 100%; height: 60px; }
      .button-container { margin-top: 20px; }
      button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
      .level-summary { background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 16px 24px; margin-bottom: 20px; display: inline-block; }
      .level-summary h2 { margin: 0 0 4px; font-size: 22px; }
      .level-summary p { margin: 0; color: #555; font-size: 15px; }
      .project-label { color: #666; font-size: 14px; margin-bottom: 16px; }
    </style>
  </head><body>
    <h1>Gap Analysis</h1>
    ${projectLabel}
    <div class="level-summary">
      <h2>Current Level: ${roundedLevel} &mdash; ${levelLabel}</h2>
      <p>${percentage}% complete &middot; ${totalSubdimensions} sub-dimensions assessed</p>
    </div>
    <p>This report lists the current maturity levels along with a gap analysis to help you determine improvements needed to reach the next level. Please review each entry and add your own notes where indicated.</p>
    <div class="button-container"><button onclick="window.print()">Print / Save as PDF</button></div>
    <table>
      <tr>
        <th>Dimension</th><th>Sub-Dimension</th><th>Current Condition</th><th>Target Condition</th>
        <th>Notes (Improvement Suggestions and Objectives - drag to scale)</th>
      </tr>`;

  for (let d in selectedLevels) {
    const dimIndex = parseInt(d);
    const dimension = dimensions[dimIndex];
    for (let s in selectedLevels[d]) {
      const subIndex = parseInt(s);
      const subDimension = dimension.subDimensions[subIndex];
      const levelNumber = parseInt(selectedLevels[d][s]);
      const currentLevelText = subDimension.levels[levelNumber - 1] || 'Not selected';
      const nextLevelText = levelNumber < subDimension.levels.length ? subDimension.levels[levelNumber] : 'N/A';
      html += `<tr>
        <td>${dimension.name}</td><td>${subDimension.name}</td>
        <td>${currentLevelText}</td><td>${nextLevelText}</td>
        <td><textarea placeholder="Describe actions to reach the next level"></textarea></td>
      </tr>`;
    }
  }

  html += `</table></body></html>`;
  res.send(html);
});

app.get('/readme', (req, res) => {
  fs.readFile(path.join(__dirname, '../README.md'), 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading README');
    const htmlContent = md.render(data);
    res.send(`<!DOCTYPE html><html><head>
      <meta charset="utf-8"><title>README</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css">
      <style>
        body { box-sizing: border-box; min-width: 200px; max-width: 980px; margin: 0 auto; padding: 45px; }
        .markdown-body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
      </style>
    </head><body class="markdown-body">${htmlContent}</body></html>`);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
