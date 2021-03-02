import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
// import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
// import { Reflector } from 'three/examples/jsm/objects/Reflector';

import cast from './cast';
import modes from './modes';

import {

	// mode_toggle_BUTTON,
	// coverings_plan_NODE,
	// mode_selection_BUTTON,
	// selection_NODE,
	mode_selection_BUTTON,
	canvas,
} from './dom';



const CLEAR_COLOR = 'grey';
const CAMERA_NEAR = 0.001;
const CAMERA_FAR = 100;
const PERSPECTIVE_CAMERA_FOV = 45;
export const MATERIAL_WIREFRAME = false;
export const ATTRIBUTE_SIZE_1 = 1;
export const ATTRIBUTE_SIZE_2 = 2;
export const ATTRIBUTE_SIZE_3 = 3;



let raycasted_mesh = null;
let transform_controls_attached_mesh = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const draggable_gltf_scenes = [];
const draggable_meshes = [];
export const raycastable_meshes = [];
export const intersects = [];
export const tileable_mesh = { _: null };



const getOrthographicCameraAttributes = () =>
	[
		-window.innerWidth / 2,
		window.innerWidth / 2,
		window.innerHeight / 2,
		-window.innerHeight / 2,
		CAMERA_NEAR,
		CAMERA_FAR,
	];

const getPerspectiveCameraAttributes = () =>
	[
		PERSPECTIVE_CAMERA_FOV,
		window.innerWidth / window.innerHeight,
		CAMERA_NEAR,
		CAMERA_FAR,
	];



export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
// renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.physicallyCorrectLights = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(CLEAR_COLOR);
renderer.autoClearColor = false;
renderer.clearColor();



export const WEBGL_MAXIMUM_ANISOTROPY = renderer.capabilities.getMaxAnisotropy();

// floor and walls, no depth test
export const scene1 = new THREE.Scene();

// segments, no depth test
export const scene2 = new THREE.Scene();

// draggable units, depth test enabled
export const scene3 = new THREE.Scene();



const ambient_light1 = new THREE.AmbientLight(0xFFFFFF);
const ambient_light2 = ambient_light1.clone();
const ambient_light3 = ambient_light1.clone();

// ambient_light.updateMatrix();
// ambient_light.updateMatrixWorld();
// ambient_light.intensity = 2;

scene1.add(ambient_light1);
scene2.add(ambient_light2);
scene3.add(ambient_light3);

// export const spot_lights = [];

// [
// 	[ 1.5, 3, 1.5 ],
// 	[ 1.5, 3, -1.5 ],
// 	[ -1.5, 3, -1.5 ],
// 	[ -1.5, 3, 1.5 ],
// ]
// 	.forEach((spot_light_position) => {

// 		const spot_light = new THREE.SpotLight(0xFFFFFF);
// 		spot_light.intensity = 10;
// 		spot_light.distance = 0;
// 		spot_light.penumbra = 0.5;
// 		spot_light.decay = 2;
// 		spot_light.angle = Math.PI * 0.5;
// 		spot_light.position.set(...spot_light_position);
// 		scene1.add(spot_light);
// 		spot_light.target.position.set(...spot_light_position);
// 		spot_light.target.position.y = 0;
// 		scene1.add(spot_light.target);

// 		// spot_lights.push(spot_light);

// 		// const spot_light_helper = new THREE.SpotLightHelper(spot_light);
// 		// scene1.add(spot_light_helper);
// 	});

// const rect_light = new THREE.RectAreaLight(0xffffff, 1, 2, 2);
// rect_light.position.set(0, 1.5, -2.99);
// rect_light.lookAt(0, 1.5, 0);
// scene1.add(rect_light);

// const rect_light_helper = new RectAreaLightHelper(rect_light);
// rect_light.add(rect_light_helper);

export const plan_camera = new THREE.OrthographicCamera(...getOrthographicCameraAttributes());
plan_camera.zoom = cast.METERS_TO_PIXELS;
plan_camera.updateProjectionMatrix();

plan_camera.rotation.set(-Math.PI * 0.5, 0, 0);
plan_camera.translateZ(1);
plan_camera.lookAt(scene1.position);

export const orbit_camera = new THREE.PerspectiveCamera(...getPerspectiveCameraAttributes());
orbit_camera.position.y = 12;



export const orbit_controls = new OrbitControls(orbit_camera, canvas);
orbit_controls.enableZoom = true;
orbit_controls.enableDamping = true;
orbit_controls.dumpingFactor = 10;



