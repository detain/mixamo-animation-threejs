import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import * as THREE from "three";

const gltfLoader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
gltfLoader.setDRACOLoader(draco);

const AllActions = [];
const myDir = "https://mystage.interserver.net/3d/chars/glb/";
const publicDir = "../public/";
const modelUrl = "5283eb0c-ed7e-45e2-aec5-da9d0d260285";

export async function setupAnimationModels(scene, gui) {
  const gltf = await gltfLoader.loadAsync(myDir + modelUrl + ".glb");
  const model = gltf.scene;
  model.traverse((n) => {
    if (n.isMesh) {
      n.castShadow = true;
      n.receiveShadow = true;
    }
  });

  const skeleton = new THREE.SkeletonHelper(model);
  skeleton.visible = false;
  model.add(skeleton);
  scene.add(model);
  gui.add(skeleton, "visible").name("Skeleton");

  const mixer = new THREE.AnimationMixer(model);

  loadAnimations(mixer, gui);
  return mixer;
}

async function loadAnimations(mixer, gui) {
  const animGlbs = [
    "109090901.glb",
    "111280901.glb",
    "115420902.glb",
    "116990907.glb",
    "117800908.glb",
    "118320902.glb",
    "121130901.glb",
    "121830901.glb",
    "124500901.glb",
    "140700907.glb",
    "150400906.glb"
  ];

  const commonActions = {
    stopAll: () => {
      AllActions.forEach((ac) => {
        ac.stop();
      });
    }
  };

  const fol = gui.addFolder("Anims");
  fol.add(commonActions, "stopAll");
  for (const url of animGlbs) {
    const animGltf = await gltfLoader.loadAsync("https://mystage.interserver.net/3d/anims/" + modelUrl + "/" + url);
    const clip = animGltf.animations[0];
    const action = new THREE.AnimationAction(mixer, clip);
    AllActions.push(action);
    const aFol = fol.addFolder(clip.name);
    aFol.add(action, "play").onChange(() => {
      action.reset();
      action.fadeIn(0.5);
      AllActions.forEach((ac) => {
        if (ac !== action) {
          ac.fadeOut(0.5);
        }
      });
    });

    aFol.add(action, "time", 0, clip.duration).listen().disable();
  }
}
