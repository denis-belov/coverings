/*
eslint-disable

no-magic-numbers,
*/



import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
// import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
// import { Reflector } from 'three/examples/jsm/objects/Reflector';

import cast from './cast';
import modes from './modes';

// import Wall from './wall';

import {

	// // tile_texture1,
	// tile_texture1,
	// tile_texture2,
	// tile_texture3,
	// tile_texture4,
	// tile_texture5,
	// tile_texture6,
	canvas,
} from './dom';



const CLEAR_COLOR = 'grey';
const ATTRIBUTE_SIZE_2 = 2;
const ATTRIBUTE_SIZE_3 = 3;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;
const PERSPECTIVE_CAMERA_FOV = 45;
// const TEXTURE_ANISOTROPY = 16;
export const MATERIAL_WIREFRAME = false;



const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const draggable_gltf_scenes = [];
const draggable_meshes = [];
export const raycastable_meshes = [];
let raycasted_mesh = null;
let transform_controls_attached_mesh = null;
export const tilable_mesh = { _: null };
export const intersects = [];



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
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(CLEAR_COLOR);
renderer.clearColor();
renderer.physicallyCorrectLights = true;

export const webgl_maximum_anisotropy = renderer.capabilities.getMaxAnisotropy();

export const scene = new THREE.Scene();
// export const floor_scene = new THREE.Scene();



const ambient_light = new THREE.AmbientLight(0xFFFFFF);
scene.add(ambient_light);
// floor_scene.add(ambient_light);

[
	[ 1.5, 3, 1.5 ],
	[ 1.5, 3, -1.5 ],
	[ -1.5, 3, -1.5 ],
	[ -1.5, 3, 1.5 ],
]
	.forEach((spot_light_position) => {

		const spot_light = new THREE.SpotLight(0xFFFFFF, 3);
		spot_light.distance = 0;
		spot_light.penumbra = 0.5;
		spot_light.decay = 1;
		spot_light.angle = Math.PI * 0.5;
		spot_light.position.set(...spot_light_position);
		scene.add(spot_light);
		// floor_scene.add(spot_light);
		spot_light.target.position.set(...spot_light_position);
		spot_light.target.position.y = 0;
		scene.add(spot_light.target);
		// floor_scene.add(spot_light.target);

		// const spot_light_helper = new THREE.SpotLightHelper(spot_light);
		// scene.add(spot_light_helper);
	});

// const rect_light = new THREE.RectAreaLight(0xffffff, 1, 2, 2);
// rect_light.position.set(0, 1.5, -2.99);
// rect_light.lookAt(0, 1.5, 0);
// scene.add(rect_light);

// const rect_light_helper = new RectAreaLightHelper(rect_light);
// rect_light.add(rect_light_helper);

export const plan_camera = new THREE.OrthographicCamera(...getOrthographicCameraAttributes());
plan_camera.zoom = cast.METERS_TO_PIXELS;
plan_camera.updateProjectionMatrix();

plan_camera.rotateX(-Math.PI * 0.5);
plan_camera.translateZ(1);
plan_camera.lookAt(scene.position);

export const orbit_camera = new THREE.PerspectiveCamera(...getPerspectiveCameraAttributes());
// orbit_camera.rotateX(-Math.PI * 0.125);
orbit_camera.position.z = 10;



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

			scene.add(...draggable_gltf_scenes);
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

scene.add(transform_controls);

canvas.addEventListener('mousemove', (evt) => {

	if (modes.orbit_mode) {

		mouse.x = ((evt.clientX / window.innerWidth) * 2) - 1;
		mouse.y = (-(evt.clientY / window.innerHeight) * 2) + 1;

		raycaster.setFromCamera(mouse, orbit_camera);

		const _intersects = raycaster.intersectObjects(raycastable_meshes);
		// intersects.length = 0;
		// intersects.push(..._intersects);

		if (_intersects.length) {

			// if (raycasted_mesh) {

			// 	if (raycasted_mesh._meshes) {

			// 		raycasted_mesh._meshes.forEach((elm) => elm.material.emissive.set(0x000000));
			// 	}
			// 	else {

			// 		raycasted_mesh.material.emissive.set(0x000000);
			// 	}
			// }

			raycasted_mesh = _intersects.sort((a, b) => (a.distance - b.distance))[0].object;

			// if (raycasted_mesh._meshes) {

			// 	raycasted_mesh._meshes.forEach((elm) => elm.material.emissive.set(0x00FF00));
			// }
			// else {

			// 	raycasted_mesh.material.emissive.set(0x00FF00);
			// }
		}
		else if (raycasted_mesh) {

			// if (raycasted_mesh._meshes) {

			// 	raycasted_mesh._meshes.forEach((elm) => elm.material.emissive.set(0x000000));
			// }
			// else {

			// 	raycasted_mesh.material.emissive.set(0x000000);
			// }

			raycasted_mesh = null;
		}
	}
});

canvas.addEventListener('dblclick', (evt) => {

	if (modes.orbit_mode) {

		// mouse.x = ((evt.clientX / window.innerWidth) * 2) - 1;
		// mouse.y = (-(evt.clientY / window.innerHeight) * 2) + 1;

		// raycaster.setFromCamera(mouse, orbit_camera);

		// const _intersects = raycaster.intersectObjects(raycastable_meshes);

		if (raycasted_mesh) {

			if (draggable_meshes.includes(raycasted_mesh)) {

				transform_controls_attached_mesh = raycasted_mesh;

				transform_controls.attach(transform_controls_attached_mesh);
			}
			else {


				transform_controls_attached_mesh = null;

				transform_controls.detach();

				tilable_mesh._ = raycasted_mesh;
			}
		}
		else {

			transform_controls_attached_mesh = null;

			transform_controls.detach();

			tilable_mesh._ = null;
		}
	}
});
