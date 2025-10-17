import { showToast } from "./main.js";

export const html = `
  <h2>Advanced</h2>
  <div class="advanced-container">
    <label><input type="checkbox" id="debugConsole"> Debug Console</label>
    <label><input type="checkbox" id="performanceMode"> Performance Mode</label>
  </div>
`;

export function init() {
  const debugConsole = document.getElementById("debugConsole");
  const performanceMode = document.getElementById("performanceMode");

  debugConsole.addEventListener("change", e => {
    if (e.target.checked) {
      showToast("Debug console opened");
      console.log("Debug console active");
    } else {
      showToast("Debug console closed");
    }
  });

  performanceMode.addEventListener("change", e => {
    document.body.style.transition = e.target.checked ? "none" : "all 0.3s ease";
    showToast(e.target.checked ? "Performance mode on" : "Performance mode off");
  });
}
