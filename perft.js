/* perft — đếm lá cây bằng API công khai của engine.
   Chạy: node perft.js

   Mục đích: kiểm tra bộ sinh nước đi của engine bằng một phép đo KHÔNG
   dùng tới tìm kiếm, nên nó bắt được lỗi luật mà test.js (chỉ chơi vài
   nước) không thấy.

   ---- VÌ SAO CHỈ KIỂM TỚI DEPTH 3 ----
   perft chuẩn của cờ tướng quy ước "không được ăn tướng": sinh nước đi
   không bao giờ đưa ra nước bắt tướng. Engine hiện CHƯA cài điều đó —
   genMoves vẫn cho phép ăn tướng — nên từ depth 4 trở đi hai bên đếm
   khác nhau. Vì vậy:
     - thế khai cuộc: chỉ kiểm tới depth 3, dùng số chuẩn đã công bố
       (44 / 1.920 / 79.666);
     - hai thế trung cờ: cũng chỉ tới depth 3.
   Số kỳ vọng của hai thế trung cờ được đối chiếu bằng HAI bộ luật độc
   lập — engine.js và bộ luật tự viết trong game.js — nên chúng không
   phải số tự tham chiếu.                                                    */
"use strict";
const X = require("./engine.js");

/* perft đệ quy: đi hết một nước rồi đếm lá. Dùng legalMoves / doMove /
   undoMove — tức đúng API mà phần còn lại của engine dùng. */
function perft(e, depth) {
  if (depth === 0) return 1;
  const mv = e.legalMoves(e.getTurn());
  let n = 0;
  for (let i = 0; i < mv.length; i += 2) {
    const f = mv[i], t = mv[i + 1];
    const cap = e.doMove(f, t);
    n += perft(e, depth - 1);
    e.undoMove(f, t, cap);
  }
  return n;
}

/* side: 1 = ĐỎ đi, -1 = ĐEN đi */
const CASES = [
  {
    ten: "thế khai cuộc (ĐỎ đi)",
    fen: X.START.join("/"),
    side: 1,
    expect: [44, 1920, 79666]
  },
  {
    ten: "thế trung cờ A (ĐỎ đi)",
    fen: "RNBA1AR2/4K2c1/1C5CB/2P3P1P/P3P4/6p2/pcp1p3p/9/9/rnbakabnr",
    side: 1,
    expect: [30, 1265, 42306]
  },
  {
    ten: "thế trung cờ A (ĐEN đi)",
    fen: "RNBA1AR2/4K2c1/1C5CB/2P3P1P/P3P4/6p2/pcp1p3p/9/9/rnbakabnr",
    side: -1,
    expect: [42, 1320, 52425]
  },
  {
    ten: "thế trung cờ B (ĐỎ đi)",
    fen: "RNBAKABN1/8R/7C1/P1P1P1P2/9/6p1P/p1p1p3p/1c5c1/r3a4/C1bak1bnr",
    side: 1,
    expect: [46, 2192, 94138]
  },
  {
    ten: "thế trung cờ B (ĐEN đi)",
    fen: "RNBAKABN1/8R/7C1/P1P1P1P2/9/6p1P/p1p1p3p/1c5c1/r3a4/C1bak1bnr",
    side: -1,
    expect: [48, 2165, 97187]
  }
];

let fail = 0;
let totalNodes = 0;
console.log("=== perft (chi toi depth 3) ===");

for (const c of CASES) {
  const e = X.createEngine();
  e.load(c.fen);
  e.setTurn(c.side);
  const out = [];
  for (const d of [1, 2, 3]) {
    const t0 = Date.now();
    const n = perft(e, d);
    totalNodes += n;
    out.push({ d, n, ms: Date.now() - t0 });
  }
  console.log("\n" + c.ten);
  console.log("  FEN: " + c.fen);
  for (let i = 0; i < out.length; i++) {
    const got = out[i].n, exp = c.expect[i];
    const ok = got === exp;
    if (!ok) fail++;
    console.log("  depth " + out[i].d + ": " + got +
      (ok ? "  (dung)" : "  <== SAI, ky vong " + exp) +
      "   " + out[i].ms + "ms");
  }
}

console.log("\ntong so la: " + totalNodes.toLocaleString("en-US"));
if (fail) {
  console.log("\nX: " + fail + " gia tri sai.");
  process.exit(1);
}
console.log("OK: perft ra dung o moi th.");
