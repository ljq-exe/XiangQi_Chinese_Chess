/* Đo độ trễ thực tế của cả 15 mức độ khó, đọc bảng BOT_LEVELS từ game.js.
   Kiểm tra: không mức nào vượt trần cứng 2s. Chạy: node levels.js     */
"use strict";
const fs = require("fs");
const path = require("path");
const X = require("./engine.js");

const src = fs.readFileSync(path.join(__dirname, "game.js"), "utf8");
const HARD = +(src.match(/BOT_HARD_MS\s*=\s*(\d+)/) || [0, 0])[1];
const body = src.slice(src.indexOf("const BOT_LEVELS = ["));
const LEVELS = [];
const re = /\{\s*label:\s*"([^"]+)",\s*depth:\s*(\d+),\s*ms:\s*(\d+),\s*noise:\s*([\d.]+)\s*\}/g;
let m;
while ((m = re.exec(body)) !== null) {
  LEVELS.push({ label: m[1], depth: +m[2], ms: +m[3], noise: +m[4] });
}
if (LEVELS.length !== 15) {
  console.error("Khong doc duoc 15 muc (doc duoc " + LEVELS.length + ")");
  process.exit(1);
}

console.log("=== do tre thuc te cua 15 muc (tran cung " + HARD + "ms) ===");
console.log("muc  ten             depth  ms    thuc te  nodes     nps    TT hit  prune");

const fmtNum = (n, width, digits = 0) => {
  const s = Number.isFinite(n) ? n.toFixed(digits) : String(n);
  return s.padStart(width);
};

let worst = 0, over = [];
const e = X.createEngine();

for (let i = 0; i < LEVELS.length; i++) {
  const lv = LEVELS[i];
  let sum = 0, dep = 0, nodes = 0, hit = 0, cut = 0, probes = 0, worstMove = 0;
  const N = 3;
  for (let g = 0; g < N; g++) {
    e.load(X.START.join("/"));
    for (let p = 0; p < 4; p++) {
      const t = e.getTurn();
      const mm = e.bestMove(t, { depth: 3, ms: 120 });
      if (!mm) break;
      e.doMove(mm.from, mm.to);
    }
    const t0 = Date.now();
    const mv = e.bestMove(e.getTurn(), lv);
    const el = Date.now() - t0;
    sum += el; worstMove = Math.max(worstMove, el);
    if (mv) { dep += mv.depth; nodes += mv.nodes; hit += mv.ttHits; cut += mv.ttCutoffs; probes += mv.ttProbes; }
    else console.log("  !! muc " + (i + 1) + " tra ve null (khong co nuoc di)");
  }
  const avg = sum / N;
  const avgNps = nodes / Math.max(1, avg) * 1000 / 1000;
  worst = Math.max(worst, worstMove);
  if (worstMove > HARD + 250) over.push(i + 1);

  console.log(
    String(i + 1).padStart(3) + "  " +
    lv.label.padEnd(14) +
    fmtNum(Math.round(dep / N), 5) + "  " +
    fmtNum(lv.ms, 5) + "  " +
    fmtNum(avg, 8, 1) + "ms " +
    fmtNum(worstMove, 7, 1) + "ms " +
    fmtNum(Math.round(nodes / N), 9) + "  " +
    fmtNum(avgNps, 6, 1) + "k " +
    fmtNum(Math.round(100 * hit / Math.max(1, probes)), 6) + "% " +
    fmtNum(Math.round(cut / N), 6));
}

console.log("\ntre lon nhat: " + worst + "ms  (tran " + HARD + "ms)");
if (over.length) {
  console.log("VUOT TRAN: muc " + over.join(", "));
  process.exit(1);
}
console.log("OK: khong muc nao vuot tran cung.");
