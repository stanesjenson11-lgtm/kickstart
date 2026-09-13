/**
 * A Dukane filmstrip projector, modelled in code.
 *
 * Built from the photographed machine's own proportions: every part below is
 * measured off the 1400px desktop cutout (x to the right, y down, in pixels)
 * and given a depth, so from the photographed angle its silhouette lands close
 * to the photograph it takes over from. It is an object, not a picture — each
 * part has its own material and the stage lights it — so it turns like a
 * machine rather than a card.
 *
 * Units are cutout pixels / 1000 with y up. ProjectorStage turns, centres and
 * scales the result to one unit across, carrying the lens point with it.
 */

type V3 = [number, number, number];

type Material = { color: V3; glow?: number; shine?: number };

export type ProjectorSoup = {
  pos: Float32Array;
  nrm: Float32Array;
  uv: Float32Array;
  color: Float32Array;
  glow: Float32Array;
  shine: Float32Array;
  /** The centre of the lens glass, where the beam leaves from. */
  lens: V3;
};

/** Cutout pixels (y down) to model units (y up). */
const px = (x: number, y: number, z: number): V3 => [x / 1000, -y / 1000, z / 1000];

export function buildProjector(): ProjectorSoup {
  const pos: number[] = [];
  const nrm: number[] = [];
  const uv: number[] = [];
  const color: number[] = [];
  const glow: number[] = [];
  const shine: number[] = [];

  const vert = (p: V3, n: V3, m: Material) => {
    pos.push(p[0], p[1], p[2]);
    nrm.push(n[0], n[1], n[2]);
    uv.push(0, 0);
    color.push(m.color[0], m.color[1], m.color[2]);
    glow.push(m.glow ?? 0);
    shine.push(m.shine ?? 0.3);
  };

  /** A face cut into a grid, so the assembly has plates to fly in. */
  const face = (o: V3, du: V3, dv: V3, n: V3, m: Material, su: number, sv: number) => {
    const at = (a: number, b: number): V3 => [
      o[0] + du[0] * a + dv[0] * b,
      o[1] + du[1] * a + dv[1] * b,
      o[2] + du[2] * a + dv[2] * b,
    ];
    for (let i = 0; i < su; i++) {
      for (let j = 0; j < sv; j++) {
        const c = [at(i / su, j / sv), at((i + 1) / su, j / sv), at((i + 1) / su, (j + 1) / sv), at(i / su, (j + 1) / sv)];
        for (const k of [0, 1, 2, 0, 2, 3]) vert(c[k], n, m);
      }
    }
  };

  /** A box between two corners in cutout pixels, with its own material on top. */
  const box = (a: V3, b: V3, m: Material, top: Material = m, seg = 3) => {
    const [x0, y0, z0] = px(Math.min(a[0], b[0]), Math.max(a[1], b[1]), Math.min(a[2], b[2]));
    const [x1, y1, z1] = px(Math.max(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]));
    const sx = x1 - x0;
    const sy = y1 - y0;
    const sz = z1 - z0;
    face([x0, y0, z1], [sx, 0, 0], [0, sy, 0], [0, 0, 1], m, seg, seg);
    face([x1, y0, z0], [-sx, 0, 0], [0, sy, 0], [0, 0, -1], m, seg, seg);
    face([x0, y0, z0], [0, 0, sz], [0, sy, 0], [-1, 0, 0], m, seg, seg);
    face([x1, y0, z1], [0, 0, -sz], [0, sy, 0], [1, 0, 0], m, seg, seg);
    face([x0, y1, z1], [sx, 0, 0], [0, 0, -sz], [0, 1, 0], top, seg, seg);
    face([x0, y0, z0], [sx, 0, 0], [0, 0, sz], [0, -1, 0], m, seg, seg);
  };

  /** A capped cylinder: centre in cutout pixels, radius and length in pixels. */
  const cylinder = (
    c: V3, axis: "x" | "y" | "z", r: number, len: number, m: Material, cap: Material = m, segs = 28,
  ) => {
    const o = px(c[0], c[1], c[2]);
    const R = r / 1000;
    const L = len / 1000;
    const A: V3 = axis === "x" ? [1, 0, 0] : axis === "y" ? [0, 1, 0] : [0, 0, 1];
    const U: V3 = axis === "x" ? [0, 1, 0] : [1, 0, 0];
    const W: V3 = axis === "z" ? [0, 1, 0] : [0, 0, 1];
    const radial = (ang: number): V3 => [
      U[0] * Math.cos(ang) + W[0] * Math.sin(ang),
      U[1] * Math.cos(ang) + W[1] * Math.sin(ang),
      U[2] * Math.cos(ang) + W[2] * Math.sin(ang),
    ];
    const at = (ang: number, t: number): V3 => {
      const d = radial(ang);
      return [o[0] + A[0] * t + d[0] * R, o[1] + A[1] * t + d[1] * R, o[2] + A[2] * t + d[2] * R];
    };
    const end = (t: number): V3 => [o[0] + A[0] * t, o[1] + A[1] * t, o[2] + A[2] * t];
    const back: V3 = [-A[0], -A[1], -A[2]];
    for (let s = 0; s < segs; s++) {
      const a0 = (s / segs) * Math.PI * 2;
      const a1 = ((s + 1) / segs) * Math.PI * 2;
      const t0 = -L / 2;
      const t1 = L / 2;
      vert(at(a0, t0), radial(a0), m); vert(at(a1, t0), radial(a1), m); vert(at(a1, t1), radial(a1), m);
      vert(at(a0, t0), radial(a0), m); vert(at(a1, t1), radial(a1), m); vert(at(a0, t1), radial(a0), m);
      vert(end(t1), A, cap); vert(at(a0, t1), A, cap); vert(at(a1, t1), A, cap);
      vert(end(t0), back, m); vert(at(a1, t0), back, m); vert(at(a0, t0), back, m);
    }
  };

  const tray: Material = { color: [0.12, 0.12, 0.13], shine: 0.25 };
  const trayTop: Material = { color: [0.38, 0.37, 0.355], shine: 0.3 };
  const body: Material = { color: [0.075, 0.075, 0.082], shine: 0.35 };
  const silver: Material = { color: [0.6, 0.58, 0.54], shine: 0.75 };
  const vent: Material = { color: [0.96, 0.95, 0.9], glow: 0.85, shine: 0.2 };
  const label: Material = { color: [0.028, 0.028, 0.032], shine: 0.55 };
  const barrel: Material = { color: [0.2, 0.2, 0.22], shine: 0.8 };
  const glass: Material = { color: [1, 0.98, 0.92], glow: 1 };
  const cream: Material = { color: [0.86, 0.83, 0.75], glow: 0.18, shine: 0.4 };
  const knob: Material = { color: [0.62, 0.07, 0.05], shine: 0.65 };
  const rubber: Material = { color: [0.04, 0.04, 0.045], shine: 0.1 };
  const indicator = (c: V3): Material => ({ color: c, glow: 0.45, shine: 0.5 });

  // The base tray: wide, low, deeper than the body, its top rim catching the key.
  box([20, 1010, -270], [1290, 1240, 270], tray, trayTop, 4);
  for (const [fx, fz] of [[120, -200], [120, 200], [980, -200], [980, 200]]) {
    cylinder([fx, 1265, fz], "y", 34, 50, rubber, rubber, 16);
  }
  // The main body, and the lit vent slats across its top.
  box([120, 190, -215], [760, 1010, 215], body, body, 4);
  for (let i = 0; i < 11; i++) {
    box([150 + i * 52, 182, -195], [178 + i * 52, 190, 195], vent, vent, 1);
  }
  // The silver tower carrying the controls, and the lens housing set on it.
  box([560, 200, -150], [980, 1010, 235], silver, silver, 4);
  box([930, 110, -130], [1230, 470, 170], silver, silver, 3);
  // The black control label and its three indicators: focus, advance, frame.
  box([720, 380, 235], [866, 738, 241], label, label, 2);
  cylinder([744, 597, 244], "z", 9, 6, indicator([0.85, 0.12, 0.08]), undefined, 14);
  cylinder([744, 636, 244], "z", 9, 6, indicator([0.12, 0.6, 0.28]), undefined, 14);
  cylinder([744, 676, 244], "z", 9, 6, indicator([0.95, 0.72, 0.12]), undefined, 14);
  // The focus knob.
  cylinder([1043, 671, 255], "z", 42, 40, knob, knob, 24);
  // The lens barrel, its glass lit from the lamp behind it.
  cylinder([1225, 507, 20], "x", 106, 230, barrel, glass, 36);
  // The cream lamp housing below the lens.
  cylinder([1170, 865, 90], "y", 150, 190, cream, cream, 36);

  return {
    pos: new Float32Array(pos),
    nrm: new Float32Array(nrm),
    uv: new Float32Array(uv),
    color: new Float32Array(color),
    glow: new Float32Array(glow),
    shine: new Float32Array(shine),
    lens: px(1340, 507, 20),
  };
}
