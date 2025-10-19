// Haupt-JavaScript: Drag & Drop und Tab-Steuerung
document.addEventListener('DOMContentLoaded', function() {
    var windowElem = document.getElementById('myWindow');
    var titlebar = windowElem.querySelector('.titlebar');
    var tabs = windowElem.querySelectorAll('.tabs button');
    var currentTab = null;

    // Variablen für Drag & Drop
    var isDragging = false;
    var offsetX = 0, offsetY = 0;

    // Maus-Down auf die Titelleiste startet Drag
    titlebar.addEventListener('mousedown', function(e) {
        isDragging = true;
        // Offset zwischen Maus und Fensterposition berechnen
        offsetX = e.clientX - windowElem.offsetLeft;
        offsetY = e.clientY - windowElem.offsetTop;
    });

    // Mausbewegung bewegt das Fenster, wenn Drag aktiv
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            windowElem.style.left = (e.clientX - offsetX) + 'px';
            windowElem.style.top = (e.clientY - offsetY) + 'px';
        }
    });

    // Maus-Loslassen beendet Drag
    document.addEventListener('mouseup', function(e) {
        isDragging = false;
    });

    // Tab-Klicks zuordnen
    tabs.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Initialen Tab laden (Allgemein)
    switchTab('general');

    // Funktion zum Wechseln der Tabs
    function switchTab(tabName) {
        if (currentTab === tabName) {
            return; // schon aktiv, nichts tun
        }
        // Alten Tab-Status entfernen
        if (currentTab) {
            var oldButton = document.querySelector('.tabs button[data-tab="' + currentTab + '"]');
            var oldContent = document.getElementById('tab-' + currentTab);
            if (oldButton) oldButton.classList.remove('active');
            if (oldContent) oldContent.classList.remove('active');
        }
        // Neuen Tab aktivieren
        var newButton = document.querySelector('.tabs button[data-tab="' + tabName + '"]');
        var newContent = document.getElementById('tab-' + tabName);
        if (newButton) newButton.classList.add('active');
        if (newContent) newContent.classList.add('active');

        // CSS- und JS-Dateien für den Tab laden
        loadTabResources(tabName);

        currentTab = tabName;
    }

    // CSS und JS für den ausgewählten Tab dynamisch nachladen
    function loadTabResources(tabName) {
        var head = document.getElementsByTagName('head')[0];

        // CSS laden, falls noch nicht vorhanden
        if (!document.getElementById(tabName + '-css')) {
            var link = document.createElement('link');
            link.id = tabName + '-css';
            link.rel = 'stylesheet';
            link.href = 'css/' + tabName + '.css';
            head.appendChild(link);
        }
        // JS laden, falls noch nicht vorhanden
        if (!document.getElementById(tabName + '-js')) {
            var script = document.createElement('script');
            script.id = tabName + '-js';
            script.src = 'js/' + tabName + '.js';
            // Skript in <head> anhängen (Ausführung erfolgt nach dem Laden)
            head.appendChild(script);
        }
    }
});
