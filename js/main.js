const content = document.getElementById("content");
const buttons = document.querySelectorAll(".tab-btn");
const guiWindow = document.getElementById("gui-window");
const closeBtn = document.getElementById("close-btn");

let offsetX, offsetY, isDragging = false;

function loadTab(tabName) {
  buttons.forEach(b => b.classList.remove("active"));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

  fetch(`js/${tabName}.js`)
    .then(() => {
      import(`./${tabName}.js?cacheBust=${Date.now()}`).then(module => {
        content.innerHTML = module.html;
        module.init();
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `css/${tabName}.css`;
        document.head.appendChild(link);
      });
    });
}

// Tabs anklickbar machen
buttons.forEach(btn => {
  btn.addEventListener("click", () => loadTab(btn.dataset.tab));
});

// Fensterbewegung
const header = document.getElementById("window-header");
header.addEventListener("mousedown", e => {
  isDragging = true;
  offsetX = e.clientX - guiWindow.offsetLeft;
  offsetY = e.clientY - guiWindow.offsetTop;
});

document.addEventListener("mouseup", () => isDragging = false);
document.addEventListener("mousemove", e => {
  if (!isDragging) return;
  guiWindow.style.left = e.clientX - offsetX + "px";
  guiWindow.style.top = e.clientY - offsetY + "px";
});

closeBtn.addEventListener("click", () => {
  guiWindow.style.display = "none";
});

loadTab("general");

function showToast(text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

export { showToast };
