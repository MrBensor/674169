// File: script.js
// TL;DR: komplette Spiel-Logik, lädt words.json, rendert Board und Keyboard, verarbeitet Eingaben.

const GAME_ROWS = 6;
const WORD_LEN = 5;

let WORDS = []; // geladen aus words.json
let solution = "";
let currentRow = 0;
let currentCol = 0;
let board = []; // GAME_ROWS x WORD_LEN chars
let gameOver = false;

const boardEl = document.getElementById("board");
const keyboardEl = document.getElementById("keyboard");
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restart");

// Warum: initiale DOM-Erstellung vor Datenladung (einfaches Skeleton)
function createBoardSkeleton(){
  boardEl.innerHTML = "";
  board = Array.from({length: GAME_ROWS}, ()=> Array.from({length: WORD_LEN}, ()=>""));
  for(let r=0;r<GAME_ROWS;r++){
    const row = document.createElement("div");
    row.className = "row";
    for(let c=0;c<WORD_LEN;c++){
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.r = r;
      cell.dataset.c = c;
      row.appendChild(cell);
    }
    boardEl.appendChild(row);
  }
}

function showMessage(text, transient=true){
  messageEl.textContent = text;
  if(transient){
    setTimeout(()=>{ if(messageEl.textContent===text) messageEl.textContent = ""; }, 2500);
  }
}

