import * as THREE from 'three';

import Loader from 'external-data-loader';

// import { transparent_IMG } from './dom';

// import textures from './textures';

import {

	scene,
	raycastable_meshes,
	// WEBGL_MAXIMUM_ANISOTROPY,
	// MATERIAL_WIREFRAME,
	ATTRIBUTE_SIZE_1,
	ATTRIBUTE_SIZE_2,
	ATTRIBUTE_SIZE_3,
} from './three';

import Material from './material';



const loader = new Loader();



const default_material = new THREE.MeshBasicMaterial({

	color: 'white',
	side: THREE.BackSide,
});



export default class Tileable {

	constructor (room) {

		// rename to smth
		// this.tile = null;

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

		this.mesh = new THREE.Mesh(geometry, default_material);
		// remove ?
		// this.mesh.matrixAutoUpdate = false;

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

		this.material = tileable.material;

		this.mesh.material = tileable.mesh.material;
	}

	async applyMaterial (material_id) {

		if (Material.instances[material_id]) {

			this.material = Material.instances[material_id];
		}
		else {

			const attributes = await fetch(

				material_id,

				{ method: 'get' },
			)
				.then((response) => response.json());



			const sources = {};

			for (const texture in attributes.textures) {

				sources[texture] = { source: `${ __STATIC_PATH__ }${ attributes.textures[texture] }`, type: 'image' };
			}

			attributes.textures = await loader.load({

				sources,

				// progress: () => 0,
			});



			loader.content = {};

			this.material = new Material(material_id, attributes);
		}



		this.usePhysicalMaterial();
	}

	useBasicMaterial () {

		this.mesh.material = this.material.basic;
	}

	usePhysicalMaterial () {

		this.mesh.material = this.material.physical;
	}

	useHoverMaterial () {

		this.mesh.material = this.material.hover;
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
