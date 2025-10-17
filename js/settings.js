import { showToast } from "./main.js";

export const html = `
  <h2>Settings</h2>
  <div class="settings-container">
    <label><input type="checkbox" id="compactView"> Compact View</label>
    <label><input type="checkbox" id="showHints"> Show Hints</label>
  </div>
`;

export function init() {
  const compactView = document.getElementById("compactView");
  const showHints = document.getElementById("showHints");

  compactView.addEventListener("change", e => {
    document.getElementById("gui-window").style.transform = e.target.checked ? "scale(0.9)" : "scale(1)";
    showToast(e.target.checked ? "Compact view on" : "Compact view off");
  });

  showHints.addEventListener("change", e => {
    showToast(e.target.checked ? "Hints enabled" : "Hints disabled");
  });
}
