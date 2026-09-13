export const beamVertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

/**
 * Projector light through haze.
 *
 * Worked in CSS pixels with the origin top-left, the same coordinates the page
 * reports the lens and the headline in, so the cone lands exactly where the DOM
 * says it should.
 *
 * Nothing here is a polygon. The cone is a distance field — how far a pixel is
 * from the beam's axis, against a radius that widens with distance from the
 * lens — and everything visible is what that light scatters off: an fbm haze
 * drifting away from the lens, a few motes caught in it, and the hot spot where
 * the light leaves the glass. The edge is a long smoothstep, so the boundary is
 * a falloff of scattered light, never a line.
 */
export const beamFragment = /* glsl */ `
  precision highp float;

  uniform vec2 uRes;      // canvas size in device pixels
  uniform float uScale;   // device pixels per CSS pixel
  uniform vec2 uOrigin;   // lens, CSS px
  uniform vec2 uTarget;   // where the light lands, CSS px
  uniform float uOn;      // intensity 0 → 1
  uniform float uReach;   // how far the light has travelled toward the target
  uniform float uSpread;  // cone half-angle, radians
  uniform float uTime;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

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

  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      sum += amp * vnoise(p);
      p = p * 2.03 + vec2(17.1, 9.2);
      amp *= 0.5;
    }
    return sum;
  }

  void main() {
    vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uScale;

    vec2 axis = uTarget - uOrigin;
    float len = max(length(axis), 1.0);
    vec2 dir = axis / len;
    vec2 v = p - uOrigin;
    float t = dot(v, dir);                        // distance along the beam
    float perp = abs(v.x * dir.y - v.y * dir.x);  // distance from its axis

    // The cone: the lens's own radius, widening with distance.
    float radius = 7.0 + max(t, 0.0) * tan(uSpread);
    float across = perp / radius;
    float edge = 1.0 - smoothstep(0.3, 1.0, across);
    float core = exp(-across * across * 3.2);

    // Leaves the lens, travels as far as uReach allows with a soft leading
    // front, and dies away just past where it lands.
    float front = uReach * len;
    float travelled = smoothstep(0.0, 16.0, t) * (1.0 - smoothstep(front - len * 0.14, front, t));
    float beyond = 1.0 - smoothstep(len, len * 1.14, t);
    float falloff = 1.0 / (1.0 + 1.4 * (t / len) * (t / len));

    // Haze: light is only seen where there is something to scatter off. The
    // field drifts away from the lens, so the air reads as moving through it.
    vec2 q = p / 150.0 - dir * uTime * 0.06;
    float density = 0.4 + 0.8 * fbm(q + vec2(0.0, uTime * 0.012));

    // Motes: sparse dust, only where the light catches it.
    vec2 cell = floor(p / 18.0);
    float h = hash(cell);
    vec2 spot = (cell + vec2(hash(cell + 3.1), hash(cell + 7.7))) * 18.0;
    float twinkle = 0.5 + 0.5 * sin(uTime * (1.3 + h * 2.7) + h * 40.0);
    float mote = step(0.975, h) * (1.0 - smoothstep(0.0, 1.8, length(p - spot))) * twinkle;

    // The glass: brightest where the light leaves the lens.
    float hot = exp(-max(t, 0.0) / 55.0) * exp(-across * across * 6.0);

    float light = (edge * 0.2 + core * 0.2) * density * falloff
                + mote * 0.5 * edge
                + hot * 0.55;
    light *= travelled * beyond * step(0.0, t) * uOn;

    // Slightly warm, the colour of a tungsten lamp rather than a screen white.
    vec3 col = vec3(1.0, 0.965, 0.9) * light;
    // Dither so the long soft gradients do not band on 8-bit output.
    col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
    gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
  }
`;
