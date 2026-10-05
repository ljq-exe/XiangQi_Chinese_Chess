/* Giải đấu thang độ khó: mức cao phải không thua mức thấp.
   Dùng đúng bảng BOT_LEVELS trong game.js. Chạy: node ladder.js [games] */
"use strict";
const X = require("./engine.js");

/* Trích bảng BOT_LEVELS ra khỏi game.js để không phải chép lại */
const fs = require("fs");
const src = fs.readFileSync(require("path").join(__dirname, "game.js"), "utf8");
const body = src.slice(src.indexOf("const BOT_LEVELS = ["));
const LEVELS = [];
const re = /\{\s*label:\s*"([^"]+)",\s*depth:\s*(\d+),\s*ms:\s*(\d+),\s*noise:\s*([\d.]+)\s*\}/g;
let m;
while ((m = re.exec(body)) !== null) {
  LEVELS.push({ label: m[1], depth: +m[2], ms: +m[3], noise: +m[4] });
}
if (LEVELS.length !== 15) {
  console.error("Không đọc được 15 mức từ game.js (đọc được " + LEVELS.length + ")");
  process.exit(1);
}
LEVELS.forEach((l, i) => l.n = i + 1);

function nm(i) { return "abcdefghi"[i % 9] + (Math.floor(i / 9) + 1); }

const GAMES = +(process.argv[2] || 2);
/* Giảm thời gian mỗi nước theo hệ số SCALE để giải chạy được trong thời
   gian hợp lý. SCALE chỉ rút ngắn "ms", giữ nguyên depth và noise —
   tức là giữ nguyên quan hệ mạnh/yếu giữa các mức (ms chỉ có tác dụng
   khi nó chặn depth dưới mức thiết lập). Chạy: node ladder.js [games] [scale] */
const SCALE = +(process.argv[3] || 1);
for (const l of LEVELS) l.ms = Math.max(60, Math.round(l.ms * SCALE));

/* Chơi một ván: cấp `hi` đi trước với màu `hiIsRed`.
   Trả về: 1 nếu cấp hi thắng, 0 nếu hòa, -1 nếu thua. */
function playGame(hi, lo, hiIsRed) {
  const e = X.createEngine();
  e.load(X.START.join("/"));
  let turn = 1, plies = 0;
  while (plies < 160) {
    const r = e.result(turn);
    if (r !== 0) {
      const loserIsRed = turn === 1;
      const hiWon = hiIsRed ? !loserIsRed : loserIsRed;
      return hiWon ? 1 : -1;
    }
    const isHi = (turn === 1) === hiIsRed;
    const lv = LEVELS[isHi ? hi : lo];
    const mv = e.bestMove(turn, { depth: lv.depth, ms: lv.ms, noise: lv.noise });
    if (!mv) return 0;
    e.doMove(mv.from, mv.to);
    turn = -turn;
    plies++;
  }
  return 0;
}

console.log("=== thang do kho (" + GAMES + " van moi cap) ===");
console.log("cau hinh:");
for (const l of LEVELS) {
  console.log("  " + String(l.n).padStart(2) + ". " + l.label.padEnd(12) +
    " depth " + String(l.depth).padStart(2) + "  " + String(l.ms).padStart(4) + "ms" +
    "  noise " + l.noise.toFixed(3));
}

const PAIRS = [[15, 1], [15, 8], [12, 6], [9, 3]];
console.log("\nket qua:");
let allOk = true;
for (const [hi, lo] of PAIRS) {
  let w = 0, d = 0, l = 0;
  for (let g = 0; g < GAMES * 2; g++) {
    const r = playGame(hi - 1, lo - 1, g % 2 === 0);
    if (r > 0) w++; else if (r < 0) l++; else d++;
  }
  const pts = w + d / 2;
  const tot = w + d + l;
  const ok = pts / tot >= 0.5;
  if (!ok) allOk = false;
  console.log("  cap " + String(hi).padStart(2) + " vs cap " + String(lo).padStart(2) +
    " ->  thang " + w + "  hoa " + d + "  thua " + l +
    "   (" + (pts / tot * 100).toFixed(0) + "% cho cap cao)" + (ok ? "" : "   <== SAI"));
}
console.log(allOk ? "\nOK: cap cao khong thua cap thap." : "\nX: co cap cao bi thua — thang do khong don diep.");