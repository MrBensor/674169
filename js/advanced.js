// JavaScript für den 'Erweitert'-Tab
console.log("advanced.js geladen");

// Beispiel: Klick-Event auf Code-Block im Erweitert-Tab
var codeBlock = document.querySelector('#tab-advanced code');
if (codeBlock) {
    codeBlock.addEventListener('click', function() {
        alert("Du hast den Code-Block geklickt!");
    });
}
