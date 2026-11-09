import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Camera, CanvasTexture, DataTexture, FloatType,
  Group, HalfFloatType, LinearFilter, Matrix4, Mesh, NearestFilter, PerspectiveCamera, PlaneGeometry, Points,
  RGBAFormat, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget,
} from "three";
import { fluidFragment, passVertex, pointFragment, pointVertex, positionFragment } from "./shaders";

const value = initial => ({ value: initial });
const clamp01 = n => Math.max(0, Math.min(1, n));

function sphereTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(24, 21, 3, 35, 36, 36);
  gradient.addColorStop(0, "#eee");
  gradient.addColorStop(0.48, "#b4b4b4");
  gradient.addColorStop(0.83, "#666");
  gradient.addColorStop(1, "#292929");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(canvas);
}

export function startMotion(canvas) {
  const context = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "high-performance" });
  if (!context?.getExtension("EXT_color_buffer_float")) return null;
  const renderer = new WebGLRenderer({ canvas, context, alpha: false, antialias: false });
  const mobile = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
  const size = mobile ? 128 : 512;
  const sim = 256;
  const resources = [];
  const keep = resource => { resources.push(resource); return resource; };
  const camera = new PerspectiveCamera(30, 1, 0.1, 1000);
  camera.position.set(-1.17, 0, 6);
  camera.lookAt(0, 0, 0);
  const scene = new Scene();
  const sculpture = new Group();
  sculpture.position.set(0.343, 0.16, -1);
  sculpture.rotation.set(-28.4 * Math.PI / 180, 390 * Math.PI / 180, 4.92 * Math.PI / 180);
  sculpture.scale.set(5, 5, 6);
  scene.add(sculpture);
  scene.updateMatrixWorld(true);

  const target = (w, h, type = HalfFloatType, filter = LinearFilter) => keep(new WebGLRenderTarget(w, h, {
    type, minFilter: filter, magFilter: filter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false,
  }));
  const pair = (n, type, filter) => ({
    front: target(n, n, type, filter), back: target(n, n, type, filter),
    swap() { [this.front, this.back] = [this.back, this.front]; },
  });
  const wind = pair(sim);
  const dye = pair(512);
  const pressure = pair(sim);
  const curl = target(sim, sim);
  const divergence = target(sim, sim);
  const mask = target(1, 1);
  const positions = pair(size, FloatType, NearestFilter);

  const initial = new Float32Array(size * size * 4);
  const random = new Float32Array(initial.length);
  const uv = new Float32Array(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    for (let j = 0; j < 4; j++) {
      initial[i * 4 + j] = j === 3 ? 1 : Math.random() * 2 - 1;
      random[i * 4 + j] = Math.random();
    }
    uv[i * 3] = (i % size + 0.5) / size;
    uv[i * 3 + 1] = (Math.floor(i / size) + 0.5) / size;
  }
  const origin = keep(new DataTexture(initial, size, size, RGBAFormat, FloatType));
  origin.needsUpdate = true;
  const geometry = keep(new BufferGeometry());
  geometry.setAttribute("position", new BufferAttribute(uv, 3));
  geometry.setAttribute("random", new BufferAttribute(random, 4));
  const renderPoints = keep(new ShaderMaterial({
    vertexShader: pointVertex, fragmentShader: pointFragment,
    uniforms: { field: value(origin), matcap: value(keep(sphereTexture())), clockTime: value(0), pixelRatio: value(1) },
    transparent: true, blending: AdditiveBlending, depthTest: true, depthWrite: false,
  }));
  const points = new Points(geometry, renderPoints);
  points.frustumCulled = false;
  sculpture.add(points);

  const passScene = new Scene();
  const quad = new Mesh(keep(new PlaneGeometry(2, 2)), renderPoints);
  quad.frustumCulled = false;
  passScene.add(quad);
  const passCamera = new Camera();
  const fluid = keep(new ShaderMaterial({
    vertexShader: passVertex, fragmentShader: fluidFragment, depthTest: false, depthWrite: false,
    uniforms: {
      field: value(null), velocity: value(null), scalar: value(null), texel: value(new Vector2(1 / sim, 1 / sim)),
      startPoint: value(new Vector2()), endPoint: value(new Vector2()), impulse: value(new Vector3()),
      radius: value(0), aspect: value(1), decay: value(1), operation: value(0),
    },
  }));
  const step = keep(new ShaderMaterial({
    vertexShader: passVertex, fragmentShader: positionFragment, depthTest: false, depthWrite: false,
    uniforms: {
      field: value(origin), origin: value(origin), velocity: value(wind.front.texture), mask: value(mask.texture),
      viewProjection: value(new Matrix4()), shapeWorld: value(sculpture.matrixWorld), cameraWorld: value(camera.matrixWorld),
      clockTime: value(0), hz: value(1),
    },
  }));
  renderer.setClearColor(0, 1);

  function draw(material, output) {
    quad.material = material;
    renderer.setRenderTarget(output);
    renderer.render(passScene, passCamera);
  }
  function clear(output) {
    renderer.setRenderTarget(output);
    renderer.clear();
  }
  function pass(operation, output, field = null, velocity = null, scalar = null) {
    const u = fluid.uniforms;
    u.operation.value = operation;
    // Unused samplers also point at a safe texture distinct from the output.
    u.field.value = field || origin;
    u.velocity.value = velocity || origin;
    u.scalar.value = scalar || origin;
    draw(fluid, output);
  }
  function apply(operation, buffer, velocity, scalar) {
    pass(operation, buffer.back, buffer.front.texture, velocity, scalar);
    buffer.swap();
  }
  for (const output of [wind.front, dye.front, pressure.front]) clear(output);

  let width = 1, height = 1, pointerDirty = false, previousSplat = 0, fluidUntil = 0;
  let lastFrame = 0, clock = 0, frameId = 0, first = true, running = true;
  const pointer = new Vector2(0.5, 0.5);
  const previous = pointer.clone();
  const delta = new Vector2();
  const gaze = new Vector3();
  function resize() {
    width = Math.max(1, canvas.clientWidth);
    height = Math.max(1, canvas.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    fluid.uniforms.aspect.value = camera.aspect;
    renderPoints.uniforms.pixelRatio.value = dpr;
    mask.setSize(Math.round(width * dpr), Math.round(height * dpr));
    clear(mask);
  }
  function move(event) {
    const x = clamp01(event.clientX / width);
    const y = 1 - clamp01(event.clientY / height);
    if (event.type === "pointerdown" || !previousSplat) {
      previous.set(x, y);
    }
    pointer.set(x, y);
    pointerDirty = true;
  }
  function fluidStep(now) {
    const u = fluid.uniforms;
    if (pointerDirty) {
      pointerDirty = false;
      delta.copy(pointer).sub(previous);
      const dx = delta.x * width, dy = delta.y * height;
      const length = Math.hypot(dx, dy);
      if (length > 0.01) {
        u.startPoint.value.copy(now - previousSplat > 50 ? pointer : previous);
        u.endPoint.value.copy(pointer);
        u.radius.value = Math.min(1, length / 5) * 60 * (mobile ? 0.8 : 0.6) / 200;
        const force = Math.min(1, length / 15) * 10;
        u.impulse.value.set(dx * force, dy * force, 1);
        apply(0, wind);
        u.impulse.value.set(1, 1, 1);
        apply(0, dye);
        fluidUntil = now + 1750;
      }
      previous.copy(pointer);
      previousSplat = now;
    }
    if (now > fluidUntil) {
      if (fluidUntil) {
        for (const output of [mask, wind.front, dye.front, pressure.front]) clear(output);
        fluidUntil = 0;
      }
      return;
    }
    pass(1, curl, null, wind.front.texture);
    apply(2, wind, wind.front.texture, curl.texture);
    pass(3, divergence, null, wind.front.texture);
    u.decay.value = 0.95;
    apply(4, pressure);
    for (let i = 0; i < 5; i++) {
      pass(5, pressure.back, divergence.texture, null, pressure.front.texture);
      pressure.swap();
    }
    apply(6, wind, wind.front.texture, pressure.front.texture);
    u.decay.value = 0.98;
    apply(7, wind, wind.front.texture);
    u.decay.value = 0.97;
    apply(7, dye, wind.front.texture);
    pass(8, mask, dye.front.texture);
  }

  function frame(now) {
    if (!running) return;
    frameId = requestAnimationFrame(frame);
    if (document.hidden) { lastFrame = 0; return; }
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 1 / 24) : 1 / 60;
    lastFrame = now;
    clock += dt;
    gaze.set(-1.17 - (2 * pointer.x - 1), (1 - 2 * pointer.y) * 2, 6);
    camera.position.lerp(gaze, 1 - Math.pow(0.95, dt * 60));
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    fluidStep(now);
    const u = step.uniforms;
    u.field.value = first ? origin : positions.front.texture;
    u.clockTime.value = clock;
    u.hz.value = dt * 60;
    u.velocity.value = wind.front.texture;
    u.viewProjection.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    draw(step, positions.back);
    positions.swap();
    renderPoints.uniforms.field.value = positions.front.texture;
    renderPoints.uniforms.clockTime.value = clock;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    if (first) { first = false; canvas.dataset.live = "true"; }
  }
  function lost(event) {
    event.preventDefault();
    running = false;
    cancelAnimationFrame(frameId);
    delete canvas.dataset.live;
  }
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerdown", move, { passive: true });
  canvas.addEventListener("webglcontextlost", lost);
  frameId = requestAnimationFrame(frame);
  return () => {
    running = false;
    cancelAnimationFrame(frameId);
    delete canvas.dataset.live;
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerdown", move);
    canvas.removeEventListener("webglcontextlost", lost);
    resources.forEach(resource => resource.dispose());
    renderer.dispose();
  };
}
