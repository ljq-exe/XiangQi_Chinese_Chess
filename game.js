const FEN = [
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

const GLYPH = {
  k:"帥", K:"將",
  a:"仕", A:"士",
  b:"相", B:"象",
  n:"馬", N:"馬",
  r:"俥", R:"車",
  c:"炮", C:"砲",
  p:"兵", P:"卒"
};
const COPY = {
  vi: {
    title: "CỜ TƯỚNG",
    subtitle: "XIANGQI · CHƠI VỚI MÁY",
    redStarts: "Đỏ đi trước",
    undo: "↶ Đi lại",
    flip: "⇅ Lật bàn",
    hint: "💡 Gợi ý",
    newGame: "Ván mới",
    playerRed: "Bạn: Đỏ",
    playerBlack: "Bạn: Đen",
    moveHistory: "LỊCH SỬ NƯỚC ĐI",
    quickHelp: "Chọn quân để xem nước đi hợp lệ. Mở Wiki để đọc luật và cách di chuyển.",
    botStart: "🤖 Đấu với máy",
    botActive: "🤖 Đang đấu với máy",
    sideTitle: "Bạn đóng vai quân nào",
    levelTitle: "Độ khó của máy (15 mức)",
    turnThinking: "Máy ({side}) đang nghĩ…",
    turnBot: "Đến lượt máy ({side})",
    turnPlayer: "Bạn ({side}) đang đi",
    turnRed: "Đỏ đi trước",
    turnBlack: "Đen đang đi",
    check: "— Đang bị chiếu!",
    redWins: "★ ĐỎ THẮNG ★",
    blackWins: "★ ĐEN THẮNG ★",
    playerWins: "★ Người chơi thắng ★",
    levelIncreased: "★ Người chơi thắng ★ Mức máy tăng lên {level}.",
    levelMax: "★ Người chơi thắng ★ Máy đã ở mức tối đa.",
    levelUnchanged: "★ Người chơi thắng ★ Máy giữ nguyên mức hiện tại.",
    languageButton: "English",
    languageLabel: "Switch language to English",
    wikiButton: "📖 Wiki · Luật chơi",
    wikiTitle: "Luật và cách đi quân",
    wikiClose: "Đóng wiki",
    quickRulesTitle: "Luật cơ bản",
    quickRules: "Mỗi lượt đi một quân. Tướng không được để đối phương chiếu; bên không còn nước hợp lệ sẽ thua.",
    boostTitle: "Tăng độ khó?",
    boostText: "Người chơi đã thắng. Bạn có muốn tăng độ khó của máy lên 1 mức không?",
    boostYes: "Có, tăng lên",
    no: "Không",
    wiki: [
      ["Mục tiêu và lượt chơi", "Hai bên lần lượt đi một quân. Mục tiêu là chiếu bí Tướng đối phương. Trong game này, bên tới lượt không còn nước đi hợp lệ sẽ thua, dù đang bị chiếu hay không. Không được đi nước khiến Tướng của mình bị chiếu hoặc để hai Tướng đối mặt trên cùng một cột không có quân chắn."],
      ["Tướng 將 / 帥", "Đi một giao điểm theo chiều ngang hoặc dọc. Tướng phải ở trong cung 3×3 của mình và không được đi vào ô bị quân đối phương khống chế."],
      ["Sĩ 士 / 仕", "Đi đúng một giao điểm theo đường chéo và luôn ở trong cung 3×3."],
      ["Tượng 象 / 相", "Đi chéo đúng hai giao điểm. Nếu giao điểm ở giữa (mắt Tượng) bị chiếm thì không đi được; Tượng không được qua sông."],
      ["Mã 馬", "Đi theo hình chữ L: một bước ngang/dọc rồi một bước chéo ra ngoài. Nếu ô sát cạnh theo hướng đi đầu tiên (chân Mã) bị chiếm thì nước đó bị chặn."],
      ["Xe 車 / 俥", "Đi ngang hoặc dọc qua các ô trống bất kỳ khoảng cách nào. Không thể nhảy qua quân; có thể ăn quân đối phương đầu tiên trên đường."],
      ["Pháo 炮 / 砲", "Đi ngang hoặc dọc như Xe khi đi vào ô trống. Để ăn quân, Pháo phải nhảy qua đúng một quân làm ngòi rồi ăn quân đối phương đầu tiên phía sau ngòi; không được ăn quân cùng phe."],
      ["Tốt 兵 / 卒", "Mỗi lượt đi một giao điểm thẳng về phía trước. Sau khi qua sông, Tốt được đi ngang một giao điểm; không bao giờ đi lùi."],
      ["Sông và cung", "Sông nằm giữa hai nửa bàn cờ: Tượng không qua sông; Tốt được đi ngang sau khi qua sông. Cung là vùng 3×3 ở mỗi đầu bàn, giới hạn đường đi của Tướng và Sĩ."],
      ["Cách dùng bàn cờ", "Chọn quân để xem các nước hợp lệ. Chấm trên ô trống là điểm đến; viền đỏ đánh dấu quân đối phương có thể ăn. Nút Đi lại hoàn tác nước đi; trong chế độ đấu máy, nó hoàn tác tối đa một lượt của mỗi bên."]
    ]
  },
  en: {
    title: "XIANGQI",
    subtitle: "CHINESE CHESS · PLAY WITH A BOT",
    redStarts: "Red moves first",
    undo: "↶ Undo",
    flip: "⇅ Flip board",
    hint: "💡 Hint",
    newGame: "New game",
    playerRed: "You: Red",
    playerBlack: "You: Black",
    moveHistory: "MOVE HISTORY",
    quickHelp: "Select a piece to see its legal moves. Open the Wiki for the rules and piece movement.",
    botStart: "🤖 Play with bot",
    botActive: "🤖 Playing with bot",
    sideTitle: "Choose your side",
    levelTitle: "Bot difficulty (15 levels)",
    turnThinking: "Bot ({side}) is thinking…",
    turnBot: "Bot's turn ({side})",
    turnPlayer: "Your turn ({side})",
    turnRed: "Red to move",
    turnBlack: "Black to move",
    check: "— Check!",
    redWins: "★ RED WINS ★",
    blackWins: "★ BLACK WINS ★",
    playerWins: "★ Player wins ★",
    levelIncreased: "★ Player wins ★ Bot level increased to {level}.",
    levelMax: "★ Player wins ★ The bot is already at maximum level.",
    levelUnchanged: "★ Player wins ★ Bot level unchanged.",
    languageButton: "Tiếng Việt",
    languageLabel: "Chuyển ngôn ngữ sang Tiếng Việt",
    wikiButton: "📖 Wiki · Rules",
    wikiTitle: "Rules and piece movement",
    wikiClose: "Close Wiki",
    quickRulesTitle: "Basic rules",
    quickRules: "Players alternate moving one piece. Keep your General safe; a player with no legal moves loses.",
    boostTitle: "Increase difficulty?",
    boostText: "You won! Would you like to increase the bot's difficulty by one level?",
    boostYes: "Yes, increase",
    no: "No",
    wiki: [
      ["Objective and turns", "Players take turns moving one piece. The goal is to checkmate the opposing General. In this game, a player with no legal moves loses, whether or not they are in check. You may not make a move that leaves your General in check or exposes both Generals to each other on an unobstructed file."],
      ["General 將 / 帥", "Moves one point orthogonally. It must stay inside its 3×3 palace and may not move to a square controlled by an enemy piece."],
      ["Advisor 士 / 仕", "Moves exactly one point diagonally and must remain inside its 3×3 palace."],
      ["Elephant 象 / 相", "Moves exactly two points diagonally. The midpoint (the elephant's eye) must be empty; elephants cannot cross the river."],
      ["Horse 馬", "Moves in an L shape: one point orthogonally, then one point diagonally outward. If the adjacent orthogonal point (the horse's leg) is occupied, that move is blocked."],
      ["Chariot 車 / 俥", "Moves any distance horizontally or vertically through empty points. It cannot jump over pieces and may capture the first enemy piece on its path."],
      ["Cannon 炮 / 砲", "Moves like a Chariot when moving to an empty point. To capture, it must jump over exactly one screen piece and take the first enemy piece beyond it; it cannot capture a friendly piece."],
      ["Soldier 兵 / 卒", "Moves one point straight forward. After crossing the river, it may also move one point sideways. It can never move backward."],
      ["River and palaces", "The river divides the two sides: Elephants cannot cross it, while Soldiers gain sideways movement after crossing. Each palace is the 3×3 area at a board end and restricts the General and Advisors."],
      ["Using the board", "Select a piece to show legal moves. Dots mark empty destinations; a red outline marks an enemy piece that can be captured. Undo reverses the latest move; against the bot it takes back up to one move by each side."]
    ]
  }
};
const LEVEL_LABELS_EN = [
  "Very easy", "Very easy", "Easy", "Easy", "Easy",
  "Medium", "Medium", "Fairly strong", "Fairly strong", "Strong",
  "Very strong", "Expert", "Master", "Master", "Maximum"
];

const board = document.getElementById("board");
const piecesEl = document.getElementById("pieces");
const turnText = document.getElementById("turnText");
const turnDot = document.getElementById("turnDot");
const warnEl = document.getElementById("warn");
const moveListEl = document.getElementById("moveList");
const levelBoostModalEl = document.getElementById("levelBoostModal");
const btnBoostLevelYesEl = document.getElementById("btnBoostLevelYes");
const btnBoostLevelNoEl = document.getElementById("btnBoostLevelNo");
const btnLanguageEl = document.getElementById("btnLanguage");
const btnWikiEl = document.getElementById("btnWiki");
const btnWikiCloseEl = document.getElementById("btnWikiClose");
const wikiPanelEl = document.getElementById("wikiPanel");
const wikiTitleEl = document.getElementById("wikiTitle");
const wikiContentEl = document.getElementById("wikiContent");
const selSideEl = document.getElementById("selSide");
const selLevelEl = document.getElementById("selLevel");
const btnBotEl = document.getElementById("btnBot");
let language = "vi";
let wikiOpen = false;

let grid = [], turn = "r", sel = -1, legal = [], history = [], lastMove = null, flip = false;
let moveAudioContext = null;
let welcomeSoundPending = false;
let endSoundPlayed = false;

function initMoveAudio() {
  if (!moveAudioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    moveAudioContext = new AudioContextClass();
  }
  if (moveAudioContext.state === "suspended") {
    moveAudioContext.resume().catch(error => {
      console.warn("Không thể bật âm thanh game:", error);
    }).then(() => {
      if (welcomeSoundPending && moveAudioContext.state === "running") {
        playWelcomeSound();
      }
    });
  }
  return moveAudioContext;
}

function playAudioTone(audio, frequency, start, duration, type, volume) {
  const now = audio.currentTime;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now + start);
  gain.gain.setValueAtTime(0.0001, now + start);
  gain.gain.exponentialRampToValueAtTime(volume, now + start + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(now + start);
  oscillator.stop(now + start + duration);
}

function playMoveSound(capture) {
  const audio = initMoveAudio();
  if (!audio) return;
  flushWelcomeSound();

  if (capture) {
    playAudioTone(audio, 185, 0, 0.11, "triangle", 0.18);
    playAudioTone(audio, 720, 0.018, 0.045, "square", 0.045);
  } else {
    playAudioTone(audio, 520, 0, 0.065, "triangle", 0.12);
    playAudioTone(audio, 145, 0, 0.045, "sine", 0.055);
  }
}

function playCheckSound() {
  const audio = initMoveAudio();
  if (!audio) return;
  flushWelcomeSound();
  playAudioTone(audio, 880, 0, 0.09, "sine", 0.12);
  playAudioTone(audio, 1175, 0.105, 0.14, "triangle", 0.14);
}

function playWelcomeSound() {
  const audio = initMoveAudio();
  if (!audio || audio.state !== "running") {
    welcomeSoundPending = true;
    return;
  }
  welcomeSoundPending = false;
  playAudioTone(audio, 523, 0, 0.16, "sine", 0.12);
  playAudioTone(audio, 659, 0.17, 0.16, "sine", 0.12);
  playAudioTone(audio, 784, 0.34, 0.24, "triangle", 0.14);
}

function flushWelcomeSound() {
  if (welcomeSoundPending && moveAudioContext && moveAudioContext.state === "running") {
    playWelcomeSound();
  }
}

function playGameEndSound(playerWon) {
  const audio = initMoveAudio();
  if (!audio) return;
  flushWelcomeSound();
  if (playerWon) {
    playAudioTone(audio, 523, 0, 0.16, "triangle", 0.14);
    playAudioTone(audio, 659, 0.15, 0.16, "triangle", 0.14);
    playAudioTone(audio, 784, 0.3, 0.2, "sine", 0.16);
    playAudioTone(audio, 1047, 0.5, 0.32, "triangle", 0.17);
  } else {
    playAudioTone(audio, 392, 0, 0.22, "sine", 0.13);
    playAudioTone(audio, 330, 0.22, 0.24, "sine", 0.13);
    playAudioTone(audio, 262, 0.46, 0.38, "triangle", 0.15);
  }
}

function queueWelcomeSound() {
  welcomeSoundPending = true;
  if (moveAudioContext && moveAudioContext.state === "running") playWelcomeSound();
}

function playEndSoundOnce(state) {
  if ((state !== "THẮNG" && state !== "THUA") || endSoundPlayed) return;
  endSoundPlayed = true;
  const winner = state === "THẮNG" ? "r" : "b";
  const playerWon = botOn ? winner !== botSide : winner === "r";
  playGameEndSound(playerWon);
}

function t(key, values = {}) {
  let text = COPY[language][key] || COPY.vi[key] || key;
  for (const [name, value] of Object.entries(values)) {
    text = text.replace("{" + name + "}", value);
  }
  return text;
}

function renderWiki() {
  wikiTitleEl.textContent = t("wikiTitle");
  wikiContentEl.innerHTML = COPY[language].wiki.map(([title, description]) =>
    '<article class="wiki-entry"><h3>' + title + '</h3><p>' + description + '</p></article>'
  ).join("");
}

function applyLanguage() {
  const copy = COPY[language];
  document.documentElement.lang = language;
  document.title = language === "vi" ? "Cờ Tướng — Xiangqi" : "Xiangqi — Chinese Chess";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (copy[key]) el.textContent = copy[key];
  });
  btnLanguageEl.textContent = t("languageButton");
  btnLanguageEl.setAttribute("aria-label", t("languageLabel"));
  btnWikiEl.textContent = t("wikiButton");
  btnWikiEl.setAttribute("aria-expanded", String(wikiOpen));
  btnWikiCloseEl.setAttribute("aria-label", t("wikiClose"));
  selSideEl.title = t("sideTitle");
  selLevelEl.title = t("levelTitle");
  Array.from(selLevelEl.children).forEach((option, i) => {
    const label = language === "en" ? LEVEL_LABELS_EN[i] : BOT_LEVELS[i].label;
    option.textContent = (language === "en" ? "Bot: " : "Máy: ") + (i + 1) + " – " + label;
  });
  renderWiki();
  syncBotUI();
  render();
}

