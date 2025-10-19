/* main.js — zentrale Steuerlogik:
   - Drag & Drop für Fenster
   - Tab-Wechsel + dynamisches Laden von css/js pro Tab
   - Schneeflocken-Controller (SnowController) — start/stop
*/

/* ========== Helfer: dynamisches Laden ========== */
function loadCSSOnce(href, id){
  if(document.getElementById(id)) return Promise.resolve();
  return new Promise((res, rej) => {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => res();
    link.onerror = () => rej(new Error('CSS load failed: ' + href));
    document.head.appendChild(link);
  });
}
function loadJSOnce(src, id){
  if(document.getElementById(id)) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.id = id;
    s.src = src;
    s.async = false; // preserve order if needed
    s.onload = () => res();
    s.onerror = () => rej(new Error('JS load failed: ' + src));
    document.head.appendChild(s);
  });
}

/* ========== Drag & Drop ========== */
(function setupDrag(){
  const win = document.getElementById('gui-window');
  const header = document.getElementById('window-header') || win.querySelector('.titlebar');
  let dragging = false, offX=0, offY=0;

  header.addEventListener('mousedown', (e) => {
    // nur linke Maustaste
    if(e.button !== 0) return;
    dragging = true;
    offX = e.clientX - win.offsetLeft;
    offY = e.clientY - win.offsetTop;
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', (e) => {
    if(!dragging) return;
    let nx = e.clientX - offX;
    let ny = e.clientY - offY;
    // fine boundaries (keep window inside viewport)
    const maxX = window.innerWidth - win.offsetWidth - 8;
    const maxY = window.innerHeight - win.offsetHeight - 8;
    if(nx < 8) nx = 8;
    if(ny < 8) ny = 8;
    if(nx > maxX) nx = maxX;
    if(ny > maxY) ny = maxY;
    win.style.left = nx + 'px';
    win.style.top  = ny + 'px';
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.removeProperty('user-select');
  });
})();

/* ========== Tab-Management ========== */
(function setupTabs(){
  const tabs = Array.from(document.querySelectorAll('.tab-btn'));
  let active = null;

  // map tabname -> resource paths
  const tabResources = {
    aimbot: { css:'css/aimbot.css', js:'js/aimbot.js' },
    visuals: { css:'css/visuals.css', js:'js/visuals.js' },
    misc: { css:'css/misc.css', js:'js/misc.js' },
    settings: { css:'css/settings.css', js:'js/settings.js' }
  };

  function setActiveTab(name){
    if(active === name) return;
    // deactivate old
    if(active){
      const oldBtn = document.querySelector(`.tab-btn[data-tab="${active}"]`);
      const oldContent = document.getElementById('tab-' + active);
      if(oldBtn) oldBtn.classList.remove('active');
      if(oldContent) oldContent.classList.remove('active');
    }
    // activate new
    const newBtn = document.querySelector(`.tab-btn[data-tab="${name}"]`);
    const newContent = document.getElementById('tab-' + name);
    if(newBtn) newBtn.classList.add('active');
    if(newContent) newContent.classList.add('active');

    // load resources (css + js) for tab (if available)
    const res = tabResources[name];
    if(res){
      // load css then js
      loadCSSOnce(res.css, name + '-css').catch(err => console.warn(err));
      loadJSOnce(res.js, name + '-js').catch(err => console.warn(err));
    }
    active = name;
  }

  // bind buttons
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-tab');
      setActiveTab(name);
    });
  });

  // initial tab
  const initial = document.querySelector('.tab-btn.active')?.getAttribute('data-tab') || 'aimbot';
  setActiveTab(initial);
})();

