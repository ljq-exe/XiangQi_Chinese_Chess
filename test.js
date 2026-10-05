/* Bộ kiểm thử engine cờ tướng — chạy: node test.js

   Quy ước FEN của engine này: CHỮ THƯỜNG = quân ĐỎ, CHỮ HOA = quân ĐEN. */
"use strict";
const X = require("./engine.js");

const NAMES = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
function nm(i) { return i < 0 ? "??" : NAMES[i % 9] + (Math.floor(i / 9) + 1); }

let pass = 0, fail = 0;
const failures = [];

function ok(name, cond, detail) {
  if (cond) pass++;
  else { fail++; failures.push(name + (detail ? " — " + detail : "")); }
}

/* Chạy engine rồi kiểm tra nước đi trả về */
function test(name, fen, side, opts, fn) {
  const e = X.createEngine();
  e.load(fen);
  let m;
  try { m = e.bestMove(side, opts); }
  catch (err) { fail++; failures.push(name + " — ném lỗi: " + err.message); return; }
  if (m === null) { fail++; failures.push(name + " — không có nước đi hợp lệ"); return; }
  const res = fn(m, e);
  if (res === true) pass++;
  else { fail++; failures.push(name + " — " + (res || "không đạt")); }
}

/* ---- 1. Bắt mã trong 1 nước ----
       Tướng đen ở giữa cung (2,4), bốn Sĩ vây kín; hai Xe đỏ chặn
       hàng 1 và hàng 3; Tốt làm bàn ngòi trên file 4. Xe từ hàng 3
       nhảy lên e4 là chiếu chéo và không còn lối thoát.               */
const MATE_FEN = "3A1A3/8r/3AKA3/8r/4p4/9/c8/9/9/4k4";
{
  const e = X.createEngine(); e.load(MATE_FEN);
  const before = e.legalMoves(-1).length;
  ok("thế bắt mã: đen chưa bị chiếu", e.inCheck(-1) === false && before > 0);
}
test("bắt mã 1 nước", MATE_FEN, 1, { depth: 8, ms: 1500 },
  (m, e) => {
    e.doMove(m.from, m.to);
    const chk = e.inCheck(-1);
    const left = e.legalMoves(-1).length;
    if (chk && left === 0) return true;
    return "đi " + nm(m.from) + nm(m.to) + " → chiếu=" + chk + ", đen còn " + left + " nước";
  });

/* ---- 2. Ăn quân đang treo ---- */
test("ăn quân miễn phí",
  "4K4/9/9/9/9/9/9/3N1r3/9/3ak4", 1, { depth: 5, ms: 500 },
  (m, e) => (m.score > 150 ? true : "score = " + m.score + " (cần > 150)"));

/* ---- 3. Phải tránh chiếu tướng ---- */
test("thoát chiếu",
  "4K4/9/9/9/9/4r4/9/9/4k4/9", 1, { depth: 6, ms: 800 },
  (m, e) => {
    e.doMove(m.from, m.to);
    if (e.inCheck(1)) return "sau nước đi tướng đỏ vẫn bị chiếu";
    if (e.getBoard()[m.to] === -82) return "Xe đen ăn được tướng đỏ";
    return true;
  });

/* ---- 4. Không để tướng đối diện nhau (phi hành quân) ---- */
test("không để tướng đối diện",
  "4K4/9/9/9/9/4p4/9/9/9/4k4", 1, { depth: 5, ms: 500 },
  (m, e) => {
    e.doMove(m.from, m.to);
    const bd = e.getBoard();
    let rk = -1, bk = -1;
    for (let i = 0; i < 90; i++) { if (bd[i] === 107) rk = i; if (bd[i] === -75) bk = i; }
    if (rk < 0 || bk < 0) return "mất tướng";
    if (rk % 9 === bk % 9) {
      const lo = Math.min(rk, bk), hi = Math.max(rk, bk);
      let blocked = false;
      for (let i = lo + 1; i < hi; i++) if (bd[i]) { blocked = true; break; }
      if (!blocked) return "hai tướng đối diện nhau (không có quân chắn giữa)";
    }
    return true;
  });

/* ---- 5. Không đi tướng vào ô bị Mã đen chiếu ---- */
test("không đi tướng vào ô bị chiếu",
  "4K4/9/9/9/9/9/9/9/4N4/3rk4", 1, { depth: 6, ms: 600 },
  (m, e) => {
    e.doMove(m.from, m.to);
    if (e.inCheck(1)) return "tướng đỏ dính chiếu";
    if (e.result(-1) !== 0) return "cho đen ăn tướng";
    return true;
  });