function setWikiOpen(open) {
  wikiOpen = open;
  wikiPanelEl.classList.toggle("open", open);
  wikiPanelEl.setAttribute("aria-hidden", String(!open));
  btnWikiEl.setAttribute("aria-expanded", String(open));
  if (open) wikiTitleEl.focus();
  else btnWikiEl.focus();
}

const isRed = p => p >= "a" && p <= "z";
const enemy = (p, s) => p !== "." && isRed(p) !== s;
const at = (r, c) => (r < 0 || r > 9 || c < 0 || c > 8) ? "." : grid[r * 9 + c];
const idx = (r, c) => r * 9 + c;

function parseFen(fen) {
  return fen.join("").split("");
}

function startPosition() {
  grid = parseFen(FEN);
  turn = "r";
  sel = -1; legal = []; history = []; lastMove = null;
  levelBoosted = false;
  endSoundPlayed = false;
  queueWelcomeSound();
  hideLevelBoostPrompt();
  moveListEl.textContent = "—";
  warnEl.textContent = "";
  render();
}

function countBetween(a, b) {
  const [r1, c1] = [Math.floor(a / 9), a % 9];
  const [r2, c2] = [Math.floor(b / 9), b % 9];
  const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1);
  let r = r1 + dr, c = c1 + dc, n = 0;
  while (r !== r2 || c !== c2) {
    if (grid[idx(r, c)] !== ".") n++;
    r += dr; c += dc;
  }
  return n;
}

