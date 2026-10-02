"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReduced } from "@/lib/motion";
import { MARK, MARK_H, MARK_W } from "@/lib/mark";

declare global {
  interface Window {
    /** Set by the loader's inline script: open the cut, and when it has finished. */
    ksLoader?: { go: () => void; done: Promise<void> };
  }
}


/**
 * The whole show on one canvas, timed as the GSAP version was: the outline
 * draws (0.62s), the fill comes up under it (0.28s), and the cut opens (0.72s)
 * once React says the page has hydrated.
 *
 * Inlined into the server HTML, so it starts with the first paint instead of
 * waiting for hydration. Where it can, it draws from a worker through an
 * OffscreenCanvas: hydration, the hero's WebGL setup and Turnstile all hold the
 * main thread during these 1.5s, and a worker's frames reach the screen without
 * it. Elsewhere `run` draws on the main thread instead.
 *
 * A string, not a function, so the server and client render the same bytes.
 */
const SCRIPT = `(function () {
  var canvas = document.currentScript.previousElementSibling;
  var box = canvas.parentNode;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function run(canvas, o, raf, post) {
    var ctx = canvas.getContext("2d");
    var W = (canvas.width = o.w), H = (canvas.height = o.h);
    var parts = o.mark.split("M").slice(1).map(function (d) { return new Path2D("M" + d); });
    var whole = new Path2D(o.mark);
    var s = (96 * o.dpr) / o.mh; // 96px tall, as h-24 was
    var x = (W - o.mw * s) / 2, y = (H - o.mh * s) / 2;
    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var t0, cutAt, wanted = false, frames = 0;

    function frame(now) {
      if (t0 === undefined) t0 = now;
      var t = now - t0;
      if (wanted && cutAt === undefined) cutAt = Math.max(t, 840);

      var d = clamp(t / 620); d = d < 0.5 ? 2 * d * d : 1 - Math.pow(2 - 2 * d, 2) / 2; // power2.inOut
      var f = clamp((t - 500) / 280); f = 1 - (1 - f) * (1 - f); // power2.out
      var c = cutAt === undefined ? 0 : clamp((t - cutAt) / 720); // expo.inOut
      c = c === 0 || c === 1 ? c : c < 0.5 ? Math.pow(2, 20 * c - 10) / 2 : (2 - Math.pow(2, 10 - 20 * c)) / 2;

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      // Out along the cut: the same polygon the clip-path used to animate.
      ctx.beginPath();
      ctx.moveTo(0, -0.3 * H);
      ctx.lineTo(W, -0.42 * H);
      ctx.lineTo(W, (1.3 - 1.6 * c) * H);
      ctx.lineTo(0, (1.18 - 1.36 * c) * H);
      ctx.fillStyle = o.ink;
      ctx.fill();
      ctx.clip();
      ctx.translate(x, y);
      ctx.scale(s, s);
      ctx.fillStyle = ctx.strokeStyle = o.paper;
      if (f > 0) {
        ctx.globalAlpha = f;
        ctx.fill(whole, "evenodd");
        ctx.globalAlpha = 1;
      }
      ctx.lineWidth = 11;
      ctx.lineJoin = "round";
      // Each piece over its own length, so all four finish together.
      parts.forEach(function (p, i) {
        var len = o.lens[i];
        ctx.setLineDash(d < 1 ? [len, len] : []);
        ctx.lineDashOffset = len * (1 - d);
        ctx.stroke(p);
      });
      ctx.restore();

      if (++frames === 2) post("painted");
      if (cutAt !== undefined && t >= cutAt + 720) return post("done");
      raf(frame);
    }
    raf(frame);
    return function () { wanted = true; };
  }

  var style = getComputedStyle(box);
  var rect = canvas.getBoundingClientRect();
  var dpr = Math.min(devicePixelRatio || 1, 2);
  var mark = ${JSON.stringify(MARK)};
  var o = {
    w: Math.round((rect.width || innerWidth) * dpr),
    h: Math.round((rect.height || innerHeight) * dpr),
    dpr: dpr,
    ink: style.backgroundColor,
    paper: style.color,
    mark: mark,
    mw: ${MARK_W},
    mh: ${MARK_H},
    lens: mark.split("M").slice(1).map(function (d) {
      var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", "M" + d);
      return p.getTotalLength();
    }),
  };

  var finish;
  var ks = (window.ksLoader = { done: new Promise(function (r) { finish = r; }) });
  function on(msg) {
    // The canvas paints the ink from its second frame on, so the box's own
    // fill steps aside. Through the Animations API: it leaves the attributes
    // React is about to hydrate untouched.
    if (msg === "painted") box.animate({ backgroundColor: "transparent" }, { fill: "forwards" });
    if (msg === "done") finish();
  }

  try {
    if (!canvas.transferControlToOffscreen || !window.Worker) throw 0;
    var worker = new Worker(URL.createObjectURL(new Blob([
      "var go, run = " + run + ";" +
      "onmessage = function (e) {" +
      "  if (e.data === 'go') return go();" +
      "  go = run(e.data.canvas, e.data," +
      "    self.requestAnimationFrame ? requestAnimationFrame.bind(self) : function (f) { setTimeout(function () { f(performance.now()); }, 16); }," +
      "    function (m) { postMessage(m); if (m === 'done') close(); });" +
      "};"
    ], { type: "text/javascript" })));
    worker.onmessage = function (e) { on(e.data); };
    worker.onerror = finish; // a worker that never starts must not strand the page
    o.canvas = canvas.transferControlToOffscreen();
    worker.postMessage(o, [o.canvas]);
    ks.go = function () { worker.postMessage("go"); };
  } catch (e) {
    ks.go = run(canvas, o, requestAnimationFrame, on);
  }
})();`;

/**
 * The KS mark draws itself, then the cut opens the page.
 *
 * Kept to ~1.5s — the brief bans long loading animations, and this exists to
 * introduce the motif, not to make anyone wait.
 *
 * It is visible in the server HTML, so a first load or refresh never shows the
 * page before the loader. CSS (.ks-loader) keeps it away from no-JS and
 * reduced-motion visitors and clears it if JS never arrives.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = root.current;
    const ks = window.ksLoader;
    // Hidden already means the CSS failsafe fired before hydration: skip the show.
    // No ksLoader means the inline script never ran (a client-side navigation here).
    if (prefersReduced() || !el || !ks || getComputedStyle(el).visibility === "hidden") {
      return setDone(true);
    }

    el.style.animation = "none"; // JS owns it from here; the failsafe is only for no JS
    const html = document.documentElement;
    html.style.overflow = "hidden";

    let live = true;
    ks.go();
    ks.done.then(() => {
      if (!live) return;
      html.style.overflow = "";
      setDone(true);
    });

    return () => {
      live = false;
      html.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="ks-loader fixed inset-0 z-[var(--z-loader)] bg-ink text-paper"
    >
      {/* Sized by the inline script before hydration, so its width and height
          attributes never match the server's bare tag. */}
      <canvas suppressHydrationWarning className="absolute inset-0 block h-full w-full" />
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
    </div>
  );
}
