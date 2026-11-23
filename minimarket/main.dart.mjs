// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      AC: Function.prototype.call.bind(DataView.prototype.setInt16),
      AD: x0 => x0.height,
      AE: (x0,x1) => x0.observe(x1),
      AF: x0 => x0.wheelDeltaY,
      AG: x0 => x0.v8BreakIterator,
      AH: x0 => x0.selectionStart,
      AI: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      AJ: (a, s, e) => a.slice(s, e),
      AK: Function.prototype.call.bind(DataView.prototype.getBigUint64),
      AL: x0 => x0.abort(),
      AM: () => globalThis.window.navigator.userAgent,
      AN: x0 => x0.exitFullscreen(),
      AO: (x0,x1,x2,x3,x4,x5) => x0.call(x1,x2,x3,x4,x5),
      AP: x0 => x0.history,
      AQ: (x0,x1,x2) => ({files: x0,title: x1,text: x2}),
      AR: (x0,x1) => x0.getUserMedia(x1),
      AS: x0 => x0.label,
      AT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      AU: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint16),
      BD: x0 => x0.width,
      BE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      BF: x0 => x0.wheelDeltaX,
      BG: () => globalThis.Intl,
      BH: x0 => x0.selectionEnd,
      BI: x0 => x0.readText(),
      BJ: (x0,x1,x2,x3) => x0.putImageData(x1,x2,x3),
      BK: x0 => x0.webSocketEndpoint,
      BL: () => new AbortController(),
      BM: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      BN: (x0,x1) => x0.push(x1),
      BO: (x0,x1,x2,x3,x4,x5,x6) => x0.call(x1,x2,x3,x4,x5,x6),
      BP: x0 => x0.location,
      BQ: (x0,x1) => ({files: x0,text: x1}),
      BR: x0 => x0.getAudioTracks(),
      BS: x0 => x0.deviceId,
      BT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      BU: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setUint8),
      CD: x0 => x0.screen,
      CE: x0 => new ResizeObserver(x0),
      CF: x0 => x0.key,
      CG: (x0,x1) => x0.segment(x1),
      CH: x0 => x0.selectionDirection,
      CI: x0 => x0.clipboard,
      CJ: x0 => x0.arrayBuffer(),
      CK: x0 => x0.protocol,
      CL: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      CM: () => globalThis.document,
      CN: (x0,x1) => x0.appendChild(x1),
      CO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      CP: (x0,x1) => x0.removeItem(x1),
      CQ: (x0,x1) => ({files: x0,title: x1}),
      CR: x0 => x0.stop(),
      CS: x0 => x0.kind,
      CT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CU: (x0,x1) => { x0.videoBitsPerSecond = x1 },
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (x0,x1) => x0.focus(x1),
      DC: Function.prototype.call.bind(DataView.prototype.setInt8),
      DD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      DE: (x0,x1) => x0.getPropertyValue(x1),
      DF: x0 => x0.identifier,
      DG: x0 => x0.index,
      DH: x0 => x0.selectionStart,
      DI: (x0,x1) => x0.writeText(x1),
      DJ: (x0,x1) => x0.transferFromImageBitmap(x1),
      DK: (x0,x1,x2) => x0.close(x1,x2),
      DL: (x0,x1) => globalThis.fetch(x0,x1),
      DM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      DN: x0 => x0.readText(),
      DO: x0 => new ResizeObserver(x0),
      DP: x0 => x0.localStorage,
      DQ: x0 => ({files: x0}),
      DR: (o,s,v) => o[s] = v,
      DS: (x0,x1) => x0.getFloatTimeDomainData(x1),
      DT: x0 => x0.parentNode,
      DU: (x0,x1) => { x0.audioBitsPerSecond = x1 },
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: () => ({}),
      EC: Function.prototype.call.bind(DataView.prototype.getInt8),
      ED: x0 => x0.tabIndex,
      EE: x0 => globalThis.parseFloat(x0),
      EF: x0 => x0.touches,
      EG: x0 => x0.next(),
      EH: x0 => x0.selectionEnd,
      EI: x0 => x0.unlock(),
      EJ: x0 => x0.height,
      EK: x0 => x0.close(),
      EL: (x0,x1) => x0.get(x1),
      EM: (x0,x1,x2) => x0.addEventListener(x1,x2),
      EN: x0 => x0.text(),
      EO: (x0,x1) => x0.observe(x1),
      EP: (x0,x1) => x0.key(x1),
      EQ: (x0,x1) => ({title: x0,text: x1}),
      ER: () => Symbol("jsBoxedDartObjectProperty"),
      ES: x0 => x0.fftSize,
      ET: x0 => x0.files,
      EU: x0 => x0.message,
      F: () => new Error().stack,
      FB: (o, p, v) => o[p] = v,
      FC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      FD: (x0,x1) => x0.contains(x1),
      FE: (x0,x1) => x0.getComputedStyle(x1),
      FF: x0 => x0.pressure,
      FG: x0 => x0.value,
      FH: x0 => x0.keyCode,
      FI: (x0,x1) => x0.lock(x1),
      FJ: x0 => x0.width,
      FK: (x0,x1) => x0.send(x1),
      FL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      FM: x0 => x0.preventDefault(),
      FN: x0 => x0.activeCues,
      FO: (o) => {
        const typeofValue = typeof o;
        return (typeofValue === 'object') ||
            typeofValue === 'function';
      },
      FP: x0 => x0.length,
      FQ: x0 => ({text: x0}),
      FR: x0 => x0.mediaDevices,
      FS: x0 => ({name: x0}),
      FT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      FU: x0 => x0.height,
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.activeElement,
      GE: x0 => x0.documentElement,
      GF: x0 => x0.tiltY,
      GG: x0 => x0.done,
      GH: (x0,x1) => x0.scrollIntoView(x1),
      GI: x0 => x0.orientation,
      GJ: x0 => x0.rasterEndMilliseconds,
      GK: () => new Array(),
      GL: (x0,x1) => x0.forEach(x1),
      GM: (x0,x1) => x0.item(x1),
      GN: (x0,x1) => { x0.mode = x1 },
      GO: x0 => x0.body,
      GP: x0 => x0.getRegistration(),
      GQ: () => ({}),
      GR: x0 => x0.state,
      GS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      GT: x0 => x0.target,
      GU: x0 => x0.width,
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.parentNode,
      HE: x0 => x0.computedStyleMap(),
      HF: x0 => x0.tiltX,
      HG: (o, m, a) => o[m].apply(o, a),
      HH: x0 => x0.multiViewEnabled,
      HI: (x0,x1) => x0.querySelector(x1),
      HJ: x0 => x0.rasterStartMilliseconds,
      HK: (x0,x1) => new WebSocket(x0,x1),
      HL: x0 => x0.name,
      HM: x0 => x0.name,
      HN: (x0,x1) => x0[x1],
      HO: (x0,x1) => { x0.id = x1 },
      HP: (x0,x1) => x0.register(x1),
      HQ: (x0,x1,x2) => new File(x0,x1,x2),
      HR: x0 => x0.permissions,
      HS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      HT: (x0,x1) => { x0.accept = x1 },
      HU: x0 => x0.code,
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.tagName,
      IE: (x0,x1) => x0.get(x1),
      IF: x0 => x0.pointerType,
      IG: x0 => x0.iterator,
      IH: (x0,x1) => x0.replaceWith(x1),
      II: (x0,x1) => { x0.title = x1 },
      IJ: x0 => x0.imageBitmaps,
      IK: x0 => x0.reason,
      IL: x0 => x0.statusText,
      IM: x0 => x0.length,
      IN: x0 => x0.length,
      IO: x0 => x0.call(),
      IP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      IQ: (x0,x1) => { x0.type = x1 },
      IR: (x0,x1) => x0.createMediaStreamSource(x1),
      IS: (x0,x1,x2) => x0.getCurrentPosition(x1,x2),
      IT: (x0,x1) => { x0.multiple = x1 },
      IU: (x0,x1,x2) => x0.setProperty(x1,x2),
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      JD: x0 => x0.target,
      JE: (o, p) => p in o,
      JF: x0 => x0.pointerId,
      JG: () => globalThis.Symbol,
      JH: (x0,x1) => { x0.className = x1 },
      JI: (x0,x1) => x0.vibrate(x1),
      JJ: (x0,x1) => { x0.height = x1 },
      JK: x0 => x0.code,
      JL: x0 => x0.url,
      JM: x0 => x0.files,
      JN: x0 => x0.textTracks,
      JO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      JP: (x0,x1) => { x0.onmessage = x1 },
      JQ: x0 => x0.message,
      JR: (x0,x1) => x0.connect(x1),
      JS: x0 => ({video: x0}),
      JT: (x0,x1) => { x0.draggable = x1 },
      JU: (x0,x1) => { x0.objectFit = x1 },
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientY,
      KE: (x0,x1) => { x0.textContent = x1 },
      KF: x0 => x0.getCoalescedEvents(),
      KG: (x0,x1) => new Intl.Segmenter(x0,x1),
      KH: (x0,x1) => { x0.name = x1 },
      KI: x0 => x0.content,
      KJ: (x0,x1) => { x0.width = x1 },
      KK: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      KL: x0 => x0.status,
      KM: x0 => x0.clipboardData,
      KN: (x0,x1) => { x0.srclang = x1 },
      KO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      KP: x0 => x0.payload,
      KQ: x0 => x0.name,
      KR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      KS: x0 => x0.getVideoTracks(),
      KT: (x0,x1) => { x0.type = x1 },
      KU: (x0,x1) => { x0.pointerEvents = x1 },
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: x0 => new Uint8ClampedArray(x0),
      LC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      LD: x0 => x0.clientX,
      LE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LF: (x0,x1) => x0.getModifierState(x1),
      LG: x0 => x0.Segmenter,
      LH: (x0,x1) => { x0.placeholder = x1 },
      LI: x0 => x0.document,
      LJ: x0 => x0.convertToBlob(),
      LK: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      LL: x0 => x0.getReader(),
      LM: x0 => globalThis.jsDisconnect(x0),
      LN: (x0,x1) => { x0.label = x1 },
      LO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      LP: x0 => x0.reply,
      LQ: x0 => ({frequency: x0}),
      LR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LS: x0 => x0.active,
      LT: (x0,x1) => { x0.target = x1 },
      LU: (x0,x1) => { x0.transformOrigin = x1 },
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      MD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      ME: x0 => x0.matches,
      MF: s => s.trimLeft(),
      MG: x0 => x0.buffer,
      MH: (x0,x1) => { x0.name = x1 },
      MI: (a, i) => a.splice(i, 1)[0],
      MJ: (x0,x1,x2) => new ImageData(x0,x1,x2),
      MK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ML: x0 => x0.read(),
      MM: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      MN: (x0,x1) => { x0.kind = x1 },
      MO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      MP: x0 => x0.id,
      MQ: x0 => new Gyroscope(x0),
      MR: (x0,x1) => { x0.onmessage = x1 },
      MS: x0 => x0.geolocation,
      MT: x0 => x0.maxTouchPoints,
      MU: (x0,x1) => { x0.transform = x1 },
      N: o => String(o),
      NB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      NC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      ND: x0 => x0.getBoundingClientRect(),
      NE: (x0,x1) => x0.matchMedia(x1),
      NF: s => s.toUpperCase(),
      NG: x0 => x0.wasmMemory,
      NH: (x0,x1) => { x0.placeholder = x1 },
      NI: (a, l) => a.length = l,
      NJ: (x0,x1) => x0.getContext(x1),
      NK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NL: x0 => x0.value,
      NM: (x0,x1,x2) => x0.register(x1,x2),
      NN: (x0,x1) => { x0.src = x1 },
      NO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4,x5,x6,x7,x8) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4,x5,x6,x7,x8) }),
      NP: x0 => x0.action,
      NQ: x0 => x0.start(),
      NR: x0 => x0.port,
      NS: x0 => x0.baseURI,
      NT: x0 => x0.hardwareConcurrency,
      NU: (x0,x1) => { x0.autoplay = x1 },
      O: o => o === undefined,
      OB: x0 => new Uint16Array(x0),
      OC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      OD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      OE: x0 => x0.matches,
      OF: x0 => x0.pop(),
      OG: () => globalThis.window._flutter_skwasmInstance,
      OH: (x0,x1) => { x0.action = x1 },
      OI: (x0,x1) => x0.createElement(x1),
      OJ: (x0,x1) => new OffscreenCanvas(x0,x1),
      OK: (o, t) => typeof o === t,
      OL: x0 => x0.done,
      OM: (x0,x1) => x0.unregister(x1),
      ON: x0 => globalThis.URL.revokeObjectURL(x0),
      OO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      OP: x0 => x0.serviceWorker,
      OQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      OR: x0 => x0.destination,
      OS: x0 => x0.document,
      OT: x0 => x0.vendorSub,
      OU: x0 => new Event(x0),
      P: (x0,x1) => x0.exec(x1),
      PB: x0 => new Int32Array(x0),
      PC: (x0,x1) => x0.querySelector(x1),
      PD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      PE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      PF: x0 => x0.flags,
      PG: () => new TextDecoder(),
      PH: (x0,x1) => { x0.method = x1 },
      PI: (x0,x1) => x0.append(x1),
      PJ: x0 => x0.allocationSize(),
      PK: x0 => x0.data,
      PL: x0 => x0.cancel(),
      PM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PN: (x0,x1) => { x0.playbackRate = x1 },
      PO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      PP: x0 => x0.data,
      PQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PR: (x0,x1) => x0.addModule(x1),
      PS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PT: x0 => x0.productSub,
      PU: x0 => x0.type,
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      QC: (x0,x1) => x0.item(x1),
      QD: Date.now,
      QE: f => f.dartFunction,
      QF: (a, s) => a.join(s),
      QG: (d, digits) => d.toFixed(digits),
      QH: (x0,x1) => { x0.noValidate = x1 },
      QI: (x0,x1,x2) => x0.insertRule(x1,x2),
      QJ: (x0,x1) => x0.copyTo(x1),
      QK: x0 => x0.readyState,
      QL: x0 => x0.body,
      QM: x0 => new FinalizationRegistry(x0),
      QN: (x0,x1) => { x0.volume = x1 },
      QO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QP: x0 => x0.tag,
      QQ: (x0,x1) => { x0.onerror = x1 },
      QR: x0 => ({parameterData: x0}),
      QS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QT: x0 => x0.product,
      QU: x0 => x0.torch,
      R: o => o,
      RB: x0 => new Uint32Array(x0),
      RC: x0 => x0.length,
      RD: (handle) => clearTimeout(handle),
      RE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RF: (x0,x1) => x0.error(x1),
      RG: x0 => x0.maxHeight,
      RH: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      RI: (x0,x1) => x0.add(x1),
      RJ: (x0,x1) => { x0.height = x1 },
      RK: (x0,x1) => { x0.binaryType = x1 },
      RL: x0 => x0.headers,
      RM: () => globalThis.FinalizationRegistry,
      RN: (x0,x1) => { x0.muted = x1 },
      RO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RP: x0 => x0.body,
      RQ: x0 => x0.error,
      RR: (x0,x1,x2) => new AudioWorkletNode(x0,x1,x2),
      RS: (x0,x1,x2) => ({enableHighAccuracy: x0,timeout: x1,maximumAge: x2}),
      RT: x0 => x0.platform,
      RU: x0 => ({zoom: x0}),
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: x0 => new Float32Array(x0),
      SC: (x0,x1) => x0.querySelectorAll(x1),
      SD: (x0,x1) => x0.closest(x1),
      SE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SF: () => globalThis.console,
      SG: x0 => x0.maxWidth,
      SH: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      SI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      SJ: (x0,x1) => { x0.width = x1 },
      SK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      SL: x0 => x0.signal,
      SM: x0 => x0.multiView,
      SN: x0 => x0.muted,
      SO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4,x5,x6) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4,x5,x6) }),
      SP: x0 => x0.title,
      SQ: (x0,x1) => { x0.onreading = x1 },
      SR: x0 => x0.audioWorklet,
      SS: (x0,x1,x2,x3) => x0.getCurrentPosition(x1,x2,x3),
      ST: x0 => x0.languages,
      SU: x0 => x0.getTracks(),
      T: o => o instanceof RegExp,
      TB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      TC: (x0,x1) => x0.getAttribute(x1),
      TD: x0 => x0.bottom,
      TE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      TF: s => s.trimRight(),
      TG: x0 => x0.minHeight,
      TH: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      TI: (x0,x1,x2) => x0.addEventListener(x1,x2),
      TJ: (x0,x1) => x0.toDataURL(x1),
      TK: (x0,x1,x2) => globalThis.jsConnect(x0,x1,x2),
      TL: (x0,x1,x2,x3) => x0.slice(x1,x2,x3),
      TM: x0 => x0.assetsDir,
      TN: (x0,x1,x2) => x0.setAttribute(x1,x2),
      TO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      TP: x0 => x0.getNotifications(),
      TQ: x0 => x0.z,
      TR: x0 => x0.channelCount,
      TS: x0 => x0.message,
      TT: x0 => x0.language,
      TU: x0 => x0.level,
      U: (string, times) => string.repeat(times),
      UB: x0 => new Float64Array(x0),
      UC: x0 => x0.remove(),
      UD: x0 => x0.top,
      UE: (o, i) => o[i],
      UF: x0 => x0.blur(),
      UG: x0 => x0.minWidth,
      UH: x0 => x0.debugSkipFontRetryDelay,
      UI: x0 => x0.preventDefault(),
      UJ: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      UK: (x0,x1) => globalThis.jsSend(x0,x1),
      UL: x0 => x0.type,
      UM: x0 => x0.baseURI,
      UN: (x0,x1) => x0.append(x1),
      UO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      UP: () => globalThis.Notification.permission,
      UQ: x0 => x0.y,
      UR: x0 => x0.sampleRate,
      US: x0 => x0.code,
      UT: x0 => x0.deviceMemory,
      UU: x0 => x0.getBattery(),
      V: o => o,
      VB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      VC: (x0,x1) => x0.appendChild(x1),
      VD: x0 => x0.right,
      VE: o => o.length,
      VF: x0 => x0.button,
      VG: (x0,x1) => x0.removeProperty(x1),
      VH: x0 => x0.status,
      VI: x0 => x0.createRange(),
      VJ: (x0,x1) => x0.getContext(x1),
      VK: (x0,x1,x2) => x0.setItem(x1,x2),
      VL: x0 => x0.blob(),
      VM: x0 => x0.routeUrlStrategy,
      VN: (x0,x1) => x0.append(x1),
      VO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      VP: () => globalThis.Notification.requestPermission(),
      VQ: x0 => x0.x,
      VR: x0 => ({sampleRate: x0}),
      VS: x0 => x0.speed,
      VT: x0 => x0.appVersion,
      VU: x0 => x0.charging,
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: x0 => new ArrayBuffer(x0),
      WC: (x0,x1) => x0.append(x1),
      WD: x0 => x0.left,
      WE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      WF: x0 => x0.innerHeight,
      WG: (x0,x1,x2) => x0.insertBefore(x1,x2),
      WH: (x0,x1,x2) => x0.set(x1,x2),
      WI: (x0,x1) => x0.selectNode(x1),
      WJ: x0 => x0.displayHeight,
      WK: x0 => x0.sessionStorage,
      WL: (x0,x1,x2) => x0.slice(x1,x2),
      WM: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      WN: x0 => x0.head,
      WO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      WP: x0 => x0.close(),
      WQ: x0 => new Accelerometer(x0),
      WR: x0 => new AudioContext(x0),
      WS: x0 => x0.heading,
      WT: x0 => x0.appName,
      WU: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      XC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      XD: x0 => x0.clientY,
      XE: x0 => x0.language,
      XF: x0 => x0.innerWidth,
      XG: x0 => x0.parentElement,
      XH: x0 => x0.arrayBuffer(),
      XI: x0 => x0.getSelection(),
      XJ: x0 => x0.format,
      XK: x0 => x0.initialData,
      XL: x0 => x0.arrayBuffer(),
      XM: x0 => x0.load(),
      XN: (x0,x1) => { x0.src = x1 },
      XO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      XP: (x0,x1,x2) => x0.showNotification(x1,x2),
      XQ: x0 => x0.start(),
      XR: () => new AudioContext(),
      XS: x0 => x0.accuracy,
      XT: x0 => x0.appCodeName,
      XU: (x0,x1) => { x0.onchargingchange = x1 },
      Y: x0 => x0.unicode,
      YB: (x0,x1,x2) => new DataView(x0,x1,x2),
      YC: x0 => x0.style,
      YD: x0 => x0.clientX,
      YE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      YF: x0 => x0.height,
      YG: (x0,x1) => x0.removeAttribute(x1),
      YH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      YI: x0 => x0.removeAllRanges(),
      YJ: x0 => x0.displayWidth,
      YK: (x0,x1) => x0.getItem(x1),
      YL: (x0,x1) => x0.getRandomValues(x1),
      YM: x0 => x0.remove(),
      YN: (x0,x1) => { x0.type = x1 },
      YO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      YP: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12) => ({dir: x0,lang: x1,body: x2,tag: x3,image: x4,icon: x5,badge: x6,timestamp: x7,renotify: x8,silent: x9,requireInteraction: x10,data: x11,actions: x12}),
      YQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      YR: x0 => x0.sampleRate,
      YS: x0 => x0.altitudeAccuracy,
      YT: x0 => x0.onLine,
      YU: (x0,x1) => { x0.loop = x1 },
      Z: x0 => x0.ignoreCase,
      ZB: (o, p) => o[p],
      ZC: x0 => x0.debugShowSemanticsNodes,
      ZD: x0 => x0.changedTouches,
      ZE: () => globalThis.window.FinalizationRegistry,
      ZF: x0 => x0.width,
      ZG: x0 => x0.id,
      ZH: (x0,x1) => x0.fetch(x1),
      ZI: (x0,x1) => x0.addRange(x1),
      ZJ: (x0,x1) => x0.revokeObjectURL(x1),
      ZK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      ZL: () => globalThis.crypto,
      ZM: (o, p) => delete o[p],
      ZN: (x0,x1) => { x0.charset = x1 },
      ZO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZP: (x0,x1) => ({action: x0,title: x1}),
      ZQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZR: x0 => x0.getSettings(),
      ZS: x0 => x0.altitude,
      ZT: x0 => x0.getSupportedConstraints(),
      ZU: (x0,x1) => { x0.value = x1 },
      a: x0 => x0.multiline,
      aB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      aC: (x0,x1) => x0.warn(x1),
      aD: x0 => x0.offsetY,
      aE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aF: x0 => x0.clientHeight,
      aG: (x0,x1) => x0.querySelectorAll(x1),
      aH: x0 => x0.fontFallbackBaseUrl,
      aI: () => globalThis.window,
      aJ: (x0,x1) => { x0.src = x1 },
      aK: x0 => x0.innerHeight,
      aL: l => new DataView(new ArrayBuffer(l)),
      aM: (x0,x1) => { x0.src = x1 },
      aN: (x0,x1) => { x0.async = x1 },
      aO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aP: x0 => x0.active,
      aQ: (x0,x1) => { x0.onerror = x1 },
      aR: (x0,x1) => x0.removeTrack(x1),
      aS: x0 => x0.timestamp,
      aT: x0 => x0.getCapabilities(),
      aU: x0 => x0.gain,
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      bC: x0 => x0.console,
      bD: x0 => x0.offsetX,
      bE: x0 => new window.FinalizationRegistry(x0),
      bF: x0 => x0.clientWidth,
      bG: x0 => x0.isConnected,
      bH: (map, o, v) => map.set(o, v),
      bI: (x0,x1) => { x0.innerText = x1 },
      bJ: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      bK: x0 => x0.outerHeight,
      bL: x0 => globalThis.URL.createObjectURL(x0),
      bM: x0 => x0.pause(),
      bN: x0 => x0.message,
      bO: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12,x13,x14,x15,x16,x17,x18,x19,x20) => x0.call(x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12,x13,x14,x15,x16,x17,x18,x19,x20),
      bP: x0 => x0.canvasKitMaximumSurfaces,
      bQ: (x0,x1) => { x0.onreading = x1 },
      bR: x0 => x0.close(),
      bS: x0 => x0.longitude,
      bT: x0 => x0.facingMode,
      bU: (x0,x1) => x0.createMediaElementSource(x1),
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.byteOffset,
      cC: () => globalThis.window,
      cD: x0 => x0.type,
      cE: (x0,x1) => x0.unregister(x1),
      cF: (x0,x1) => { x0.content = x1 },
      cG: x0 => x0.offsetHeight,
      cH: o => o.byteLength,
      cI: x0 => x0.offsetY,
      cJ: x0 => x0.naturalHeight,
      cK: x0 => x0.screenLeft,
      cL: x0 => x0.read(),
      cM: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      cN: x0 => x0.error,
      cO: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof DataView) return 1;
        return 2;
      },
      cP: x0 => x0.nextSibling,
      cQ: x0 => x0.z,
      cR: (x0,x1) => x0.warn(x1),
      cS: x0 => x0.latitude,
      cT: x0 => x0.facingMode,
      cU: x0 => x0.createGain(),
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: o => o.buffer,
      dC: (o, c) => o instanceof c,
      dD: x0 => x0.maxTouchPoints,
      dE: (x0,x1) => x0.contains(x1),
      dF: (x0,x1) => { x0.name = x1 },
      dG: x0 => x0.offsetWidth,
      dH: (map, o) => map.get(o),
      dI: x0 => x0.offsetX,
      dJ: x0 => x0.naturalWidth,
      dK: x0 => x0.height,
      dL: (x0,x1) => x0.getType(x1),
      dM: (x0,x1) => x0.toDataURL(x1),
      dN: x0 => x0.playbackRate,
      dO: (x0,x1,x2,x3,x4) => x0.call(x1,x2,x3,x4),
      dP: (x0,x1) => x0.debug(x1),
      dQ: x0 => x0.y,
      dR: () => globalThis.console,
      dS: x0 => x0.coords,
      dT: (x0,x1) => ({video: x0,audio: x1}),
      dU: x0 => x0.createStereoPanner(),
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: Function.prototype.call.bind(DataView.prototype.getUint8),
      eC: (x0,x1) => x0[x1],
      eD: x0 => x0.platform,
      eE: (s) => +s,
      eF: x0 => x0.head,
      eG: (x0,x1) => { x0.tabIndex = x1 },
      eH: () => new WeakMap(),
      eI: x0 => x0.button,
      eJ: x0 => x0.decode(),
      eK: x0 => x0.width,
      eL: x0 => x0.types,
      eM: (x0,x1) => x0.getContext(x1),
      eN: x0 => x0.volume,
      eO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      eP: x0 => x0.hostElement,
      eQ: x0 => x0.x,
      eR: x0 => x0.state,
      eS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eT: x0 => x0.max,
      eU: (x0,x1) => { x0.crossOrigin = x1 },
      f: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      fB: (b, o) => new DataView(b, o),
      fC: x0 => x0.length,
      fD: x0 => x0.body,
      fE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      fF: (x0,x1) => x0.removeChild(x1),
      fG: x0 => x0.stopPropagation(),
      fH: (x0,x1,x2) => x0.supports(x1,x2),
      fI: x0 => x0.classList,
      fJ: (x0,x1) => { x0.decoding = x1 },
      fK: x0 => x0.screen,
      fL: x0 => x0.clipboard,
      fM: (x0,x1) => { x0.height = x1 },
      fN: (x0,x1) => x0.end(x1),
      fO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      fP: x0 => x0.location,
      fQ: x0 => new Magnetometer(x0),
      fR: x0 => x0.stop(),
      fS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fT: x0 => x0.min,
      fU: (x0,x1) => { x0.preload = x1 },
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: (b, o, l) => new DataView(b, o, l),
      gC: (string, token) => string.split(token),
      gD: () => globalThis.document,
      gE: s => s.trim(),
      gF: x0 => x0.firstChild,
      gG: x0 => x0.value,
      gH: () => globalThis.CSS,
      gI: (x0,x1) => { x0.height = x1 },
      gJ: (x0,x1) => { x0.crossOrigin = x1 },
      gK: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      gL: x0 => new ClipboardItem(x0),
      gM: x0 => x0.videoHeight,
      gN: x0 => x0.length,
      gO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      gP: (x0,x1) => x0.getModifierState(x1),
      gQ: x0 => x0.start(),
      gR: (x0,x1,x2) => ({mimeType: x0,audioBitsPerSecond: x1,bitsPerSecond: x2}),
      gS: (x0,x1,x2,x3) => x0.watchPosition(x1,x2,x3),
      gT: x0 => x0.zoom,
      gU: x0 => x0.length,
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      hC: o => o instanceof Array,
      hD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      hE: x0 => x0.classList,
      hF: x0 => x0.viewConstraints,
      hG: x0 => x0.disabled,
      hH: (x0,x1) => { x0.innerText = x1 },
      hI: (x0,x1) => { x0.width = x1 },
      hJ: (x0,x1) => x0.createObjectURL(x1),
      hK: () => new FileReader(),
      hL: (x0,x1) => x0.write(x1),
      hM: (x0,x1) => { x0.width = x1 },
      hN: x0 => x0.buffered,
      hO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hP: x0 => x0.metaKey,
      hQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      hR: (x0,x1) => new MediaRecorder(x0,x1),
      hS: (x0,x1) => x0.clearWatch(x1),
      hT: x0 => x0.zoom,
      hU: x0 => x0.getReader(),
      i: x0 => new Promise(x0),
      iB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      iC: (a, i) => a[i],
      iD: x0 => x0.hasFocus(),
      iE: x0 => x0.preventDefault(),
      iF: x0 => x0.hostElement,
      iG: (x0,x1) => { x0.type = x1 },
      iH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      iI: x0 => x0.style,
      iJ: x0 => x0.URL,
      iK: (x0,x1) => x0.readAsArrayBuffer(x1),
      iL: x0 => x0.naturalHeight,
      iM: x0 => x0.videoWidth,
      iN: x0 => x0.duration,
      iO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      iP: x0 => x0.altKey,
      iQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      iR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      iS: x0 => globalThis.Intl.supportedValuesOf(x0),
      iT: (x0,x1) => x0.lock(x1),
      iU: x0 => x0.value,
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      jC: a => a.length,
      jD: x0 => x0.relatedTarget,
      jE: x0 => x0.parent,
      jF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jG: (x0,x1) => { x0.min = x1 },
      jH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      jI: x0 => x0.sheet,
      jJ: x0 => new Blob(x0),
      jK: x0 => x0.result,
      jL: x0 => x0.naturalWidth,
      jM: (x0,x1) => x0.createElement(x1),
      jN: x0 => x0.currentTime,
      jO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      jP: x0 => x0.ctrlKey,
      jQ: (x0,x1) => { x0.onerror = x1 },
      jR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jS: () => globalThis.Intl.DateTimeFormat(),
      jT: x0 => x0.requestFullscreen(),
      jU: x0 => x0.done,
      k: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      kB: (t, s) => t.set(s),
      kC: (x0,x1) => x0.test(x1),
      kD: x0 => x0.shiftKey,
      kE: x0 => x0.timeStamp,
      kF: x0 => ({runApp: x0}),
      kG: (x0,x1) => { x0.max = x1 },
      kH: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      kI: x0 => x0.head,
      kJ: x0 => x0.close(),
      kK: () => new XMLHttpRequest(),
      kL: (x0,x1) => { x0.pointerEvents = x1 },
      kM: x0 => x0.play(),
      kN: (o, p, v) => o[p] = v,
      kO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      kP: x0 => x0.isComposing,
      kQ: (x0,x1) => { x0.onreading = x1 },
      kR: (x0,x1) => x0.start(x1),
      kS: x0 => x0.resolvedOptions(),
      kT: x0 => x0.orientation,
      kU: x0 => x0.read(),
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      lC: x0 => x0.userAgent,
      lD: (decoder, codeUnits) => decoder.decode(codeUnits),
      lE: (x0,x1) => x0.hasAttribute(x1),
      lF: () => typeof dartUseDateNowForTicks !== "undefined",
      lG: (x0,x1) => { x0.value = x1 },
      lH: x0 => x0.history,
      lI: () => globalThis.document,
      lJ: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      lK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      lL: (x0,x1) => { x0.src = x1 },
      lM: x0 => x0.message,
      lN: (x0,x1) => { x0.border = x1 },
      lO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      lP: x0 => x0.code,
      lQ: x0 => x0.z,
      lR: x0 => x0.createAnalyser(),
      lS: x0 => x0.timeZone,
      lT: x0 => x0.unlock(),
      lU: x0 => x0.body,
      m: o => [o],
      mB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      mC: x0 => x0.navigator,
      mD: () => new TextDecoder("utf-8", {fatal: true}),
      mE: x0 => x0.buttons,
      mF: () => Date.now(),
      mG: (x0,x1) => { x0.disabled = x1 },
      mH: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      mI: x0 => new WeakRef(x0),
      mJ: (x0,x1) => x0.decode(x1),
      mK: x0 => x0.send(),
      mL: x0 => x0.src,
      mM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      mN: (x0,x1) => { x0.height = x1 },
      mO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      mP: x0 => x0.repeat,
      mQ: x0 => x0.y,
      mR: (x0,x1) => { x0.smoothingTimeConstant = x1 },
      mS: (x0,x1) => x0.getRandomValues(x1),
      mT: (x0,x1) => { x0.srcObject = x1 },
      mU: x0 => x0.assetBase,
      n: (o0, o1) => [o0, o1],
      nB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      nC: Function.prototype.call.bind(String.prototype.toLowerCase),
      nD: () => new TextDecoder("utf-8", {fatal: false}),
      nE: x0 => x0.ctrlKey,
      nF: () => 1000 * performance.now(),
      nG: (x0,x1) => { x0.scrollTop = x1 },
      nH: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      nI: x0 => x0.deref(),
      nJ: x0 => x0.duration,
      nK: x0 => x0.type,
      nL: x0 => x0.decode(),
      nM: x0 => ({xhrSetup: x0}),
      nN: (x0,x1) => { x0.width = x1 },
      nO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      nP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      nQ: x0 => x0.x,
      nR: (x0,x1) => { x0.fftSize = x1 },
      nS: (x0,x1,x2,x3) => x0.encrypt(x1,x2,x3),
      nT: x0 => x0.srcObject,
      nU: x0 => x0.loader,
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: Function.prototype.call.bind(DataView.prototype.getUint32),
      oC: Object.is,
      oD: (a, i, v) => a[i] = v,
      oE: x0 => x0.y,
      oF: (x0,x1) => x0.requestAnimationFrame(x1),
      oG: (x0,x1) => { x0.scrollLeft = x1 },
      oH: o => Object.keys(o),
      oI: () => globalThis.WeakRef,
      oJ: x0 => x0.image,
      oK: x0 => x0.response,
      oL: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      oM: x0 => new Hls(x0),
      oN: x0 => x0.style,
      oO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      oP: x0 => globalThis.Wakelock.toggle(x0),
      oQ: x0 => new LinearAccelerationSensor(x0),
      oR: (x0,x1) => { x0.onstop = x1 },
      oS: x0 => x0.subtle,
      oT: (x0,x1,x2) => x0.translate(x1,x2),
      oU: () => globalThis._flutter,
      p: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      pB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      pC: x0 => x0.vendor,
      pD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      pE: x0 => x0.x,
      pF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      pG: (x0,x1) => { x0.spellcheck = x1 },
      pH: x0 => x0.state,
      pI: x0 => x0.pyodide,
      pJ: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      pK: (x0,x1) => { x0.responseType = x1 },
      pL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      pM: (x0,x1) => x0.loadSource(x1),
      pN: (x0,x1) => { x0.controls = x1 },
      pO: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12) => x0.call(x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12),
      pP: (x0,x1) => x0.querySelector(x1),
      pQ: x0 => x0.start(),
      pR: x0 => x0.mimeType,
      pS: (x0,x1,x2,x3,x4,x5,x6,x7) => x0.unwrapKey(x1,x2,x3,x4,x5,x6,x7),
      pT: (x0,x1,x2) => x0.scale(x1,x2),
      q: (x0,x1,x2) => { x0[x1] = x2 },
      qB: Function.prototype.call.bind(DataView.prototype.getInt32),
      qC: (x0,x1) => x0.createTextNode(x1),
      qD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      qE: x0 => x0.scrollTop,
      qF: x0 => x0.now(),
      qG: (x0,x1) => { x0.disabled = x1 },
      qH: x0 => x0.state,
      qI: () => globalThis.flet,
      qJ: x0 => new window.ImageDecoder(x0),
      qK: x0 => x0.vendor,
      qL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qM: (x0,x1) => x0.attachMedia(x1),
      qN: (x0,x1,x2) => x0.call(x1,x2),
      qO: x0 => x0.call(),
      qP: () => globalThis.Wakelock.enabled(),
      qQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qR: (x0,x1) => { x0.ondataavailable = x1 },
      qS: (x0,x1,x2,x3,x4,x5) => x0.importKey(x1,x2,x3,x4,x5),
      qT: (x0,x1,x2,x3,x4,x5) => x0.drawImage(x1,x2,x3,x4,x5),
      r: (o, p) => o[p],
      rB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      rC: (x0,x1) => { x0.id = x1 },
      rD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      rE: x0 => x0.offsetTop,
      rF: x0 => x0.performance,
      rG: (x0,x1) => { x0.autocomplete = x1 },
      rH: (x0,x1) => x0.go(x1),
      rI: (x0,x1) => x0.matchMedia(x1),
      rJ: x0 => x0.name,
      rK: x0 => x0.navigator,
      rL: x0 => x0.send(),
      rM: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      rN: (x0,x1,x2,x3) => x0.call(x1,x2,x3),
      rO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      rP: (x0,x1) => x0.canShare(x1),
      rQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      rR: x0 => x0.data,
      rS: (x0,x1,x2,x3) => x0.generateKey(x1,x2,x3),
      rT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      s: () => globalThis,
      sB: o => o instanceof Uint16Array,
      sC: (x0,x1) => { x0.nonce = x1 },
      sD: x0 => x0.visibilityState,
      sE: x0 => x0.scrollLeft,
      sF: x0 => new Uint8Array(x0),
      sG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      sH: x0 => x0.hash,
      sI: x0 => x0.matches,
      sJ: x0 => x0.repetitionCount,
      sK: x0 => new Blob(x0),
      sL: x0 => x0.status,
      sM: (x0,x1) => x0.canPlayType(x1),
      sN: (x0,x1,x2,x3,x4) => x0.call(x1,x2,x3,x4),
      sO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sP: (x0,x1) => x0.share(x1),
      sQ: (x0,x1) => { x0.onerror = x1 },
      sR: x0 => globalThis.MediaRecorder.isTypeSupported(x0),
      sS: (x0,x1,x2,x3,x4) => x0.wrapKey(x1,x2,x3,x4),
      sT: (x0,x1,x2) => x0.toBlob(x1,x2),
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: Function.prototype.call.bind(DataView.prototype.getUint16),
      tC: x0 => x0.nonce,
      tD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      tE: x0 => x0.offsetLeft,
      tF: (x0,x1,x2) => x0.slice(x1,x2),
      tG: (x0,x1) => { x0.value = x1 },
      tH: x0 => x0.location,
      tI: () => globalThis.window,
      tJ: x0 => x0.frameCount,
      tK: x0 => ({type: x0}),
      tL: x0 => x0.response,
      tM: () => globalThis.Hls.isSupported(),
      tN: x0 => x0.disconnect(),
      tO: (x0,x1) => { x0.defer = x1 },
      tP: x0 => x0.click(),
      tQ: (x0,x1) => { x0.onreading = x1 },
      tR: x0 => x0.disconnect(),
      tS: (x0,x1,x2) => x0.exportKey(x1,x2),
      tT: x0 => ({torch: x0}),
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: o => o instanceof Int16Array,
      uC: () => globalThis.window.flutterConfiguration,
      uD: x0 => x0.disconnect(),
      uE: x0 => x0.offsetParent,
      uF: (x0,x1) => x0.decode(x1),
      uG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      uH: x0 => x0.search,
      uI: (a, i) => a.splice(i, 1),
      uJ: x0 => x0.selectedTrack,
      uK: (x0,x1) => new Blob(x0,x1),
      uL: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      uM: x0 => x0.userAgent,
      uN: x0 => x0.devicePixelRatio,
      uO: x0 => x0.id,
      uP: (o, a) => o + a,
      uQ: x0 => x0.z,
      uR: x0 => x0.state,
      uS: x0 => x0.crypto,
      uT: (x0,x1) => x0.applyConstraints(x1),
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: Function.prototype.call.bind(DataView.prototype.getInt16),
      vC: (x0,x1) => x0.attachShadow(x1),
      vD: x0 => new Intl.Locale(x0),
      vE: (o, p, r) => o.replace(p, () => r),
      vF: (x0,x1) => x0.adoptText(x1),
      vG: (x0,x1) => x0.add(x1),
      vH: x0 => x0.pathname,
      vI: a => a.pop(),
      vJ: x0 => x0.completed,
      vK: x0 => x0.size,
      vL: (x0,x1) => { x0.responseType = x1 },
      vM: (x0,x1) => { x0.innerHTML = x1 },
      vN: (x0,x1) => x0.call(x1),
      vO: x0 => x0.text(),
      vP: x0 => x0.children,
      vQ: x0 => x0.y,
      vR: x0 => x0.resume(),
      vS: x0 => x0.isSecureContext,
      vT: x0 => x0.torch,
      w: (l, r) => l === r,
      wB: o => o instanceof Uint8ClampedArray,
      wC: (x0,x1) => x0.createElement(x1),
      wD: x0 => x0.region,
      wE: (o, p, r) => o.replaceAll(p, () => r),
      wF: x0 => x0.first(),
      wG: x0 => x0.data,
      wH: x0 => x0.click(),
      wI: (handle) => clearInterval(handle),
      wJ: x0 => x0.ready,
      wK: x0 => globalThis.fetch(x0),
      wL: () => new XMLHttpRequest(),
      wM: (x0,x1) => { x0.currentTime = x1 },
      wN: (x0,x1,x2,x3,x4,x5,x6,x7,x8) => x0.call(x1,x2,x3,x4,x5,x6,x7,x8),
      wO: (x0,x1,x2,x3) => ({method: x0,headers: x1,body: x2,credentials: x3}),
      wP: (x0,x1) => { x0.download = x1 },
      wQ: x0 => x0.x,
      wR: x0 => x0.resume(),
      wS: (x0,x1,x2,x3) => x0.decrypt(x1,x2,x3),
      wT: x0 => ({mimeType: x0}),
      x: x0 => x0.random(),
      xB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      xC: x0 => x0.scale,
      xD: x0 => x0.script,
      xE: x0 => x0.deltaMode,
      xF: x0 => x0.next(),
      xG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      xH: (x0,x1) => x0.getElementsByClassName(x1),
      xI: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      xJ: x0 => x0.tracks,
      xK: x0 => x0.arrayBuffer(),
      xL: (o, p) => p in o,
      xM: x0 => x0.paused,
      xN: x0 => x0.height,
      xO: (x0,x1,x2) => x0.fetch(x1,x2),
      xP: (x0,x1) => { x0.display = x1 },
      xQ: x0 => ({name: x0}),
      xR: x0 => x0.suspend(),
      xS: (x0,x1) => x0.querySelector(x1),
      xT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setInt32),
      yC: x0 => x0.visualViewport,
      yD: x0 => x0.language,
      yE: x0 => x0.deltaY,
      yF: x0 => x0.current(),
      yG: x0 => x0.value,
      yH: (x0,x1) => x0.dispatchEvent(x1),
      yI: () => Date.now(),
      yJ: () => globalThis.window.ImageDecoder,
      yK: x0 => x0.isActive,
      yL: x0 => x0.groups,
      yM: x0 => x0.requestFullscreen(),
      yN: x0 => x0.width,
      yO: (x0,x1) => { x0.src = x1 },
      yP: (x0,x1) => { x0.href = x1 },
      yQ: (x0,x1) => x0.query(x1),
      yR: x0 => x0.pause(),
      yS: (x0,x1) => x0.removeChild(x1),
      yT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setUint32),
      zC: x0 => x0.devicePixelRatio,
      zD: x0 => x0.languages,
      zE: x0 => x0.deltaX,
      zF: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      zG: x0 => x0.selectionDirection,
      zH: (x0,x1) => x0.createEvent(x1),
      zI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      zJ: (a, i, v) => a.splice(i, 0, v),
      zK: x0 => x0.userActivation,
      zL: x0 => x0.input,
      zM: x0 => x0.documentElement,
      zN: x0 => x0.isConnected,
      zO: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      zP: x0 => ({url: x0}),
      zQ: x0 => ({audio: x0}),
      zR: x0 => x0.enumerateDevices(),
      zS: x0 => x0.firstChild,
      zT: x0 => x0.start(),

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      s: [
        "([ \r\n\t]+)|([!-\\[\\]-‧‪-퟿豈-￿][̀-ͯ]*|[\ud800-\udbff][\udc00-\udfff][̀-ͯ]*|\\\\verb\\*([^]).*?\\3|\\\\verb([^*a-zA-Z]).*?\\4|\\\\operatorname\\*|\\\\[a-zA-Z@]+[ \r\n\t]*|\\\\[^\ud800-\udfff])",
      ],
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