/* Luật Pháo: đi qua các ô trống; khi ăn phải có đúng một quân làm ngòi.
   `quiet` chứa ô đi thường, `shots` chứa đích ăn và đường đi qua ngòi. */
function scanCannon(from, red) {
  const r = Math.floor(from / 9), c = from % 9;
  const quiet = [], shots = [];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [dr, dc] of dirs) {
    let nr = r + dr, nc = c + dc;
    const path = [];      /* các ô đã đi qua, dùng để vẽ đường ăn */
    let screen = -1;      /* ô chứa quân làm ngòi, -1 = chưa gặp ngòi nào */
    while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
      const j = idx(nr, nc);
      const t = grid[j];
      if (screen === -1) {
        if (t === ".") {
          quiet.push(j);          /* đi thường tới ô trống */
          path.push(j);
        } else {
          screen = j;              /* quân đầu tiên gặp = quân làm NGÒI */
          path.push(j);
        }
      } else if (t === ".") {
        path.push(j);              /* ô trống sau ngòi: vẫn quét tiếp */
      } else {
        /* quân kế tiếp sau ngòi quyết định nước ăn của Pháo */
        if (isRed(t) !== red) shots.push({ to: j, screen, path: path.slice() });
        break;                     /* dừng ở đây: có ngòi thì chỉ ăn 1 quân */
      }
      nr += dr; nc += dc;
    }
  }
  return { quiet, shots };
}