/* ========== SnowController: realistische Schneeflocken in Canvas ========== */
window.SnowController = (function(){
  // canvas confined to the interior of the window (content area)
  const canvas = document.getElementById('effect-canvas');
  const win = document.getElementById('gui-window');
  const content = document.querySelector('.content');

  let ctx = canvas.getContext('2d');
  let width = 0, height = 0;
  let flakes = [];
  let rafId = null;
  let running = false;
  let lastTime = 0;

  // physik-gewürz: wind, gravity, rotation
  const GRAVITY = 40; // px/s^2
  const WIND_CHANGE_INTERVAL = 3000; // ms
  let wind = 0; // px/s
  let lastWindChange = 0;

  function resizeCanvas(){
    // compute canvas to exactly overlay content area inside window
    const rect = content.getBoundingClientRect();
    const winRect = win.getBoundingClientRect();
    // place canvas relative to window (canvas is absolutely positioned inside window)
    canvas.style.top = (rect.top - winRect.top) + 'px';
    canvas.style.left = (rect.left - winRect.left) + 'px';
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  function spawnFlake(){
    // spawn at random x within width, negative y above area
    const size = 6 + Math.random()*18; // 6..24 px (varied sizes)
    const x = Math.random()*width;
    const y = - (Math.random()*40 + size);
    const vx = (Math.random()-0.5) * 20; // horizontal velocity (initial)
    const vy = 10 + Math.random()*30; // initial down speed
    const rot = Math.random()*Math.PI*2;
    const rotSpeed = (Math.random()-0.5)*1.2;
    const opacity = 0.6 + Math.random()*0.4;
    const sway = Math.random()*1.6;
    flakes.push({x,y,vx,vy,size,rot,rotSpeed,opacity,sway,age:0});
  }

  function render(now){
    if(!running) return;
    if(!lastTime) lastTime = now;
    const dt = Math.min(50, now - lastTime) / 1000; // clamp dt
    lastTime = now;

    // occasionally change wind
    if(now - lastWindChange > WIND_CHANGE_INTERVAL){
      lastWindChange = now;
      wind = (Math.random()-0.5) * 40; // px/s wind
    }

    // spawn rate proportional to width
    const spawnRate = Math.max(1, Math.floor(width / 60));
    for(let i=0;i<spawnRate;i++){
      if(Math.random() < 0.12) spawnFlake();
    }

    // clear
    ctx.clearRect(0,0,width, height);

    // update + draw
    for(let i=flakes.length-1;i>=0;i--){
      const f = flakes[i];
      // physics
      f.vy += GRAVITY * dt * (0.6 + f.size/30); // larger fall faster slightly
      // wind + horizontal acceleration
      const windAccel = (wind + Math.sin(f.age*0.5 + f.sway) * 10) * dt;
      f.vx += windAccel * 0.1;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.rot += f.rotSpeed * dt;
      f.age += dt;

      // fade out near bottom
      const fadeStart = height*0.75;
      let alpha = f.opacity;
      if(f.y > fadeStart) alpha = f.opacity * (1 - (f.y - fadeStart)/(height - fadeStart));
      if(alpha < 0) alpha = 0;

      // draw a simple stylized snowflake — small radial gradient + "arms"
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.globalAlpha = alpha;
      // soft glow
      const g = ctx.createRadialGradient(0,0,0,0,0,f.size*0.9);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.6, 'rgba(255,255,255,0.65)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0,0, f.size*0.6, 0, Math.PI*2);
      ctx.fill();

      // draw thin arms to feel like snowflake
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.8*alpha) + ')';
      ctx.lineWidth = Math.max(1, f.size*0.06);
      ctx.beginPath();
      ctx.moveTo(-f.size*0.9,0);
      ctx.lineTo(f.size*0.9,0);
      ctx.moveTo(0,-f.size*0.9);
      ctx.lineTo(0,f.size*0.9);
      ctx.stroke();
      ctx.restore();

      // cleanup if out of bounds
      if(f.y - f.size > height + 30 || f.x < -50 || f.x > width + 50 || alpha <= 0.001) {
        flakes.splice(i,1);
      }
    }

    rafId = requestAnimationFrame(render);
  }

  function start(){
    if(running) return;
    running = true;
    lastTime = 0;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    rafId = requestAnimationFrame(render);
  }
  function stop(){
    if(!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    rafId = null;
    flakes = [];
    ctx.clearRect(0,0,canvas.width, canvas.height);
    window.removeEventListener('resize', resizeCanvas);
  }

  // expose public api
  return {
    start,
    stop,
    isRunning: () => running,
    // helper to toggle
    toggle: function(){
      if(this.isRunning()) this.stop(); else this.start();
    }
  };
})();

/* ========== Wire settings toggle (exists on load) ========== */
document.addEventListener('DOMContentLoaded', function(){
  // wire the switch in settings (if present after resources load)
  const switchEl = document.getElementById('toggle-snow');
  if(switchEl){
    switchEl.checked = false; // default off
    switchEl.addEventListener('change', function(){
      if(this.checked) SnowController.start();
      else SnowController.stop();
    });
  }

  // Close button — just hides window
  const closeBtn = document.getElementById('close-btn');
  closeBtn?.addEventListener('click', () => {
    document.getElementById('gui-window').style.display = 'none';
  });
});
