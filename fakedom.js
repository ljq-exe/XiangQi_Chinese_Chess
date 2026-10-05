/* DOM giả cho việc nạp game.js trong Node — dùng chung cho smoke.js và
   crosscheck.js.

   Mọi phần tử trả chính nó cho mọi thuộc tính, nên không cần mô phỏng
   trình duyệt thật; mục tiêu duy nhất là cho game.js nạp được và chạy
   được phần luật + phần render mà không ném lỗi.

   ROOT lấy theo __dirname để copy dự án sang máy khác vẫn chạy.     */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;

/* Dựng một sandbox đầy đủ. Trả về { sandbox, ctx, load, errors, getEl }.
   - `load(file)` nạp một file .js của dự án vào sandbox; lỗi được gom
     vào `errors` thay vì ném ra, để người gọi báo cáo cả hai file.
   - `getEl(id)` trả về phần tử giả tương ứng id (dùng chung cache với
     document.getElementById nên luôn là CÙNG một đối tượng).          */
function createSandbox() {
  const listeners = [];

  function fakeStyle() {
    return new Proxy({}, { get: () => "", set: () => true });
  }

  function fakeClassList() {
    const set = new Set();
    return {
      add: (...a) => a.forEach(x => set.add(x)),
      remove: (...a) => a.forEach(x => set.delete(x)),
      toggle: (c, f) => {
        if (f === undefined) { set.has(c) ? set.delete(c) : set.add(c); }
        else if (f) set.add(c); else set.delete(c);
        return set.has(c);
      },
      contains: c => set.has(c),
      _set: set
    };
  }

  function makeEl(tag) {
    return {
      tagName: (tag || "div").toUpperCase(),
      children: [],
      childNodes: [],
      style: fakeStyle(),
      classList: fakeClassList(),
      dataset: {},
      _attrs: {},
      _html: "",
      _text: "",
      value: "",
      disabled: false,
      checked: false,
      innerHTML: "",
      textContent: "",
      offsetWidth: 90,
      offsetHeight: 90,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 90, height: 90, right: 90, bottom: 90 }),
      appendChild(c) { this.children.push(c); this.childNodes.push(c); return c; },
      removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); return c; },
      insertBefore(c) { this.children.push(c); return c; },
      setAttribute(k, v) { this._attrs[k] = v; },
      getAttribute(k) { return this._attrs[k] === undefined ? null : this._attrs[k]; },
      removeAttribute(k) { delete this._attrs[k]; },
      hasAttribute(k) { return this._attrs[k] !== undefined; },
      addEventListener(t, f) { listeners.push([this, t, f]); },
      removeEventListener() {},
      focus() {}, blur() {}, click() {}, scrollIntoView() {},
      querySelector: () => null,
      querySelectorAll: () => []
    };
  }

  const cache = new Map();
  function getEl(id) {
    if (!cache.has(id)) cache.set(id, makeEl("div"));
    return cache.get(id);
  }

  const documentStub = {
    getElementById: getEl,
    createElement: (t) => makeEl(t),
    createTextNode: (t) => ({ text: t }),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: (t, f) => listeners.push([documentStub, t, f]),
    removeEventListener: () => {},
    body: makeEl("body"),
    documentElement: makeEl("html")
  };

  const sandbox = {
    document: documentStub,
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: () => 0,
    clearInterval: () => 0,
    requestAnimationFrame: (f) => setTimeout(f, 0),
    cancelAnimationFrame: () => {},
    Math: Math, Date: Date, JSON: JSON, Object: Object, Array: Array,
    Number: Number, String: String, Boolean: Boolean, Error: Error,
    parseInt: parseInt, parseFloat: parseFloat, isNaN: isNaN,
    Uint8Array: Uint8Array, Int16Array: Int16Array, Int32Array: Int32Array,
    Float64Array: Float64Array, ArrayBuffer: ArrayBuffer, Map: Map, Set: Set
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;

  const ctx = vm.createContext(sandbox);
  const errors = [];

  function load(file) {
    const code = fs.readFileSync(path.join(ROOT, file), "utf8");
    try {
      vm.runInContext(code, ctx, { filename: file });
      return true;
    } catch (e) {
      errors.push(file + ": " + e.message);
      return false;
    }
  }

  /* Chạy một biểu thức bên trong sandbox. Dùng khi cần đọc/gán các biến
     mà game.js khai báo bằng `let`/`const` ở cấp script: những binding
     đó nằm trong môi trường từ vực toàn cục chứ KHÔNG phải thuộc tính
     của đối tượng sandbox, nên không truy cập được từ ngoài. */
  function evalIn(expr) {
    return vm.runInContext(expr, ctx);
  }

  return { sandbox, ctx, load, errors, getEl, evalIn };
}

module.exports = { createSandbox, ROOT };
