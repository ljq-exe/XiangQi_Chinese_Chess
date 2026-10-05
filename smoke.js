/* Smoke test: nạp game.js + engine.js trong DOM giả để phát hiện lỗi
   lúc khởi tạo trang (thiếu phần tử, sai API, biến chưa định nghĩa...).
   Chạy: node smoke.js

   Khối DOM giả nằm ở fakedom.js, dùng chung với crosscheck.js.      */
"use strict";
const fs = require("fs");
const path = require("path");
const { createSandbox } = require("./fakedom.js");

const { sandbox, load, errors, evalIn } = createSandbox();
const audioFrequencies = [];
sandbox.AudioContext = class {
  constructor() {
    this.state = "running";
    this.currentTime = 0;
    this.destination = {};
  }
  createOscillator() {
    return {
      type: "",
      frequency: { setValueAtTime: frequency => audioFrequencies.push(frequency) },
      connect() {},
      start() {},
      stop() {}
    };
  }
  createGain() {
    return {
      gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      connect() {}
    };
  }
};

console.log("=== smoke test trang web ===");
const okEngine = load("engine.js");
console.log("engine.js nap OK: " + (okEngine ? "co" : "khong"));
const okGame = load("game.js");
console.log("game.js nap OK: " + (okGame ? "co" : "khong"));

/* select do khó phải có đúng 15 option */
const opts = sandbox.document.getElementById("selLevel").children;
console.log("so option muc do kho: " + opts.length + (opts.length === 15 ? "  (dung 15)" : "  <== SAI"));
if (opts.length) {
  console.log("  dau: " + opts[0].textContent);
  console.log("  cuoi: " + opts[opts.length - 1].textContent);
}
if (!sandbox.document.getElementById("btnBot").classList.contains("on") ||
    !sandbox.document.getElementById("selSide").disabled ||
    sandbox.document.getElementById("selLevel").disabled ||
    sandbox.document.getElementById("btnBot").textContent !== "🤖 Đang đấu với máy") {
  errors.push("game did not start in play-against-computer mode");
}
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
if (!html.includes('id="marks" clip-path="url(#board-intersections)"') ||
    !html.includes('<rect x="0.5" y="0.5" width="8" height="9"/>')) {
  errors.push("outer pawn position markers are not clipped to the board intersections");
}

/* engine phai san co */
const api = sandbox.Xiangqi;
console.log("Xiangqi.createEngine: " + (api && typeof api.createEngine === "function" ? "co" : "khong"));

/* thu bot bang cach goi bestMove qua engine that */
if (api) {
  const e = api.createEngine();
  e.load(api.START.join("/"));
  const t0 = Date.now();
  const m = e.bestMove(1, { depth: 5, ms: 1000 });
  console.log("bot di: " + (m ? m.from + "->" + m.to : "null") +
    "  depth " + (m ? m.depth : "-") + "  " + (Date.now() - t0) + "ms  nodes " + (m ? m.nodes : 0));
}

evalIn("btnLanguageEl.onclick()");
const langOption = sandbox.document.getElementById("selLevel").children[0];
const wiki = sandbox.document.getElementById("wikiContent");
if (sandbox.document.documentElement.lang !== "en" ||
    sandbox.document.getElementById("btnLanguage").textContent !== "Tiếng Việt" ||
    langOption.textContent !== "Bot: 1 – Very easy" ||
    !wiki.innerHTML.includes("General 將 / 帥")) {
  errors.push("English language toggle or Wiki content failed");
}
evalIn("btnWikiEl.onclick()");
if (!sandbox.document.getElementById("wikiPanel").classList.contains("open")) {
  errors.push("Wiki panel did not open");
}
evalIn("btnWikiCloseEl.onclick()");
if (sandbox.document.getElementById("wikiPanel").classList.contains("open")) {
  errors.push("Wiki panel did not close");
}
evalIn("btnLanguageEl.onclick()");
if (sandbox.document.documentElement.lang !== "vi" ||
    sandbox.document.getElementById("selLevel").children[0].textContent !== "Máy: 1 – Rất dễ" ||
    !wiki.innerHTML.includes("Tướng 將 / 帥")) {
  errors.push("Vietnamese language toggle or Wiki content failed");
}
evalIn("playMoveSound(false); playMoveSound(true); playCheckSound()");
if (!audioFrequencies.includes(520) || !audioFrequencies.includes(185) ||
    !audioFrequencies.includes(880) || !audioFrequencies.includes(1175)) {
  errors.push("move, capture, or check sounds were not generated");
}
evalIn("playWelcomeSound()");
evalIn("endSoundPlayed = false; botOn = true; botSide = 'b'; playEndSoundOnce('THẮNG')");
const tonesAfterWin = audioFrequencies.length;
evalIn("playEndSoundOnce('THẮNG')");
if (!audioFrequencies.includes(1047) || audioFrequencies.length !== tonesAfterWin) {
  errors.push("win sound did not play exactly once");
}
evalIn("endSoundPlayed = false; playEndSoundOnce('THUA')");
if (!audioFrequencies.includes(262)) {
  errors.push("loss sound was not generated");
}
if (![523, 659, 784].every(frequency => audioFrequencies.includes(frequency))) {
  errors.push("welcome sound was not generated");
}
evalIn("grid[0] = '.'; history.push({ from: 0, to: 1, piece: 'R', captured: null }); selLevelEl.value = '1'; selLevelEl.onchange()");
if (evalIn("botLevel") !== 1 ||
    evalIn("history.length") !== 0 ||
    evalIn("grid[0]") !== "R" ||
    evalIn("turn") !== "r" ||
    !sandbox.document.getElementById("btnBot").classList.contains("on")) {
  errors.push("changing bot difficulty did not reset the board and keep bot mode active");
}

if (errors.length) {
  console.log("\nLOI:");
  for (const s of errors) console.log("  x " + s);
  process.exit(1);
}
console.log("\nOK: trang khoi dong khong loi.");
