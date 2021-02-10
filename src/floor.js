/*
eslint-disable

no-magic-numbers,
*/



import earcut from 'earcut';
import * as THREE from 'three';

// import { coverings_plan_NODE } from './dom';

// import Wall from './wall';

// import modes from './modes';
// import cast from './cast';

import {

	// geometry_walls,
	// geometry_floor,
	// position_data_walls,
	// uv_data_walls,
	// index_data_floor,
	// position_data_floor,
	// normal_data_floor,
	// uv_data_floor,
	// mesh_floor,
	scene,
	floor_scene,
	webgl_maximum_anisotropy,
	raycastable_meshes,
	MATERIAL_WIREFRAME,
} from './three';



// const TEST_ROOM_HEIGHT_METERS = 3;



// inherit Floor and Wall from base class
export default class Floor {

	constructor (room) {

		this.room = room;

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
			// side: THREE.BackSide,
			wireframe: MATERIAL_WIREFRAME,
		});

		this.mesh = new THREE.Mesh(this.geometry, this.material);

		this.mesh.userData.parent = this;

		raycastable_meshes.push(this.mesh);

		scene.add(this.mesh);
		// floor_scene.add(this.mesh);
	}

	setTile (tile_sizes, textures) {

		this.tile_sizes = tile_sizes;

		this.base_texture.image = textures.base;
		this.normal_texture.image = textures.normal;
		this.ao_texture.image = textures.ao;
		this.roughness_texture.image = textures.roughness;
		this.metalness_texture.image = textures.metalness;

		console.log(textures);

		this.base_texture.needsUpdate = true;
		this.normal_texture.needsUpdate = true;
		this.ao_texture.needsUpdate = true;
		this.roughness_texture.needsUpdate = true;
		this.metalness_texture.needsUpdate = true;

		// this.material.needsUpdate = true;
	}

	updateGeometry () {

		const index_data_floor = [];
		const position_data_floor = [];
		const normal_data_floor = [];
		const uv_data_floor = [];
		const scene_coordinates = [];

		this.room.points.forEach((point) => scene_coordinates.push(point.scene_x, point.scene_z));
		// console.log(scene_coordinates);

		index_data_floor.push(...earcut(scene_coordinates).reverse());

		index_data_floor.forEach((index) => {

			if (!position_data_floor[index * 3]) {

				position_data_floor[(index * 3) + 0] = this.room.points[index].scene_x;
				position_data_floor[(index * 3) + 1] = 0;
				position_data_floor[(index * 3) + 2] = this.room.points[index].scene_z;

				normal_data_floor[(index * 3) + 0] = 0;
				normal_data_floor[(index * 3) + 1] = 1;
				normal_data_floor[(index * 3) + 2] = 0;

				uv_data_floor[(index * 2) + 0] = this.room.points[index].scene_x / this.tile_sizes[0];
				uv_data_floor[(index * 2) + 1] = this.room.points[index].scene_z / this.tile_sizes[1];
			}
		});

		// eliminate allocation of typed arrays from the function
		// make walls geometry calculations when toggling orbital mode on and show walls in orbital mode only
		this.geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(index_data_floor), 1));
		this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data_floor), 3));
		this.geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normal_data_floor), 3));
		this.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data_floor), 2));
		this.geometry.setAttribute('uv2', new THREE.BufferAttribute(this.geometry.attributes.uv.array, 2));

		// this.geometry.index.needsUpdate = true;
		// this.geometry.attributes.position.needsUpdate = true;
		// this.geometry.attributes.normal.needsUpdate = true;
		// this.geometry.attributes.uv.needsUpdate = true;
		// this.geometry.attributes.uv2.needsUpdate = true;
	}
}