function pseudoMoves(i) {
  const p = grid[i];
  if (p === ".") return [];
  const r = Math.floor(i / 9), c = i % 9;
  const red = isRed(p);
  const up = red ? -1 : 1;
  const home = red ? 9 : 0;
  const out = [];

  if (p === "k" || p === "K") {
    const lo = red ? 7 : 0, hi = red ? 9 : 2;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < lo || nr > hi || nc < 3 || nc > 5) continue;
      const t = at(nr, nc);
      if (t !== "." && isRed(t) === red) continue;
      out.push(idx(nr, nc));
    }
  }

  if (p === "a" || p === "A") {
    for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nr = r + dr, nc = c + dc;
      const lo = red ? 7 : 0, hi = red ? 9 : 2;
      if (nr < lo || nr > hi || nc < 3 || nc > 5) continue;
      const t = at(nr, nc);
      if (t !== "." && isRed(t) === red) continue;
      out.push(idx(nr, nc));
    }
  }

  if (p === "b" || p === "B") {
    for (const [dr, dc] of [[2, 2], [2, -2], [-2, 2], [-2, -2]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr > 9 || nc < 0 || nc > 8) continue;
      if (red && (nr < 5 || r < 5)) continue;
      if (!red && (nr > 4 || r > 4)) continue;
      if (at(r + dr / 2, c + dc / 2) !== ".") continue;
      const t = at(nr, nc);
      if (t !== "." && isRed(t) === red) continue;
      out.push(idx(nr, nc));
    }
  }

  if (p === "n" || p === "N") {
    for (const [dr, dc] of [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr > 9 || nc < 0 || nc > 8) continue;
      const lr = Math.abs(dr) === 2 ? r + dr / 2 : r;
      const lc = Math.abs(dc) === 2 ? c + dc / 2 : c;
      if (at(lr, lc) !== ".") continue;
      const t = at(nr, nc);
      if (t !== "." && isRed(t) === red) continue;
      out.push(idx(nr, nc));
    }
  }

  if (p === "c" || p === "C") {
    const sc = scanCannon(i, red);
    for (const j of sc.quiet) out.push(j);
    for (const s of sc.shots) out.push(s.to);
  }

  if (p === "r" || p === "R") {
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
        const j = idx(nr, nc), t = at(nr, nc);
        if (t === ".") out.push(j);
        else {
          if (isRed(t) !== red) out.push(j);
          break;
        }
        nr += dr; nc += dc;
      }
    }
  }

  if (p === "p" || p === "P") {
    const nr = r + up;
    if (nr >= 0 && nr <= 9) {
      const t = at(nr, c);
      if (t === "." || isRed(t) !== red) out.push(idx(nr, c));
    }
    const crossed = red ? r <= 4 : r >= 5;
    if (crossed) {
      for (const dc of [1, -1]) {
        const nc = c + dc;
        if (nc < 0 || nc > 8) continue;
        const t = at(r, nc);
        if (t === "." || isRed(t) !== red) out.push(idx(r, nc));
      }
    }
  }

  return out;
}

function findGeneral(red) {
  const target = red ? "k" : "K";
  for (let i = 0; i < 90; i++) if (grid[i] === target) return i;
  return -1;
}

function inCheck(red) {
  const g = findGeneral(red);
  if (g === -1) return true;
  for (let i = 0; i < 90; i++) {
    const p = grid[i];
    if (p === "." || isRed(p) === red) continue;
    if (pseudoMoves(i).includes(g)) return true;
  }
  return false;
}

function legalMovesFrom(i) {
  const saved = grid.slice();
  const res = [];
  for (const j of pseudoMoves(i)) {
    grid[j] = grid[i];
    grid[i] = ".";
    if (!generalsFace() && !inCheck(isRed(saved[i]))) res.push(j);
    grid = saved.slice();
  }
  return res;
}

function generalsFace() {
  const a = findGeneral(true), b = findGeneral(false);
  if (a === -1 || b === -1) return false;
  if (a % 9 !== b % 9) return false;
  return countBetween(a, b) === 0;
}

function anyLegal(side) {
  for (let i = 0; i < 90; i++) {
    const p = grid[i];
    if (p === "." || isRed(p) !== side) continue;
    if (legalMovesFrom(i).length) return true;
  }
  return false;
}

let stateCache = null, stateCacheVal = "";

function gameState() {
  const key = grid.join("") + turn;
  if (stateCache === key) return stateCacheVal;
  const side = turn === "r";
  const check = inCheck(side);
  const val = !anyLegal(side) ? (side ? "THUA" : "THẮNG") : (check ? "Cờ" : "");
  stateCache = key;
  stateCacheVal = val;
  return val;
}

