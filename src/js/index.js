import config from './config';

const polyfill = new WebVRPolyfill(config);
console.log("Using webvr-polyfill version " + WebVRPolyfill.version + " with configuration: " + JSON.stringify(config));

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(Math.floor(window.devicePixelRatio) || 1);

const canvas = renderer.domElement;
document.body.appendChild(canvas);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

const effect = new THREE.VREffect(renderer);
effect.setSize(canvas.clientWidth, canvas.clientHeight, false);


const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
cube.position.z = -1;
scene.add(cube);

const loader = new THREE.TextureLoader();
loader.load('assets/img/box.png', texture => {
  const boxWidth = 5;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(boxWidth, boxWidth);
  const skyboxGeometry = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);
  const skyboxMaterial = new THREE.MeshBasicMaterial({ map: texture, color: 0x01BE00, side: THREE.BackSide });
  const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
  scene.add(skybox);
});

let controls;
let vrDisplay;
// The polyfill provides this in the event this browser
// does not support WebVR 1.1
navigator.getVRDisplays().then( vrDisplays => {
  // If we have a native display, or we have a CardboardVRDisplay from the polyfill, use it
  if (vrDisplays.length) {
    vrDisplay = vrDisplays[0];
    // Apply VR headset positional data to camera.
    controls = new THREE.VRControls(camera);
    vrDisplay.requestAnimationFrame(animate);
  }
  // Otherwise, we're on a desktop environment with no native displays, so provide controls for a monoscopic desktop view
  else {
    controls = new THREE.OrbitControls(camera);
    controls.target.set(0, 0, -1);
    
    var enterVRButton = document.querySelector('#vr');
    enterVRButton.disabled = true;
    requestAnimationFrame(animate);
  }
});
// Request animation frame loop function
let lastRender = 0;
const animate = timestamp => {
  const delta = Math.min(timestamp - lastRender, 500);
  lastRender = timestamp;
  
  cube.rotation.y += delta * 0.0002;

  // Update VR headset position and apply to camera.
  controls.update();
  
  effect.render(scene, camera);
  // Keep looping; if using a VRDisplay, call its requestAnimationFrame, otherwise call window.requestAnimationFrame.
  if (vrDisplay) {
    vrDisplay.requestAnimationFrame(animate);
  } else {
    requestAnimationFrame(animate);
  }
}

const onResize = () => {
  if (!onResize.resizeDelay) {
    onResize.resizeDelay = setTimeout(() => {
      onResize.resizeDelay = null;
      console.log('Resizing to %s x %s.', canvas.clientWidth, canvas.clientHeight);
      effect.setSize(canvas.clientWidth, canvas.clientHeight, false);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }, 250);
  }
}

const onVRDisplayPresentChange = () => {
  console.log('onVRDisplayPresentChange');
  onResize();
  buttons.hidden = vrDisplay.isPresenting;
}

// Resize the WebGL canvas when we resize and also when we change modes.
window.addEventListener('resize', onResize);
window.addEventListener('vrdisplaypresentchange', onVRDisplayPresentChange);

document.querySelector('button#fullscreen').addEventListener('click', () => enterFullscreen(renderer.domElement));
document.querySelector('button#vr').addEventListener('click', () => vrDisplay.requestPresent([{source: renderer.domElement}]));

const enterFullscreen = el => {
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  }
}