const draco_loader = new DRACOLoader();
draco_loader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

export const gltf_loader = new GLTFLoader();
gltf_loader.setDRACOLoader(draco_loader);

export const uploadModel = (evt) => {

	gltf_loader.parse(

		evt.target.result,

		null,

		(gltf) => {

			const meshes = [];

			gltf.scene.traverse((elm) => {

				if (elm.isMesh) {

					meshes.push(elm);

					elm._meshes = meshes;
				}
			});

			draggable_gltf_scenes.push(gltf.scene);

			gltf.scene.traverse((elm) => {

				if (elm.isMesh) {

					raycastable_meshes.push(elm);
					draggable_meshes.push(elm);
				}
			});

			scene3.add(...draggable_gltf_scenes);
		},
	);
};



const transform_controls = new TransformControls(orbit_camera, renderer.domElement);

transform_controls.addEventListener('change', () => {

	if (transform_controls_attached_mesh) {

		if (transform_controls_attached_mesh._meshes) {

			transform_controls_attached_mesh._meshes.forEach((elm) => {

				elm.position.copy(transform_controls_attached_mesh.position);
				elm.rotation.copy(transform_controls_attached_mesh.rotation);
			});
		}
	}
});

transform_controls.addEventListener('dragging-changed', (evt) => (orbit_controls.enabled = !evt.value));

scene3.add(transform_controls);



canvas.addEventListener('mousemove', (evt) => {

	if (modes.orbit_mode) {

		raycasted_mesh &&

			raycasted_mesh.material.color.set(0xFFFFFF);

		raycasted_mesh = null;

		mouse.x = ((evt.clientX / window.innerWidth) * 2) - 1;
		mouse.y = (-(evt.clientY / window.innerHeight) * 2) + 1;

		raycaster.setFromCamera(mouse, orbit_camera);

		// LOG(draggable_meshes)

		let _intersects = raycaster.intersectObjects([ ...scene2.children, ...scene1.children, ...draggable_meshes ]);

		if (_intersects.length) {

			const [ nearest ] = _intersects.sort((a, b) => (a.distance - b.distance));

			raycasted_mesh = nearest.object;

			if (raycasted_mesh._meshes) {

				raycasted_mesh._meshes.forEach((elm) => elm.material.color.set(0xADD8E6));
			}
			else {

				raycasted_mesh.material.color.set(0xADD8E6);
			}
		}
		else if (raycasted_mesh) {

			if (raycasted_mesh._meshes) {

				raycasted_mesh._meshes.forEach((elm) => elm.material.color.set(0xFFFFFF));
			}
			else {

				raycasted_mesh.material.color.set(0xFFFFFF);
			}
		}
	}

	// 	const _intersects = raycaster.intersectObjects(raycastable_meshes);
	// 	// intersects.length = 0;
	// 	// intersects.push(..._intersects);

	// 	if (_intersects.length) {

	// 		if (raycasted_mesh) {

	// 			if (raycasted_mesh._meshes) {

	// 				raycasted_mesh._meshes.forEach((elm) => elm.material.color.set(0xFFFFFF));

	// 				// raycasted_mesh._meshes.forEach((elm) => {

	// 				// 	elm.material = elm.userData.parent.material;
	// 				// });
	// 			}
	// 			else {

	// 				raycasted_mesh.material.color.set(0xFFFFFF);

	// 				// raycasted_mesh.material = raycasted_mesh.userData.parent.material;
	// 			}
	// 		}

	// 		raycasted_mesh = _intersects.sort((a, b) => (a.distance - b.distance))[0].object;

	// 		if (raycasted_mesh._meshes) {

	// 			raycasted_mesh._meshes.forEach((elm) => elm.material.color.set(0xADD8E6));

	// 			// raycasted_mesh._meshes.forEach((elm) => {

	// 			// 	elm.material = elm.userData.parent.material2;
	// 			// });
	// 		}
	// 		else {

	// 			raycasted_mesh.material.color.set(0xADD8E6);

	// 			// raycasted_mesh.material = raycasted_mesh.userData.parent.material2;
	// 		}
	// 	}
	// 	else if (raycasted_mesh) {

	// 		if (raycasted_mesh._meshes) {

	// 			raycasted_mesh._meshes.forEach((elm) => elm.material.color.set(0xFFFFFF));

	// 			// raycasted_mesh._meshes.forEach((elm) => {

	// 			// 	elm.material = elm.userData.parent.material;
	// 			// });
	// 		}
	// 		else {

	// 			raycasted_mesh.material.color.set(0xFFFFFF);

	// 			// raycasted_mesh.material = raycasted_mesh.userData.parent.material;
	// 		}

	// 		raycasted_mesh = null;
	// 	}
	// }
});