// Lade Wörter und starte Spiel
async function init(){
  createBoardSkeleton();
  try{
    const res = await fetch("words.json");
    const txt = await res.text();
    // words.json könnte kommentare haben (wie oben). Entferne Kommentare vor JSON parse.
    const cleaned = txt.replace(/\/\*[\s\S]*?\*\//g,"").trim();
    WORDS = JSON.parse(cleaned).filter(w => typeof w === "string" && w.length===WORD_LEN).map(w => w.toLowerCase());
    if(WORDS.length===0) throw new Error("Wortliste leer oder fehlerhaft");
  }catch(e){
    showMessage("Fehler beim Laden der Wortliste. Prüfe words.json", false);
    console.error(e);
    return;
  }
  startNewGame();
  setupKeyboard();
  window.addEventListener("keydown", onPhysicalKey);
}

// Setzt neues Spiel
function startNewGame(){
  solution = WORDS[Math.floor(Math.random()*WORDS.length)];
  currentRow = 0; currentCol = 0; gameOver=false;
  // clear board UI
  document.querySelectorAll(".cell").forEach(cell=>{
    cell.className="cell";
    cell.textContent="";
  });
  document.querySelectorAll(".key").forEach(k=>{ k.className="key"; });
  showMessage("Gutes Gelingen!");
  // For debugging: console.log("Solution:", solution);
}

// Bildschirmtastatur (deutsche QWERTZ-ähnlich Anordnung, nur Buchstaben)
const KEYS = ["q","w","e","r","t","z","u","i","o","p","a","s","d","f","g","h","j","k","l","y","x","c","v","b","n","m"];

function setupKeyboard(){
  keyboardEl.innerHTML = "";
  // Layout in zwei rows: first 10, then rest with Enter/Delete
  const row1 = document.createElement("div");
  row1.style.display = "flex"; row1.style.gap = "8px"; row1.style.justifyContent="center";
  KEYS.slice(0,10).forEach(k => row1.appendChild(makeKey(k)));
  keyboardEl.appendChild(row1);
  const row2 = document.createElement("div");
  row2.style.display = "flex"; row2.style.gap = "8px"; row2.style.justifyContent="center"; row2.style.marginTop="8px";
  row2.appendChild(makeKey("enter", true));
  KEYS.slice(10).forEach(k => row2.appendChild(makeKey(k)));
  row2.appendChild(makeKey("back", true));
  keyboardEl.appendChild(row2);
}

function makeKey(k, wide=false){
  const el = document.createElement("div");
  el.className = "key"+(wide?" wide":"");
  el.textContent = (k==="enter" ? "ENTER" : k==="back" ? "⌫" : k);
  el.dataset.key = k;
  el.addEventListener("click", ()=>onVirtualKey(k));
  return el;
}

// Virtuelle Tastatur Klicks
function onVirtualKey(k){
  if(gameOver) return;
  if(k==="enter"){ submitGuess(); return; }
  if(k==="back"){ deleteChar(); return; }
  insertChar(k);
}

// Physische Tastatur
function onPhysicalKey(e){
  if(gameOver) return;
  const k = e.key.toLowerCase();
  if(k === "enter"){ submitGuess(); return; }
  if(k === "backspace" || k==="delete"){ deleteChar(); return; }
  // akzeptiere a-z
  if(k.length===1 && k >= "a" && k <= "z"){
    insertChar(k);
  }
}

// Einfügen eines Buchstabens
function insertChar(ch){
  if(currentCol >= WORD_LEN) return;
  board[currentRow][currentCol] = ch;
  updateCell(currentRow, currentCol, ch);
  currentCol++;
}

// Löschen
function deleteChar(){
  if(currentCol<=0) return;
  currentCol--;
  board[currentRow][currentCol] = "";
  updateCell(currentRow, currentCol, "");
}

// UI Zellupdate
function updateCell(r,c,txt){
  const sel = `.cell[data-r="${r}"][data-c="${c}"]`;
  const el = document.querySelector(sel);
  el.textContent = txt ? txt.toUpperCase() : "";
  if(txt) el.classList.add("filled"); else el.classList.remove("filled");
}

// Submit Guess
function submitGuess(){
  if(currentCol !== WORD_LEN){
    showMessage("Fülle alle 5 Buchstaben aus.");
    return;
  }
  const guess = board[currentRow].join("").toLowerCase();
  if(!WORDS.includes(guess)){
    showMessage("Wort nicht in Liste.");
    return;
  }
  // Berechne Feedback (Berücksichtige Mehrfachbuchstaben korrekt)
  const solutionArr = solution.split("");
  const guessArr = guess.split("");
  const result = Array(WORD_LEN).fill("gray");
  const used = Array(WORD_LEN).fill(false);

  // Erste Pass: grün
  for(let i=0;i<WORD_LEN;i++){
    if(guessArr[i] === solutionArr[i]){
      result[i] = "green";
      used[i] = true;
    }
  }
  // Zweite Pass: gelb für verbleibende
  for(let i=0;i<WORD_LEN;i++){
    if(result[i] === "green") continue;
    const idx = solutionArr.findIndex((ch,j)=>!used[j] && ch===guessArr[i]);
    if(idx !== -1){
      result[i] = "yellow";
      used[idx] = true;
    }
  }

  // Anwenden der Farben mit Animation
  for(let c=0;c<WORD_LEN;c++){
    const cell = document.querySelector(`.cell[data-r="${currentRow}"][data-c="${c}"]`);
    cell.classList.add("flip");
    // kurze Verzögerung pro Zelle
    setTimeout(((cell, cls, ch)=>{
      return ()=>{
        cell.classList.remove("flip");
        cell.classList.add(cls);
        // update keyboard key style
        const keyEl = Array.from(document.querySelectorAll(".key")).find(k=>k.dataset.key === ch);
        if(keyEl){
          // priorisiere grün > gelb > grau
          if(cls === "green") keyEl.className = "key used green";
          else if(cls === "yellow" && !keyEl.classList.contains("green")) keyEl.className = "key used yellow";
          else if(cls === "gray" && !keyEl.classList.contains("green") && !keyEl.classList.contains("yellow")) keyEl.className = "key used gray";
        }
      };
    })(cell, result[c], guessArr[c]), c*220);
  }

  // Ergebnis prüfen
  setTimeout(()=>{
    if(result.every(r=>r==="green")){
      showMessage(`Gewonnen! Lösung: ${solution.toUpperCase()}`, false);
      gameOver = true;
      return;
    }
    currentRow++;
    currentCol = 0;
    if(currentRow >= GAME_ROWS){
      showMessage(`Verloren. Lösung war: ${solution.toUpperCase()}`, false);
      gameOver = true;
    }
  }, WORD_LEN*220 + 50);
}

// Restart
restartBtn.addEventListener("click", ()=> startNewGame());

// initialisieren
init();
