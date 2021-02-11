import * as THREE from 'three';

import {

	scene,
	webgl_maximum_anisotropy,
	raycastable_meshes,
	MATERIAL_WIREFRAME,
	ATTRIBUTE_SIZE_2,
	ATTRIBUTE_SIZE_3,
} from './three';



const none_image = new Image();



export default class Tileable {

	constructor (room, side) {

		this.room = room;

		this.tile_sizes = [ 1, 1 ];

		this.geometry = new THREE.BufferGeometry();
		this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), ATTRIBUTE_SIZE_3));
		this.geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array([]), ATTRIBUTE_SIZE_3));
		this.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([]), ATTRIBUTE_SIZE_2));
		this.geometry.setAttribute(

			'uv2', new THREE.BufferAttribute(this.geometry.attributes.uv.array, ATTRIBUTE_SIZE_2),
		);

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

			map: null,
			normalMap: null,
			aoMap: null,
			roughnessMap: null,
			metalnessMap: null,
			side: THREE[side],
			wireframe: MATERIAL_WIREFRAME,
		});

		this.mesh = new THREE.Mesh(this.geometry, this.material);

		this.mesh.userData.parent = this;

		raycastable_meshes.push(this.mesh);

		scene.add(this.mesh);
	}

	setTile (tile_sizes, textures) {

		this.tile_sizes = tile_sizes;

		if (textures.base) {

			this.base_texture.image = textures.base;
			this.material.map = this.base_texture;
		}
		else {

			this.material.map = null;
		}

		if (textures.normal) {

			this.normal_texture.image = textures.normal;
			this.material.normalMap = this.normal_texture;
		}
		else {

			this.material.normalMap = null;
		}

		if (textures.ao) {

			this.ao_texture.image = textures.ao;
			this.material.aoMap = this.ao_texture;
		}
		else {

			this.material.aoMap = null;
		}

		if (textures.roughness) {

			this.roughness_texture.image = textures.roughness;
			this.material.roughnessMap = this.roughness_texture;
		}
		else {

			this.material.roughnessMap = null;
		}

		if (textures.metalness) {

			this.metalness_texture.image = textures.metalness;
			this.material.metalnessMap = this.metalness_texture;
		}
		else {

			this.material.metalnessMap = null;
		}

		this.base_texture.needsUpdate = true;
		this.normal_texture.needsUpdate = true;
		this.ao_texture.needsUpdate = true;
		this.roughness_texture.needsUpdate = true;
		this.metalness_texture.needsUpdate = true;

		this.material.needsUpdate = true;
	}
}
