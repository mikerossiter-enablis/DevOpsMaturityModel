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
document.addEventListener("DOMContentLoaded", () => {
  fetch("dimensions.json")
    .then(response => response.json())
    .then(dimensions => {
      const tableBody = document.getElementById("table-body");
      const averageLevelDisplay = document.getElementById("average-level");
      const levelDescriptionDisplay = document.getElementById("level-description");
      const projectNameInput = document.getElementById("project-name-input");
      const stateFileInput = document.getElementById("state-file-input");
      let selectedLevels = {};

      const levelDescriptions = {
        1: "Foundational - Basic, ad-hoc practices.",
        2: "Improving - Some structure, still evolving.",
        3: "Accelerating - Standardised, stable processes with frequent interactions.",
        4: "Leading - On-demand deployment, highly optimised DevOps practices."
      };

      // Save State — download a JSON file and record a snapshot server-side
      document.getElementById("save-state-btn").addEventListener("click", () => {
        const project = projectNameInput.value.trim();
        const state = getModelState();
        const payload = {
          project: project || null,
          savedAt: new Date().toISOString(),
          state
        };

        // Trigger browser download
        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const slug = project
          ? project.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
          : "devops-maturity";
        a.href = url;
        a.download = `${slug}-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Also record a snapshot server-side (for time series graph and gap analysis)
        fetch("/save-state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project: project || null, state })
        }).catch(() => {});
      });

      // Load State — open a file picker
      document.getElementById("load-state-btn").addEventListener("click", () => {
        stateFileInput.value = "";
        stateFileInput.click();
      });

      stateFileInput.addEventListener("change", () => {
        const file = stateFileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = event => {
          try {
            const data = JSON.parse(event.target.result);
            // Support both { state: {...}, project: "..." } and bare { selectedLevels: {...} }
            const stateData = data.state || data;
            const project = data.project || "";

            if (!stateData || !stateData.selectedLevels) {
              alert("Invalid state file — no selectedLevels found.");
              return;
            }

            loadModelState(stateData);
            projectNameInput.value = project;

            // Update server's in-memory state for gap analysis
            fetch("/set-state", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ project: project || null, state: stateData })
            }).catch(() => {});
          } catch (e) {
            alert("Could not read file. Please select a valid JSON state file.");
          }
        };
        reader.readAsText(file);
      });

      // Reset — clear everything client-side
      document.getElementById("reset-state-btn").addEventListener("click", () => {
        if (confirm("This will clear the current assessment. Are you sure?")) {
          resetModel();
        }
      });

      function loadModelState(savedState) {
        const { selectedLevels: savedLevels } = savedState;
        dimensions.forEach((dimension, dimensionIndex) => {
          selectedLevels[dimensionIndex] = savedLevels[dimensionIndex] || {};
          dimension.subDimensions.forEach((subDim, subDimIndex) => {
            if (savedLevels[dimensionIndex] && savedLevels[dimensionIndex][subDimIndex] !== undefined) {
              selectedLevels[dimensionIndex][subDimIndex] = savedLevels[dimensionIndex][subDimIndex];
            }
            const levelSelector = document.querySelector(`#dimension-${dimensionIndex}-subdimension-${subDimIndex}`);
            if (levelSelector) {
              levelSelector.value = savedLevels[dimensionIndex]?.[subDimIndex] || "";
            }
          });
          updateProgress(dimensionIndex);
        });
        updateAverageLevel();
      }

      function resetModel() {
        selectedLevels = {};
        document.querySelectorAll("select.level-selector").forEach(s => { s.value = ""; });
        dimensions.forEach((dimension, dimensionIndex) => {
          const progressBar = document.getElementById(`progress-bar-${dimensionIndex}`);
          if (progressBar) { progressBar.style.width = "0%"; progressBar.textContent = ""; }
          const thinProgressBar = document.getElementById(`progress-bar-closed-${dimensionIndex}`);
          if (thinProgressBar) { thinProgressBar.style.width = "0%"; thinProgressBar.textContent = ""; }
        });
        averageLevelDisplay.textContent = "Please select levels for each dimension";
        levelDescriptionDisplay.textContent = "";
      }

      function updateProgress(dimensionIndex) {
        const selectElements = document.querySelectorAll(`.sub-dimension-${dimensionIndex} select.level-selector`);
        let total = 0;
        let count = 0;

        if (selectElements.length > 0) {
          selectElements.forEach(select => {
            if (select.value === "") return;
            total += parseInt(select.value);
            count++;
          });
        } else {
          if (selectedLevels[dimensionIndex]) {
            Object.values(selectedLevels[dimensionIndex]).forEach(val => {
              if (val !== "" && val !== undefined) { total += val; count++; }
            });
          }
        }

        const dimensionSubCount = dimensions[dimensionIndex].subDimensions.length;
        if (count < dimensionSubCount) {
          const progressBar = document.getElementById(`progress-bar-${dimensionIndex}`);
          if (progressBar) { progressBar.style.width = "0%"; progressBar.textContent = ""; }
          const thinProgressBar = document.getElementById(`progress-bar-closed-${dimensionIndex}`);
          if (thinProgressBar) { thinProgressBar.style.width = "0%"; thinProgressBar.textContent = ""; }
          updateAverageLevel();
          return;
        }

        const percentage = (total / count / 4) * 100;

        const progressBar = document.getElementById(`progress-bar-${dimensionIndex}`);
        if (progressBar) {
          progressBar.style.width = `${percentage}%`;
          progressBar.textContent = `${percentage.toFixed(1)}% Complete`;
          progressBar.className = "progress-bar";
          if (percentage === 100) progressBar.classList.add("colour5");
          else if (percentage > 75) progressBar.classList.add("colour4");
          else if (percentage > 50) progressBar.classList.add("colour3");
          else if (percentage > 25) progressBar.classList.add("colour2");
          else progressBar.classList.add("colour1");
        }

        const thinProgressBar = document.getElementById(`progress-bar-closed-${dimensionIndex}`);
        if (thinProgressBar) {
          thinProgressBar.style.width = `${percentage}%`;
          thinProgressBar.textContent = "";
          thinProgressBar.className = "progress-bar progress-bar-thin";
          if (percentage === 100) thinProgressBar.classList.add("colour5");
          else if (percentage > 75) thinProgressBar.classList.add("colour4");
          else if (percentage > 50) thinProgressBar.classList.add("colour3");
          else if (percentage > 25) thinProgressBar.classList.add("colour2");
          else thinProgressBar.classList.add("colour1");
        }
        updateAverageLevel();
      }

      function updateAverageLevel() {
        let totalLevels = 0;
        let totalSubdimensions = 0;
        let allSelected = true;

        dimensions.forEach((dimension, dimensionIndex) => {
          dimension.subDimensions.forEach((subDim, subDimIndex) => {
            totalSubdimensions++;
            if (!selectedLevels[dimensionIndex] ||
              selectedLevels[dimensionIndex][subDimIndex] === undefined ||
              selectedLevels[dimensionIndex][subDimIndex] === "") {
              allSelected = false;
            } else {
              totalLevels += selectedLevels[dimensionIndex][subDimIndex];
            }
          });
        });

        if (!allSelected) {
          averageLevelDisplay.textContent = "Please select levels for each dimension";
          levelDescriptionDisplay.textContent = "";
          return;
        }

        const averageLevel = totalLevels / totalSubdimensions;
        const roundedAverageLevel = Math.round(averageLevel);
        const percentage = (averageLevel / 4) * 100;
        averageLevelDisplay.textContent = `Level: ${roundedAverageLevel} (${percentage.toFixed(2)}% completed)`;
        levelDescriptionDisplay.textContent = levelDescriptions[roundedAverageLevel] || "";
      }

      function getModelState() {
        const modelState = { selectedLevels: {} };
        dimensions.forEach((dimension, dimensionIndex) => {
          modelState.selectedLevels[dimensionIndex] = {};
          if (!selectedLevels[dimensionIndex]) {
            dimension.subDimensions.forEach((_, subDimIndex) => {
              modelState.selectedLevels[dimensionIndex][subDimIndex] = "";
            });
          } else {
            dimension.subDimensions.forEach((_, subDimIndex) => {
              modelState.selectedLevels[dimensionIndex][subDimIndex] =
                selectedLevels[dimensionIndex][subDimIndex] || "";
            });
          }
        });
        return modelState;
      }

      function renderDimensions() {
        dimensions.forEach((dimension, dimensionIndex) => {
          const row = document.createElement("tr");
          row.classList.add("dimension-row");
          row.id = `row-${dimensionIndex}`;
          const cell = document.createElement("td");
          cell.textContent = dimension.name;
          cell.classList.add("clickable");
          cell.style.cursor = "pointer";
          cell.style.fontWeight = "bold";
          cell.colSpan = 2;
          row.appendChild(cell);
          tableBody.appendChild(row);

          const closedProgressRow = document.createElement("tr");
          closedProgressRow.id = `progress-row-closed-${dimensionIndex}`;
          const closedProgressCell = document.createElement("td");
          closedProgressCell.colSpan = 2;
          const closedProgressContainer = document.createElement("div");
          closedProgressContainer.classList.add("progress-container");
          const thinProgressBar = document.createElement("div");
          thinProgressBar.classList.add("progress-bar", "progress-bar-thin");
          thinProgressBar.id = `progress-bar-closed-${dimensionIndex}`;
          closedProgressContainer.appendChild(thinProgressBar);
          closedProgressCell.appendChild(closedProgressContainer);
          closedProgressRow.appendChild(closedProgressCell);
          tableBody.insertBefore(closedProgressRow, row.nextSibling);

          let expanded = false;
          const arrow = document.createElement("span");
          arrow.classList.add("arrow");
          arrow.textContent = "   🔽";
          cell.appendChild(arrow);

          cell.addEventListener("click", () => {
            if (expanded) {
              document.querySelectorAll(`.sub-dimension-${dimensionIndex}`).forEach(el => el.remove());
              const progressRow = document.getElementById(`progress-row-${dimensionIndex}`);
              if (progressRow) progressRow.remove();
              closedProgressRow.style.display = "table-row";
              expanded = false;
            } else {
              closedProgressRow.style.display = "none";
              if (!selectedLevels[dimensionIndex]) selectedLevels[dimensionIndex] = {};

              dimension.subDimensions.forEach((subDim, subDimIndex) => {
                const subRow = document.createElement("tr");
                subRow.classList.add(`sub-dimension-${dimensionIndex}`);
                const subCell1 = document.createElement("td");
                subCell1.textContent = subDim.name;
                subCell1.style.paddingLeft = "20px";
                const subCell2 = document.createElement("td");
                const select = document.createElement("select");
                select.classList.add("level-selector");
                select.id = `dimension-${dimensionIndex}-subdimension-${subDimIndex}`;

                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "Select level";
                select.appendChild(defaultOption);

                subDim.levels.forEach((levelText, levelIndex) => {
                  const option = document.createElement("option");
                  option.value = levelIndex + 1;
                  option.textContent = `Level ${levelIndex + 1}: ${levelText}`;
                  select.appendChild(option);
                });

                if (selectedLevels[dimensionIndex] &&
                  selectedLevels[dimensionIndex][subDimIndex] !== undefined &&
                  selectedLevels[dimensionIndex][subDimIndex] !== "") {
                  select.value = selectedLevels[dimensionIndex][subDimIndex];
                } else {
                  select.value = "";
                }

                select.addEventListener("change", () => {
                  selectedLevels[dimensionIndex][subDimIndex] = select.value === "" ? "" : parseInt(select.value);
                  updateProgress(dimensionIndex);
                });

                subCell2.appendChild(select);
                subRow.appendChild(subCell1);
                subRow.appendChild(subCell2);
                tableBody.insertBefore(subRow, closedProgressRow);
              });

              const progressRow = document.createElement("tr");
              progressRow.id = `progress-row-${dimensionIndex}`;
              const progressCell = document.createElement("td");
              progressCell.colSpan = 2;
              const progressContainer = document.createElement("div");
              progressContainer.classList.add("progress-container");
              const progressBar = document.createElement("div");
              progressBar.classList.add("progress-bar");
              progressBar.id = `progress-bar-${dimensionIndex}`;
              progressContainer.appendChild(progressBar);
              progressCell.appendChild(progressContainer);
              progressRow.appendChild(progressCell);
              tableBody.insertBefore(progressRow, closedProgressRow);
              expanded = true;
              updateProgress(dimensionIndex);
            }
          });
        });
      }

      renderDimensions();
      averageLevelDisplay.textContent = "Please select levels for each dimension";
      levelDescriptionDisplay.textContent = "";
    })
    .catch(error => console.error("Error loading dimensions:", error));
});
