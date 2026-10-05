/* crosscheck — so tập nước hợp lệ giữa ENGINE và BỘ LUẬT TRONG TRANG.

   Dự án này có HAI bộ luật cờ tướng chạy song song:
     - engine.js      — dùng cho tìm kiếm, điểm, hay gợi ý
     - game.js        — dùng cho bấm chuột, hiện đường ăn, kết thúc ván
   Chúng được viết riêng nên có thể LỆCH nhau mà không ai phát hiện.
   File này nạp cả hai vào cùng một ngữ cảnh vm rồi đối chiếu tập nước
   hợp lệ ở nhiều thế cờ, để một bên sửa luật mà quên sửa bên kia thì
   đỏ ngay ở đây.

   Chạy: node crosscheck.js                                              */
"use strict";
const { createSandbox } = require("./fakedom.js");

/* Cứ mỗi PLY_CHECK ply của ván tự đánh thì đối chiếu một lần. So sánh ở
   mọi ply thì chậm hơn nhiều (bộ luật trong game.js gọi inCheck theo từng
   nước ứng viên) mà phần lớn độ sâu là lặp lại của các thế đã xét. */
const PLY_CHECK = 70;
const GAMES = 10;
const MAX_PLY = 300;

/* ---- Nạp engine.js + game.js vào CÙNG một ngữ cảnh ---- */
const sb = createSandbox();
const { sandbox, load, errors, evalIn } = sb;

if (!load("engine.js")) { console.error("nap engine.js that bai"); process.exit(1); }
if (!load("game.js")) { console.error("nap game.js that bai"); process.exit(1); }

const X = sandbox.Xiangqi;
if (!X || !X.createEngine) { console.error("engine.js khong tao duoc Xiangqi"); process.exit(1); }

/* ---- Công cụ đọc/gán trạng thái bên trong sandbox ----

   LƯU Ý QUAN TRỌNG: game.js khai báo `grid`, `turn`, `stateCache` bằng
   `let` ở cấp script. Những binding đó nằm trong môi trường từ vực
   toàn cục của ngữ cảnh vm, KHÔNG phải thuộc tính của đối tượng sandbox,
   nên không gán được kiểu `sandbox.grid = ...`. Phải chạy một script
   riêng trong chính ngữ cảnh đó (evalIn bên dưới).

   Ngược lại, hàm khai báo bằng `function` (legalMovesFrom, inCheck,
   anyLegal, gameState, gridToFen...) thì nằm trên đối tượng global nên
   gọi được từ ngoài. Ta gom mọi thứ cần đọc vào một hàm __probe để chỉ
   phải vượt ranh giới ngữ cảnh đúng một lần mỗi lần đối chiếu.      */

/* fen của engine ghi ô trống bằng CHỮ SỐ ("9" = chín ô trống);
   grid của game.js dùng DẤU CHẤM. Phải giải nén trước. */
function expandFen(fen) {
  const out = [];
  for (const row of fen.split("/")) {
    let run = 0;
    const flush = () => { while (run > 0) { out.push("."); run--; } };
    for (const ch of row) {
      if (ch >= "1" && ch <= "9") { run += +ch; continue; }
      flush();
      out.push(ch);
    }
    flush();
  }
  if (out.length !== 90) throw new Error("fen sai do dai: " + fen + " -> " + out.length);
  return out.join("");
}

evalIn(`
  globalThis.__setPos = function (grid90, turnCh) {
    grid = grid90.split("");
    turn = turnCh;
    stateCache = null;
  };
  globalThis.__probe = function () {
    const side = turn === "r";
    const moves = [];
    for (let i = 0; i < 90; i++) {
      const p = grid[i];
      if (p === "." || isRed(p) !== side) continue;
      const dsts = legalMovesFrom(i);
      for (let k = 0; k < dsts.length; k++) moves.push(i * 100 + dsts[k]);
    }
    return JSON.stringify({
      moves: moves,
      chk: inCheck(side),
      any: anyLegal(side),
      state: gameState(),
      fen: gridToFen()
    });
  };
`);