function applyMove(from, to) {
  stateCache = null;
  const p = grid[from];
  const captured = grid[to];
  grid[to] = p;
  grid[from] = ".";
  history.push({ from, to, piece: p, captured: captured === "." ? null : captured });
  lastMove = { from, to };
  turn = turn === "r" ? "b" : "r";
  if (gameState() === "Cờ") playCheckSound();
}

function restoreHistoryMove(m) {
  grid[m.from] = m.piece;
  grid[m.to] = m.captured || ".";
  turn = turn === "r" ? "b" : "r";
}

/* Các dấu móc cố định tại giao điểm xuất phát của Pháo và Tốt. */
const MARK_POINTS = [
  [2, 1], [2, 7], [7, 1], [7, 7],                          // Pháo
  [3, 0], [3, 2], [3, 4], [3, 6], [3, 8],                  // Tốt đen
  [6, 0], [6, 2], [6, 4], [6, 6], [6, 8]                   // Tốt đỏ
];

function renderMarks() {
  const g = document.getElementById("marks");
  if (!g) return;
  /* Đầu móc vươn ra ngoài mép quân để dấu vẫn nhìn thấy khi có quân đứng trên giao điểm. */
  const v = 0.1, t = 0.34;
  let d = "";
  for (const pt of MARK_POINTS) {
    const x = pt[1] + 0.5, y = pt[0] + 0.5;
    d += "M" + (x - v - t) + " " + (y - v) + "H" + (x - v) +
         "M" + (x - v) + " " + (y - v - t) + "V" + (y - v);
    d += "M" + (x + v) + " " + (y - v) + "H" + (x + v + t) +
         "M" + (x + v) + " " + (y - v - t) + "V" + (y - v);
    d += "M" + (x - v - t) + " " + (y + v) + "H" + (x - v) +
         "M" + (x - v) + " " + (y + v) + "V" + (y + v + t);
    d += "M" + (x + v) + " " + (y + v) + "H" + (x + v + t) +
         "M" + (x + v) + " " + (y + v + t) + "V" + (y + v);
  }
  g.innerHTML = '<path class="mk-corner" d="' + d + '"/>';
}

/* Đường ăn của Pháo khi đang được chọn.
   Dùng CHUNG scanCannon với phần sinh nước đi, và chỉ vẽ cho những nước ăn
   thật sự hợp lệ (đã qua bộ lọc chiếu/đối mặt tướng), nên hình ảnh luôn khớp
   với nước đi mà người chơi bấm được. */
function shotPathOf() {
  const set = new Set();
  if (sel === -1) return set;
  const p = grid[sel];
  if (p !== "c" && p !== "C") return set;
  for (const s of scanCannon(sel, isRed(p)).shots) {
    if (!legal.includes(s.to)) continue;
    for (const j of s.path) if (j !== sel) set.add(j);
  }
  return set;
}

function hideLevelBoostPrompt() {
  if (!levelBoostModalEl) return;
  levelBoostModalEl.classList.remove("visible");
  levelBoostModalEl.setAttribute("aria-hidden", "true");
}

function showLevelBoostPrompt() {
  if (!levelBoostModalEl || botLevel >= BOT_LEVELS.length - 1) {
    warnEl.textContent = t("levelMax");
    return;
  }
  levelBoostModalEl.classList.add("visible");
  levelBoostModalEl.setAttribute("aria-hidden", "false");
  if (btnBoostLevelYesEl) btnBoostLevelYesEl.focus();
}

function acceptLevelBoost() {
  if (botLevel < BOT_LEVELS.length - 1) {
    botLevel += 1;
    selLevelEl.value = String(botLevel);
    hideLevelBoostPrompt();
    startPosition();
    warnEl.textContent = t("levelIncreased", { level: botLevel + 1 });
    return;
  }
  hideLevelBoostPrompt();
  warnEl.textContent = t("levelMax");
}

function render() {
  piecesEl.innerHTML = "";
  const shotPath = shotPathOf();
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const i = idx(r, c);
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.dataset.i = i;
      const rr = flip ? 9 - r : r;
      const cc = flip ? 8 - c : c;
      slot.style.gridRow = rr + 1;
      slot.style.gridColumn = cc + 1;
      const p = grid[i];
      /* Dấu vị trí quân vừa rời đi: ô này giờ trống nên phải vẽ riêng,
         nếu không sẽ không thấy được quân vừa đi từ đâu sang đâu. */
      if (lastMove && i === lastMove.from && !legal.includes(i)) slot.classList.add("frommark");
      /* Đường ăn của Pháo: các ô trên đường, gồm cả ô quân làm ngòi. */
      if (shotPath.has(i)) slot.classList.add("shot");
      if (p !== ".") {
        const d = document.createElement("div");
        d.className = "piece " + (isRed(p) ? "red" : "blk");
        d.textContent = GLYPH[p];
        if (i === sel) d.classList.add("sel");
        if (lastMove && i === lastMove.to) d.classList.add("last");
        slot.appendChild(d);
        /* Nước ăn hợp lệ được đánh dấu viền đỏ trên quân địch. */
        if (legal.includes(i) && isRed(p) !== (turn === "r")) slot.classList.add("capture");
      } else if (legal.includes(i)) {
        slot.classList.add("legal");
      }
      slot.onclick = () => onSlot(i);
      piecesEl.appendChild(slot);
    }
  }
  const red = turn === "r";
  turnDot.className = "dot " + (red ? "red" : "blk");
  if (botOn) {
    const ten = language === "vi" ? (red ? "Đỏ" : "Đen") : (red ? "Red" : "Black");
    if (botBusy) turnText.textContent = t("turnThinking", { side: ten });
    else if (turn === botSide) turnText.textContent = t("turnBot", { side: ten });
    else turnText.textContent = t("turnPlayer", { side: ten });
  } else {
    turnText.textContent = red ? t("turnRed") : t("turnBlack");
  }
  const st = gameState();
  playEndSoundOnce(st);
  if (botOn && !botBusy && gameOverNow() && !levelBoosted && (botSide === "b" ? st === "THẮNG" : st === "THUA")) {
    levelBoosted = true;
    if (botLevel < BOT_LEVELS.length - 1) {
      showLevelBoostPrompt();
    } else {
      warnEl.textContent = t("levelMax");
    }
    return;
  }
  if (st === "Cờ") warnEl.textContent = t("check");
  else if (st === "THẮNG") warnEl.textContent = t("redWins");
  else if (st === "THUA") warnEl.textContent = t("blackWins");
  else warnEl.textContent = "";
}

