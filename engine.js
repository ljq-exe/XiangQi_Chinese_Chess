/* ============================================================================
   Xiangqi Engine — negamax + alpha-beta + transposition table
   Bảng phân mã quân: 0 = trống
   Quân đen (uppercase, đi trước ở phía trên): K A B N R C P
   Quân đỏ  (lowercase, phía dưới):            k a b n r c p
   ========================================================================== */
(function (root) {
  "use strict";

  var EMPTY = 0;

  /* ---------- Khởi tạo bàn ---------- */
  var START = [
    "RNBAKABNR",
    ".........",
    ".C.....C.",
    "P.P.P.P.P",
    ".........",
    ".........",
    "p.p.p.p.p",
    ".c.....c.",
    ".........",
    "rnbakabnr"
  ];

  /* Mã ASCII chuẩn hoá theo LOẠI quân (dùng làm chỉ số mảng, không phụ
     thuộc màu): K A B N R C P  — dùng cho VAL, VALSEE, ZMAP, MVV-LVA.  */
  var KIND_ASCII = { K: 75, A: 65, B: 66, N: 78, R: 82, C: 67, P: 80 };
  var KIND_LIST = ["K", "A", "B", "N", "R", "C", "P"];

  /* ==================== HẮNG Số & BẢNG TOẠ ĐỘ ==================== */

  /* Quân hóa theo góc nhìn ĐỎ (lowercase, dương) / ĐEN (uppercase, âm):
       k=107 Tướng  a=97  Sĩ  b=98  Tượng
       n=110 Mã     r=114 Xe  c=99  Pháo  p=112 Tốt                     */
  var CODE = { K: 107, A: 97, B: 98, N: 110, R: 114, C: 99, P: 112 };
  /* Hàng của ô phẳng. */
  var ROW_OF = new Int8Array(90);
  var COL_OF = new Int8Array(90);
  /* VFLIP: ô tương ứng khi lật bàn theo chiều dọc (hàng r -> 9-r).
     Đây là phép đối xứng ĐÚNG của tướng: quân ĐỎ đi lên (9->0), quân ĐEN
     đi xuống (0->9), nên cùng một bảng PST gốc là dùng được cho cả hai
     nếu tra theo VFLIP. (Lật 180° — tức 89-i — là SAI vì xoay cả cột.)   */
  var VFLIP = new Int8Array(90);
  for (var _i = 0; _i < 90; _i++) {
    var _r = (_i / 9) | 0, _c = _i % 9;
    ROW_OF[_i] = _r;
    COL_OF[_i] = _c;
    VFLIP[_i] = (9 - _r) * 9 + _c;
  }

  /* Bảng 8 bước đi của Mã, kèm ô "chân" phải trống. */
  var HORSE_MV = [
    [2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0],
    [1, 2, 0, 1], [1, -2, 0, -1], [-1, 2, 0, 1], [-1, -2, 0, -1]
  ];
  /* Gộp thành bảng phẳng để tra nhanh: [dR,dC,legR,legC] x 8 */
  var HORSE_STEP = new Int8Array(32);
  for (var _h = 0; _h < 8; _h++) {
    HORSE_STEP[_h * 4] = HORSE_MV[_h][0];
    HORSE_STEP[_h * 4 + 1] = HORSE_MV[_h][1];
    HORSE_STEP[_h * 4 + 2] = HORSE_MV[_h][2];
    HORSE_STEP[_h * 4 + 3] = HORSE_MV[_h][3];
  }

  /* Bảng đánh giá Tốt đã qua sông, theo số hàng đã đi được vào bàn địch.
     Chỉ mã hoá phần "đã sang bên kia"; giá trị tính theo góc nhìn ĐỎ.  */
  var PAWN_CROSS = [0, 2, 6, 12, 20, 30, 42, 56, 72, 90];

  /* Giá trị quân (phía đỏ). Tướng không bao giờ bị ăn nên không tính.   */
  var VAL = { P: 100, R: 600, N: 270, C: 285, B: 220, A: 220, K: 0 };
  /* Ngưỡng nhận diện điểm chiếu hết. */
  var MATE = 30000;
  var MATE_TH = 29000;

  /* ---------- Bảng đánh giá vị trí (PST) ----------
     Nhập theo góc nhìn quân ĐỎ: hàng 0 = sát cung đen, hàng 9 = cung đỏ.
     Quân đỏ đi từ hàng 9 lên hàng 0, nên giá trị CAO ở hàng thấp.      */
  var PST_RED = {
    p: [ /* Tốt: càng lên gần cung đen càng tốt */
        0,  3,  6,  9, 12,  9,  6,  3,  0,
       -2,  2,  4,  6,  8,  6,  4,  2, -2,
       -6,  0,  8, 14, 20, 14,  8,  0, -6,
       -6,  0,  4,  8, 10,  8,  4,  0, -6,
       -8, -2,  2,  4,  6,  4,  2, -2, -8,
       -8, -2,  0,  2,  4,  2,  0, -2, -8,
       -8, -4,  0,  0,  2,  0,  0, -4, -8,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0
    ],
    r: [ /* Xe: file trung và hàng trung rất mạnh */
       -6,  6, 14, 20, 22, 20, 14,  6, -6,
       -4,  8, 18, 26, 30, 26, 18,  8, -4,
        0, 10, 20, 30, 34, 30, 20, 10,  0,
        2, 12, 22, 32, 36, 32, 22, 12,  2,
        2, 12, 22, 32, 36, 32, 22, 12,  2,
        0, 12, 20, 30, 34, 30, 20, 12,  0,
       -2,  8, 16, 24, 28, 24, 16,  8, -2,
       -6,  4, 10, 18, 20, 18, 10,  4, -6,
       -8,  0,  6, 14, 16, 14,  6,  0, -8,
       -8, -2,  2,  8, 10,  8,  2, -2, -8
    ],
    n: [ /* Mã: trung tâm tốt, cạnh và góc yếu */
        2,  4,  8, 10, 10, 10,  8,  4,  2,
        6, 12, 18, 22, 24, 22, 18, 12,  6,
       10, 18, 26, 30, 32, 30, 26, 18, 10,
       14, 24, 32, 36, 38, 36, 32, 24, 14,
       14, 24, 32, 36, 38, 36, 32, 24, 14,
       12, 20, 28, 32, 34, 32, 28, 20, 12,
        8, 12, 18, 22, 24, 22, 18, 12,  8,
        0,  6, 10, 12, 14, 12, 10,  6,  0,
       -4,  0,  4,  6,  8,  6,  4,  0, -4,
       -6, -4,  0,  0,  2,  0,  0, -4, -6
    ],
    c: [ /* Pháo: chỉ mạnh khi có quân chắn, thích trục giữa */
        -8, -4,  0,  6, 10,  6,  0, -4, -8,
        -6,  0,  6, 12, 16, 12,  6,  0, -6,
        -4,  2,  8, 12, 14, 12,  8,  2, -4,
        -4,  0,  4,  6,  8,  6,  4,  0, -4,
        -2,  0,  2,  4,  4,  4,  2,  0, -2,
        -2,  0,  2,  2,  2,  2,  2,  0, -2,
        -4,  0,  0,  2,  2,  2,  0,  0, -4,
        -6, -2,  0,  0,  0,  0,  0, -2, -6,
        -8, -4, -2,  0,  0,  0, -2, -4, -8,
       -8, -6, -4, -2,  0, -2, -4, -6, -8
    ],
    b: [ /* Tượng: chỉ 7 điểm trong nước nhà, điểm gần vị trí sở trường */
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0, 14,  0,  0,  0, 14,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0
    ],
    a: [ /* Sĩ: đứng đúng 4 chỗ bảo vệ tướng */
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0, 16,  0,  0,  0, 16,  0,  0,
        0,  0,  0,  8,  0,  8,  0,  0,  0
    ],
    k: [ /* Tướng: ưu tiên giữ chính cung, tránh đứng sơ hở */
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  8,  0,  0,  0,  0,
        0,  0,  0,  0, 12,  0,  0,  0,  0
    ]
  };

  /* Bảng PST gốc (góc nhìn đỏ). Quân đen tra qua VFLIP, không lật bảng. */
  var PST = PST_RED;

  /* Bảng tra nhanh: mã ASCII (đã lấy dấu) -> giá trị quân của phe đó.
     Chỉ mục = mã + 128 nên nằm trong khoảng [35, 235] — vừa khớp với
     cách lập chỉ mục (p + 128) để sắp nước đi chỉ cần một phép cộng.    */
  var VALSEE = new Int16Array(256);
  (function () {
    for (var t = 0; t < KIND_LIST.length; t++) {
      var ch = KIND_LIST[t], up = KIND_ASCII[ch];
      VALSEE[CODE[ch] + 128] = VAL[ch];          // quân đỏ  (lowercase, dương)
      VALSEE[up + 128] = VAL[ch];                // quân đen (uppercase) — dương
      VALSEE[128 - up] = -VAL[ch];               // quân đen đã lưu thành số âm
    }
  })();

  /* ============================ Trạng thái ============================ */
  /* ---------- Quy uoc: quân ĐỎ giữ mã ASCII dương, quân ĐEN giữ mã ÂM ----------
     'k'=107 đỏ, 'K'=75 đen -> lưu -75. Nhờ vậy p>0 luôn đúng cho đỏ.      */
  function createEngine() {
    var board = new Int16Array(90);
    var turn = 1;              // 1 = đỏ (lowercase), -1 = đen (uppercase)
    var kings = { "1": -1, "-1": -1 };

    var ply = 0;
    var nodes = 0;
    var deadline = Infinity;
    var startedAt = 0;
    var aborted = false;
    /* Thống kê hiệu năng, đọc từ bestMove(): số lần tra bảng băm, số lần
       ăn trong bảng băm, và số lần cắt alpha-beta. Giúp đo xem TT và
       move ordering có thực sự hiệu quả không. */
    var statTTProbe = 0, statTTHit = 0, ttCutoffs = 0;

    /* Bảng phân mã hoá dạng mảng số: nhanh hơn Map rất nhiều trong nhiệm
       vụ nóng. size = 2^20 ô. ttKey = -1 nghĩa là ô còn trống.
       Tách mỗi thành phần ra một mảng riêng thay vì gói bit — dễ kiểm
       tra hơn và không mất độ chính xác của điểm.                     */
    var TT_BITS = 20;
    var TT_SIZE = 1 << TT_BITS;
    var TT_MASK = TT_SIZE - 1;
    var ttKey = new Int32Array(TT_SIZE);
    var ttScore = new Int32Array(TT_SIZE);
    var ttDepth = new Int16Array(TT_SIZE);
    var ttFlag = new Uint8Array(TT_SIZE);
    var ttMv = new Int32Array(TT_SIZE);
    /* Cờ bound: 0 = EXACT, 1 = LOWER (fail-high), 2 = UPPER (fail-low)   */
    var BOUND_EXACT = 0, BOUND_LOWER = 1, BOUND_UPPER = 2;
    function ttClear() { ttKey.fill(-1); }
    ttKey.fill(-1);

    var hist = new Int32Array(90 * 90);
    var killers = new Int32Array(256);

    function load(fen) {
      board.fill(0);
      var rows = (typeof fen === "string" ? fen.split("/") : fen);
      for (var r = 0; r < rows.length && r < 10; r++) {
        var c = 0, row = rows[r];
        for (var i = 0; i < row.length; i++) {
          var ch = row[i];
          if (ch >= "1" && ch <= "9") { c += +ch; continue; }
          if (ch === "." || ch === " " || ch === "") { c++; continue; }
          if (c > 8) break;
          var code = ch.charCodeAt(0);
          /* chữ hoa = đen -> lưu số âm để phân biệt nhanh bằng dấu */
          board[r * 9 + c] = (ch >= "A" && ch <= "Z") ? -code : code;
          c++;
        }
      }
      kings["1"] = scanKing(CODE.K);         // 'k'  (107)
      kings["-1"] = scanKing(-KIND_ASCII.K); // 'K' đã lưu thành -75
      turn = 1;
      /* Tính khoá Zobrist một lần khi nạp thế; từ đây doMove/undoMove
         tự cập nhật tăng dần. */
      zobHash = hashFull();
    }

    /* Quét tìm vị trí tướng theo giá trị đã lưu */
    function scanKing(code) {
      for (var i = 0; i < 90; i++) if (board[i] === code) return i;
      return -1;
    }

    function getTurn() { return turn; }
    function setTurn(t) {
      if (t === turn) return;
      /* đổi lượt cũng phải đổi khoá Zobrist, nếu không thế sau đó sẽ
         không bao giờ khớp trong bảng băm */
      var h = zobHash ^ zKeys[ZSQ + (turn === 1 ? 0 : 1)];
      turn = t;
      zobHash = (h ^ zKeys[ZSQ + (turn === 1 ? 0 : 1)]) | 0;
    }
    function clone() { var e = createEngine(); e.load(fenOf()); e.setTurn(turn); return e; }

    /* FEN chuan: quan den = CHU HOA, quan do = chu thuong */
    function fenOf() {
      var out = "";
      for (var r = 0; r < 10; r++) {
        var empty = 0;
        for (var c = 0; c < 9; c++) {
          var p = board[r * 9 + c];
          if (!p) { empty++; continue; }
          if (empty) { out += empty; empty = 0; }
          var s = String.fromCharCode(p < 0 ? -p : p);
          out += p > 0 ? s.toLowerCase() : s.toUpperCase();
        }
        if (empty) out += empty;
        if (r < 9) out += "/";
      }
      return out;
    }

    /* --------------------------- Tiện ích --------------------------- */
    /* Kiểm tra tọa độ (phải kiểm tra cả hàng lẫn cột, nếu chỉ kiểm tra
       chỉ số phẳng thì mã/voi ở mép cột sẽ "cuộn" sang hàng bên cạnh) */
    function inBoard(r, c) { return r >= 0 && r <= 9 && c >= 0 && c <= 8; }

    function own(p, s) { return p !== EMPTY && (p > 0) === (s === 1); }
    function kind(p) {
      var c = String.fromCharCode(p < 0 ? -p : p).toUpperCase();
      return c;
    }

    function findKing(s) {
      return s === 1 ? kings["1"] : kings["-1"];
    }

    /* Số quân giữa hai ô (dùng cho tướng đối diện nhau) */
    function betweenCount(a, b) {
      var r1 = (a / 9) | 0, c1 = a % 9;
      var r2 = (b / 9) | 0, c2 = b % 9;
      var dr = (r2 > r1) - (r2 < r1);
      var dc = (c2 > c1) - (c2 < c1);
      var r = r1 + dr, c = c1 + dc, n = 0;
      while (r !== r2 || c !== c2) {
        if (board[r * 9 + c]) n++;
        r += dr; c += dc;
      }
      return n;
    }

    /* Hai tướng có đối diện nhau qua đường dọc không */
    function kingsFacing() {
      var a = kings["1"], b = kings["-1"];
      if (a < 0 || b < 0) return false;
      if (a % 9 !== b % 9) return false;
      return betweenCount(a, b) === 0;
    }

    /* -------------------- Sinh nước đi (mảng phẳng) --------------------
       out = [from, to, from, to, ...] — nước "giả" (chưa lọc chiếu tướng)   */
    function genMoves(s, out, capturesOnly) {
      var n = 0;
      for (var from = 0; from < 90; from++) {
        var p = board[from];
        if (!p || (p > 0) !== (s === 1)) continue;
        var k = kind(p);
        var r = (from / 9) | 0, c = from % 9;

        /* --- Tướng & Sĩ: chỉ trong cung --- */
        if (k === "K" || k === "A") {
          var lo = s === 1 ? 7 : 0, hi = s === 1 ? 9 : 2;
          var steps = k === "K"
            ? [[1, 0], [-1, 0], [0, 1], [0, -1]]
            : [[1, 1], [1, -1], [-1, 1], [-1, -1]];
          for (var a = 0; a < 4; a++) {
            var nr = r + steps[a][0], nc = c + steps[a][1];
            if (nr < lo || nr > hi || nc < 3 || nc > 5) continue;
            var to = nr * 9 + nc, q = board[to];
            if (own(q, s)) continue;
            if (capturesOnly && !q) continue;
            out[n++] = from; out[n++] = to;
          }
          continue;
        }

        /* --- Tượng: chéo 2 ô, không qua sông, mắt không bị chặn --- */
        if (k === "B") {
          for (var b = 0; b < 4; b++) {
            var dr = b < 2 ? 2 : -2, dc = (b % 2 === 0) ? 2 : -2;
            var tr = r + dr, tc = c + dc;
            if (!inBoard(tr, tc)) continue;
            if (s === 1 && (tr < 5 || r < 5)) continue;
            if (s === -1 && (tr > 4 || r > 4)) continue;
            if (board[(r + dr / 2) * 9 + (c + dc / 2)]) continue;
            var t2 = tr * 9 + tc, q2 = board[t2];
            if (own(q2, s)) continue;
            if (capturesOnly && !q2) continue;
            out[n++] = from; out[n++] = t2;
          }
          continue;
        }

        /* --- Mã: 8 nước, chân bị chặn thì không đi --- */
        if (k === "N") {
          var hm = [
            [2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0],
            [1, 2, 0, 1], [1, -2, 0, -1], [-1, 2, 0, 1], [-1, -2, 0, -1]
          ];
          for (var h = 0; h < 8; h++) {
            var xr = r + hm[h][0], xc = c + hm[h][1];
            if (!inBoard(xr, xc)) continue;
            /* chân mã: ô (r + hm[h][2], c + hm[h][3]) phải trong bàn và trống */
            if (!inBoard(r + hm[h][2], c + hm[h][3])) continue;
            if (board[(r + hm[h][2]) * 9 + (c + hm[h][3])]) continue;
            var t3 = xr * 9 + xc, q3 = board[t3];
            if (own(q3, s)) continue;
            if (capturesOnly && !q3) continue;
            out[n++] = from; out[n++] = t3;
          }
          continue;
        }

        /* --- Xe & Pháo: trượt thẳng --- */
        if (k === "R" || k === "C") {
          var isC = k === "C";
          var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
          for (var d = 0; d < 4; d++) {
            var cr = r + dirs[d][0], cc = c + dirs[d][1];
            var jumped = false;
            while (cr >= 0 && cr <= 9 && cc >= 0 && cc <= 8) {
              var sq = cr * 9 + cc, piece = board[sq];
              if (!isC) {
                if (!piece) { if (!capturesOnly) { out[n++] = from; out[n++] = sq; } }
                else {
                  if ((piece > 0) !== (s === 1)) { out[n++] = from; out[n++] = sq; }
                  break;
                }
              } else {
                if (!jumped) {
                  if (!piece) { if (!capturesOnly) { out[n++] = from; out[n++] = sq; } }
                  else jumped = true;
                } else if (piece) {
                  if ((piece > 0) !== (s === 1)) { out[n++] = from; out[n++] = sq; }
                  break;
                }
              }
              cr += dirs[d][0]; cc += dirs[d][1];
            }
          }
          continue;
        }

        /* --- Tốt: đi thẳng; qua sông rồi mới đi ngang --- */
        if (k === "P") {
          var up = s === 1 ? -1 : 1;
          var fr = r + up;
          if (fr >= 0 && fr <= 9) {
            var ft = fr * 9 + c;
            if (!board[ft] && !capturesOnly) { out[n++] = from; out[n++] = ft; }
            else if (board[ft] && (board[ft] > 0) !== (s === 1)) { out[n++] = from; out[n++] = ft; }
          }
          var crossed = s === 1 ? r <= 4 : r >= 5;
          if (crossed) {
            for (var dd = -1; dd <= 1; dd += 2) {
              var nc2 = c + dd;
              if (nc2 < 0 || nc2 > 8) continue;
              var tt2 = r * 9 + nc2, qq = board[tt2];
              if (own(qq, s)) continue;
              if (!qq && capturesOnly) continue;
              out[n++] = from; out[n++] = tt2;
            }
          }
          continue;
        }
      }
      return n;
    }

    /* ------------- Đặt quân / bỏ quân (undo bằng stack) -------------
       Mỗi nước đi/hoàn tác đều cập nhật khoá Zobrist tăng dần: bỏ quân
       khỏi ô cũ, đặt vào ô mới, bỏ/đặt quân bị ăn, và đổi khoá lượt.
       Nhờ vậy hashPos() là O(1) thay vì quét 90 ô.                      */
    function doMove(from, to) {
      var p = board[from], cap = board[to];
      var h = zobHash;
      var tp = ZIDX[p + 128], tc = ZIDX[cap + 128];
      if (tp >= 0) h ^= zKeys[tp * 90 + from];      /* gỡ p khỏi ô đi     */
      if (tp >= 0) h ^= zKeys[tp * 90 + to];        /* đặt p vào ô đến   */
      if (tc >= 0) h ^= zKeys[tc * 90 + to];        /* gỡ quân bị ăn     */
      h ^= zKeys[ZSQ + (turn === 1 ? 0 : 1)];
      board[to] = p; board[from] = EMPTY;
      if (p === CODE.K) kings["1"] = to;
      if (p === -KIND_ASCII.K) kings["-1"] = to;
      if (cap === CODE.K) kings["1"] = -1;
      if (cap === -KIND_ASCII.K) kings["-1"] = -1;
      turn = -turn;
      h ^= zKeys[ZSQ + (turn === 1 ? 0 : 1)];
      zobHash = h | 0;
      return cap;
    }

    function undoMove(from, to, cap) {
      var p = board[to];
      var h = zobHash;
      var tp = ZIDX[p + 128], tc = ZIDX[cap + 128];
      if (tp >= 0) h ^= zKeys[tp * 90 + to];        /* gỡ p khỏi ô đến   */
      if (tc >= 0) h ^= zKeys[tc * 90 + to];        /* trả cap về ô đến */
      if (tp >= 0) h ^= zKeys[tp * 90 + from];      /* trả p về ô đi    */
      h ^= zKeys[ZSQ + (turn === 1 ? 0 : 1)];
      board[from] = p; board[to] = cap;
      if (p === CODE.K) kings["1"] = from;
      if (p === -KIND_ASCII.K) kings["-1"] = from;
      if (cap === CODE.K) kings["1"] = to;
      if (cap === -KIND_ASCII.K) kings["-1"] = to;
      turn = -turn;
      h ^= zKeys[ZSQ + (turn === 1 ? 0 : 1)];
      zobHash = h | 0;
    }

    /* -------------------- Kiểm tra chiếu tướng -------------------- */
    function inCheck(s) {
      var ks = findKing(s);
      if (ks < 0) return false;
      return isAttacked(ks, -s);
    }

    /* Ô `sq` có bị quân phía `by` tấn công không */
    function isAttacked(sq, by) {
      var r = (sq / 9) | 0, c = sq % 9;
      var byRed = by === 1;

      /* Tốt: quân đỏ đi lên nên nằm ở hàng dưới mục tiêu; quân đen đi xuống */
      var pr = byRed ? r + 1 : r - 1;
      var isPawn = byRed ? 112 : -80;          // 'p' | 'P'
      if (pr >= 0 && pr <= 9) {
        if (board[pr * 9 + c] === isPawn) return true;
      }
      /* Tốt đi ngang sau khi qua sông, cùng hàng với mục tiêu. */
      var crossed = byRed ? r <= 4 : r >= 5;
      if (crossed) {
        if (c > 0 && board[r * 9 + (c - 1)] === isPawn) return true;
        if (c < 8 && board[r * 9 + (c + 1)] === isPawn) return true;
      }

      /* Tướng: tấn công 1 ô, cùng cột nếu không bị chắn (đối diện nhau) */
      var kLo = byRed ? 7 : 0, kHi = byRed ? 9 : 2;
      for (var i = 0; i < 4; i++) {
        var d = [[1, 0], [-1, 0], [0, 1], [0, -1]][i];
        var nr = r + d[0], nc = c + d[1];
        if (nr < kLo || nr > kHi || nc < 3 || nc > 5) continue;
        var q = board[nr * 9 + nc];
        if (q && (q > 0) === byRed) {
          var kk = kind(q);
          if (kk === "K") return true;
        }
      }

      /* Sĩ */
      for (var j = 0; j < 4; j++) {
        var dd2 = [[1, 1], [1, -1], [-1, 1], [-1, -1]][j];
        var ar = r + dd2[0], ac = c + dd2[1];
        if (ar < kLo || ar > kHi || ac < 3 || ac > 5) continue;
        var qa = board[ar * 9 + ac];
        if (qa && (qa > 0) === byRed && kind(qa) === "A") return true;
      }

      /* Xe: quét 4 hướng, quân đầu tiên */
      var dr = [1, -1, 0, 0], dc = [0, 0, 1, -1];
      for (var x = 0; x < 4; x++) {
        var y1 = r + dr[x], x1 = c + dc[x];
        while (y1 >= 0 && y1 <= 9 && x1 >= 0 && x1 <= 8) {
          var v = board[y1 * 9 + x1];
          if (v) {
            if ((v > 0) === byRed && kind(v) === "R") return true;
            break;
          }
          y1 += dr[x]; x1 += dc[x];
        }
      }

      /* Pháo: quân thứ 2 mới bắn được */
      for (var y = 0; y < 4; y++) {
        var y2 = r + dr[y], x2 = c + dc[y], seen = false;
        while (y2 >= 0 && y2 <= 9 && x2 >= 0 && x2 <= 8) {
          var v2 = board[y2 * 9 + x2];
          if (v2) {
            if (seen) {
              if ((v2 > 0) === byRed && kind(v2) === "C") return true;
              break;
            }
            seen = true;
          }
          y2 += dr[y]; x2 += dc[y];
        }
      }

      /* Mã: 8 vị trí + chân.
         Bảng hm2 viết theo góc nhìn quân Mã: đi [dR,dC] thì chân ở
         Mã + [legR,legC]. Ở đây quét ngược từ mục tiêu nên ô Mã phải
         đứng ở T - [dR,dC], rồi chân tính từ chính ô MÃ đó.
         Bản ců lấy Mã ở T + [dR,dC] và chân tính từ mục tiêu, nên:
           - tìm nhầm phía (chỉ đúng khi bảng đối xứng nên lọt qua test),
           - chân Mã tính sai ô nên Mã có chân bị chặn vẫn bị coi là đánh,
             khiến inCheck() báo chiếu giả và loại nhầm nước giữ chiếu. */
      var hm2 = [
        [2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0],
        [1, 2, 0, 1], [1, -2, 0, -1], [-1, 2, 0, 1], [-1, -2, 0, -1]
      ];
      for (var m = 0; m < 8; m++) {
        var hr = r - hm2[m][0], hc = c - hm2[m][1];
        if (!inBoard(hr, hc)) continue;
        var qh = board[hr * 9 + hc];
        if (!qh || (qh > 0) !== byRed || kind(qh) !== "N") continue;
        var hlr = hr + hm2[m][2], hlc = hc + hm2[m][3];
        if (!inBoard(hlr, hlc)) continue;
        if (board[hlr * 9 + hlc]) continue;
        return true;
      }

      /* Tượng */
      for (var e = 0; e < 4; e++) {
        var er = r + (e < 2 ? 2 : -2), ec = c + (e % 2 === 0 ? 2 : -2);
        if (!inBoard(er, ec)) continue;
        if (byRed && (er < 5 || r < 5)) continue;
        if (!byRed && (er > 4 || r > 4)) continue;
        var qe = board[er * 9 + ec];
        if (!qe || (qe > 0) !== byRed || kind(qe) !== "B") continue;
        if (board[(r + (e < 2 ? 1 : -1)) * 9 + (c + (e % 2 === 0 ? 1 : -1))]) continue;
        return true;
      }

      return false;
    }

    /* Ghi các nước hợp lệ vào buffer của caller, trả về số phần tử theo cặp. */
    var rawBuf = new Int32Array(180);

    function fillLegal(s, out) {
      var n = genMoves(s, rawBuf, false);
      var cnt = 0;
      for (var i = 0; i < n; i += 2) {
        var f = rawBuf[i], t = rawBuf[i + 1];
        var cap = doMove(f, t);
        var ok = !kingsFacing() && !inCheck(s);
        undoMove(f, t, cap);
        if (ok) { out[cnt] = f; out[cnt + 1] = t; cnt += 2; }
      }
      return cnt;
    }

    /* Bộ đệm cho danh sách nước đi của từng tầng negamax và quiescence.
       MAXPLY phải lớn hơn số tầng tối đa: depth tăng dần theo đệ quy và
       mở rộng thêm khi bị chiếu, nhưng `ext` không bao giờ vượt 2 nên
       độ sâu tối đa hữu hạn.                                        */
    var MAXPLY = 96;
    var plyBuf = new Int32Array(180 * MAXPLY);
    var qBuf = new Int32Array(180 * 16);
    var sIdx = new Int32Array(180);
    var ordIdx = new Int32Array(180);
    var tmpBuf = new Int32Array(180);

    /* API công khai: trả về mảng phẳng (dùng ngoài nhiệm vụ tìm). */
    function legalMoves(s) {
      var tmp = new Int32Array(180);
      var cnt = fillLegal(s, tmp);
      var res = [];
      for (var i = 0; i < cnt; i++) res.push(tmp[i]);
      return res;
    }

    /* Theo luật 困BIS, bên hết nước hợp lệ thua dù có bị chiếu hay không. */
    function result(s) {
      var tmp = new Int32Array(180);
      return fillLegal(s, tmp) ? 0 : -1;
    }

    /* GOM[p + 128][sq] lưu điểm vật liệu và vị trí của quân tại ô đó. */
    var GOM = (function () {
      var g = new Int16Array(256 * 90);
      for (var t = 0; t < KIND_LIST.length; t++) {
        var ch = KIND_LIST[t];
        var v = VAL[ch];
        var rc = CODE[ch];                 // mã quân ĐỎ  (lowercase, dương)
        var bcp = KIND_ASCII[ch];          // mã quân ĐEN (uppercase, sẽ lưu âm)
        var tbl = PST[ch.toLowerCase()];   // bảng nhập theo góc nhìn đỏ
        for (var sq = 0; sq < 90; sq++) {
          /* quân đỏ đứng tại sq: cộng thẳng điểm vật liệu + PST */
          g[(rc + 128) * 90 + sq] = v + tbl[sq];
          /* quân đen đứng tại sq: nhìn qua gương VFLIP rồi lấy phủ định.
             Đây là lật DỌC (hàng r -> 9-r, giữ nguyên cột) — đúng vì
             quân đỏ đi lên còn quân đen đi xuống.                          */
          g[(128 - bcp) * 90 + sq] = -(v + tbl[VFLIP[sq]]);
        }
      }
      return g;
    })();

    /* Bảng cộng thêm cho Tốt đã qua sông, gộp thẳng vào GOM để evaluate()
       vẫn chỉ là một phép cộng trên mỗi ô.                              */
    (function () {
      for (var sq = 0; sq < 90; sq++) {
        var r = ROW_OF[sq];
        /* quân đỏ đã qua sông khi r <= 4; đo bằng số hàng đã đi sâu vào
           bàn địch = 9 - r, nhưng chỉ tính từ hàng 4 trở lên.             */
        var advR = 9 - r;
        if (r <= 4 && advR > 0) GOM[(CODE.P + 128) * 90 + sq] += PAWN_CROSS[advR];
        /* quân đen đã qua sông khi r >= 5 */
        var advB = r;
        if (r >= 5 && advB > 0) GOM[(128 - KIND_ASCII.P) * 90 + sq] -= PAWN_CROSS[advB];
      }
    })();

    /* Đánh giá thế cờ bằng một lần quét bàn cờ.
       Các yếu tố bổ sung ngoài PST:
       - Mã (馬) bị chặn chân là yếu: chấm theo số nước còn đi.
       - Xe (俥) nắm file không có Tốt nào là file mở, rất mạnh.
       - Pháo (炮) trấn giữ trục 3/4/5 là trục chính của cung đối phương.
       - Sĩ (仕) giữ cung; thiếu Sĩ thì tướng dễ bị Pháo/Mã ăn.

       Điểm trả về theo góc nhìn phe ĐỎ. */
    var R_CODE = CODE.R, R_CODE_NEG = -KIND_ASCII.R;
    var C_CODE = CODE.C, C_CODE_NEG = -KIND_ASCII.C;
    var A_CODE = CODE.A, A_CODE_NEG = -KIND_ASCII.A;
    var N_CODE = CODE.N, N_CODE_NEG = -KIND_ASCII.N;
    var P_CODE = CODE.P, P_CODE_NEG = -KIND_ASCII.P;

    function evaluate() {
      var sc = 0;
      var pawnFileRed = 0, pawnFileBlack = 0;
      var rookSq = [], rookRed = [];
      var canSq = [], canRed = [];
      var advRed = 0, advBlack = 0;
      var horSq = [], horRed = [];

      for (var i = 0; i < 90; i++) {
        var p = board[i];
        if (!p) continue;
        sc += GOM[(p + 128) * 90 + i];
        if (p === P_CODE) pawnFileRed |= 1 << COL_OF[i];
        else if (p === P_CODE_NEG) pawnFileBlack |= 1 << COL_OF[i];
        else if (p === R_CODE) { rookSq.push(i); rookRed.push(1); }
        else if (p === R_CODE_NEG) { rookSq.push(i); rookRed.push(0); }
        else if (p === C_CODE) { canSq.push(i); canRed.push(1); }
        else if (p === C_CODE_NEG) { canSq.push(i); canRed.push(0); }
        else if (p === A_CODE) advRed++;
        else if (p === A_CODE_NEG) advBlack++;
        else if (p === N_CODE) { horSq.push(i); horRed.push(1); }
        else if (p === N_CODE_NEG) { horSq.push(i); horRed.push(0); }
      }

      /* Xe trên file mở (không Tốt phe nào) / nửa mở (không Tốt phe mình) */
      for (var r = 0; r < rookSq.length; r++) {
        var bit = 1 << COL_OF[rookSq[r]];
        var mine = rookRed[r];
        var ownMask = mine ? pawnFileRed : pawnFileBlack;
        var foeMask = mine ? pawnFileBlack : pawnFileRed;
        var bonus;
        if (!(ownMask & bit)) bonus = !(foeMask & bit) ? 22 : 12;
        else bonus = 0;
        sc += mine ? bonus : -bonus;
      }
      /* Pháo giữ trục giữa */
      for (var c = 0; c < canSq.length; c++) {
        var col = COL_OF[canSq[c]];
        if (col >= 3 && col <= 5) sc += canRed[c] ? 8 : -8;
      }
      /* Sĩ còn trong cung */
      sc += (advRed - advBlack) * 6;
      /* Mã: 0 nước đi thì gần như chết, mỗi nước đi thêm được điểm */
      for (var h = 0; h < horSq.length; h++) {
        var m = horseMobility(horSq[h]);
        sc += (m - 4) * (horRed[h] ? 6 : -6);
      }
      return sc;
    }

    /* Số nước đi hợp lệ của Mã tại ô `from` (chỉ tính chân, không tính
       luật tự phong cung — Mã không bị ràng buộc nào khác).               */
    function horseMobility(from) {
      var r = ROW_OF[from], c = COL_OF[from], n = 0;
      for (var m = 0; m < 8; m++) {
        var b = m * 4;
        var nr = r + HORSE_STEP[b], nc = c + HORSE_STEP[b + 1];
        if (nr < 0 || nr > 9 || nc < 0 || nc > 8) continue;
        var lr = r + HORSE_STEP[b + 2], lc = c + HORSE_STEP[b + 3];
        if (board[lr * 9 + lc]) continue;         /* bị chặn chân */
        n++;
      }
      return n;
    }

    /* Zobrist keys: 14 loại quân × 90 ô, cộng hai khóa lượt đi. */
    var ZSQ = 14 * 90;
    var zKeys = new Int32Array(ZSQ + 2);
    (function () {
      var a = 0x9e3779b9 >>> 0;
      function rnd() {
        a = (a + 0x6d2b79f5) >>> 0;
        var t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return (t ^ (t >>> 14)) | 0;
      }
      for (var i = 0; i < zKeys.length; i++) zKeys[i] = rnd();
    })();

    /* Ánh xạ mã quân đã chuẩn hóa sang chỉ số Zobrist. */
    var ZMAP = (function () {
      var m = new Int16Array(256);
      for (var j = 0; j < 256; j++) m[j] = -1;
      for (var i = 0; i < KIND_LIST.length; i++) {
        var ch = KIND_LIST[i];
        m[CODE[ch]] = i;                 // quân đỏ  (chữ thường, dương)
        m[KIND_ASCII[ch]] = i + 7;       // quân đen (chữ hoa, lưu thành âm)
      }
      return m;
    })();

    /* Tra mã quân đã cộng 128 thành chỉ số Zobrist, -1 nếu ô trống. */
    var ZIDX = (function () {
      var t = new Int16Array(256);
      for (var j = 0; j < 256; j++) {
        var code = j - 128;
        t[j] = (code === 0) ? -1 : ZMAP[code < 0 ? -code : code];
      }
      return t;
    })();

    /* Hash vị trí hiện tại; được cập nhật tăng dần trong doMove/undoMove. */
    var zobHash = 0;

    function hashFull() {
      var h = 0;
      for (var i = 0; i < 90; i++) {
        var t = ZIDX[board[i] + 128];
        if (t >= 0) h ^= zKeys[t * 90 + i];
      }
      h ^= zKeys[ZSQ + (turn === 1 ? 0 : 1)];
      return h | 0;
    }

    function hashPos() {
      return zobHash;
    }

    /* Bảng điểm quân bị ăn, tra trực tiếp theo mã quân đã cộng 128. */
    var CAP_SCORE = new Int32Array(256);
    (function () {
      for (var p = -128; p < 128; p++) {
        var vic = VALSEE[p + 128];      /* dương = quân đỏ, âm = quân đen */
        var v = vic < 0 ? -vic : vic;  /* giá trị quân bị ăn, luôn dương   */
        CAP_SCORE[p + 128] = (v === 0) ? 10000 : v;
      }
    })();

    /* Giá trị quân đứng tại ô `sq` (luôn dương, dùng cho MVV-LVA).       */
    function pieceVal(sq) {
      var v = VALSEE[board[sq] + 128];
      return v < 0 ? -v : v;
    }

    /* Sắp nước đi trong `buf` (đếm `cnt` phần tử, theo cặp) tại chỗ.
       Không cấp phát mảng mới: dùng sIdx/ordIdx/tmpBuf dùng chung.    */
    function scoreMoves(buf, cnt, ttMove) {
      var n = cnt >> 1;
      for (var i = 0; i < n; i++) {
        var f = buf[i * 2], t = buf[i * 2 + 1];
        var sc;
        if (ttMove >= 0 && ttMove === f * 90 + t) {
          sc = 2000000;
        } else {
          var victim = board[t];
          if (victim) {
            sc = 1000000 + CAP_SCORE[victim + 128] * 16 - pieceVal(f);
          } else {
            sc = hist[f * 90 + t];
            if (killers[ply * 2] === f * 90 + t) sc += 80000;
            if (killers[ply * 2 + 1] === f * 90 + t) sc += 70000;
          }
        }
        sIdx[i] = sc;
        ordIdx[i] = i;
      }
      /* Chọn lọc O(n^2) thay cho Array.sort: khối này chạy ở mọi node
         nên callback của sort và phân bổ mảng là chi phí đáng kể.      */
      for (var a = 0; a < n - 1; a++) {
        var bi = a, bs = sIdx[a];
        for (var b = a + 1; b < n; b++) {
          if (sIdx[b] > bs) { bs = sIdx[b]; bi = b; }
        }
        if (bi !== a) {
          var ts = sIdx[a]; sIdx[a] = sIdx[bi]; sIdx[bi] = ts;
          var tm = ordIdx[a]; ordIdx[a] = ordIdx[bi]; ordIdx[bi] = tm;
        }
      }
      /* Ghi lại theo thứ tự đã xếp (cần bản sao vì hoán đổi tại chỗ
         sẽ phá vỡ các chỉ số ordIdx chưa dùng).                       */
      for (var c = 0; c < cnt; c++) tmpBuf[c] = buf[c];
      for (var d = 0; d < n; d++) {
        var si = ordIdx[d] * 2;
        buf[d * 2] = tmpBuf[si];
        buf[d * 2 + 1] = tmpBuf[si + 1];
      }
      /* Trả về SỐ PHẦN TỬ, không trả về `buf`. */
      return cnt;
    }

    /* Quiescence search: xét nước ăn, hoặc mọi nước thoát chiếu nếu đang bị chiếu. */
    function quiesce(alpha, beta, plyQ) {
      nodes++;
      if ((nodes & 1023) === 0 && Date.now() > deadline) { aborted = true; return 0; }

      var checked = inCheck(turn);
      var stand = null;
      if (!checked) {
        stand = evaluate() * turn;
        if (stand >= beta) return beta;
        if (stand > alpha) alpha = stand;
      }
      if (plyQ > 12) return alpha;   /* chặn bố cục tìm vô hạn */

      /* Khi đang bị chiếu phải xét MỌI nước đi để thoát; nếu không
         chiếu thì chỉ xét nước ăn, theo MVV-LVA. Mỗi tầng đệ quy của
         quiesce dùng vùng đệm riêng (theo plyQ) để không đè lên nhau.*/
      var base = (plyQ < 15 ? plyQ : 15) * 180;
      var caps = qBuf.subarray(base, base + 180);
      var n = genMoves(turn, caps, checked ? false : true);

      if (!checked) {
        /* Lọc theo delta pruning: một nước ăn không thể nâng alpha nếu
           lãi ròng của nó cộng điểm đứng yên vẫn nhỏ hơn alpha.          */
        var keep = 0;
        for (var i = 0; i < n; i += 2) {
          var f = caps[i], t = caps[i + 1];
          if (CAP_SCORE[board[t] + 128] + stand < alpha) continue;
          caps[keep] = f; caps[keep + 1] = t;
          keep += 2;
        }
        n = keep;
        /* Sắp theo MVV-LVA bằng chọn lọc (danh sách rất ngắn).        */
        for (var a = 0; a < n - 2; a += 2) {
          var bestS = CAP_SCORE[board[caps[a + 1]] + 128], bi = a;
          for (var b = a + 2; b < n; b += 2) {
            var bs2 = CAP_SCORE[board[caps[b + 1]] + 128];
            if (bs2 > bestS) { bestS = bs2; bi = b; }
          }
          if (bi !== a) {
            var tf = caps[a]; caps[a] = caps[bi]; caps[bi] = tf;
            var tt2 = caps[a + 1]; caps[a + 1] = caps[bi + 1]; caps[bi + 1] = tt2;
          }
        }
      }

      for (var m = 0; m < n; m += 2) {
        var qf = caps[m], qt = caps[m + 1];
        var cap = doMove(qf, qt);
        if (kingsFacing() || inCheck(turn)) { undoMove(qf, qt, cap); continue; }
        var s2 = -quiesce(-beta, -alpha, plyQ + 1);
        undoMove(qf, qt, cap);
        if (aborted) return alpha;
        if (s2 >= beta) return beta;
        if (s2 > alpha) alpha = s2;
      }
      return alpha;
    }

    /* Chuẩn hóa điểm chiếu hết theo ply để TT dùng được ở độ sâu khác. */
    function ttStore(v, ply) {
      if (v > MATE_TH) return v + ply;    /* chiếu mã: gần hơn càng tốt */
      if (v < -MATE_TH) return v - ply;
      return v;
    }
    function ttProbe(v, ply) {
      if (v > MATE_TH) return v - ply;
      if (v < -MATE_TH) return v + ply;
      return v;
    }

    function negamax(depth, alpha, beta, ext) {
      ply++;
      nodes++;
      /* Giới hạn độ sâu đệ quy để không vượt call stack hoặc buffer theo ply. */
      if (ply >= MAXPLY - 1) { ply--; return evaluate() * turn; }
      if ((nodes & 1023) === 0 && Date.now() > deadline) { aborted = true; ply--; return 0; }

      var checked = inCheck(turn);

      /* Mở rộng tối đa hai tầng liên tiếp khi bên đi đang bị chiếu. */
      var childExt = (checked && ext < 2 && depth < 40) ? ext + 1 : 0;

      var key = hashPos();
      var slot = key & TT_MASK;
      var ttMove = -1;
      var alphaOrig = alpha;
      var plyOff = (ply < MAXPLY ? ply : MAXPLY - 1) * 180;
      statTTProbe++;
      if (ttKey[slot] === key) {
        ttMove = ttMv[slot];
        if (ttDepth[slot] >= depth && childExt === 0) {
          var v = ttProbe(ttScore[slot], ply), flag = ttFlag[slot];
          statTTHit++;
          if (flag === BOUND_EXACT) {
            if (v > alpha) alpha = v;
          } else if (flag === BOUND_LOWER) {
            if (v > alpha) alpha = v;
          } else {
            if (v < beta) beta = v;
          }
          if (alpha >= beta) { ttCutoffs++; ply--; return v; }
        }
      }

      /* Luật 困BIS: bên hết nước hợp lệ thua, nên kiểm tra trước quiescence. */
      if (depth <= 0 && !checked) {
        var q = quiesce(alpha, beta, 0);
        ply--;
        return q;
      }

      /* Mở rộng khi đang chiếu, nhưng chỉ tối đa vài lần liên tiếp */
      if (childExt > 0) depth++;
      else if (depth <= 0) { depth = 1; }

      var cnt = fillLegal(turn, plyBuf.subarray(plyOff, plyOff + 180));
      if (cnt === 0) {
        /* Bên hết nước hợp lệ thua theo luật 困BIS, dù có bị chiếu hay không. */
      var val = -MATE + ply;
        ttKey[slot] = key;
        ttScore[slot] = ttStore(val, ply);
        ttDepth[slot] = depth;
        ttFlag[slot] = BOUND_EXACT;
        ttMv[slot] = -1;
        ply--;
        return val;
      }
      /* `n` = số phần tử thật trong vùng đệm của tầng này (scoreMoves trả
         về cnt). Vòng lặp chỉ duyệt tới n, không duyệt hết 180 phần tử. */
      var list = plyBuf.subarray(plyOff, plyOff + 180);
      var nCnt = scoreMoves(list, cnt, ttMove);

      var best = -Infinity, bestMoveIdx = -1;
      for (var i = 0; i < nCnt; i += 2) {
        var f = list[i], t = list[i + 1];
        var cap = doMove(f, t);
        var sc;
if (i === 0) {
          sc = -negamax(depth - 1, -beta, -alpha, childExt);
        } else {
          /* PVS: gọi trước bằng null window rồi thăm lại nếu cần */
          sc = -negamax(depth - 1, -alpha - 1, -alpha, childExt);
          if (sc > alpha && sc < beta) sc = -negamax(depth - 1, -beta, -alpha, childExt);
        }
        undoMove(f, t, cap);
        if (aborted) { ply--; return best === -Infinity ? 0 : best; }

        if (sc > best) {
          best = sc;
          bestMoveIdx = f * 90 + t;
          if (sc > alpha) {
            alpha = sc;
            if (sc >= beta) {
              if (!cap) {
                if (killers[ply * 2] !== bestMoveIdx) {
                  killers[ply * 2 + 1] = killers[ply * 2];
                  killers[ply * 2] = bestMoveIdx;
                }
                hist[f * 90 + t] += depth * depth;
              }
              break;
            }
          }
        }
      }

      /* Lưu điểm cùng loại bound để TT diễn giải đúng khi tra cứu. */
      var flag2 = best >= beta ? BOUND_LOWER
               : (best > alphaOrig ? BOUND_EXACT : BOUND_UPPER);
      var store = ttStore(best, ply);
      ttKey[slot] = key;
      ttScore[slot] = store;
      ttDepth[slot] = depth;
      ttFlag[slot] = flag2;
      ttMv[slot] = bestMoveIdx;
      ply--;
      return best;
    }

    /* Tìm nước tốt nhất. maxDepth/score theo điểm của phía `s`.
       Nhận cả hai dạng: bestMove(s, {depth, ms}) hoặc bestMove(s, depth, ms)
       opts.noise = x (0..1): cố tình chọn nước tệ hơn nước tốt nhất với
       xác suất x — dùng để hạ cấp cho mức chơi thấp.                    */
    function bestMove(s, opts, msArg) {
      if (typeof opts === "number") opts = { depth: opts, ms: msArg || 2000 };
      opts = opts || {};
      var maxDepth = opts.depth || 4;
      var maxMs = opts.ms || 2000;
      var noise = opts.noise || 0;
      turn = s;
      nodes = 0;
      aborted = false;
      statTTProbe = 0; statTTHit = 0; ttCutoffs = 0;
      startedAt = Date.now();
      deadline = startedAt + maxMs;
      ply = 0;
      hist.fill(0);
      killers.fill(-1);

      var root = legalMoves(s);
      if (!root.length) return null;

      /* Xếp nước gốc theo MVV-LVA */
      var scored = [];
      for (var i = 0; i < root.length; i += 2) {
        var f = root[i], t = root[i + 1];
        var s2 = board[t] ? CAP_SCORE[board[t] + 128] * 16 - pieceVal(f) : 0;
        scored.push({ f: f, t: t, s: s2, sc: -Infinity });
      }
      scored.sort(function (a, b) { return b.s - a.s; });

      var bestIdx = 0, bestScore = -Infinity, reached = 0;
      var lastIterMs = 0;

      for (var d = 1; d <= maxDepth; d++) {
        /* ---- Chặn bắt đầu vòng sâu mới khi không còn đủ thời gian ----
           Vòng depth d+1 tốn khoảng 2-4 lần vòng depth d. Nếu còn thời
           gian không đủ vòng sau, engine sẽ chạy nửa vòng rồi bị cắt, tốn
           hết thời gian mà vẫn không đưa ra nước đi mới — đó chính là
           lý do bot "đứng" 3+ giây rồi mới đi. Ở đây ta dừng sớm và
           trả ngay nước tốt nhất của vòng đã hoàn thành.                */
        if (d > 1 && lastIterMs > 0) {
          var left = deadline - Date.now();
          if (left < lastIterMs * 2.0) break;
        }

        var iterStart = Date.now();
        var alpha = -MATE - 1, iterBest = -Infinity, iterIdx = 0, got = true;
        for (var j = 0; j < scored.length; j++) {
          var mv = scored[j];
          var capd = doMove(mv.f, mv.t);
          var sc;
          if (j === 0) {
            sc = -negamax(d - 1, -MATE - 1, -alpha, 0);
          } else {
            sc = -negamax(d - 1, -alpha - 1, -alpha, 0);
            if (sc > alpha && sc < MATE) sc = -negamax(d - 1, -MATE - 1, -alpha, 0);
          }
          undoMove(mv.f, mv.t, capd);
          if (aborted) { got = false; break; }
          mv.sc = sc;                    /* nhớ điểm thật của nước này */
          if (sc > iterBest) { iterBest = sc; iterIdx = j; }
          if (sc > alpha) alpha = sc;
        }
        lastIterMs = Date.now() - iterStart;
        if (!got && d > 1) break;
        if (got && iterBest > -Infinity) {
          bestScore = iterBest;
          reached = d;
          /* Đặt nước tốt nhất lên đầu để dùng làm thứ tự vòng kế tiếp. */
          var tmp = scored[iterIdx];
          scored.splice(iterIdx, 1);
          scored.unshift(tmp);
          bestIdx = 0;
        }
        /* Đã tìm ra nước bắt mã chắc chắn thì không cần đào sâu thêm. */
        if (bestScore > MATE_TH || Date.now() >= deadline) break;
      }

      /* Xếp nước theo điểm tìm kiếm để noise chọn nước yếu có kiểm soát. */
      var ranked = scored.slice().sort(function (a, b) { return b.sc - a.sc; });
      var chosen = scored.indexOf(ranked[0]) >= 0 ? scored.indexOf(ranked[0]) : 0;

      /* Không áp dụng noise khi đã tìm thấy nước bắt mã chắc chắn. */
      if (bestScore <= MATE_TH && scored.length > 1 && reached > 0) {
        if (noise > 0) {
          var pool = Math.min(ranked.length, 1 + Math.round(noise * 7));
          chosen = scored.indexOf(ranked[Math.floor(Math.random() * pool)]);
        }
      }

      var pick = scored[chosen];
      return {
        from: pick.f,
        to: pick.t,
        score: pick.sc > -Infinity ? pick.sc : bestScore,
        depth: reached,
        nodes: nodes,
        nps: nodes / Math.max(1, (Date.now() - startedAt)) * 1000,
        ms: Date.now() - startedAt,
        ttProbes: statTTProbe,
        ttHits: statTTHit,
        ttCutoffs: ttCutoffs
      };
    }

    /* Bản in thế cờ để đối chiếu mắt thường. */
    var PRINT = {
      k: "帥", K: "將", a: "仕", A: "士", b: "相", B: "象",
      n: "馬", N: "馬", r: "俥", R: "車", c: "炮", C: "砲", p: "兵", P: "卒"
    };
    function prettyBoard() {
      var out = [];
      for (var r = 0; r < 10; r++) {
        var line = "";
        for (var c = 0; c < 9; c++) {
          var p = board[r * 9 + c];
          if (!p) { line += "."; continue; }
          var s = String.fromCharCode(p < 0 ? -p : p);
          line += PRINT[p > 0 ? s.toLowerCase() : s.toUpperCase()] || "?";
        }
        out.push(line);
      }
      return out;
    }

    return {
      load: load,
      getBoard: function () { return board; },
      getTurn: getTurn,
      setTurn: setTurn,
      fen: fenOf,
      prettyBoard: prettyBoard,
      doMove: doMove,
      undoMove: undoMove,
      genMoves: genMoves,
      legalMoves: legalMoves,
      inCheck: inCheck,
      result: result,
      evaluate: evaluate,
      bestMove: bestMove,
      findKing: findKing,
      kings: kings,
      hash: hashPos,
      hashFull: hashFull,
      newGame: function () { load(START.join("/")); ttClear(); hist.fill(0); }
    };
  }

  var api = {
    createEngine: createEngine,
    START: START,
    MATE: MATE
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Xiangqi = api;
})(typeof self !== "undefined" ? self : this);
