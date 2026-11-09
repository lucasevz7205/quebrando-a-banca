export const passVertex = `
varying vec2 uvPass;
void main() {
  uvPass = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

export const fluidFragment = `
varying vec2 uvPass;
uniform sampler2D field, velocity, scalar;
uniform vec2 texel, startPoint, endPoint;
uniform vec3 impulse;
uniform float radius, aspect, decay;
uniform int operation;
vec2 flow(vec2 uv) { return texture2D(velocity, uv).xy; }
float value(vec2 uv) { return texture2D(scalar, uv).x; }
void main() {
  vec2 uv = uvPass;
  vec2 x = vec2(texel.x, 0.0), y = vec2(0.0, texel.y);
  vec4 old = texture2D(field, uv);
  vec3 outValue = vec3(0.0);
  if (operation == 0) {
    vec2 ratio = vec2(aspect, 1.0);
    vec2 segment = (endPoint - startPoint) * ratio;
    vec2 offset = (uv - startPoint) * ratio;
    float t = clamp(dot(offset, segment) / max(dot(segment, segment), 0.00000001), 0.0, 1.0);
    vec2 delta = offset - segment * t;
    outValue = clamp(old.rgb + impulse * exp(-dot(delta, delta) / max(radius * radius, 0.00000001)), -500.0, 500.0);
  } else if (operation == 1) {
    outValue.x = 0.5 * (flow(uv + x).y - flow(uv - x).y - flow(uv + y).x + flow(uv - y).x);
  } else if (operation == 2) {
    vec2 n = 0.5 * vec2(abs(value(uv + y)) - abs(value(uv - y)), abs(value(uv - x)) - abs(value(uv + x)));
    outValue.xy = clamp(flow(uv) + n / max(length(n), 0.0001) * value(uv) * 30.0 / 60.0, -500.0, 500.0);
  } else if (operation == 3) {
    vec2 c = flow(uv);
    float l = uv.x < texel.x ? -c.x : flow(uv - x).x;
    float r = uv.x > 1.0 - texel.x ? -c.x : flow(uv + x).x;
    float b = uv.y < texel.y ? -c.y : flow(uv - y).y;
    float t = uv.y > 1.0 - texel.y ? -c.y : flow(uv + y).y;
    outValue.x = 0.5 * (r - l + t - b);
  } else if (operation == 4) {
    outValue = old.rgb * decay;
  } else if (operation == 5) {
    outValue.x = 0.25 * (value(uv - x) + value(uv + x) + value(uv - y) + value(uv + y) - old.x);
  } else if (operation == 6) {
    outValue.xy = flow(uv) - vec2(value(uv + x) - value(uv - x), value(uv + y) - value(uv - y));
  } else if (operation == 7) {
    outValue = texture2D(field, uv - flow(uv) * texel / 60.0).rgb * decay;
  } else {
    float density = clamp(max(old.r, max(old.g, old.b)), 0.0, 1.0);
    gl_FragColor = vec4(vec3(density), density);
    return;
  }
  gl_FragColor = vec4(outValue, 1.0);
}`;

export const positionFragment = `
varying vec2 uvPass;
uniform sampler2D field, origin, velocity, mask;
uniform mat4 viewProjection, shapeWorld, cameraWorld;
uniform float clockTime, hz;

