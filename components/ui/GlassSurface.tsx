"use client";

import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

type Props = {
  children?: ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  /**
   * Channel offsets. Equal values on purpose: splitting them is what produces
   * the rainbow fringe on the usual "liquid glass" demo, and this brand is
   * monochrome. Same displacement per channel gives refraction with no colour.
   */
  channelOffset?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Can `backdrop-filter` take an SVG filter reference on this browser?
 *
 * Cached at module scope so the snapshot is stable across renders, and read
 * through useSyncExternalStore so the server and the first client render agree
 * (both say "no") and the refraction is switched on only after hydration.
 */
let refractSupport: boolean | null = null;

function detectRefraction(): boolean {
  if (refractSupport !== null) return refractSupport;
  if (typeof document === "undefined") return false;
  const probe = document.createElement("div");
  probe.style.backdropFilter = "url(#ks-probe)";
  const ua = navigator.userAgent;
  const isWebkit = /Safari/.test(ua) && !/Chrome|Chromium/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  refractSupport = probe.style.backdropFilter !== "" && !isWebkit && !isFirefox;
  return refractSupport;
}

const noopSubscribe = () => () => {};

/**
 * Refractive glass panel — an edge displacement map fed to `backdrop-filter`,
 * so what is behind the panel bends around its rim instead of merely blurring.
 *
 * Adapted from React Bits' GlassSurface for this project: TypeScript, no
 * chromatic aberration (see `channelOffset`), and the frost tuned for a
 * permanently dark ground rather than `light-dark()`.
 *
 * The SVG path is Chrome-only; Safari and Firefox get a plain blurred pane,
 * which is the same affordance without the refraction.
 */
export default function GlassSurface({
  children,
  width = "100%",
  height = "auto",
  borderRadius = 999,
  borderWidth = 0.07,
  brightness = 60,
  opacity = 0.9,
  blur = 11,
  displace = 0.4,
  backgroundOpacity = 0.06,
  saturation = 1,
  distortionScale = -140,
  channelOffset = 12,
  className = "",
  style = {},
}: Props) {
  const uid = useId().replace(/:/g, "-");
  const filterId = `glass-${uid}`;
  const edgeId = `glass-edge-${uid}`;
  const faceId = `glass-face-${uid}`;

  const container = useRef<HTMLDivElement>(null);
  const feImage = useRef<SVGFEImageElement>(null);
  const dispR = useRef<SVGFEDisplacementMapElement>(null);
  const dispG = useRef<SVGFEDisplacementMapElement>(null);
  const dispB = useRef<SVGFEDisplacementMapElement>(null);
  const gauss = useRef<SVGFEGaussianBlurElement>(null);

  // Feature-detect rather than sniff: if backdrop-filter will not take an SVG
  // filter reference, the refraction cannot work and the plain pane stands in.
  const refractive = useSyncExternalStore(noopSubscribe, detectRefraction, () => false);

  useEffect(() => {
    const el = container.current;
    if (!el) return;

    const paint = () => {
      const r = el.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width));
      const h = Math.max(1, Math.round(r.height));
      const edge = Math.min(w, h) * (borderWidth * 0.5);

      // A luminance map: bright rim, dark middle. The rim is what bends light.
      const svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${edgeId}" x1="100%" y1="0%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/>
    </linearGradient>
    <linearGradient id="${faceId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="black"/>
  <rect width="${w}" height="${h}" rx="${borderRadius}" fill="url(#${edgeId})"/>
  <rect width="${w}" height="${h}" rx="${borderRadius}" fill="url(#${faceId})" style="mix-blend-mode:difference"/>
  <rect x="${edge}" y="${edge}" width="${w - edge * 2}" height="${h - edge * 2}" rx="${borderRadius}"
        fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)"/>
</svg>`;
      feImage.current?.setAttribute("href", `data:image/svg+xml,${encodeURIComponent(svg)}`);

      for (const ref of [dispR, dispG, dispB]) {
        ref.current?.setAttribute("scale", String(distortionScale + channelOffset));
      }
      gauss.current?.setAttribute("stdDeviation", String(displace));
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(el);
    return () => ro.disconnect();
  }, [
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    distortionScale,
    channelOffset,
    edgeId,
    faceId,
  ]);

  return (
    <div
      ref={container}
      className={`ks-glass ${refractive ? "ks-glass--refract" : "ks-glass--pane"} ${className}`}
      style={
        {
          ...style,
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
          borderRadius,
          "--glass-frost": backgroundOpacity,
          "--glass-sat": saturation,
          "--glass-filter": `url(#${filterId})`,
        } as CSSProperties
      }
    >
      <svg className="ks-glass__svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feImage ref={feImage} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
            <feDisplacementMap ref={dispR} in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" result="dR" />
            <feColorMatrix in="dR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="cR" />
            <feDisplacementMap ref={dispG} in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" result="dG" />
            <feColorMatrix in="dG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="cG" />
            <feDisplacementMap ref={dispB} in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" result="dB" />
            <feColorMatrix in="dB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cB" />
            <feBlend in="cR" in2="cG" mode="screen" result="rg" />
            <feBlend in="rg" in2="cB" mode="screen" result="out" />
            <feGaussianBlur ref={gauss} in="out" stdDeviation="0.4" />
          </filter>
        </defs>
      </svg>
      <div className="ks-glass__content">{children}</div>
    </div>
  );
}