function setPos(grid90, side) {
  evalIn("__setPos(" + JSON.stringify(grid90) + ", " + JSON.stringify(side === 1 ? "r" : "b") + ")");
}

/* Thế cố định nhắm thẳng vào từng luật, bổ sung cho phần lấy mẫu ngẫu nhiên.
   Lý do: một số luật rất hiếm gặp trong ván tự đánh, nếu chỉ đối chiếu ngẫu
   nhiên thì sửa sai luật ấy vẫn có thể lọt. Mỗi thế dưới đây đã dùng để
   kiểm chứng: cố ý phá đúng luật ứng với nó thì crosscheck phải báo lệch.

   Quy ước: chữ thường = ĐỎ, chữ hoa = ĐEN; cung đen ở hàng 0, cung đỏ ở hàng 9. */
const PROBES = [
  { ten: "Phao an khong can ngai", fen: "3K5/9/9/9/9/9/9/4C4/9/k3r4", side: -1 },
  { ten: "Tuong doi dien bi lo", fen: "4K4/9/9/9/4C4/9/9/9/9/4k4", side: -1 },
  { ten: "Khong cam tu chien tuong", fen: "3K5/9/9/9/9/4r4/4n4/9/9/3k5", side: 1 },
  { ten: "Ma chan chan / Tuot qua song", fen: "RNBAKABNR/........./.C.....C./P.P.P.P.P/........./........./p.p.p.p.p/.c.....c./........./rnbakabnr", side: 1 },
  { ten: "Khai cuoc — DEN di", fen: "RNBAKABNR/........./.C.....C./P.P.P.P.P/........./........./p.p.p.p.p/.c.....c./........./rnbakabnr", side: -1 }
];

const NAMES = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
function nm(i) { return NAMES[i % 9] + (Math.floor(i / 9) + 1); }
function mvName(code) { return nm(Math.floor(code / 100)) + "-" + nm(code % 100); }

/* ---- Đối chiếu một thế ---- */
let checked = 0;
let diffs = [];

function crosscheck(e, side, nhan) {
  /* Dựng lại grid của game.js từ fen() của engine: đây là mắt xích
     duy nhất nối hai bộ luật, nên nó cũng phải được kiểm tra. */
  let grid90;
  try { grid90 = expandFen(e.fen()); }
  catch (err) { diffs.push({ nhan, why: "fen khong giai nen duoc: " + err.message, fen: e.fen() }); return; }

  setPos(grid90, side);
  const g = JSON.parse(sandbox.__probe());

  /* 1. hai bên phải cùng một thế cờ */
  if (expandFen(g.fen) !== grid90) {
    diffs.push({ why: "grid cua game.js khong khop engine.fen()", fen: e.fen(), gFen: g.fen });
    return;
  }

  /* 2. tập nước hợp lệ */
  const em = [];
  const raw = e.legalMoves(side);
  for (let i = 0; i < raw.length; i += 2) em.push(raw[i] * 100 + raw[i + 1]);
  const A = g.moves.slice().sort((a, b) => a - b);
  const B = em.slice().sort((a, b) => a - b);

  const onlyG = A.filter(x => B.indexOf(x) < 0);
  const onlyE = B.filter(x => A.indexOf(x) < 0);

  /* 3. chiếu tướng phải giống nhau */
  const chkE = e.inCheck(side);
  /* 4. luật 困BIS: hết nước hợp lệ là thua, không phân biệt chiếu hay không.
        engine: result(side) = -1 khi hết nước. game.js: gameState() trả
        "THUA"/"THẮNG" theo phía đang đi. */
  const resE = e.result(side);
  const stateLoose = g.state === "THUA" || g.state === "THẮNG";

  const why = [];
  if (onlyG.length || onlyE.length) {
    why.push("khac nhau " + (onlyG.length + onlyE.length) + " nuoc" +
      (onlyG.length ? "; chi game.js: " + onlyG.map(mvName).join(" ") : "") +
      (onlyE.length ? "; chi engine: " + onlyE.map(mvName).join(" ") : ""));
  }
  if (chkE !== g.chk) why.push("chiếu tướng: engine=" + chkE + " game.js=" + g.chk);
  if ((resE === -1) !== stateLoose) why.push("hết nước: engine result=" + resE + " game.js=" + g.state);

  checked++;
  if (why.length) diffs.push({ nhan, fen: e.fen(), side, why: why.join(" | ") });
}

