/* Kiểm tra khoá Zobrist tăng dần có đúng bằng khoá tính lại từ đầu.
   Sau mỗi nước đi, so hash của engine (cập nhật tăng dần) với hash của
   một engine mới nạp lại đúng thế đó (tính toàn bộ). Chạy: node zob.js */
"use strict";
const X = require("./engine.js");

const e = X.createEngine();
let bad = 0, checks = 0;

function freshHashOf(fen, turn) {
  const g = X.createEngine();
  g.load(fen);
  if (turn !== undefined) g.setTurn(turn);
  return g.hash();
}

/* 1. Thế khai cuộc */
e.load(X.START.join("/"));
if (e.hash() !== freshHashOf(X.START.join("/"))) { bad++; }
checks++;

/* 2. Mọi nước đi hợp lệ ở thế khai cuộc: đi rồi so hash */
e.load(X.START.join("/"));
let legal = e.legalMoves(1);
for (let i = 0; i < legal.length; i += 2) {
  const f = legal[i], t = legal[i + 1];
  const cap = e.doMove(f, t);
  const hInc = e.hash();
  const hRef = freshHashOf(e.fen(), -1);
  checks++;
  if (hInc !== hRef) {
    if (bad < 5) console.log("SAI sau Do " + e.fen() + "  tang=" + hInc + "  tinh lai=" + hRef);
    bad++;
  }
  e.undoMove(f, t, cap);
  checks++;
  if (e.hash() !== freshHashOf(X.START.join("/"), 1)) bad++;
}
console.log("buoc 1: " + checks + " lan kiem tra, " + bad + " sai");

/* 3. Chuoi do/undo lien tiep, so hash o moi buroc toi moi 5 nuoc */
e.load(X.START.join("/"));
let turn = 1, steps = 0, b2 = 0;
for (let ply = 0; ply < 120; ply++) {
  if (e.result(turn) !== 0) break;
  legal = e.legalMoves(turn);
  if (!legal.length) break;
  const k = (Math.random() * legal.length / 2) | 0;
  const f = legal[k * 2], t = legal[k * 2 + 1];
  const cap = e.doMove(f, t);
  turn = -turn;
  steps++;
  if (steps % 5 === 0) {
    if (e.hash() !== freshHashOf(e.fen(), turn)) b2++;
  }
}
console.log("buoc 2: " + steps + " nuoc choi, " + b2 + " lan sai hash");
bad += b2;

/* 4. Do/undo lien tiep nhau: hash phai tro ve dang bang sau khi hoan tac */
e.load(X.START.join("/"));
const h0 = e.hash();
let b3 = 0;
for (let r = 0; r < 200; r++) {
  const lg = e.legalMoves(e.getTurn());
  if (!lg.length) break;
  const k = (Math.random() * (lg.length / 2)) | 0;
  const cap = e.doMove(lg[k * 2], lg[k * 2 + 1]);
  e.undoMove(lg[k * 2], lg[k * 2 + 1], cap);
  if (e.hash() !== h0) b3++;
}
console.log("buoc 3: 200 vong do/undo, " + b3 + " lan hash khong tro ve");
bad += b3;

console.log(bad === 0
  ? "\nOK: Zobrist tang dan luon khop voi tinh lai."
  : "\nLOI: " + bad + " lan hash sai.");
process.exit(bad ? 1 : 0);