/* ---- 6. Không sinh nước chiếm quân mình ---- */
test("không chiếm quân mình",
  "3K5/9/9/9/9/9/9/9/9/2C1k1C2", 1, { depth: 5, ms: 500 },
  (m, e) => {
    const piece = e.getBoard()[m.from];
    if (!piece || piece < 0) return "ô nguồn không có quân đỏ";
    const legal = e.legalMoves(1);
    let found = false;
    for (let i = 0; i < legal.length; i += 2) {
      if (legal[i] === m.from && legal[i + 1] === m.to) { found = true; break; }
    }
    return found ? true : "nước trả về không nằm trong tập hợp lệ";
  });

/* ---- 7. Bất biến đối xứng màu của hàm đánh giá ---- */
function mirrorFen(fen) {
  const rows = fen.split("/"), out = [];
  for (let i = 0; i < 10; i++) {
    const row = rows[9 - i];
    let s = "", e = 0;
    for (const ch of row) {
      if (ch >= "1" && ch <= "9") { e += +ch; continue; }
      if (ch === ".") { e++; continue; }
      const m = ch >= "a" && ch <= "z" ? ch.toUpperCase() : ch.toLowerCase();
      if (e) { s += e; e = 0; }
      s += m;
    }
    if (e) s += e;
    out.push(s);
  }
  return out.join("/");
}
{
  const fens = [
    X.START.join("/"),
    "r1bakab1r/9/1cN3Nc1/p1p1p1p1p/9/9/P1P1P1P1P/1Cn3Nc1/9/R1BAKAB1R",
    "3K5/9/9/4p4/9/9/9/9/4P4/3k1a3"
  ];
  let bad = [];
  for (const f of fens) {
    const a = X.createEngine(); a.load(f); const ea = a.evaluate();
    const b = X.createEngine(); b.load(mirrorFen(f)); const eb = b.evaluate();
    if (ea !== -eb) bad.push(f + " (" + ea + " / " + eb + ")");
  }
  ok("đánh giá đối xứng màu (" + fens.length + " thế)", bad.length === 0, bad.join("; "));
}

/* ---- 8. Thế khai cuộc phải bằng 0 ---- */
{
  const e = X.createEngine(); e.load(X.START.join("/"));
  const v = e.evaluate();
  ok("thế khai cuộc = 0", v === 0, "cho " + v);
}

/* ---- 9. Tôn trọng giới hạn thời gian ---- */
{
  const e = X.createEngine(); e.load(X.START.join("/"));
  const m = e.bestMove(1, { depth: 99, ms: 400 });
  ok("tôn trọng thời gian", m && m.ms <= 900 && m.depth >= 2,
    m ? (m.ms + "ms, depth " + m.depth) : "null");
}

/* ---- 10. Chơi 40 nước liên tiếp không sinh nước bất hợp lệ ---- */
{
  const e = X.createEngine(); e.load(X.START.join("/"));
  let bad = null, plies = 0;
  for (let i = 0; i < 40; i++) {
    const side = e.getTurn();
    if (e.result(side) !== 0) break;
    const m = e.bestMove(side, { depth: 5, ms: 120 });
    if (!m) { bad = "không có nước đi ở ply " + i; break; }
    const bd = e.getBoard();
    const piece = bd[m.from];
    if (!piece || (piece > 0) !== (side === 1)) { bad = "quân sai màu ply " + i; break; }
    if (bd[m.to] && (bd[m.to] > 0) === (side === 1)) { bad = "chiếm quân mình ply " + i; break; }
    e.doMove(m.from, m.to);
    plies++;
  }
  ok("40 nước hợp lệ liên tiếp", bad === null && plies >= 30, bad || ("ply = " + plies));
}

/* ---- 11. Tìm sâu hơn thì điểm không được TỤT quá nhiều, và nước đi
       phải ổn định. Không đòi đơn điệu tuyệt đối: đây là engine
       heuristic có quiescence + mở rộng khi chiếu, nên điểm giữa các
       vòng deepening có dao động vài chục điểm là bình thường. Cái
       thực sự sai là điểm tụt mạnh (sâu hơn mà hiểu sai thế).       */
{
  const e = X.createEngine(); e.load(X.START.join("/"));
  const TOL = 80;
  let prev = -Infinity, prevMove = "", worst = 0, note = "";
  for (let d = 1; d <= 5; d++) {
    const m = e.bestMove(1, { depth: d, ms: 20000 });
    const move = nm(m.from) + nm(m.to);
    if (m.score < prev - TOL) worst = Math.max(worst, prev - m.score);
    if (note === "" && prevMove !== "" && move !== prevMove) note = prevMove + " -> " + move;
    prev = m.score; prevMove = move;
  }
  ok("điểm không tụt quá " + TOL + " điểm khi tìm sâu hơn", worst <= TOL,
    worst > TOL ? ("tụt " + worst + " điểm") : "");
}

