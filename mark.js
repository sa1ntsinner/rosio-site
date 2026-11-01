// The mark as a solid: four chrome bars, one per layer. The bar of the
// layer the reader shows slides out and turns brighter, the way the third bar sits out
// in the flat mark.
import * as THREE from "./assets/vendor/three.module.min.js";
import { RoomEnvironment } from "./assets/vendor/room.js";

const figure = document.querySelector(".stage");
const canvas = figure.querySelector(".solid");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const order = ["declared", "coded", "observed", "recorded"];

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.NeutralToneMapping;
const scene = new THREE.Scene();
scene.environmentIntensity = 1.8;
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
camera.position.set(0, 0, 8.4);
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(-3, 4, 5);
scene.add(key);

const data = new Float32Array(await (await fetch("assets/3d/bar.bin")).arrayBuffer());
const half = data.length / 2;
const shape = new THREE.BufferGeometry();
shape.setAttribute("position", new THREE.BufferAttribute(data.subarray(0, half), 3));
shape.setAttribute("normal", new THREE.BufferAttribute(data.subarray(half), 3));

const deep = new THREE.Color(0xc4c8ce);
const dark = { color: deep, metalness: 1, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 };
const bright = new THREE.Color(0xffffff);
const group = new THREE.Group();
const bars = order.map((layer, i) => {
  const bar = new THREE.Mesh(shape, new THREE.MeshPhysicalMaterial(dark));
  bar.position.y = (1.5 - i) * 0.786;
  bar.userData = { layer, out: 0, goal: 0 };
  group.add(bar);
  return bar;
});

scene.add(group);

function slide(layer) {
  for (const bar of bars) bar.userData.goal = bar.userData.layer === layer ? 1 : 0;
}

let aim = { x: 0, y: 0 };
addEventListener("pointermove", (e) => {
  aim = { x: e.clientX / innerWidth - 0.5, y: e.clientY / innerHeight - 0.5 };
});
document.addEventListener("rosio:layer", (e) => slide(e.detail));

function fit() {
  const { width, height } = canvas.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.position.z = Math.max(8.4, 8.4 * (1.1 / camera.aspect));
  camera.updateProjectionMatrix();
  // the bars stand in the left of the stage, the reader holds the right
  const reach = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
  group.position.x = innerWidth > 700 ? -reach + 1.35 : 0;
  group.position.y = innerWidth > 700 ? 0 : 1.6;
}
new ResizeObserver(fit).observe(canvas);
fit();

let shown = true;
new IntersectionObserver(([entry]) => { shown = entry.isIntersecting; }).observe(figure);
const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  if (shown && !document.hidden) {
    for (const bar of bars) {
      const u = bar.userData;
      u.out += still ? u.goal - u.out : (u.goal - u.out) * (1 - Math.exp(-dt * 7));
      bar.position.x = u.out * 0.857;
      bar.material.color.lerpColors(deep, bright, u.out);
    }
    const sway = still ? 0 : Math.sin(t * 0.5) * 0.08;
    group.rotation.y += ((aim.x * 0.6 - 0.32 + sway) - group.rotation.y) * (1 - Math.exp(-dt * 3));
    group.rotation.x += ((aim.y * 0.35 + 0.14) - group.rotation.x) * (1 - Math.exp(-dt * 3));
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}
group.rotation.set(0.14, -0.32, 0);
frame();
figure.classList.add("live");
setTimeout(() => slide(document.querySelector(".scale [aria-checked=true]").dataset.layer), still ? 0 : 500);