float shape(vec3 p) {
  if (length(p) > 0.8) return length(p) - 0.7;
  p.z = sqrt(p.z * p.z + 0.0215) - sqrt(0.012);
  p = p.zxy;
  vec2 plane = vec2(p.y * 0.91, p.z * 1.08);
  float a = atan(plane.y, plane.x);
  float lobe = 0.241 + 0.029 * sin(2.0 * a + 0.3) + 0.018 * sin(3.0 * a - 0.4);
  float depth = p.x - 0.081 - 0.036 * sin(2.0 * a + 0.8);
  float tube = 0.063 + 0.017 * cos(3.0 * a + 0.6);
  return length(vec2(length(plane) - lobe, depth * 1.22)) - tube;
}
vec3 normalAt(vec3 p) {
  const vec2 h = vec2(0.001, 0.0);
  vec3 g = vec3(shape(p + h.xyy) - shape(p - h.xyy),
    shape(p + h.yxy) - shape(p - h.yxy), shape(p + h.yyx) - shape(p - h.yyx));
  return g / max(length(g), 0.00001);
}
vec3 curlAt(vec3 p) {
  vec3 a = vec3(2.3, 1.4, -1.9), b = vec3(-1.2, 2.7, 1.8), c = vec3(1.9, -2.1, 2.2);
  vec3 ax = a * cos(dot(p,a)) + c * 0.6 * cos(dot(p,c) + 2.0);
  vec3 ay = b * cos(dot(p,b) + 1.0) + a * 0.7 * cos(dot(p,a) - 1.0);
  vec3 az = c * cos(dot(p,c) + 3.0) + b * 0.8 * cos(dot(p,b) + 0.2);
  vec3 curl = vec3(az.y - ay.z, ax.z - az.x, ay.x - ax.y);
  return curl / max(length(curl), 0.00001);
}
void main() {
  vec3 p = texture2D(field, uvPass).xyz;
  vec3 home = texture2D(origin, uvPass).xyz;
  if (length(p) > 0.7) p *= 0.5;
  p += curlAt(p * 0.1 + clockTime * 0.05) * 0.0002 * hz;
  vec3 normal = normalAt(p);
  p += cross(p / max(length(p), 0.00001), normal) * 0.0005 * hz;
  p -= normal * shape(p) * (1.0 - pow(0.5, hz));
  p += (home - p) * 0.0002 * hz;
  vec4 clip = viewProjection * shapeWorld * vec4(p, 1.0);
  vec2 screen = clip.xy / max(clip.w, 0.0001) * 0.5 + 0.5;
  if (all(greaterThanEqual(screen, vec2(0.0))) && all(lessThanEqual(screen, vec2(1.0)))) {
    vec3 wind = mat3(cameraWorld) * vec3(texture2D(velocity, screen).xy, 0.0);
    p += wind * (0.0001 * 0.4 * hz * texture2D(mask, screen).r);
  }
  gl_FragColor = vec4(p, 1.0);
}`;

export const pointVertex = `
attribute vec4 random;
uniform sampler2D field;
uniform float pixelRatio;
varying vec4 seed;
varying float pointScale;
void main() {
  seed = random;
  vec3 p = texture2D(field, position.xy).xyz;
  p *= mix(1.0, 1.5, pow(random.y, 150.0));
  vec4 view = modelViewMatrix * vec4(p, 1.0);
  float distanceToCamera = max(0.1, length(view.xyz));
  pointScale = smoothstep(3.0, 15.0, distanceToCamera) * mix(0.5, 1.0, random.z);
  gl_PointSize = 0.04 * pixelRatio * 2.0 * pointScale * (1000.0 / distanceToCamera);
  gl_Position = projectionMatrix * view;
}`;

export const pointFragment = `
uniform sampler2D matcap;
uniform float clockTime;
varying vec4 seed;
varying float pointScale;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float r = length(p);
  if (r > 0.5 || pointScale < 0.1) discard;
  float a = sin(clockTime + seed.z * 20.0) * 0.5 + 1.0;
  float shade = texture2D(matcap, mat2(cos(a), -sin(a), sin(a), cos(a)) * p + 0.5).r;
  vec3 color = mix(vec3(mix(0.0, 0.2, seed.x)), vec3(0.6, 0.45, 1.0), pow(seed.z, 100.0));
  vec3 soft = (1.0 - 2.0 * shade) * color * color + 2.0 * shade * color;
  color = mix(color, soft, 0.8);
  vec3 overlay = mix(2.0 * shade * color, 1.0 - 2.0 * (1.0 - shade) * (1.0 - color), step(0.5, color));
  color = mix(color, overlay, 0.2);
  float sparkle = 0.5 + (0.4 + sin(clockTime * 4.0 + seed.y * 20.0)) * pow(seed.z, 10.0) * 2.5;
  gl_FragColor = vec4(color * max(0.08, sparkle) * (1.0 - smoothstep(0.32, 0.5, r)), 1.0);
}`;