function getSlotCenter(idx) {
  const r = Math.floor(idx / 9), c = idx % 9;
  const slot = piecesEl.querySelector(`[data-i="${idx}"]`);
  if (!slot) return { x: 0, y: 0 };
  const rect = slot.getBoundingClientRect();
  const boardRect = piecesEl.getBoundingClientRect();
  return { x: rect.left - boardRect.left + rect.width / 2, y: rect.top - boardRect.top + rect.height / 2 };
}

function animateMove(from, to, callback, options = {}) {
  const { reverse = false, capturedPiece = null } = options;
  const slotFrom = piecesEl.querySelector(`[data-i="${from}"]`);
  if (!slotFrom) { callback(); return; }
  const pieceEl = slotFrom.querySelector(".piece");
  if (!pieceEl) { callback(); return; }

  const fromCenter = getSlotCenter(from);
  const toCenter = getSlotCenter(to);
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;

  const pieceRect = pieceEl.getBoundingClientRect();
  const w = pieceRect.width;
  const h = pieceRect.height;

  const clone = pieceEl.cloneNode(true);
  clone.style.position = "absolute";
  clone.style.width = w + "px";
  clone.style.height = h + "px";
  clone.style.margin = "0";
  clone.style.left = fromCenter.x - w / 2 + "px";
  clone.style.top = fromCenter.y - h / 2 + "px";
  clone.style.transform = "translate(0, 0)";
  clone.style.zIndex = "100";
  clone.style.pointerEvents = "none";
  clone.style.transition = "transform .25s cubic-bezier(.25,.46,.45,.94)";
  clone.style.willChange = "transform";
  if (reverse) clone.style.filter = "drop-shadow(0 0 7px rgba(255, 200, 50, .75))";

  piecesEl.appendChild(clone);
  pieceEl.style.visibility = "hidden";

  if (capturedPiece && reverse) {
    const cap = document.createElement("div");
    cap.className = "piece " + (isRed(capturedPiece) ? "red" : "blk");
    cap.textContent = GLYPH[capturedPiece];
    cap.style.position = "absolute";
    cap.style.width = w + "px";
    cap.style.height = h + "px";
    cap.style.margin = "0";
    cap.style.left = fromCenter.x - w / 2 + "px";
    cap.style.top = fromCenter.y - h / 2 + "px";
    cap.style.opacity = "0";
    cap.style.zIndex = "101";
    cap.style.pointerEvents = "none";
    cap.style.transition = "opacity .18s ease-out, transform .22s ease-out";
    cap.style.transform = "scale(0.8)";
    piecesEl.appendChild(cap);
    requestAnimationFrame(() => {
      cap.style.opacity = "0.95";
      cap.style.transform = "scale(1)";
    });
    setTimeout(() => cap.remove(), 220);
  }

  requestAnimationFrame(() => {
    clone.style.transform = `translate(${dx}px, ${dy}px)`;
  });

  let finished = false;
  const onEnd = (e) => {
    if (finished) return;
    if (e && e.propertyName !== "transform") return;
    finished = true;
    clone.removeEventListener("transitionend", onEnd);
    clone.remove();
    pieceEl.style.visibility = "";
    callback();
  };
  clone.addEventListener("transitionend", onEnd);
  setTimeout(onEnd, 350);
}

function onSlot(i) {
  if (gameState() === "THẮNG" || gameState() === "THUA") return;
  const p = grid[i];
  if (p !== "." && isRed(p) === (turn === "r")) {
    sel = i;
    legal = legalMovesFrom(i);
    render();
    return;
  }
  if (sel === -1) return;
  if (!legal.includes(i)) { sel = -1; legal = []; render(); return; }
  const from = sel;
  const to = i;
  sel = -1; legal = [];
  playMoveSound(grid[to] !== ".");
  animateMove(from, to, () => {
    applyMove(from, to);
    drawHistory();
    render();
    maybeBot();
  });
}

function drawHistory() {
  const rc = i => "abcdefghi"[i % 9] + (10 - Math.floor(i / 9));
  let html = "";
  for (let i = 0; i < history.length; i += 2) {
    const a = history[i], b = history[i + 1];
    const redTxt = b ? `<b>${GLYPH[a.piece]}</b> ${rc(a.from)}→${rc(a.to)} <span style="opacity:.6">·</span> <b>${GLYPH[b.piece]}</b> ${rc(b.from)}→${rc(b.to)}`
                    : `<b>${GLYPH[a.piece]}</b> ${rc(a.from)}→${rc(a.to)}`;
    html += `<div class="mv">${(i / 2 + 1) + ". " + redTxt}</div>`;
  }
  moveListEl.innerHTML = html || "—";
  moveListEl.parentElement.scrollTop = moveListEl.parentElement.scrollHeight;
}

