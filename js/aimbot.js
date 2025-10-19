// aimbot.js — nur tab-spezifische Logik
console.log('aimbot.js geladen');
// Beispiel: einfache demo-interaktion (erst aktiv, wenn Tab geladen)
(function(){
  const el = document.getElementById('tab-aimbot');
  if(!el) return;
  // fülle mit Demo-Controls
  const container = document.createElement('div');
  container.innerHTML = `
    <label style="display:block;margin:8px 0;">
      <input type="checkbox" id="aim-enabled"> Aimbot aktiv
    </label>
    <label style="display:block;margin:8px 0;">
      Empfindlichkeit:
      <input id="aim-sens" type="range" min="1" max="10" value="5">
    </label>
  `;
  el.appendChild(container);

  // events
  setTimeout(()=>{ // sicherstellen, dass DOM ready ist
    const ch = document.getElementById('aim-enabled');
    const rg = document.getElementById('aim-sens');
    ch?.addEventListener('change', () => console.log('Aimbot:', ch.checked));
    rg?.addEventListener('input', () => console.log('Sens:', rg.value));
  }, 50);
})();
