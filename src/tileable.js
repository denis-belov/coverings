import * as THREE from 'three';

import Loader from 'external-data-loader';

import { transparent_IMG } from './dom';

import textures from './textures';

import {

	scene,
	raycastable_meshes,
	WEBGL_MAXIMUM_ANISOTROPY,
	MATERIAL_WIREFRAME,
	ATTRIBUTE_SIZE_1,
	ATTRIBUTE_SIZE_2,
	ATTRIBUTE_SIZE_3,
} from './three';



const loader = new Loader();



export default class Tileable {

	constructor (room) {

		// rename to smth
		this.tile = null;

		this.quaternion = new THREE.Quaternion();
		this.position = new THREE.Vector3();

		this.segments = [];

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

		this.physical_material = new THREE.MeshPhysicalMaterial({

			map,
			normalMap: normal_map,
			aoMap: ao_map,
			roughnessMap: roughness_map,
			metalnessMap: metalness_map,
			side: THREE.BackSide,
			wireframe: MATERIAL_WIREFRAME,
		});

		this.basic_material = new THREE.MeshBasicMaterial({

			map,
			side: THREE.BackSide,
		});

		this.mesh = new THREE.Mesh(geometry, this.physical_material);
		// remove ?
		this.mesh.matrixAutoUpdate = false;

		// rename
		this.mesh.userData.parent = this;

		raycastable_meshes.push(this.mesh);

		// tileable
		if (room) {

			this.room = room;
		}

		scene.add(this.mesh);
	}

	copy (tileable) {

		this.tile = tileable.tile;

		this.mesh.material = tileable.mesh.material;
	}

	// setTile2 (tile) {

	// 	this.tile = tile;

	// 	this.physical_material.map.image = this.tile.textures.map || transparent_IMG;
	// 	this.physical_material.normalMap.image = this.tile.textures.normal_map || transparent_IMG;
	// 	this.physical_material.aoMap.image = this.tile.textures.ao_map || transparent_IMG;
	// 	this.physical_material.roughnessMap.image = this.tile.textures.roughness_map || transparent_IMG;
	// 	this.physical_material.metalnessMap.image = this.tile.textures.metalness_map || transparent_IMG;

	// 	this.physical_material.map.needsUpdate = true;
	// 	this.physical_material.normalMap.needsUpdate = true;
	// 	this.physical_material.aoMap.needsUpdate = true;
	// 	this.physical_material.roughnessMap.needsUpdate = true;
	// 	this.physical_material.metalnessMap.needsUpdate = true;

	// 	this.physical_material.needsUpdate = true;



	// 	this.basic_material.map.image = this.tile.textures.map || transparent_IMG;

	// 	this.basic_material.map.needsUpdate = true;

	// 	this.basic_material.needsUpdate = true;
	// }

	async setTile (tile_id) {

		if (!textures[tile_id]) {

			const info = await fetch(

				tile_id,

				{ method: 'get' },
			)
				.then((response) => response.json());



			if (info.textures) {

				const sources = {};

				for (const texture in info.textures) {

					sources[texture] = { source: `${ __STATIC_PATH__ }${ info.textures[texture] }`, type: 'image' };
				}

				await loader.load({

					sources,

					// progress: () => 0,
				});
			}



			info.id = tile_id;

			info.textures = loader.content;

			loader.content = {};

			textures[tile_id] = info;
		}

		// LOG(textures[tile_id])

		this.tile = textures[tile_id];

		this.physical_material.map.image = this.tile.textures.map || transparent_IMG;
		this.physical_material.normalMap.image = this.tile.textures.normal_map || transparent_IMG;
		this.physical_material.aoMap.image = this.tile.textures.ao_map || transparent_IMG;
		this.physical_material.roughnessMap.image = this.tile.textures.roughness_map || transparent_IMG;
		this.physical_material.metalnessMap.image = this.tile.textures.metalness_map || transparent_IMG;

		this.physical_material.map.needsUpdate = true;
		this.physical_material.normalMap.needsUpdate = true;
		this.physical_material.aoMap.needsUpdate = true;
		this.physical_material.roughnessMap.needsUpdate = true;
		this.physical_material.metalnessMap.needsUpdate = true;

		this.physical_material.needsUpdate = true;



		this.basic_material.map.image = this.tile.textures.map || transparent_IMG;

		this.basic_material.map.needsUpdate = true;

		this.basic_material.needsUpdate = true;
	}

	setBasicMaterial () {

		this.mesh.material = this.basic_material;
	}

	setPhysicalMaterial () {

		this.mesh.material = this.physical_material;
	}

	// Return polybooljs object (triangle) array that can be used as polybooljs boolean operation argument.
	// Decided to split entire geometry into separate polybooljs triangle object with a single "regions" element
	// and apply boolean operation to each of them
	// because wrong operation results are being appeared with any other approaches.
	getPolybooljsTriangles () {

		const polybooljs_triangles = [];

		for (let i = 0; i < this.mesh.geometry.index.array.length; i += 3) {

			const polybooljs_triangle = { regions: [] };

			const index1 = this.mesh.geometry.index.array[i + 0] * 3;
			const index2 = this.mesh.geometry.index.array[i + 1] * 3;
			const index3 = this.mesh.geometry.index.array[i + 2] * 3;

			polybooljs_triangle.regions.push(

				[
					[
						this.mesh.geometry.attributes.position.array[index1 + 0],
						this.mesh.geometry.attributes.position.array[index1 + 1],
					],

					[
						this.mesh.geometry.attributes.position.array[index2 + 0],
						this.mesh.geometry.attributes.position.array[index2 + 1],
					],

					[
						this.mesh.geometry.attributes.position.array[index3 + 0],
						this.mesh.geometry.attributes.position.array[index3 + 1],
					],
				],
			);

			polybooljs_triangles.push(polybooljs_triangle);
		}

		return polybooljs_triangles;
	}
}