document.getElementById("btnNew").onclick = () => {
  initMoveAudio();
  startPosition();
};
document.getElementById("btnUndo").onclick = () => {
  if (!history.length) return;
  const m = history.pop();
  const from = m.to;
  const to = m.from;
  playMoveSound(false);
  animateMove(from, to, () => {
    stateCache = null;
    restoreHistoryMove(m);
    sel = -1; legal = [];
    lastMove = history.length ? { from: history[history.length - 1].from, to: history[history.length - 1].to } : null;
    drawHistory();
    render();
  }, { reverse: true, capturedPiece: m.captured });
};
document.getElementById("btnFlip").onclick = () => {
  flip = !flip;
  board.classList.toggle("flipped", flip);
  render();
};
document.getElementById("btnHint").onclick = function () {
  this.classList.toggle("on");
  const on = this.classList.contains("on");
  if (on) {
    const side = turn === "r";
    for (let i = 0; i < 90; i++) {
      const p = grid[i];
      if (p === "." || isRed(p) !== side) continue;
      const mv = legalMovesFrom(i);
      if (mv.length) {
        sel = i; legal = mv; render();
        return;
      }
    }
  } else { sel = -1; legal = []; render(); }
};

/* Bot chạy trên luồng chính; giới hạn thời gian mỗi nước để UI không bị treo lâu. */
const BOT_HARD_MS = 2000;

const BOT_LEVELS = [
  { label: "Rất dễ",      depth: 2,  ms: 150,  noise: 0.95 },
  { label: "Rất dễ",      depth: 2,  ms: 200,  noise: 0.80 },
  { label: "Dễ",          depth: 3,  ms: 250,  noise: 0.62 },
  { label: "Dễ",          depth: 3,  ms: 300,  noise: 0.46 },
  { label: "Dễ",          depth: 3,  ms: 350,  noise: 0.34 },
  { label: "Trung bình",  depth: 4,  ms: 450,  noise: 0.22 },
  { label: "Trung bình",  depth: 4,  ms: 600,  noise: 0.15 },
  { label: "Khá",         depth: 4,  ms: 750,  noise: 0.10 },
  { label: "Khá",         depth: 5,  ms: 900,  noise: 0.06 },
  { label: "Giỏi",        depth: 5,  ms: 1100, noise: 0.03 },
  { label: "Rất giỏi",    depth: 5,  ms: 1300, noise: 0.015 },
  { label: "Cao thủ",     depth: 6,  ms: 1500, noise: 0 },
  { label: "Đại thủ",     depth: 6,  ms: 1700, noise: 0 },
  { label: "Đại thủ",     depth: 6,  ms: 1900, noise: 0 },
  { label: "Cực hạn",     depth: 64, ms: 2000, noise: 0 }
];
const DEFAULT_BOT_LEVEL = 0;   /* mở project thì máy bắt đầu ở mức 1 — dễ tiếp cận người chơi */

let botOn = true, botSide = "b", botLevel = DEFAULT_BOT_LEVEL, botBusy = false, botTimer = null;
let engine = null, levelBoosted = false;

/* --- engine.js: quân đen = CHỮ HOA, đỏ = chữ thường, quân đen là số âm --- */
const sideToNum = s => (s === "r" ? 1 : -1);

/* Danh sách 15 mức được sinh ra từ BOT_LEVELS để bảng cấu hình và
   giao diện không lệch nhau. */
(function fillLevels() {
  BOT_LEVELS.forEach((lv, i) => {
    const o = document.createElement("option");
    o.value = String(i);
    o.textContent = (language === "en" ? "Bot: " : "Máy: ") + (i + 1) +
      " – " + (language === "en" ? LEVEL_LABELS_EN[i] : lv.label);
    if (i === DEFAULT_BOT_LEVEL) o.selected = true;
    selLevelEl.appendChild(o);
  });
})();

/* Dựng chuỗi FEN từ grid hiện tại cho engine. */
function gridToFen() {
  const rows = [];
  for (let r = 0; r < 10; r++) {
    let line = "", empty = 0;
    for (let c = 0; c < 9; c++) {
      const p = grid[r * 9 + c];
      if (p === ".") { empty++; continue; }
      if (empty) { line += empty; empty = 0; }
      line += p;
    }
    if (empty) line += empty;
    rows.push(line);
  }
  return rows.join("/");
}

function initEngine() {
  if (engine) return engine;
  if (typeof Xiangqi === "undefined" || !Xiangqi.createEngine) return null;
  engine = Xiangqi.createEngine();
  return engine;
}

/* Hỏi engine một nước đi.
   Engine chạy trên luồng chính: file đã được <script src="engine.js"> nạp sẵn.
   Worker không dùng được khi mở bằng file:// (blob worker bị chặn CORS), nên
   ta chấp nhận treo giao diện trong thời gian ngắn và giới hạn thời gian
   tìm kiếm theo độ khó đã chọn. */
function askEngine(fen, side, lv) {
  return new Promise(res => {
    /* nhường một nhịp để giao diện kịp vẽ trạng thái "máy đang nghĩ" */
    setTimeout(() => {
      const g = initEngine();
      if (!g) return res(null);
      g.load(fen);
      let mv = null;
      try {
        mv = g.bestMove(side, {
          depth: lv.depth,
          ms: Math.min(lv.ms, BOT_HARD_MS),
          noise: lv.noise || 0
        });
      }
      catch (e) { mv = null; }
      res(mv);
    }, 30);
  });
}

let botToken = 0;

function stopBot() {
  botToken += 1;
  if (botTimer) { clearTimeout(botTimer); botTimer = null; }
  botBusy = false;
}

function gameOverNow() {
  const st = gameState();
  return st === "THẮNG" || st === "THUA";
}

