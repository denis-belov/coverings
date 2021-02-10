// import Point from './point';

import {

	coverings_plan_NODE,
	add_wall_mode_BUTTON,
} from './dom';

import modes from './modes';

import * as THREE from 'three';
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import {

	// renderer,
	webgl_maximum_anisotropy,
	scene,
	raycastable_meshes,
	MATERIAL_WIREFRAME,
	// cubeCamera,
} from './three';

import cast from './cast';

// import {

// 	tile_texture1,
// 	tile_texture3,
// 	tile_texture4,
// 	tile_texture5,
// 	tile_texture6,
// 	// tile_texture2,
// 	// canvas,
// } from './dom';



// const CLEAR_COLOR = 0xFFFFFF;
// const ATTRIBUTE_SIZE_2 = 2;
// const ATTRIBUTE_SIZE_3 = 3;
// const CAMERA_NEAR = 0.1;
// const CAMERA_FAR = 1000;
// const PERSPECTIVE_CAMERA_FOV = 45;
// const TEXTURE_ANISOTROPY = 16;
// const MATERIAL_WIREFRAME = false;



const TIME_TO_WAIT_FOR_APPENDING_WALL = 250;



const TEST_ROOM_HEIGHT_METERS = 3;



export default class Wall {

	static selected = null;
	static walls_to_add_new = [];
	static instances = null;
	static room_height = 0;

	static move (evt) {

		const [ point1, point2 ] = Wall.selected.points;

		point1.move(evt.movementX, evt.movementY);
		point2.move(evt.movementX, evt.movementY);
	}