canvas.addEventListener('dblclick', (evt) => {

	if (modes.orbit_mode) {

		// 	if (draggable_meshes.includes(raycasted_mesh)) {

		// 		transform_controls_attached_mesh = raycasted_mesh;

		// 		transform_controls.attach(transform_controls_attached_mesh);
		// 	}
		// 	else {

		// 		// console.log(raycasted_mesh);

		// 		transform_controls_attached_mesh = null;

		// 		transform_controls.detach();

		// 		tileable_mesh._ = raycasted_mesh;
		// 	}

		// LOG(raycasted_mesh);

		if (raycasted_mesh) {

			if (draggable_meshes.includes(raycasted_mesh)) {

				transform_controls_attached_mesh = raycasted_mesh;

				transform_controls.attach(transform_controls_attached_mesh);
			}
			else {

				tileable_mesh._ = raycasted_mesh;

				// or parent.floor
				if (tileable_mesh._.userData.parent.wall) {

					mode_selection_BUTTON.style.display = 'none';
				}
				else {

					mode_selection_BUTTON.style.display = 'inline-block';
				}
			}
		}
		else {

			tileable_mesh._ = null;

			mode_selection_BUTTON.style.display = 'none';

			transform_controls_attached_mesh = null;

			transform_controls.detach();

			tileable_mesh._ = raycasted_mesh;
		}

		// mouse.x = ((evt.clientX / window.innerWidth) * 2) - 1;
		// mouse.y = (-(evt.clientY / window.innerHeight) * 2) + 1;

		// raycaster.setFromCamera(mouse, orbit_camera);

		// const _intersects = raycaster.intersectObjects(raycastable_meshes);

		// // LOG(_intersects)

		// if (_intersects.length) {

		// 	tileable_mesh._ = _intersects.sort((a, b) => (a.distance - b.distance))[0].object;
		// }
		// else {

		// 	tileable_mesh._ = null;
		// }

		// tileable_mesh._.material = tileable_mesh._.userData.parent.material2;

		// scene1.children.forEach((child) => {

		// 	child.visible = Boolean(child === tileable_mesh._ || child instanceof THREE.AmbientLight);
		// });

		// tileable_mesh._.quaternion.set(0, 0, 0, 1);
		// tileable_mesh._.position.set(0, 0, 0);
		// tileable_mesh._.updateMatrix();

		// // ambient_light.intensity = 2;

		// mode_selection_BUTTON.innerHTML = 'Selection mode';

		// // mode_toggle_BUTTON.classList.remove('-pressed');

		// // coverings_plan_NODE.classList.remove('-hidden');

		// selection_NODE.classList.remove('-hidden');

		// // wall
		// if (tileable_mesh._.userData.parent.points) {

		// 	LOG('wall')

		// 	plan_camera.rotation.set(0, Math.PI, 0);
		// }
		// // floor
		// else {

		// 	LOG('floor')

		// 	plan_camera.rotation.set(-Math.PI * 0.5, 0, 0);
		// }

		// plan_camera.position.set(0, 0, 0);
		// plan_camera.translateZ(1);
		// // plan_camera.lookAt(scene1.position);

		// modes.orbit_mode = 0;

		// // LOG(plan_camera)

		// plan_camera.updateMatrix();

		// console.log(tileable_mesh);

		// if (raycasted_mesh) {

		// 	if (draggable_meshes.includes(raycasted_mesh)) {

		// 		transform_controls_attached_mesh = raycasted_mesh;

		// 		transform_controls.attach(transform_controls_attached_mesh);
		// 	}
		// 	else {

		// 		// console.log(raycasted_mesh);

		// 		transform_controls_attached_mesh = null;

		// 		transform_controls.detach();

		// 		tileable_mesh._ = raycasted_mesh;
		// 	}
		// }
		// else {

		// 	transform_controls_attached_mesh = null;

		// 	transform_controls.detach();

		// 	tileable_mesh._ = null;
		// }
	}
});

// var gl = renderer.context;
// gl.disable(gl.DEPTH_TEST);
