import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, controls;
let loader;

let giraffeModel, sharkModel, monkeyModel;
let currentModel;

let colorPicker;
let sizeSlider;

init();
animate();

function init(){

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdcdcdc);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1, 5);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Controls (orbit like p5)
  controls = new OrbitControls(camera, renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(0.5, 1, -0.5);
  scene.add(dirLight);

  // Loader
  loader = new GLTFLoader();

  // Load models
  loader.load('models/animals/giraffe.glb', (gltf) => {
  giraffeModel = gltf.scene;
  giraffeModel.scale.set(1,1,1);
  currentModel = giraffeModel;
  scene.add(giraffeModel);
  centerModelCamera(giraffeModel);
}, undefined, (error) => {
  console.error('Error loading giraffe model:', error);
});

loader.load('models/animals/shark.glb', (gltf) => {
  sharkModel = gltf.scene;
  sharkModel.scale.set(1,1,1);
}, undefined, (error) => {
  console.error('Error loading shark model:', error);
});

loader.load('models/animals/monkey.glb', (gltf) => {
  monkeyModel = gltf.scene;
  monkeyModel.scale.set(1,1,1);
}, undefined, (error) => {
  console.error('Error loading monkey model:', error);
});

  // UI elements
  colorPicker = document.getElementById("furColor");
  sizeSlider = document.getElementById("sizeSlider");

  // Buttons
  document.getElementById("giraffeButton").onclick = () => {
    switchModel(giraffeModel);
  };

  document.getElementById("sharkButton").onclick = () => {
    switchModel(sharkModel);
  };

  document.getElementById("monkeyButton").onclick = () => {
    switchModel(monkeyModel);
  };

  window.addEventListener('resize', onWindowResize);
}

// Switch model (same behavior as p5 currentModel)
function switchModel(newModel){
  if (!newModel) return;

  if (currentModel){
    scene.remove(currentModel);
  }

  currentModel = newModel;
  scene.add(currentModel);
  centerModelCamera(currentModel);
}

function centerModelCamera(model){
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

  camera.position.set(center.x, center.y, center.z + cameraZ);
  controls.target.copy(center);
  controls.update();
}

function animate(){
  requestAnimationFrame(animate);

  if (currentModel){

    // Scale (same as slider)
    let size = sizeSlider.value;
    currentModel.scale.set(size, size, size);

    // Color
    let color = new THREE.Color(colorPicker.value);

    currentModel.traverse((child) => {
      if (child.isMesh){
        child.material.color.copy(color);
        child.material.emissive.setHex(0x000000);
        child.material.metalness = 0;
        child.material.roughness = 0.5;
      }
    });
  }

  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
