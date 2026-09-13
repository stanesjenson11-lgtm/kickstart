"use client";

import { useEffect, useRef } from "react";
import {
  Renderer,
  Camera,
  Transform,
  Mesh,
  Program,
  Geometry,
  Texture,
  Vec3,
  GLTFLoader,
  type OGLRenderingContext,
} from "ogl";
import { stageVertex, stageFragment } from "./stage-shaders";
import { buildProjector } from "./projector-model";
import { hero } from "@/lib/content";
import { shot } from "@/lib/shot";

/** The photo rig's CSS `perspective`, so the model and the photograph share a lens. */
const PERSPECTIVE = 1400;
const DEG = Math.PI / 180;
/** Along the machine toward the lens, leaning by the site's cut. */
const SEAM = [Math.cos(12 * DEG), Math.sin(12 * DEG), 0] as const;

/**
 * The modelled projector's pose at rest, matching the photograph: seen a little
 * from above (top tipped toward the viewer) with the lens end a touch further
 * away. Degrees, XYZ.
 */
const MODELLED_POSE = [16, 10, 0] as const;

type V3 = [number, number, number];

type Soup = {
  pos: Float32Array;
  nrm: Float32Array;
  uv: Float32Array;
  color?: Float32Array;
  glow?: Float32Array;
  shine?: Float32Array;
};

const hash = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/** Rotation matrix (column-major) for XYZ Euler angles in degrees. R = Rz * Ry * Rx. */
function euler(deg: readonly number[]) {
  const [x, y, z] = deg.map((d) => d * DEG);
  const cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y);
  const cz = Math.cos(z), sz = Math.sin(z);
  return [
    cy * cz, cy * sz, -sy,
    sx * sy * cz - cx * sz, sx * sy * sz + cx * cz, sx * cy,
    cx * sy * cz + sx * sz, cx * sy * sz - sx * cz, cx * cy,
  ];
}

/**
 * Into the photograph's space: turned by `pose`, centred, and scaled so the
 * machine is one unit across. Done once, on the data, so everything after — the
 * seam, the fit to the screen — can assume that space. `point` (the lens) is
 * carried through the same transform and returned.
 */
function normalise(soup: Soup, pose: readonly number[], point: readonly number[]): V3 {
  const r = euler(pose);
  const { pos, nrm } = soup;
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  const turn = (x: number, y: number, z: number): V3 => [
    r[0] * x + r[3] * y + r[6] * z,
    r[1] * x + r[4] * y + r[7] * z,
    r[2] * x + r[5] * y + r[8] * z,
  ];
  for (let i = 0; i < pos.length; i += 3) {
    const p = turn(pos[i], pos[i + 1], pos[i + 2]);
    const n = turn(nrm[i], nrm[i + 1], nrm[i + 2]);
    for (let k = 0; k < 3; k++) {
      pos[i + k] = p[k];
      nrm[i + k] = n[k];
      lo[k] = Math.min(lo[k], p[k]);
      hi[k] = Math.max(hi[k], p[k]);
    }
  }
  const mid = [0, 1, 2].map((k) => (lo[k] + hi[k]) / 2);
  const span = hi[0] - lo[0] || 1;
  for (let i = 0; i < pos.length; i += 3) {
    for (let k = 0; k < 3; k++) pos[i + k] = (pos[i + k] - mid[k]) / span;
  }
  const lp = turn(point[0], point[1], point[2]);
  return [(lp[0] - mid[0]) / span, (lp[1] - mid[1]) / span, (lp[2] - mid[2]) / span];
}

/** Plates per unit of machine: triangles sharing a cell fly home as one piece. */
const PLATES = 16;

/**
 * The mesh cut into plates. A generated model has tens of thousands of tiny
 * triangles, which flown one by one read as dust, so triangles are grouped by a
 * coarse grid; each group carries its shared centre and a random seed, and the
 * vertex shader flies it home as one rigid piece. A model without per-part
 * materials gets neutral ones.
 */
