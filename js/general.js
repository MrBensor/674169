// JavaScript für den 'Allgemein'-Tab
console.log("general.js geladen");

// Beispiel: Klick-Event für Liste im Allgemein-Tab
var generalItems = document.querySelectorAll('#tab-general li');
generalItems.forEach(function(item) {
    item.addEventListener('click', function() {
        alert('Du hast geklickt auf: ' + this.textContent);
    });
});
