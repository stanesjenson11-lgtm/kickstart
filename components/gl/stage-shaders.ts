/**
 * The projector assembling, and lit.
 *
 * Every triangle arrives as its own plate. A seam sweeps along the machine at
 * the site's 12° cut; each plate's distance from it decides how far through its
 * journey it is. Behind the seam a plate is home. Ahead of it the plate is out
 * past the machine's surface, shrunk and tumbling on its own axis, and it flies
 * in, turning and growing, as the seam reaches it — the suit closing up rather
 * than a dissolve. Where plates lock in, a thin hot edge the colour of the lamp.
 */
export const stageVertex = /* glsl */ `
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;
  attribute vec3 color;
  attribute float glow;
  attribute float shine;
  attribute vec3 centroid;
  attribute float rand;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  uniform vec3 uSeamDir;
  uniform float uSeamPos;
  uniform float uBand;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vGlow;
  varying float vShine;
  varying float vHome;
  varying float vSeam;

  mat3 rotAxis(vec3 axis, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat3(
      oc * axis.x * axis.x + c,           oc * axis.x * axis.y + axis.z * s,  oc * axis.z * axis.x - axis.y * s,
      oc * axis.x * axis.y - axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z + axis.x * s,
      oc * axis.z * axis.x + axis.y * s,  oc * axis.y * axis.z - axis.x * s,  oc * axis.z * axis.z + c
    );
  }

  void main() {
    // Distance past the seam, jittered per plate so the front is ragged rather
    // than a clean slice through the machine.
    float d = dot(centroid, uSeamDir) - uSeamPos + (rand - 0.5) * uBand * 0.6;
    float home = 1.0 - smoothstep(-uBand, 0.0, d);
    float away = 1.0 - home;

    // Each plate turns about its own centre, on its own axis, as it travels.
    vec3 local = position - centroid;
    vec3 axis = normalize(vec3(rand - 0.5, 0.7, fract(rand * 7.31) - 0.5));
    local = rotAxis(axis, away * (2.4 + rand * 2.2)) * local;
    local *= mix(1.0, 0.3, away);

    // Out from the machine's centre and a little toward the viewer, coming home
    // on an ease so the last stretch is slow and the lock-in reads. Shared by
    // the whole plate, so it travels as one piece.
    vec3 dir = normalize(centroid + vec3(0.0, 0.18, 0.4));
    vec3 p = centroid + local + dir * away * away * (0.45 + rand * 0.45);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vView = -mv.xyz;
    vColor = color;
    vGlow = glow;
    vShine = shine;
    vHome = home;
    vSeam = 1.0 - smoothstep(0.0, uBand * 0.3, abs(d));
    gl_Position = projectionMatrix * mv;
  }
`;

export const stageFragment = /* glsl */ `
  precision highp float;

  uniform sampler2D tMap;
  uniform float uHasMap;
  uniform vec4 uBaseColor;
  uniform float uShade;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vGlow;
  varying float vShine;
  varying float vHome;
  varying float vSeam;

  void main() {
    if (vHome < 0.015) discard;

    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    // The photograph's own light: a key high and in front from the viewer's
    // left, held fixed in the room while the machine turns under it.
    vec3 key = normalize(vec3(-0.45, 0.75, 0.55));
    vec3 fill = normalize(vec3(0.6, -0.1, 0.45));
    float diff = max(dot(n, key), 0.0);
    float low = max(dot(n, fill), 0.0);
    float spec = pow(max(dot(n, normalize(key + v)), 0.0), mix(10.0, 96.0, vShine)) * vShine;
    float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);

    vec3 col;
    if (uHasMap > 0.5) {
      // A generated model: its texture already carries the photograph's
      // shading, so light only modulates it.
      vec3 albedo = texture2D(tMap, vUv).rgb * uBaseColor.rgb;
      col = albedo * (0.72 + 0.38 * diff) + spec * 0.15;
    } else {
      // Modelled: lit for real — the key, a low warm fill from the lens side,
      // a cool rim off the dark set, and highlights on the metal.
      col = vColor * (0.16 + 0.95 * diff + 0.22 * low * vec3(1.0, 0.92, 0.8))
          + vec3(1.0, 0.97, 0.92) * spec * 0.9
          + vec3(0.55, 0.6, 0.7) * rim * 0.22 * (0.3 + vShine);
    }
    // Lamp-lit parts — the vents, the lens glass — glow on their own.
    col = mix(col, vColor * 1.15, vGlow);

    // The plate's grade, so the machine and the photograph it came from match.
    col = clamp((col - 0.5) * 1.12 + 0.5, 0.0, 1.0) * 0.96 * uShade;

    // The hot edge where plates lock in.
    col += vec3(1.0, 0.94, 0.82) * vSeam * 0.85;

    // Plates still arriving are thinner. Premultiplied, for the canvas.
    float alpha = smoothstep(0.015, 0.3, vHome);
    gl_FragColor = vec4(col * alpha, alpha);
  }
`;
