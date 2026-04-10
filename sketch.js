import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, controls;
let loader;
let baseCameraY = 1;

let giraffeModel, sharkModel, monkeyModel, flamingoModel, lionModel;
let currentModel;
let maceModel, pepsiModel;
let activeItems = {};
const initialScales = {};
const modelScales = {};

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
  controls.enableZoom = false;

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
  const modelGroup = new THREE.Group();
  modelGroup.add(gltf.scene);

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const center = box.getCenter(new THREE.Vector3());
  gltf.scene.position.sub(center);

  giraffeModel = modelGroup;
  giraffeModel.scale.set(0.5,0.5,0.5);
  modelScales['giraffe'] = 0.5;
  currentModel = giraffeModel;
  scene.add(giraffeModel);
  centerModelCamera(giraffeModel);
}, undefined, (error) => {
  console.error('Error loading giraffe model:', error);
});

loader.load('models/animals/shark.glb', (gltf) => {
  const modelGroup = new THREE.Group();
  modelGroup.add(gltf.scene);

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const center = box.getCenter(new THREE.Vector3());
  gltf.scene.position.sub(center);

  sharkModel = modelGroup;
  sharkModel.scale.set(0.5,0.5,0.5);
  modelScales['shark'] = 0.5;
}, undefined, (error) => {
  console.error('Error loading shark model:', error);
});

loader.load('models/animals/monkeyNew.glb', (gltf) => {
  const modelGroup = new THREE.Group();
  modelGroup.add(gltf.scene);

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const center = box.getCenter(new THREE.Vector3());
  gltf.scene.position.sub(center);

  monkeyModel = modelGroup;
  monkeyModel.scale.set(0.5,0.5,0.5);
  modelScales['monkey'] = 0.5;
}, undefined, (error) => {
  console.error('Error loading monkey model:', error);
});

loader.load('models/animals/flamingo.glb', (gltf) => {
  const modelGroup = new THREE.Group();
  modelGroup.add(gltf.scene);

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const center = box.getCenter(new THREE.Vector3());
  gltf.scene.position.sub(center);

  flamingoModel = modelGroup;
  flamingoModel.scale.set(0.5,0.5,0.5);
  modelScales['flamingo'] = 0.5;
}, undefined, (error) => {
  console.error('Error loading flamingo model:', error);
});

loader.load('models/animals/lion.glb', (gltf) => {
  const modelGroup = new THREE.Group();
  modelGroup.add(gltf.scene);

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const center = box.getCenter(new THREE.Vector3());
  gltf.scene.position.sub(center);

  lionModel = modelGroup;
  lionModel.scale.set(0.5,0.5,0.5);
  modelScales['lion'] = 0.5;
}, undefined, (error) => {
  console.error('Error loading lion model:', error);
});

// Load item models
loader.load('models/items/mace.glb', (gltf) => {
  const modelGroup = new THREE.Group();
  modelGroup.add(gltf.scene);

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const center = box.getCenter(new THREE.Vector3());
  gltf.scene.position.sub(center);

  maceModel = modelGroup;
  maceModel.scale.set(0.2, 0.2, 0.2);
  maceModel.position.set(-2, 0, 0);
}, undefined, (error) => {
  console.error('Error loading mace model:', error);
});

loader.load('models/items/pepsi.glb', (gltf) => {
  const modelGroup = new THREE.Group();
  modelGroup.add(gltf.scene);

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const center = box.getCenter(new THREE.Vector3());
  gltf.scene.position.sub(center);

  pepsiModel = modelGroup;
  pepsiModel.scale.set(0.2, 0.2, 0.2);
  pepsiModel.position.set(-2, 0, 0);
}, undefined, (error) => {
  console.error('Error loading pepsi model:', error);
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

  document.getElementById("flamingoButton").onclick = () => {
    switchModel(flamingoModel);
  };

  document.getElementById("lionButton").onclick = () => {
    switchModel(lionModel);
  };

  // Set giraffe as active initially
  document.getElementById("giraffeButton").classList.add('active');

  // Items toggle button
  document.getElementById("tm").onclick = () => {
    const container = document.getElementById("itemsContainer");
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
  };

  // Item buttons
  document.getElementById("maceButton").onclick = () => {
    toggleItem('mace');
  };

  document.getElementById("pepsiButton").onclick = () => {
    toggleItem('pepsi');
  };

  window.addEventListener('resize', onWindowResize);

  // Scroll to move camera up/down with limits
  const minCameraY = -3;
  const maxCameraY = 8;
  window.addEventListener('wheel', (event) => {
    event.preventDefault();
    const scrollDirection = event.deltaY > 0 ? 1 : -1;
    const moveAmount = scrollDirection * 0.3;
    const newY = camera.position.y + moveAmount;

    if (newY >= minCameraY && newY <= maxCameraY) {
      camera.position.y = newY;
      controls.target.y = newY;
    }
  }, { passive: false });
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
  camera.position.y = baseCameraY;
  controls.target.y = baseCameraY;
  sizeSlider.value = 1;

  // Remove active class from all buttons
  document.querySelectorAll('button').forEach(btn => {
    btn.classList.remove('active');
  });

  // Add active class to the appropriate button
  if (newModel === giraffeModel) {
    document.getElementById("giraffeButton").classList.add('active');
  }
  else if (newModel === sharkModel) document.getElementById("sharkButton").classList.add('active');
  else if (newModel === monkeyModel) document.getElementById("monkeyButton").classList.add('active');
  else if (newModel === flamingoModel) document.getElementById("flamingoButton").classList.add('active');
  else if (newModel === lionModel) document.getElementById("lionButton").classList.add('active');

  // Toggle off all items
  if (activeItems['mace']) {
    scene.remove(maceModel);
    activeItems['mace'] = false;
    document.getElementById("maceButton").classList.remove('active');
  }
  if (activeItems['pepsi']) {
    scene.remove(pepsiModel);
    activeItems['pepsi'] = false;
    document.getElementById("pepsiButton").classList.remove('active');
  }
}

function centerModelCamera(model){
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 3;

  camera.position.set(center.x, baseCameraY, center.z + cameraZ);
  controls.target.set(center.x, baseCameraY, center.z);
  controls.update();
}

function toggleItem(itemName) {
  const item = itemName === 'mace' ? maceModel : pepsiModel;
  const button = itemName === 'mace' ? document.getElementById("maceButton") : document.getElementById("pepsiButton");

  if (!item) return;

  if (activeItems[itemName]) {
    // Remove item from scene
    scene.remove(item);
    activeItems[itemName] = false;
    button.classList.remove('active');
  } else {
    // Add item to scene
    scene.add(item);
    activeItems[itemName] = true;
    button.classList.add('active');
  }
}

function animate(){
  requestAnimationFrame(animate);

  if (currentModel){

    // Scale (same as slider)
    let size = sizeSlider.value;
    let initialScale = 0.5;

    if (currentModel === giraffeModel) initialScale = modelScales['giraffe'];
    else if (currentModel === sharkModel) initialScale = modelScales['shark'];
    else if (currentModel === monkeyModel) initialScale = modelScales['monkey'];
    else if (currentModel === flamingoModel) initialScale = modelScales['flamingo'];
    else if (currentModel === lionModel) initialScale = modelScales['lion'];

    currentModel.scale.set(initialScale * size, initialScale * size, initialScale * size);

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
