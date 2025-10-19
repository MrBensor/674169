// JavaScript für den 'Einstellungen'-Tab
console.log("settings.js geladen");

// Beispiel: Checkbox-Events im Einstellungen-Tab
var optA = document.getElementById('optA');
var optB = document.getElementById('optB');
var optC = document.getElementById('optC');

if (optA) {
    optA.addEventListener('change', function() {
        console.log("Option A geändert: " + (this.checked ? "aktiviert" : "deaktiviert"));
    });
}
if (optB) {
    optB.addEventListener('change', function() {
        console.log("Option B geändert: " + (this.checked ? "aktiviert" : "deaktiviert"));
    });
}
if (optC) {
    optC.addEventListener('change', function() {
        console.log("Option C geändert: " + (this.checked ? "aktiviert" : "deaktiviert"));
    });
}
