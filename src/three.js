/*
eslint-disable

max-len,
*/



import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import {

	tile_texture1,
	tile_texture2,
	canvas,
} from './dom';



const CLEAR_COLOR = 0xFFFFFF;
const ATTRIBUTE_SIZE_2 = 2;
const ATTRIBUTE_SIZE_3 = 3;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;
const PERSPECTIVE_CAMERA_FOV = 45;
// const TEXTURE_ANISOTROPY = 16;
const MATERIAL_WIREFRAME = false;



const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const draggable_gltf_scenes = [];
const draggable_meshes = [];
let raycasted_mesh = null;
let transform_controls_attached_mesh = null;



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
renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(CLEAR_COLOR);
renderer.clearColor();

export const scene = new THREE.Scene();



export const position_data_walls = [];
export const uv_data_walls = [];
export const geometry_walls = new THREE.BufferGeometry();
geometry_walls.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data_walls), ATTRIBUTE_SIZE_3));
geometry_walls.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data_walls), ATTRIBUTE_SIZE_2));

const default_texture_walls = new THREE.Texture();
default_texture_walls.image = tile_texture1;
default_texture_walls.anisotropy = renderer.capabilities.getMaxAnisotropy();
default_texture_walls.wrapS = THREE.RepeatWrapping;
default_texture_walls.wrapT = THREE.RepeatWrapping;
default_texture_walls.needsUpdate = true;

const material_walls = new THREE.MeshBasicMaterial({ map: default_texture_walls, side: THREE.BackSide, wireframe: MATERIAL_WIREFRAME });

const mesh_walls = new THREE.Mesh(geometry_walls, material_walls);

scene.add(mesh_walls);



export const position_data_floor = [];
export const uv_data_floor = [];
export const geometry_floor = new THREE.BufferGeometry();
geometry_floor.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data_floor), ATTRIBUTE_SIZE_3));
geometry_floor.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data_floor), ATTRIBUTE_SIZE_2));

const default_texture_floor = new THREE.Texture();
default_texture_floor.image = tile_texture2;
default_texture_floor.anisotropy = renderer.capabilities.getMaxAnisotropy();
default_texture_floor.wrapS = THREE.RepeatWrapping;
default_texture_floor.wrapT = THREE.RepeatWrapping;
default_texture_floor.needsUpdate = true;

const material_floor = new THREE.MeshBasicMaterial({ map: default_texture_floor, side: THREE.BackSide, wireframe: MATERIAL_WIREFRAME });

const mesh_floor = new THREE.Mesh(geometry_floor, material_floor);

scene.add(mesh_floor);



const hemisphere_light = new THREE.HemisphereLight('white', 'white', 1);
scene.add(hemisphere_light);

export const plan_camera = new THREE.OrthographicCamera(...getOrthographicCameraAttributes());
plan_camera.zoom = 10;
plan_camera.updateProjectionMatrix();

/* eslint-disable no-magic-numbers */
plan_camera.rotateX(-Math.PI * 0.5);
plan_camera.translateZ(1);
plan_camera.lookAt(scene.position);

export const orbit_camera = new THREE.PerspectiveCamera(...getPerspectiveCameraAttributes());
orbit_camera.rotateX(-Math.PI * 0.125);
orbit_camera.translateZ(10);
/* eslint-enable no-magic-numbers */

export const camera = { _: plan_camera };

export const orbit_controls = new OrbitControls(orbit_camera, canvas);
orbit_controls.enableZoom = true;
orbit_controls.enableDamping = true;
orbit_controls.dumpingFactor = 10;



const draco_loader = new DRACOLoader();
draco_loader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

export const gltf_loader = new GLTFLoader();
gltf_loader.setDRACOLoader(draco_loader);

// gltf_loader.load(

// 	'models/washing_machine_new.glb',

// 	(gltf) => scene.add(gltf.scene),
// );

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

		transform_controls_attached_mesh._meshes.forEach((elm) => {

			elm.position.copy(transform_controls_attached_mesh.position);
			elm.rotation.copy(transform_controls_attached_mesh.rotation);
		});
	}
});

transform_controls.addEventListener('dragging-changed', (evt) => (orbit_controls.enabled = !evt.value));

scene.add(transform_controls);

canvas.addEventListener('mousemove', (evt) => {

	mouse.x = ((evt.clientX / window.innerWidth) * 2) - 1;
	mouse.y = (-(evt.clientY / window.innerHeight) * 2) + 1;

	raycaster.setFromCamera(mouse, orbit_camera);

	const intersects = raycaster.intersectObjects(draggable_meshes);

	if (intersects.length) {

		if (raycasted_mesh) {

			raycasted_mesh._meshes.forEach((elm) => elm.material.emissive.set(0x000000));
		}

		raycasted_mesh = intersects.sort((a, b) => (a.distance - b.distance))[0].object;

		raycasted_mesh._meshes.forEach((elm) => elm.material.emissive.set(0x00FF00));
	}
	else if (raycasted_mesh) {

		raycasted_mesh._meshes.forEach((elm) => elm.material.emissive.set(0x000000));

		raycasted_mesh = null;
	}
});

canvas.addEventListener('dblclick', () => {

	if (raycasted_mesh) {

		transform_controls_attached_mesh = raycasted_mesh;

		transform_controls.attach(transform_controls_attached_mesh);
	}
	else {

		transform_controls_attached_mesh = null;

		transform_controls.detach();
	}
});



export const animate = () => {

	requestAnimationFrame(animate);

	geometry_walls.attributes.position.needsUpdate = true;
	geometry_floor.attributes.position.needsUpdate = true;

	orbit_controls.update();

	// default_texture_floor.rotation += 0.01;

	renderer.render(scene, camera._);
};
