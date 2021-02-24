import * as THREE from 'three';

import { transparent_IMG } from './dom';

import {

	scene1,
	scene2,
	WEBGL_MAXIMUM_ANISOTROPY,
	raycastable_meshes,
	MATERIAL_WIREFRAME,
	ATTRIBUTE_SIZE_1,
	ATTRIBUTE_SIZE_2,
	ATTRIBUTE_SIZE_3,
} from './three';



export default class Tileable {

	constructor (room, side, scene) {

		this.room = room;

		this.tile = null;

		// for using with walls
		this.quat = new THREE.Quaternion();
		this.position = new THREE.Vector3();

		// rename to children ?
		this.z_index = 0;

		const geometry = new THREE.BufferGeometry();
		geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(), ATTRIBUTE_SIZE_1));
		geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(), ATTRIBUTE_SIZE_3));
		geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(), ATTRIBUTE_SIZE_3));
		geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(), ATTRIBUTE_SIZE_2));
		geometry.setAttribute(

			'uv2', new THREE.BufferAttribute(new Float32Array(), ATTRIBUTE_SIZE_2),
		);

		const map = new THREE.Texture();
		map.image = transparent_IMG;
		map.anisotropy = WEBGL_MAXIMUM_ANISOTROPY;
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;

		const normal_map = new THREE.Texture();
		normal_map.image = transparent_IMG;
		normal_map.anisotropy = WEBGL_MAXIMUM_ANISOTROPY;
		normal_map.wrapS = THREE.RepeatWrapping;
		normal_map.wrapT = THREE.RepeatWrapping;

		// ambient_occlusion
		const ao_map = new THREE.Texture();
		ao_map.image = transparent_IMG;
		ao_map.anisotropy = WEBGL_MAXIMUM_ANISOTROPY;
		ao_map.wrapS = THREE.RepeatWrapping;
		ao_map.wrapT = THREE.RepeatWrapping;

		const roughness_map = new THREE.Texture();
		roughness_map.image = transparent_IMG;
		roughness_map.anisotropy = WEBGL_MAXIMUM_ANISOTROPY;
		roughness_map.wrapS = THREE.RepeatWrapping;
		roughness_map.wrapT = THREE.RepeatWrapping;

		const metalness_map = new THREE.Texture();
		metalness_map.image = transparent_IMG;
		metalness_map.anisotropy = WEBGL_MAXIMUM_ANISOTROPY;
		metalness_map.wrapS = THREE.RepeatWrapping;
		metalness_map.wrapT = THREE.RepeatWrapping;

		this.material = new THREE.MeshPhysicalMaterial({

			map,
			normalMap: normal_map,
			aoMap: ao_map,
			roughnessMap: roughness_map,
			metalnessMap: metalness_map,
			side: THREE[side],
			wireframe: MATERIAL_WIREFRAME,
		});

		this.material2 = new THREE.MeshBasicMaterial({

			map,
			side: THREE[side],
		});

		this.mesh = new THREE.Mesh(geometry, this.material);
		this.mesh.matrixAutoUpdate = false;
		this.mesh.userData.parent = this;

		raycastable_meshes.push(this.mesh);

		(scene === 1 ? scene1 : scene2).add(this.mesh);
	}

	copy (tileable) {

		this.tile = tileable.tile;

		this.mesh.material = tileable.mesh.material;
	}

	setTile (tile) {

		this.tile = tile;

		this.material.map.image = this.tile.textures.map || transparent_IMG;
		this.material.normalMap.image = this.tile.textures.normal_map || transparent_IMG;
		this.material.aoMap.image = this.tile.textures.ao_map || transparent_IMG;
		this.material.roughnessMap.image = this.tile.textures.roughness_map || transparent_IMG;
		this.material.metalnessMap.image = this.tile.textures.metalness_map || transparent_IMG;

		this.material.map.needsUpdate = true;
		this.material.normalMap.needsUpdate = true;
		this.material.aoMap.needsUpdate = true;
		this.material.roughnessMap.needsUpdate = true;
		this.material.metalnessMap.needsUpdate = true;

		this.material.needsUpdate = true;



		this.material2.map.image = this.tile.textures.map || transparent_IMG;

		this.material2.map.needsUpdate = true;

		this.material2.needsUpdate = true;
	}
}
