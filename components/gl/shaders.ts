export const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

/**
 * The hero grade.
 *
 * A cross-dissolving montage of stills, treated as footage: monochrome grade,
 * halation bleeding out of the highlights, film grain, a vignette, an ink
 * displacement that follows the cursor, and a scroll-driven pinch that hands
 * the frame off to the next section.
 *
 * The drifting light streak is the KS bolt, drawn as a signed-distance field —
 * the logo appearing as a lens artefact rather than as a pasted-on mark. It is
 * the site's one "3D object", and it behaves like a light leak on a set, which
 * keeps it inside the brief's ban on spinning objects and particle effects.
 */
export const fragment = /* glsl */ `
  precision highp float;

  uniform sampler2D tA;
  uniform sampler2D tB;
  uniform vec2 uCoverA;
  uniform vec2 uCoverB;
  uniform float uMix;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uMouseAmt;
  uniform float uScroll;

  varying vec2 vUv;

  vec2 cover(vec2 uv, vec2 s) {
    return (uv - 0.5) * s + 0.5;
  }

  float luma(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // Grade both plates at one uv and blend them.
  float plate(vec2 uv) {
    float a = luma(texture2D(tA, cover(uv, uCoverA)).rgb);
    float b = luma(texture2D(tB, cover(uv, uCoverB)).rgb);
    return mix(a, b, uMix);
  }

  // Signed distance to a line segment — the bolt is built from four of them.
  float seg(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  float bolt(vec2 p) {
    float d = seg(p, vec2(0.10, 0.42), vec2(-0.10, 0.02));
    d = min(d, seg(p, vec2(-0.10, 0.02), vec2(0.02, 0.00)));
    d = min(d, seg(p, vec2(0.02, 0.00), vec2(-0.06, -0.40)));
    d = min(d, seg(p, vec2(-0.06, -0.40), vec2(0.12, 0.04)));
    return d;
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 uv = vUv;

    // Scroll hands the frame off: a slow pinch and push-in.
    uv.y = (uv.y - 0.5) / (1.0 - uScroll * 0.16) + 0.5;
    uv = (uv - 0.5) * (1.0 - uScroll * 0.06) + 0.5;

    // Ink displacement around the cursor — the image yields to it like wet film.
    vec2 m = uMouse;
    vec2 d = (uv - m) * vec2(aspect, 1.0);
    float dist = length(d);
    float pull = exp(-dist * 5.5) * uMouseAmt;
    uv -= normalize(d + 1e-6) * pull * 0.045;

    float base = plate(uv);

    // Halation: highlights bleed outward, the way film shoulders roll off.
    float halo = 0.0;
    for (int i = 0; i < 4; i++) {
      float a = float(i) * 1.5707963 + uTime * 0.05;
      vec2 o = vec2(cos(a), sin(a)) * 0.014 * vec2(1.0, aspect);
      halo += plate(uv + o);
    }
    halo *= 0.25;
    float lift = smoothstep(0.55, 1.0, halo);

    float c = base + lift * 0.22;

    // Contrast — high-contrast black and white is the brief's image treatment.
    c = clamp((c - 0.5) * 1.24 + 0.46, 0.0, 1.0);

    // The bolt drifts across the frame as a light streak.
    vec2 bp = (uv - 0.5) * vec2(aspect, 1.0);
    bp -= vec2(sin(uTime * 0.06) * 0.42, cos(uTime * 0.045) * 0.14);
    float bd = bolt(bp * 1.5);
    float streak = smoothstep(0.055, 0.0, bd);
    c += streak * (0.05 + 0.05 * sin(uTime * 0.7)) * (1.0 - uScroll);

    // Vignette keeps the eye centred on the headline.
    float v = smoothstep(1.15, 0.28, length((vUv - 0.5) * vec2(aspect, 1.0)));
    c *= mix(0.42, 1.0, v);

    // Scroll dims the plate so the headline stays legible as it compresses.
    c *= 1.0 - uScroll * 0.45;

    // Grain, resolution-independent so it does not swim on retina.
    float g = hash(floor(gl_FragCoord.xy * 0.85) + fract(uTime) * 91.7);
    c += (g - 0.5) * 0.075;

    gl_FragColor = vec4(vec3(clamp(c, 0.0, 1.0)), 1.0);
  }
`;
