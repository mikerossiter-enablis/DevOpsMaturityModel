const graphContainer = document.getElementById('graph-container');
const ctx = document.getElementById('adoption-graph').getContext('2d');

function getRandomColor() {
  const r = Math.floor(Math.random() * 200);
  const g = Math.floor(Math.random() * 200);
  const b = Math.floor(Math.random() * 200);
  return `rgba(${r}, ${g}, ${b}, 1)`;
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

          return {
            label: dimension.name,
            data,
            borderColor: getRandomColor(),
            tension: 0.1,
            fill: false,
            spanGaps: true
          };
        });

        new Chart(ctx, {
          type: 'line',
          data: { datasets },
          options: {
            elements: {
              line: {
                tension: 0.5,
                cubicInterpolationMode: 'monotone',
                borderWidth: 5
              }
            },
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: 'day',
                  tooltipFormat: 'MMM dd, yyyy',
                  displayFormats: { day: 'MMM dd, yyyy' }
                },
                ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 },
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
              }
            }
          }
        });
      });
  })
  .catch(error => {
    console.error('Error loading graph data:', error);
    graphContainer.innerHTML = '<p class="no-state-message">Error loading graph data.</p>';
  });