function panels(gl: OGLRenderingContext, soup: Soup) {
  const { pos, nrm, uv } = soup;
  const verts = pos.length / 3;
  const tris = verts / 3;
  const centroid = new Float32Array(verts * 3);
  const rand = new Float32Array(verts);

  const keyOf = new Int32Array(tris);
  const groups = new Map<number, number[]>();
  for (let t = 0; t < tris; t++) {
    const c = [0, 1, 2].map((k) => (pos[t * 9 + k] + pos[t * 9 + 3 + k] + pos[t * 9 + 6 + k]) / 3);
    const [gx, gy, gz] = c.map((x) => Math.floor(x * PLATES) + 64);
    const key = (gx * 128 + gy) * 128 + gz;
    keyOf[t] = key;
    const g = groups.get(key) ?? [0, 0, 0, 0];
    g[0] += c[0]; g[1] += c[1]; g[2] += c[2]; g[3]++;
    groups.set(key, g);
  }

  let lo = Infinity;
  let hi = -Infinity;
  for (const [key, g] of groups) {
    g[0] /= g[3]; g[1] /= g[3]; g[2] /= g[3];
    g[3] = hash(key);
    const along = g[0] * SEAM[0] + g[1] * SEAM[1] + g[2] * SEAM[2];
    lo = Math.min(lo, along);
    hi = Math.max(hi, along);
  }
  for (let t = 0; t < tris; t++) {
    const g = groups.get(keyOf[t])!;
    for (let k = 0; k < 3; k++) {
      centroid.set(g.slice(0, 3), (t * 3 + k) * 3);
      rand[t * 3 + k] = g[3];
    }
  }
  const geometry = new Geometry(gl, {
    position: { size: 3, data: pos },
    normal: { size: 3, data: nrm },
    uv: { size: 2, data: uv },
    color: { size: 3, data: soup.color ?? new Float32Array(verts * 3).fill(1) },
    glow: { size: 1, data: soup.glow ?? new Float32Array(verts) },
    shine: { size: 1, data: soup.shine ?? new Float32Array(verts).fill(0.3) },
    centroid: { size: 3, data: centroid },
    rand: { size: 1, data: rand },
  });
  return { geometry, seamMin: lo, seamMax: hi };
}

type GltfMaterial = {
  baseColorFactor?: number[];
  baseColorTexture?: { texture?: Texture };
};

