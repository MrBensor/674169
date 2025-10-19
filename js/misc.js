// misc.js — nur tab-spezifische Logik
console.log('misc.js geladen');
(function(){
  const el = document.getElementById('tab-misc');
  if(!el) return;
  const c = document.createElement('div');
  c.innerHTML = `
    <label style="display:block;margin:8px 0;">
      <input id="misc-a" type="checkbox"> Option A
    </label>
    <label style="display:block;margin:8px 0;">
      <input id="misc-b" type="checkbox"> Option B
    </label>
  `;
  el.appendChild(c);
  setTimeout(() => {
    document.getElementById('misc-a')?.addEventListener('change', e => console.log('misc-a', e.target.checked));
    document.getElementById('misc-b')?.addEventListener('change', e => console.log('misc-b', e.target.checked));
  }, 50);
})();