function syncBotUI() {
  btnBotEl.classList.toggle("on", botOn);
  btnBotEl.textContent = botOn ? t("botActive") : t("botStart");
  btnBotEl.disabled = botBusy;
  selSideEl.disabled = botOn;
  selLevelEl.disabled = !botOn;
  /* lật bàn cho quân của người chơi nằm ở dưới */
  if (botOn) {
    const wantFlip = botSide === "r";
    if (flip !== wantFlip) { flip = wantFlip; board.classList.toggle("flipped", flip); }
  }
}

function botMove() {
  if (!botOn || botBusy) return;
  if (gameOverNow()) return;
  if (turn !== botSide) return;

  botBusy = true;
  sel = -1; legal = [];
  syncBotUI();
  render();

  const lv = BOT_LEVELS[botLevel] || BOT_LEVELS[DEFAULT_BOT_LEVEL];
  const side = sideToNum(turn);
  const fen = gridToFen();

  const myToken = botToken;
  askEngine(fen, side, lv).then(mv => {
    if (myToken !== botToken || !botOn) {
      botBusy = false;
      botTimer = null;
      syncBotUI();
      return;
    }
    botBusy = false;
    botTimer = null;
    if (gameOverNow()) { render(); return; }
    let from = mv ? mv.from : -1, to = mv ? mv.to : -1;
    const legals = from >= 0 ? legalMovesFrom(from) : [];
    if (!legals.includes(to)) {
      from = -1;
      for (let i = 0; i < 90 && from < 0; i++) {
        if (grid[i] === "." || isRed(grid[i]) !== (side === 1)) continue;
        const mv2 = legalMovesFrom(i);
        if (mv2.length) { from = i; to = mv2[0]; }
      }
    }
    if (from < 0) { syncBotUI(); render(); return; }
    playMoveSound(grid[to] !== ".");
    animateMove(from, to, () => {
      applyMove(from, to);
      drawHistory();
      syncBotUI();
      render();
    });
  });
}

/* sau mỗi nước đi của người chơi, nếu tới lượt máy thì máy đi */
function maybeBot() {
  if (botOn && turn === botSide && !botBusy) {
    botTimer = setTimeout(botMove, 220);
  }
}

/* selSide chính là phe của NGƯỜI CHƠI, nên phe máy là phe còn lại. */
const botSideFromSelect = () => (selSideEl.value === "r" ? "b" : "r");

document.getElementById("btnBot").onclick = () => {
  botOn = !botOn;
  stopBot();
  sel = -1; legal = [];
  if (botOn) {
    botSide = botSideFromSelect();
    syncBotUI();
    render();
    maybeBot();
  } else {
    syncBotUI();
    render();
  }
};
selSideEl.onchange = () => {
  initMoveAudio();
  botSide = botSideFromSelect();
  stopBot();
  startPosition();
  sel = -1; legal = [];
  syncBotUI();
  render();
  maybeBot();
};
selLevelEl.onchange = () => {
  initMoveAudio();
  botLevel = Number(selLevelEl.value);
  if (!Number.isInteger(botLevel) || botLevel < 0 || botLevel >= BOT_LEVELS.length) {
    botLevel = DEFAULT_BOT_LEVEL;
    selLevelEl.value = String(botLevel);
  }
  startPosition();
};

if (btnBoostLevelYesEl) {
  btnBoostLevelYesEl.onclick = () => {
    initMoveAudio();
    acceptLevelBoost();
  };
}
if (btnBoostLevelNoEl) {
  btnBoostLevelNoEl.onclick = () => {
    hideLevelBoostPrompt();
    warnEl.textContent = t("levelUnchanged");
  };
}
btnLanguageEl.onclick = () => {
  language = language === "vi" ? "en" : "vi";
  applyLanguage();
};
btnWikiEl.onclick = () => setWikiOpen(!wikiOpen);
btnWikiCloseEl.onclick = () => setWikiOpen(false);
document.addEventListener("pointerdown", event => {
  initMoveAudio();
  const targetId = event.target && event.target.id;
  if (targetId !== "btnNew" && targetId !== "btnBoostLevelYes" && targetId !== "selSide") {
    flushWelcomeSound();
  }
}, { once: true });

/* chặn thao tác khi đang đến lượt máy, và bàn tới lượt máy sau nước của người */
const _onSlot = onSlot;
onSlot = function (i) {
  if (botOn && (turn === botSide || botBusy)) return;
  _onSlot(i);
  maybeBot();
};

/* ván mới / đi lại trong chế độ đấu máy */
const _startPosition = startPosition;
startPosition = function () {
  stopBot();
  _startPosition();
  sel = -1; legal = [];
  maybeBot();
};
const _undo = document.getElementById("btnUndo").onclick;
document.getElementById("btnUndo").onclick = function () {
  if (!botOn) return _undo();
  stopBot();
  if (!history.length) return;
  const count = history.length >= 2 ? 2 : 1;
  const moves = [];
  for (let i = 0; i < count; i++) moves.push(history.pop());
  const last = moves[0];
  const from = last ? last.to : -1;
  const to = last ? last.from : -1;
  playMoveSound(false);
  animateMove(from, to, () => {
    for (let i = 0; i < moves.length; i++) {
      restoreHistoryMove(moves[i]);
    }
    stateCache = null;
    sel = -1; legal = [];
    lastMove = history.length
      ? { from: history[history.length - 1].from, to: history[history.length - 1].to } : null;
    drawHistory();
    render();
    syncBotUI();
    maybeBot();
  }, { reverse: true, capturedPiece: last && last.captured });
};

startPosition();
applyLanguage();
/* Ký hiệu giao điểm là CỐ ĐỊNH theo toạ độ bàn cờ, nên chỉ vẽ một lần.
   Không gọi lại trong render()/startPosition() để ký hiệu không bao giờ
   dịch chuyển theo vị trí quân. */
renderMarks();
syncBotUI();
