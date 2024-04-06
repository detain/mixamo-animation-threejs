import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

import { GUI } from "lil-gui";
import { setupAnimationModels } from "./setupAnimations";
import {
  EffectComposer,
  RenderPass,
  BloomEffect,
  EffectPass
} from "postprocessing";

const gui = new GUI();

const params = {
  bgColor: new THREE.Color("#5ccbf0")
};
const hdrLoader = new RGBELoader();

const renderer = new THREE.WebGLRenderer();
renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight
);
camera.position.set(2, 2, 3);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

const scene = new THREE.Scene();
scene.background = params.bgColor;
const composer = new EffectComposer(renderer, {
  multisampling: 16,
  frameBufferType: THREE.HalfFloatType
});
composer.addPass(new RenderPass(scene, camera));
composer.setSize(window.innerWidth, window.innerHeight);
const bloomEff = new BloomEffect({
  luminanceThreshold: 5,
  intensity: 0.1,
  mipmapBlur: true
});
composer.addPass(new EffectPass(camera, bloomEff));

const light = new THREE.DirectionalLight("#ffff00", 3);
light.position.set(3, 3, 3);
light.castShadow = true;
light.shadow.bias = -0.00002;
light.shadow.mapSize.x = 1024;
light.shadow.mapSize.y = 1024;
const size = 2;
light.shadow.camera.top = size;
light.shadow.camera.bottom = -size;
light.shadow.camera.left = -size;
light.shadow.camera.right = size;

scene.add(light);
// scene.add(new DirectionalLightHelper(light));
// scene.add(new THREE.CameraHelper(light.shadow.camera));

scene.add(new THREE.AmbientLight("#0000ff", 1));

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(8, 32).rotateX(-Math.PI / 2).translate(0, 0, 0),
  new THREE.MeshStandardMaterial({ roughness: 0.5, color: "pink" })
);
scene.add(floor);
floor.receiveShadow = true;
gui.addColor(floor.material, "color").name("Floor Color");
let mixer;
setupAnimationModels(scene, gui).then((m) => {
  mixer = m;
});

window.onresize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  composer.setSize(window.innerWidth, window.innerHeight);
};

hdrLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/outdoor_workshop_1k.hdr",
  (tex) => {
    tex.mapping = THREE.EquirectangularReflectionMapping;

    scene.environment = tex;
    // scene.background = tex;
    // scene.backgroundBlurriness = 0.5;
  }
);

const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();
  controls.update();
  if (mixer) mixer.update(delta);
  // renderer.render(scene, camera);
  composer.render();
});

gui.addColor(params, "bgColor");
