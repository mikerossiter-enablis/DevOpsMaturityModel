if (typeof ChartZoom !== 'undefined') Chart.register(ChartZoom);

const graphContainer = document.getElementById('graph-container');
const ctx = document.getElementById('adoption-graph').getContext('2d');

function getRandomColor() {
  const r = Math.floor(Math.random() * 200);
  const g = Math.floor(Math.random() * 200);
  const b = Math.floor(Math.random() * 200);
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

function setActivePreset(id) {
  ['btn-7d', 'btn-30d', 'btn-90d', 'btn-all'].forEach(btnId => {
    document.getElementById(btnId).classList.toggle('active', btnId === id);
  });
}

Promise.all([
  fetch('/dimensions.json').then(r => r.json()),
  fetch('/current-project').then(r => r.json())
])
  .then(([dimensions, { project }]) => {
    const projectParam = project !== null ? `?project=${encodeURIComponent(project)}` : '?project=';
    return fetch(`/state-files${projectParam}`)
      .then(r => r.json())
      .then(stateRows => {
        if (stateRows.length < 2) {
          const label = project ? `"${project}"` : 'this assessment';
          graphContainer.innerHTML = `<p class="no-state-message">Not enough data yet — save ${label} at least twice to see the trend graph.</p>`;
          document.getElementById('controls').style.display = 'none';
          return;
        }

        const stateData = stateRows
          .map(row => ({ timestamp: new Date(row.timestamp), selectedLevels: row.state.selectedLevels }))
          .sort((a, b) => a.timestamp - b.timestamp);

        const datasets = dimensions.map((dimension, dimensionIndex) => {
          const subCount = dimension.subDimensions.length;
          const data = stateData.map(state => {
            const levelsObj = state.selectedLevels[dimensionIndex] || {};
            let total = 0;
            let applicableCount = 0;
            for (let i = 0; i < subCount; i++) {
              const val = levelsObj[i];
              if (val === 'na') continue;
              const numVal = (val === undefined || val === '') ? 1 : parseInt(val, 10);
              total += numVal;
              applicableCount++;
            }
            return { x: state.timestamp, y: applicableCount > 0 ? (total / (4 * applicableCount)) * 100 : null };
          });

          const color = getRandomColor();
          return {
            label: dimension.name,
            data,
            borderColor: color,
            backgroundColor: color,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.1,
            fill: false,
            spanGaps: true
          };
        });

        const chart = new Chart(ctx, {
          type: 'line',
          data: { datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
              line: {
                tension: 0.5,
                cubicInterpolationMode: 'monotone',
                borderWidth: 3
              }
            },
            scales: {
              x: {
                type: 'time',
                time: {
                  displayFormats: {
                    second: 'HH:mm:ss',
                    minute: 'HH:mm',
                    hour:   'MMM d, HH:mm',
                    day:    'MMM d, yyyy',
                    week:   'MMM d, yyyy',
                    month:  'MMM yyyy',
                    year:   'yyyy'
                  },
                  tooltipFormat: 'MMM d, yyyy HH:mm'
                },
                ticks: { maxRotation: 45, minRotation: 0, autoSkip: true, maxTicksLimit: 10 },
                title: { display: true, text: 'Time' }
              },
              y: {
                beginAtZero: true,
                max: 100,
                title: { display: true, text: 'Adoption (%)' }
              }
            },
            plugins: {
              title: {
                display: true,
                text: 'Adoption Progress for Each Dimension Over Time'
              },
              zoom: {
                zoom: {
                  drag: {
                    enabled: true,
                    backgroundColor: 'rgba(70, 130, 180, 0.15)',
                    borderColor: 'rgba(70, 130, 180, 0.7)',
                    borderWidth: 1
                  },
                  wheel: { enabled: true, modifierKey: 'ctrl' },
                  pinch: { enabled: true },
                  mode: 'x',
                  onZoomComplete() { setActivePreset(null); }
                }
              }
            }
          }
        });

        function zoomToLastDays(days, btnId) {
          const now = Date.now();
          chart.zoomScale('x', { min: now - days * 86400000, max: now }, 'default');
          setActivePreset(btnId);
        }

        document.getElementById('btn-7d').addEventListener('click', () => zoomToLastDays(7, 'btn-7d'));
        document.getElementById('btn-30d').addEventListener('click', () => zoomToLastDays(30, 'btn-30d'));
        document.getElementById('btn-90d').addEventListener('click', () => zoomToLastDays(90, 'btn-90d'));

        document.getElementById('btn-all').addEventListener('click', () => {
          chart.resetZoom();
          setActivePreset('btn-all');
        });

        document.getElementById('btn-reset').addEventListener('click', () => {
          chart.resetZoom();
          setActivePreset('btn-all');
        });
      });
  })
  .catch(error => {
    console.error('Error loading graph data:', error);
    graphContainer.innerHTML = '<p class="no-state-message">Error loading graph data.</p>';
  });
