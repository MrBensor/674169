import { showToast } from "./main.js";

export const html = `
  <h2>General Options</h2>
  <div class="checkbox-group">
    <label><input type="checkbox" id="darkMode"> Dark Mode</label>
    <label><input type="checkbox" id="borderToggle"> Show Border</label>
    <label><input type="checkbox" id="glowEffect"> Glow Effect</label>
  </div>
`;

export function init() {
  const darkMode = document.getElementById("darkMode");
  const borderToggle = document.getElementById("borderToggle");
  const glowEffect = document.getElementById("glowEffect");

  darkMode.addEventListener("change", e => {
    document.body.classList.toggle("dark-mode", e.target.checked);
    showToast(e.target.checked ? "Dark mode on" : "Dark mode off");
  });

  borderToggle.addEventListener("change", e => {
    const win = document.getElementById("gui-window");
    win.classList.toggle("border-toggle", e.target.checked);
    showToast(e.target.checked ? "Border visible" : "Border hidden");
  });

  glowEffect.addEventListener("change", e => {
    const win = document.getElementById("gui-window");
    win.classList.toggle("glow", e.target.checked);
    showToast(e.target.checked ? "Glow enabled" : "Glow disabled");
  });
}
