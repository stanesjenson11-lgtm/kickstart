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
  /* Fog boundary in texture x: (ramp start, fully on). Set per plate, because
     the lens is not in the same place in the landscape and portrait frames. */
  uniform vec2 uFog;
  /* The projector shot. tMask is a soft matte of the projector in plate texture
     space; uLift is how far the projector has left the photograph. Where both
     are on, the patch it vacates is filled. */
  uniform sampler2D tMask;
  uniform float uLift;

  /* How far the smoke is pushed, in uv. The previous 0.024 worked out to about
     five pixels of travel on a phone over ten seconds, which is invisible —
     this is the one number to turn if the plume wants more or less life. */
  const float SMOKE = 0.085;


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

  // Value noise off the same hash, smoothstepped at the cell edges so the field
  // is continuous — a raw hash per cell would read as flicker, not as drift.
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Sample both plates at one uv and blend them. Full colour — luma survives
  // only to drive halation, which keys off brightness, not hue.
  vec3 plate(vec2 uv) {
    vec3 a = texture2D(tA, cover(uv, uCoverA)).rgb;
    // Holding on one plate — always, with a single plate — the second tap adds
    // nothing, and plate() runs five times a pixel.
    if (uMix <= 0.0) return a;
    vec3 b = texture2D(tB, cover(uv, uCoverB)).rgb;
    return mix(a, b, uMix);
  }

  /* The set behind the projector, which the photograph never recorded. Rebuilt
     from two rings of taps outside the matte, each weighted by how far outside
     it lies so the machine's own pixels never bleed back in, then pulled down
     toward a set whose key light has just been carried away. Two rings of eight
     keeps it to sixteen taps — this runs across a patch of the hero every frame. */
  vec3 vacated(vec2 tc) {
    vec3 acc = vec3(0.0);
    float wsum = 0.0;
    for (int ring = 1; ring <= 2; ring++) {
      float r = 0.06 * float(ring);
      for (int k = 0; k < 8; k++) {
        float ang = float(k) * 0.7853982 + float(ring) * 0.39;
        vec2 p = tc + vec2(cos(ang), sin(ang)) * r;
        float outside = 1.0 - texture2D(tMask, p).r;
        float w = outside * outside;
        acc += texture2D(tA, p).rgb * w;
        wsum += w;
      }
    }
    return (wsum > 0.001 ? acc / wsum : vec3(0.0)) * 0.35;
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

    /* Only the fog past the lens moves.

       Masked in texture space, not screen space, so the boundary stays on the
       lens whatever the crop: uFog gates it by x, and brightness
       gates it again so the dark surround to the right of the beam stays still
       too. The projector, its casing and the lens fall entirely outside the
       mask and render exactly as before. */
    vec2 tc = cover(uv, uCoverA);
    float lit = luma(texture2D(tA, tc).rgb);
    float fog = smoothstep(uFog.x, uFog.y, tc.x) * smoothstep(0.18, 0.62, lit);

    /* Left to right: subtracting time from the x argument translates the noise
       field in +x, so its features march away from the lens. Two octaves at
       different scales and speeds keep it from sliding as one sheet.

       The push is mostly horizontal — a little y keeps it from looking like a
       sideways wipe, but the travel is along the beam. */
    float n1 = vnoise(vec2(tc.x * 2.4 - uTime * 0.050, tc.y * 3.6));
    float n2 = vnoise(vec2(tc.x * 5.0 - uTime * 0.085, tc.y * 6.4 + 3.7));
    vec2 push = vec2((n1 - 0.5) + (n2 - 0.5) * 0.5, (n2 - 0.5) * 0.28);

    vec2 huv = uv + push * SMOKE * fog;

    vec3 base = plate(huv);

    // Where the projector has lifted away, the plate shows the set behind it.
    float hole = texture2D(tMask, tc).r * uLift;
    if (hole > 0.002) base = mix(base, vacated(tc), hole);

    // Halation: highlights bleed outward, the way film shoulders roll off. The
    // bleed is driven by the blurred sample's brightness, so it reads off luma
    // while the colour it lifts stays the plate's own. Sampled off the warped
    // uv so the bloom travels with the fog; past the mask huv equals uv, so the
    // projector's own highlights bloom exactly where they did.
    vec3 halo = vec3(0.0);
    for (int i = 0; i < 4; i++) {
      float a = float(i) * 1.5707963 + uTime * 0.05;
      vec2 o = vec2(cos(a), sin(a)) * 0.014 * vec2(1.0, aspect);
      halo += plate(huv + o);
    }
    halo *= 0.25;
    // The vacated patch must not keep glowing from the projector that left it.
    float lift = smoothstep(0.55, 1.0, luma(halo)) * (1.0 - hole);

    vec3 c = base + lift * 0.22;

    // Gentler than the 1.24 the monochrome grade used: the same curve on colour
    // crushes the shadows and oversaturates everything it lifts.
    c = clamp((c - 0.5) * 1.12 + 0.48, 0.0, 1.0);

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

    gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
  }
`;
