import * as THREE from 'three';

import Loader from 'external-data-loader';

import { transparent_IMG } from './dom';

import {

	WEBGL_MAXIMUM_ANISOTROPY,
	MATERIAL_WIREFRAME,
} from './three';



const loader = new Loader();



export default class Material {

	static instances = [];

	static default = null;



	static loadDefault = async () => {

		const attributes = await fetch(

			`${ __STATIC_PATH__ }/textures/3/info.json`,

			{ method: 'get' },
		)
			.then((response) => response.json());



		const sources = {};

		for (const texture_type in attributes.textures) {

			sources[texture_type] =
				{
					source: `${ __STATIC_PATH__ }${ attributes.textures[texture_type] }`,

					type: 'image',
				};
		}

		await loader.load({

			sources,

			// progress: () => 0,
		});

		attributes.textures = loader.content;



		Material.default = new Material(`${ __STATIC_PATH__ }/textures/3/info.json`, attributes);



		loader.content = {};
	};



	constructor (id, attributes) {

		this.id = id;

		this.sizes = attributes.sizes;

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

		this.basic = new THREE.MeshBasicMaterial({

			map,
			side: THREE.BackSide,
		});

		this.basic.map.image = attributes.textures.map || transparent_IMG;

		this.basic.map.needsUpdate = true;

		// this.basic.needsUpdate = true;



		this.physical = new THREE.MeshPhysicalMaterial({

			map,
			normalMap: normal_map,
			aoMap: ao_map,
			roughnessMap: roughness_map,
			metalnessMap: metalness_map,
			side: THREE.BackSide,
			wireframe: MATERIAL_WIREFRAME,
		});

		this.physical.map.image = attributes.textures.map || transparent_IMG;
		this.physical.normalMap.image = attributes.textures.normal_map || transparent_IMG;
		this.physical.aoMap.image = attributes.textures.ao_map || transparent_IMG;
		this.physical.roughnessMap.image = attributes.textures.roughness_map || transparent_IMG;
		this.physical.metalnessMap.image = attributes.textures.metalness_map || transparent_IMG;

		this.physical.map.needsUpdate = true;
		this.physical.normalMap.needsUpdate = true;
		this.physical.aoMap.needsUpdate = true;
		this.physical.roughnessMap.needsUpdate = true;
		this.physical.metalnessMap.needsUpdate = true;

		// this.physical.needsUpdate = true;



		this.hover = this.physical.clone();

		this.hover.color = new THREE.Color(0xADD8E6);



		Material.instances[id] = this;
	}

	// applyTextures () {

	// 	// this.physical.map.image = textures.map || transparent_IMG;
	// 	// this.physical.normalMap.image = textures.normal_map || transparent_IMG;
	// 	// this.physical.aoMap.image = textures.ao_map || transparent_IMG;
	// 	// this.physical.roughnessMap.image = textures.roughness_map || transparent_IMG;
	// 	// this.physical.metalnessMap.image = textures.metalness_map || transparent_IMG;

	// 	// this.physical.map.needsUpdate = true;
	// 	// this.physical.normalMap.needsUpdate = true;
	// 	// this.physical.aoMap.needsUpdate = true;
	// 	// this.physical.roughnessMap.needsUpdate = true;
	// 	// this.physical.metalnessMap.needsUpdate = true;

	// 	// this.physical.needsUpdate = true;



	// 	// this.basic.map.image = textures.map || transparent_IMG;

	// 	// this.basic.map.needsUpdate = true;

	// 	// this.basic.needsUpdate = true;
	// }
}
