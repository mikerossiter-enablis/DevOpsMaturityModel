const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({ html: true });
const dimensions = require('../public/dimensions.json');
const app = express();
const PORT = process.env.PORT || 3131;

let currentHistory = [];
let currentProject = null;

app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());

app.post('/save-state', (req, res) => {
  const { project, history } = req.body;
  currentProject = project || null;
  currentHistory = Array.isArray(history) ? history : [];
  res.json({ success: true });
});

app.post('/set-state', (req, res) => {
  const { project, history } = req.body;
  currentProject = project || null;
  currentHistory = Array.isArray(history) ? history : [];
  res.json({ success: true });
});

app.get('/current-project', (req, res) => {
  res.json({ project: currentProject });
});

app.get('/state-files', (req, res) => {
  const projectFilter = req.query.project !== undefined ? req.query.project : null;
  if (projectFilter !== null && (currentProject || null) !== (projectFilter || null)) {
    return res.json([]);
  }
  res.json(currentHistory.map(entry => ({
    timestamp: entry.savedAt,
    project: currentProject,
    state: entry.state
  })));
});

app.get('/gap-analysis', (req, res) => {
  const latestEntry = currentHistory[currentHistory.length - 1];
  if (!latestEntry) {
    return res.send('<h1>Gap Analysis</h1><p>No state loaded. Save or load an assessment first.</p>');
  }

  const selectedLevels = latestEntry.state.selectedLevels;
  let totalLevels = 0;
  let totalSubdimensions = 0;
  let naSubdimensions = 0;
  for (let d in selectedLevels) {
    for (let s in selectedLevels[d]) {
      if (selectedLevels[d][s] === 'na') { naSubdimensions++; continue; }
      const val = parseInt(selectedLevels[d][s]);
      if (!isNaN(val) && val > 0) { totalLevels += val; totalSubdimensions++; }
    }
  }
  const averageLevel = totalSubdimensions > 0 ? totalLevels / totalSubdimensions : 0;
  const roundedLevel = Math.round(averageLevel);
  const percentage = totalSubdimensions > 0 ? ((averageLevel / 4) * 100).toFixed(1) : 0;
  const levelDescriptions = { 1: 'Foundational', 2: 'Improving', 3: 'Accelerating', 4: 'Leading' };
  const levelLabel = levelDescriptions[roundedLevel] || 'N/A';
  const naNote = naSubdimensions > 0 ? ` &middot; ${naSubdimensions} marked not applicable` : '';
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
      <p>${percentage}% complete &middot; ${totalSubdimensions} sub-dimensions assessed${naNote}</p>
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
      const rawValue = selectedLevels[d][s];
      if (rawValue === 'na') {
        html += `<tr style="background-color: #f5f5f5; color: #888;">
          <td>${dimension.name}</td><td>${subDimension.name}</td>
          <td colspan="2" style="font-style: italic; color: #aaa;">Not applicable to this engagement</td>
          <td><textarea placeholder="Reason or context (optional)"></textarea></td>
        </tr>`;
      } else {
        const levelNumber = parseInt(rawValue);
        const currentLevelText = subDimension.levels[levelNumber - 1] || 'Not selected';
        const nextLevelText = levelNumber < subDimension.levels.length ? subDimension.levels[levelNumber] : 'At Leading level — maintain and continue improving';
        html += `<tr>
          <td>${dimension.name}</td><td>${subDimension.name}</td>
          <td>${currentLevelText}</td><td>${nextLevelText}</td>
          <td><textarea placeholder="Describe actions to reach the next level"></textarea></td>
        </tr>`;
      }
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
