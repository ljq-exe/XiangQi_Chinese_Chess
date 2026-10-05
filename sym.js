/* Kiểm tra bất biến đối xứng màu của evaluate().
   Mỗi quân đổi thành quân đen và bàn cờ lật dọc thì điểm phải đảo dấu.
   Chạy: node sym.js                                                */
"use strict";
const X = require("./engine.js");

/* Mã quân thực tế của engine.js:
   đỏ (chữ thường) lưu DƯƠNG theo ASCII viết thường: k=107 a=97 b=98
   n=110 r=114 c=99 p=112;  đen (chữ hoa) lưu ÂM theo ASCII viết hoa:
   K=-75 A=-65 B=-66 N=-78 R=-82 C=-67 P=-80.                     */
const BLACK_KIND = { "-75": "k", "-65": "a", "-66": "b", "-78": "n", "-82": "r", "-67": "c", "-80": "p" };
const RED_KIND = { "107": "k", "97": "a", "98": "b", "110": "n", "114": "r", "99": "c", "112": "p" };

function boardToFen(bd) {
  let fen = "";
  for (let r = 0; r < 10; r++) {
    let s = "", run = 0;
    for (let c = 0; c < 9; c++) {
      const p = bd[r * 9 + c];
      if (!p) { run++; continue; }
      if (run) { s += run; run = 0; }
      const ch = p > 0 ? RED_KIND[p] : BLACK_KIND[p];
      if (ch === undefined) throw new Error("ma qua la: " + p);
      s += p > 0 ? ch : ch.toUpperCase();  /* đỏ = thường, đen = hoa */
    }
    if (run) s += run;
    fen += s + (r < 9 ? "/" : "");
  }
  return fen;
}

/* Đổi màu mọi quân + lật dọc: thế đối xứng của thế đang xét.
   Lưu ý mã quân KHÔNG đối xứng âm dương: đỏ = ASCII thường (r=114),
   đen = -(ASCII hoa) = -82. Nên đổi màu là 32 - p, KHÔNG phải -p.  */
function mirrorBoard(bd) {
  const out = new Array(90).fill(0);
  for (let i = 0; i < 90; i++) {
    const p = bd[i];
    if (!p) continue;
    out[(9 - ((i / 9) | 0)) * 9 + (i % 9)] = 32 - p;
  }
  return out;
}

const bad = [];
let checked = 0;

function checkSym(bd, label) {
  const a = X.createEngine(); a.load(boardToFen(bd));
  const b = X.createEngine(); b.load(boardToFen(mirrorBoard(bd)));
  const ea = a.evaluate(), eb = b.evaluate();
  checked++;
  if (ea !== -eb) bad.push(label + "\n     the   : " + boardToFen(bd) + "\n     eval  = " + ea + "\n     doi   = " + eb);
  return Math.abs(ea - -eb);
}

/* 1. Thế khai cuộc */
{
  const e = X.createEngine(); e.load(X.START.join("/"));
  checkSym(Array.from(e.getBoard()), "khai cuoc");
}

/* 2. Thế ngẫu nhiên: tướng trong cung + vài quân rải rác */
let rng = 123456789;
function rnd() { rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5; return (rng >>> 0) / 4294967296; }

const CODES2 = [-80, -67, -82, -78, -66, -65, 107, 97, 98, 110, 114, 99, 112];
for (let t = 0; t < 400; t++) {
  const bd = new Array(90).fill(0);
  bd[(7 + ((rnd() * 3) | 0)) * 9 + ((rnd() * 3) | 0)] = 107;   /* tướng đỏ (dương) */
  bd[((rnd() * 3) | 0) * 9 + (3 + ((rnd() * 3) | 0))] = -75;   /* tướng đen (âm)   */
  const n = 4 + ((rnd() * 22) | 0);
  for (let k = 0; k < n; k++) {
    const sq = (rnd() * 90) | 0;
    if (bd[sq]) continue;
    bd[sq] = CODES2[(rnd() * CODES2.length) | 0];
  }
  checkSym(bd, "ngau nhien #" + t);
}

/* 3. Thế sinh ra khi engine tự đấu */
for (let game = 0; game < 3; game++) {
  const e = X.createEngine(); e.load(X.START.join("/"));
  for (let ply = 0; ply < 30; ply++) {
    const side = e.getTurn();
    if (e.result(side) !== 0) break;
    if (ply % 3 === 0) checkSym(Array.from(e.getBoard()), "tu dau game " + game + " ply " + ply);
    const m = e.bestMove(side, { depth: 4, ms: 250 });
    if (!m) break;
    e.doMove(m.from, m.to);
  }
}

/* 4. Các thế chiếu / kết thúc đã dùng trong test.js */
for (const f of [
  "3A1A3/8r/3AKA3/8r/4p4/9/c8/9/9/4k4",
  "4k4/9/9/9/9/9/9/3N1r3/9/3ak4",
  "3k5/9/9/9/9/9/9/9/9/2C1k1C2",
  "4K4/9/9/9/9/4p4/9/9/9/4k4",
  "4K4/9/9/9/9/9/9/9/4N4/3rk4"
]) {
  const a = X.createEngine(); a.load(f);
  checkSym(Array.from(a.getBoard()), "chi " + f.slice(0, 16));
}

console.log("=== doi xung mau evaluate() ===");
console.log("da kiem tra: " + checked + " the");
if (bad.length) {
  console.log("SAI: " + bad.length + " the");
  for (const s of bad.slice(0, 8)) console.log("  x " + s);
  process.exit(1);
} else {
  console.log("OK: moi the deu doi xung mau tuyet doi.");
}