/* ---- Ván tự đánh: nửa ngẫu nhiên, nửa dùng engine, để thế cờ đa dạng ---- */
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

console.log("=== crosscheck engine <-> luat trong game.js ===");
console.log(PROBES.length + " the co dinh + moi " + PLY_CHECK + " ply lai doi chieu mot lan trong " + GAMES + " van\n");

console.log("--- the co dinh ---");
let nFixed = 0;
for (const p of PROBES) {
  const e = X.createEngine();
  try { e.load(p.fen); } catch (err) { diffs.push({ nhan: p.ten, why: "engine.load() that bai: " + err.message }); continue; }
  crosscheck(e, p.side, p.ten);
  nFixed++;
  process.stdout.write(".");
}
process.stdout.write("\n");

console.log("--- van tu danh ---");
for (let g = 1; g <= GAMES; g++) {
  const rnd = rng(g * 2654435761);
  const e = X.createEngine();
  e.newGame();
  let side = 1, plies = 0, note = "het nuoc";

  crosscheck(e, side, "van " + g + " ply 0");

  while (plies < MAX_PLY) {
    const mv = e.legalMoves(side);
    if (!mv.length) break;

    /* Nửa nước ngẫu nhiên để lái ván rời khỏi khai cuộc, nửa nước do
       engine chọn để ván kéo dài và thế cờ có cấu trúc. bestMove KHÔNG
       đặt giới hạn thời gian (ms) — nếu có, cùng một mã nguồn cho kết quả
       khác nhau giữa các lần chạy, khó biết lúc nào thất bại là do luật
       lệch hay chỉ do máy chậm. */
    let f, t;
    if (rnd() < 0.4) {
      const k = Math.floor(rnd() * (mv.length / 2));
      f = mv[k * 2]; t = mv[k * 2 + 1];
    } else {
      const m = e.bestMove(side, { depth: 3 });
      if (!m) break;
      f = m.from; t = m.to;
    }
    e.doMove(f, t);
    side = -side;
    plies++;

    /* engine vẫn cho phép ăn tướng (xem ghi chú trong perft.js). Khi một
       tướng đã bị ăn thì cả hai bộ luật đều mất ý nghĩa, nên dừng ván
       thay vì báo cáo lệch giả. */
    const bd = e.getBoard();
    if (bd.indexOf(107) < 0 || bd.indexOf(-75) < 0) { note = "co tuong bi an"; break; }

    if (plies % PLY_CHECK === 0) crosscheck(e, side, "van " + g + " ply " + plies);
  }

  console.log("van " + g + ": " + plies + " ply (" + note + ")");
}

console.log("\nso the da doi chieu: " + checked + "  (" + nFixed + " co dinh + " + (checked - nFixed) + " trong van)");
if (diffs.length) {
  console.log("\nLECH " + diffs.length + " the:\n");
  for (const d of diffs.slice(0, 12)) {
    console.log("  [" + (d.nhan || "?") + "]");
    console.log("  FEN: " + (d.fen || "?") + (d.side ? "   (" + (d.side === 1 ? "ĐỎ" : "ĐEN") + " đi)" : ""));
    if (d.gFen) console.log("  fen cua game.js: " + d.gFen);
    console.log("  " + d.why + "\n");
  }
  console.log("X: hai bo luat da lech nhau.");
  process.exit(1);
}
console.log("OK: hai bo luat cho ra cung tap nuoc hoi o moi the da doi chieu.");