	constructor (room, point1, point2) {

		// rename to related_points
		this.points = [ point1, point2 ];

		this.room = room;

		this.pixel_length = 0;

		this.points[0].walls.push(this);
		this.points[1].walls.push(this);

		this.rect = document.createElement('div');
		this.rect.className = 'coverings-plan-rect';

		this.rect.addEventListener('mousedown', (evt) => {

			evt.preventDefault();

			if (!modes.add_wall_mode) {

				window.addEventListener('mousemove', Wall.move);

				Wall.selected = this;
			}
		});

		this.rect.addEventListener('click', () => {

			if (modes.add_wall_mode) {

				this.rect.classList.add('-selected');

				Wall.walls_to_add_new.push(this);

				if (Wall.walls_to_add_new.length >= 2) {

					modes.add_wall_mode = 0;

					add_wall_mode_BUTTON.classList.remove('-pressed');

					setTimeout(() => {

						Wall.walls_to_add_new.forEach((wall) => wall.rect.classList.remove('-selected'));

						const new_point1 =
							Wall.walls_to_add_new[0].points[0].centerWith(Wall.walls_to_add_new[0].points[1]);
						const new_point2 =
							Wall.walls_to_add_new[1].points[0].centerWith(Wall.walls_to_add_new[1].points[1]);

						const [ shared_point ] = [

							...Wall.walls_to_add_new[0].points,
							...Wall.walls_to_add_new[1].points,
						]
							.filter(

								(point) =>
									(
										Wall.walls_to_add_new[0].points.includes(point) &&
										Wall.walls_to_add_new[1].points.includes(point)
									),
							);

						const shared_index = this.room.points.indexOf(shared_point);

						const new_points = this.room.points.slice();

						if (Wall.walls_to_add_new[0].points[1] === Wall.walls_to_add_new[1].points[0]) {

							new_points.splice(shared_index, 1, new_point1, new_point2);
						}
						else {

							new_points.splice(shared_index, 1, new_point2, new_point1);
						}

						this.room.makeContour(this.room.height, new_points);

						Wall.walls_to_add_new.length = 0;
					}, TIME_TO_WAIT_FOR_APPENDING_WALL);
				}
			}
		});

		this.rect.inner = document.createElement('div');

		this.rect.inner.className = 'coverings-plan-rect-inner';

		this.rect.appendChild(this.rect.inner);

		coverings_plan_NODE.appendChild(this.rect);



		this.tile_sizes = [ 1, 1 ];

		this.geometry = new THREE.BufferGeometry();
		this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
		this.geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array([]), 3));
		this.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([]), 2));
		this.geometry.setAttribute('uv2', new THREE.BufferAttribute(this.geometry.attributes.uv.array, 2));

		this.base_texture = new THREE.Texture();
		this.base_texture.anisotropy = webgl_maximum_anisotropy;
		this.base_texture.wrapS = THREE.RepeatWrapping;
		this.base_texture.wrapT = THREE.RepeatWrapping;

		this.normal_texture = new THREE.Texture();
		this.normal_texture.anisotropy = webgl_maximum_anisotropy;
		this.normal_texture.wrapS = THREE.RepeatWrapping;
		this.normal_texture.wrapT = THREE.RepeatWrapping;

		// ambient_occlusion
		this.ao_texture = new THREE.Texture();
		this.ao_texture.anisotropy = webgl_maximum_anisotropy;
		this.ao_texture.wrapS = THREE.RepeatWrapping;
		this.ao_texture.wrapT = THREE.RepeatWrapping;

		this.roughness_texture = new THREE.Texture();
		this.roughness_texture.anisotropy = webgl_maximum_anisotropy;
		this.roughness_texture.wrapS = THREE.RepeatWrapping;
		this.roughness_texture.wrapT = THREE.RepeatWrapping;

		this.metalness_texture = new THREE.Texture();
		this.metalness_texture.anisotropy = webgl_maximum_anisotropy;
		this.metalness_texture.wrapS = THREE.RepeatWrapping;
		this.metalness_texture.wrapT = THREE.RepeatWrapping;

		this.material = new THREE.MeshPhysicalMaterial({

			map: this.base_texture,
			normalMap: this.normal_texture,
			aoMap: this.ao_texture,
			roughnessMap: this.roughness_texture,
			metalnessMap: this.metalness_texture,
			side: THREE.BackSide,
			wireframe: MATERIAL_WIREFRAME,
		});

		this.mesh = new THREE.Mesh(this.geometry, this.material);

		this.mesh.userData.parent = this;

		raycastable_meshes.push(this.mesh);

		scene.add(this.mesh);
	}

	setTile (tile_sizes, textures) {

		this.tile_sizes = tile_sizes;

		this.base_texture.image = textures.base;
		this.normal_texture.image = textures.normal;
		this.ao_texture.image = textures.ao;
		this.roughness_texture.image = textures.roughness;
		this.metalness_texture.image = textures.metalness;

		this.base_texture.needsUpdate = true;
		this.normal_texture.needsUpdate = true;
		this.ao_texture.needsUpdate = true;
		this.roughness_texture.needsUpdate = true;
		this.metalness_texture.needsUpdate = true;

		// this.material.needsUpdate = true;
	}

	updateGeometry () {

		const [ point, next_point ] = this.points;

		const wall_data_index = [];
		const wall_data_position = [];
		const wall_data_normal = [];
		const wall_data_uv = [];

		const plane_geometry =
			new THREE.PlaneBufferGeometry(

				point.distanceTo(next_point) * cast.PIXELS_TO_METERS,
				this.room.height,
			);

		const vv1 = new THREE.Vector3(1, 0, 0);
		const vv2 = new THREE.Vector3(next_point.scene_x, 0, next_point.scene_z)
			.sub(new THREE.Vector3(point.scene_x, 0, point.scene_z)).normalize();
		const q = new THREE.Quaternion().setFromUnitVectors(vv1, vv2);

		const position = point.centerWith2(next_point);

		wall_data_index.push(...plane_geometry.index.array);
		wall_data_position.push(...plane_geometry.attributes.position.array);
		wall_data_normal.push(...plane_geometry.attributes.normal.array);
		wall_data_uv.push(...plane_geometry.attributes.uv.array);

		for (let i = 0; i < wall_data_uv.length; i += 2) {

			wall_data_uv[i + 0] *= this.pixel_length * cast.PIXELS_TO_METERS / this.tile_sizes[0];
			wall_data_uv[i + 1] *= this.room.height / this.tile_sizes[1];
		}

		// apply constants 3, 2
		this.geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(wall_data_index), 1));
		this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(wall_data_position), 3));
		this.geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(wall_data_normal), 3));
		this.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(wall_data_uv), 2));
		this.geometry.setAttribute('uv2', new THREE.BufferAttribute(this.geometry.attributes.uv.array, 2));

		this.mesh.quaternion.identity();
		this.mesh.applyQuaternion(q);
		this.mesh.position.set(position[0], this.room.height * 0.5, position[1]);
	}
}