/** A generated model, flattened into triangles in its world pose. */
async function loadModel(gl: OGLRenderingContext, src: string) {
  const gltf = await GLTFLoader.load(gl, src);
  gltf.scene?.forEach((node) => node.updateMatrixWorld());
  const prim = gltf.meshes?.[0]?.primitives?.[0] as Mesh | undefined;
  if (!prim) throw new Error("model has no mesh");

  const attr = prim.geometry.attributes;
  const P = attr.position.data as ArrayLike<number>;
  const N = attr.normal?.data as ArrayLike<number> | undefined;
  const T = attr.uv?.data as ArrayLike<number> | undefined;
  const I = attr.index?.data as ArrayLike<number> | undefined;
  const count = I ? I.length : P.length / 3;
  const m = prim.worldMatrix;

  const pos = new Float32Array(count * 3);
  const nrm = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  for (let k = 0; k < count; k++) {
    const v = I ? I[k] : k;
    const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
    pos[k * 3] = m[0] * x + m[4] * y + m[8] * z + m[12];
    pos[k * 3 + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    pos[k * 3 + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    if (N) {
      const nx = N[v * 3], ny = N[v * 3 + 1], nz = N[v * 3 + 2];
      nrm[k * 3] = m[0] * nx + m[4] * ny + m[8] * nz;
      nrm[k * 3 + 1] = m[1] * nx + m[5] * ny + m[9] * nz;
      nrm[k * 3 + 2] = m[2] * nx + m[6] * ny + m[10] * nz;
    }
    if (T) {
      uv[k * 2] = T[v * 2];
      uv[k * 2 + 1] = T[v * 2 + 1];
    }
  }
  if (!N) flatNormals(pos, nrm);

  const material = (prim.program as Program & { gltfMaterial?: GltfMaterial }).gltfMaterial;
  return {
    soup: { pos, nrm, uv } as Soup,
    map: material?.baseColorTexture?.texture ?? null,
    baseColor: material?.baseColorFactor ?? [1, 1, 1, 1],
  };
}

function flatNormals(pos: Float32Array, nrm: Float32Array) {
  for (let i = 0; i < pos.length; i += 9) {
    const ax = pos[i + 3] - pos[i], ay = pos[i + 4] - pos[i + 1], az = pos[i + 5] - pos[i + 2];
    const bx = pos[i + 6] - pos[i], by = pos[i + 7] - pos[i + 1], bz = pos[i + 8] - pos[i + 2];
    let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    for (let k = 0; k < 9; k += 3) nrm.set([nx, ny, nz], i + k);
  }
}

/**
 * The 3D projector: one fixed, transparent canvas drawing the machine into the
 * box ProjectorShot gives it, sharing the photograph's perspective so the two
 * line up at the hand-off. It also projects the lens to the screen every frame,
 * which is where the beam leaves from once the machine is in play.
 *
 * It draws the modelled projector (projector-model.ts). A generated model at
 * `hero.shot.model.src`, if one is ever supplied, takes its place.
 */
export default function ProjectorStage() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio, 1.5),
      });
    } catch {
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(gl.canvas);

    const camera = new Camera(gl, { near: 1, far: 8000 });
    camera.position.set(0, 0, PERSPECTIVE);
    const root = new Transform();
    const empty = new Transform();
    const cfg = hero.shot.model;
    const lens = new Vec3();
    let lensAt: V3 = [cfg.lens[0], cfg.lens[1], cfg.lens[2]];
    let mesh: Mesh | null = null;
    let seamMin = 0;
    let seamMax = 1;
    let disposed = false;

    const program = new Program(gl, {
      vertex: stageVertex,
      fragment: stageFragment,
      cullFace: false,
      uniforms: {
        tMap: { value: new Texture(gl) },
        uHasMap: { value: 0 },
        uBaseColor: { value: [1, 1, 1, 1] },
        uShade: { value: 1 },
        uSeamDir: { value: [...SEAM] },
        uSeamPos: { value: -10 },
        uBand: { value: cfg.band },
      },
    });

    const build = (soup: Soup, pose: readonly number[], lensPoint: readonly number[], map: Texture | null, baseColor: number[]) => {
      if (disposed) return;
      lensAt = normalise(soup, pose, lensPoint);
      const p = panels(gl, soup);
      seamMin = p.seamMin;
      seamMax = p.seamMax;
      if (map) {
        program.uniforms.tMap.value = map;
        program.uniforms.uHasMap.value = 1;
      }
      program.uniforms.uBaseColor.value = baseColor;
      mesh = new Mesh(gl, { geometry: p.geometry, program });
      mesh.setParent(root);
    };

    loadModel(gl, cfg.src)
      // A generated model's lens is given in its normalised space already, so
      // it is carried through an identity turn.
      .then(({ soup, map, baseColor }) => {
        build(soup, cfg.calib, [0, 0, 0], map, baseColor);
        lensAt = [cfg.lens[0], cfg.lens[1], cfg.lens[2]];
      })
      .catch(() => {
        const modelled = buildProjector();
        build(modelled, MODELLED_POSE, modelled.lens, null, [1, 1, 1, 1]);
      });

    const resize = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      renderer.setSize(W, H);
      camera.perspective({ aspect: W / H, fov: (2 * Math.atan(H / 2 / PERSPECTIVE)) / DEG });
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let idle = false;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const m = shot.model;
      if (!mesh || m.morph <= 0.0005 || m.w <= 1) {
        if (!idle) {
          renderer.render({ scene: empty, camera });
          shot.lens.ready = false;
          idle = true;
        }
        return;
      }
      idle = false;
      const W = window.innerWidth;
      const H = window.innerHeight;

      root.position.set(m.cx - W / 2, H / 2 - m.cy, m.z);
      root.scale.set(m.w, m.w, m.w);
      // Screen y runs down, world y up: CSS-style pitch and roll flip sign.
      root.rotation.set(-m.pitch * DEG, m.yaw * DEG, -m.roll * DEG);

      const band = cfg.band * (seamMax - seamMin);
      program.uniforms.uBand.value = band;
      program.uniforms.uSeamPos.value = seamMin - band + (seamMax - seamMin + 2 * band) * m.morph;
      program.uniforms.uShade.value = m.shade;

      renderer.render({ scene: root, camera });

      // Where the beam leaves from: the lens glass, through the same camera.
      lens.set(lensAt[0], lensAt[1], lensAt[2]).applyMatrix4(mesh.worldMatrix);
      camera.project(lens);
      shot.lens.x = ((lens.x + 1) / 2) * W;
      shot.lens.y = ((1 - lens.y) / 2) * H;
      shot.lens.ready = true;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      shot.lens.ready = false;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, []);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[var(--z-stage)]"
    />
  );
}
