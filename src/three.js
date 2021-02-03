/*
eslint-disable

max-len,
*/



import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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



export const animate = () => {

	requestAnimationFrame(animate);

	geometry_walls.attributes.position.needsUpdate = true;
	geometry_floor.attributes.position.needsUpdate = true;

	orbit_controls.update();

	// default_texture_floor.rotation += 0.01;

	renderer.render(scene, camera._);
};
