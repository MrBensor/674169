// visuals.js — nur tab-spezifische Logik
console.log('visuals.js geladen');
(function(){
  const el = document.getElementById('tab-visuals');
  if(!el) return;
  const c = document.createElement('div');
  c.innerHTML = `
    <label style="display:block;margin:8px 0;">
      <input id="vis-chams" type="checkbox"> Chams
    </label>
    <label style="display:block;margin:8px 0;">
      <input id="vis-glow" type="checkbox"> Glow
    </label>
  `;
  el.appendChild(c);

  setTimeout(() => {
    const chams = document.getElementById('vis-chams');
    const glow  = document.getElementById('vis-glow');
    chams?.addEventListener('change', () => console.log('Chams', chams.checked));
    glow?.addEventListener('change', () => console.log('Glow', glow.checked));
  }, 50);
})();