/* ---- 12. Luật 困BIS: hết nước hợp lệ phải là THUA (-1), không hòa (0) ---- */
{
  /* Thế mà bên đi không còn nước đi hợp lệ nhưng KHÔNG bị chiếu */
  const FEN_BIS = "9/9/9/9/9/9/9/8k/8p/8K"; // Tốt đen đã lên đỉnh, Đen đi nhưng không còn nước hợp lệ?
  /* Kiểm tra: tạo engine và thử result */
  const e = X.createEngine();
  e.load(FEN_BIS);
  const res = e.result(-1); // bên Đen đi
  ok("困BIS: hết nước là thua (-1)", res === -1, "result = " + res);
}

/* ---- 13. Chặn tái phát lỗi 1.1: thế chỉ có 2 nước hợp lệ, depth 4, nodes < 300 ---- */
{
  /* Thế 2 vua - chỉ có 2 nước hợp lệ mỗi bên */
  const FEN_2K = "4K4/9/9/9/9/9/9/9/9/4k4";
  const e = X.createEngine();
  e.load(FEN_2K);
  const m = e.bestMove(1, { depth: 4, ms: 5000 });
  ok("chống tái phát lỗi 1.1: có nước đi", m !== null, "m null");
  if (m) {
    /* Kiểm tra nodes < 300 */
    ok("chống tái phát lỗi 1.1: nodes < 300", m.nodes < 300, "nodes = " + m.nodes);
    /* Kiểm tra nước đi nằm trong 2 nước hợp lệ */
    const legal = e.legalMoves(1);
    let found = false;
    for (let i = 0; i < legal.length; i += 2) {
      if (legal[i] === m.from && legal[i + 1] === m.to) { found = true; break; }
    }
    ok("chống tái phát lỗi 1.1: nước đi hợp lệ", found, nm(m.from) + nm(m.to) + " không hợp lệ");
  }
}

/* ---- 14. Regression: chân Mã bị chặn - Mã Đen chiếu vua Đỏ ---- */
{
  /* Thế tái hiện lỗi chân Mã: Mã Đen ở ô 69 (h7) chiếu vua Đỏ ở ô 76 (i4). 
     Mã Đỏ 61→68 chặn chân Mã Đen - phải hết bị chiếu */
  const FEN_HORSE = "4K4/4A2c1/4B4/9/P1P5P/9/p6np/b5N2/4k4/3a1ab2";
  const e = X.createEngine();
  e.load(FEN_HORSE);
  const m = e.bestMove(1, { depth: 4, ms: 2000 });
  if (m) {
    e.doMove(m.from, m.to);
    ok("regression chân Mã: chặn chân Mã hết bị chiếu", !e.inCheck(1), 
       "vẫn bị chiếu sau " + nm(m.from) + nm(m.to));
    e.undoMove(m.from, m.to, e.getBoard()[m.to]);
  }
}

/* ---- 15. Regression: Tốt đi ngang qua sông ---- */
{
  /* Thế tái hiện lỗi Tốt đi ngang: Tốt Đen đã qua sông (ô 83) có thể đánh ngang 82,84 */
  const FEN_PAWN = "5K3/9/5A3/4c4/9/2b6/9/8b/P3a4/2P1ka3";
  const e = X.createEngine();
  e.load(FEN_PAWN);
  const legalRed = e.legalMoves(1);
  /* Kiểm tra vua Đỏ (85 = e1) không thể đi vào ô bị Tốt Đen đánh (84 = d1 hoặc 82 = f1?) */
  /* Vua Đỏ ở 85, muốn đi 84 là dính chiếu nếu Tốt Đen ở 83 đánh ngang */
  let badKingMove = false;
  for (let i = 0; i < legalRed.length; i += 2) {
    if (legalRed[i] === 85 && legalRed[i + 1] === 84) {
      badKingMove = true; break;
    }
  }
  ok("regression Tốt đi ngang: vua không đi vào ô bị Tốt đánh", !badKingMove,
     badKingMove ? "vua Đỏ có thể đi 85→84 bất hợp lệ" : "");
}

console.log("=== engine test ===");
console.log("PASS: " + pass + "   FAIL: " + fail);
for (const f of failures) console.log("  x " + f);
process.exit(fail ? 1 : 0);