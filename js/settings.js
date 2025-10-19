// settings.js — nur tab-spezifische Logik
console.log('settings.js geladen');
(function(){
  const el = document.getElementById('tab-settings');
  if(!el) return;

  // Ensure the toggle input exists (it is in index.html)
  const toggle = document.getElementById('toggle-snow');
  if(toggle){
    // set visual state from SnowController
    toggle.checked = !!(window.SnowController && window.SnowController.isRunning && window.SnowController.isRunning());
    toggle.addEventListener('change', function(){
      if(this.checked) {
        window.SnowController?.start();
      } else {
        window.SnowController?.stop();
      }
    });
  }

  // Additional settings can go here
})();
