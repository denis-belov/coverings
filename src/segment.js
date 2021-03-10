/*
eslint-disable

max-params,
*/



import * as THREE from 'three';
import earcut from 'earcut';

import {

	ATTRIBUTE_SIZE_2,
	ATTRIBUTE_SIZE_3,
} from './three';

import Tileable from './tileable';



export default class Segment extends Tileable {

	// change tileable to something
	constructor (room, tileable) {

		super(room);

		this.tileable = tileable;
	}

	updateGeometry2 (region) {

		const scene_coordinates = [];
		const index_data = [];
		const position_data = [];
		const normal_data = [];
		const uv_data = [];

		region.forEach((coordinates) => scene_coordinates.push(...coordinates));

		const qwe = (position_data.length / 3);

		const _index_data = [ ...earcut(scene_coordinates).map((elm) => elm + qwe) ];

		index_data.push(..._index_data);

		_index_data.forEach((_index) => {

			if (!position_data[_index * ATTRIBUTE_SIZE_3]) {

				position_data[(_index * ATTRIBUTE_SIZE_3) + 0] = scene_coordinates[((_index - qwe) * 2) + 0];
				position_data[(_index * ATTRIBUTE_SIZE_3) + 1] = scene_coordinates[((_index - qwe) * 2) + 1];
				position_data[(_index * ATTRIBUTE_SIZE_3) + 2] = 0;

				normal_data[(_index * ATTRIBUTE_SIZE_3) + 0] = 0;
				normal_data[(_index * ATTRIBUTE_SIZE_3) + 1] = 0;
				normal_data[(_index * ATTRIBUTE_SIZE_3) + 2] = 1;

				uv_data[(_index * ATTRIBUTE_SIZE_2) + 0] = scene_coordinates[((_index - qwe) * 2) + 0] / this.tile.sizes[0];
				uv_data[(_index * ATTRIBUTE_SIZE_2) + 1] = scene_coordinates[((_index - qwe) * 2) + 1] / this.tile.sizes[1];
			}
		});



		this.mesh.geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(index_data), 1));
		this.mesh.geometry.setAttribute(

			'position', new THREE.BufferAttribute(new Float32Array(position_data), ATTRIBUTE_SIZE_3),
		);
		this.mesh.geometry.setAttribute(

			'normal', new THREE.BufferAttribute(new Float32Array(normal_data), ATTRIBUTE_SIZE_3),
		);
		this.mesh.geometry.setAttribute(

			'uv', new THREE.BufferAttribute(new Float32Array(uv_data), ATTRIBUTE_SIZE_2),
		);
		this.mesh.geometry.setAttribute(

			'uv2', new THREE.BufferAttribute(this.mesh.geometry.attributes.uv.array, ATTRIBUTE_SIZE_2),
		);
	}

	updateGeometry3 () {

		const scene_coordinates = [];
		const index_data = [];
		const position_data = [];
		const normal_data = [];
		const uv_data = [];

		this.region.forEach((coordinates) => scene_coordinates.push(...coordinates));

		const qwe = (position_data.length / 3);

		const _index_data = [ ...earcut(scene_coordinates).map((elm) => elm + qwe) ];

		index_data.push(..._index_data);

		_index_data.forEach((_index) => {

			if (!position_data[_index * ATTRIBUTE_SIZE_3]) {

				position_data[(_index * ATTRIBUTE_SIZE_3) + 0] = scene_coordinates[((_index - qwe) * 2) + 0];
				position_data[(_index * ATTRIBUTE_SIZE_3) + 1] = scene_coordinates[((_index - qwe) * 2) + 1];
				position_data[(_index * ATTRIBUTE_SIZE_3) + 2] = 0;

				normal_data[(_index * ATTRIBUTE_SIZE_3) + 0] = 0;
				normal_data[(_index * ATTRIBUTE_SIZE_3) + 1] = 0;
				normal_data[(_index * ATTRIBUTE_SIZE_3) + 2] = 1;

				uv_data[(_index * ATTRIBUTE_SIZE_2) + 0] = scene_coordinates[((_index - qwe) * 2) + 0] / this.tile.sizes[0];
				uv_data[(_index * ATTRIBUTE_SIZE_2) + 1] = scene_coordinates[((_index - qwe) * 2) + 1] / this.tile.sizes[1];
			}
		});



		this.mesh.geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(index_data), 1));
		this.mesh.geometry.setAttribute(

			'position', new THREE.BufferAttribute(new Float32Array(position_data), ATTRIBUTE_SIZE_3),
		);
		this.mesh.geometry.setAttribute(

			'normal', new THREE.BufferAttribute(new Float32Array(normal_data), ATTRIBUTE_SIZE_3),
		);
		this.mesh.geometry.setAttribute(

			'uv', new THREE.BufferAttribute(new Float32Array(uv_data), ATTRIBUTE_SIZE_2),
		);
		this.mesh.geometry.setAttribute(

			'uv2', new THREE.BufferAttribute(this.mesh.geometry.attributes.uv.array, ATTRIBUTE_SIZE_2),
		);
	}

	updateGeometry (regions) {

		const index_data = [];
		const position_data = [];
		const normal_data = [];
		const uv_data = [];

		// move to constructor
		this.regions = regions;

		regions.forEach((region) => {

			const scene_coordinates = [];

			region.forEach((coordinates) => scene_coordinates.push(...coordinates));

			const qwe = (position_data.length / 3);

			const _index_data = [ ...earcut(scene_coordinates).map((elm) => elm + qwe) ];

			index_data.push(..._index_data);

			_index_data.forEach((_index) => {

				if (!position_data[_index * ATTRIBUTE_SIZE_3]) {

					position_data[(_index * ATTRIBUTE_SIZE_3) + 0] = scene_coordinates[((_index - qwe) * 2) + 0];
					position_data[(_index * ATTRIBUTE_SIZE_3) + 1] = scene_coordinates[((_index - qwe) * 2) + 1];
					position_data[(_index * ATTRIBUTE_SIZE_3) + 2] = 0;

					normal_data[(_index * ATTRIBUTE_SIZE_3) + 0] = 0;
					normal_data[(_index * ATTRIBUTE_SIZE_3) + 1] = 0;
					normal_data[(_index * ATTRIBUTE_SIZE_3) + 2] = 1;

					uv_data[(_index * ATTRIBUTE_SIZE_2) + 0] = scene_coordinates[((_index - qwe) * 2) + 0] / this.tile.sizes[0];
					uv_data[(_index * ATTRIBUTE_SIZE_2) + 1] = scene_coordinates[((_index - qwe) * 2) + 1] / this.tile.sizes[1];
				}
			});
		});



		this.mesh.geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(index_data), 1));
		// this.mesh.geometry.index = null;
		this.mesh.geometry.setAttribute(

			'position', new THREE.BufferAttribute(new Float32Array(position_data), ATTRIBUTE_SIZE_3),
		);
		this.mesh.geometry.setAttribute(

			'normal', new THREE.BufferAttribute(new Float32Array(normal_data), ATTRIBUTE_SIZE_3),
		);
		this.mesh.geometry.setAttribute(

			'uv', new THREE.BufferAttribute(new Float32Array(uv_data), ATTRIBUTE_SIZE_2),
		);
		this.mesh.geometry.setAttribute(

			'uv2', new THREE.BufferAttribute(this.mesh.geometry.attributes.uv.array, ATTRIBUTE_SIZE_2),
		);
	}

	updateGeometry4 (regions) {

		const index_data = [];
		const position_data = [];
		const normal_data = [];
		const uv_data = [];

		// move to constructor
		this.regions = regions;

		regions.forEach((region) => {

			// LOG(region)

			// const scene_coordinates = [];

			// region.coordinates.forEach((coordinates) => scene_coordinates.push(...coordinates));

			// scene_coordinates.push(...region.coordinates);

			const qwe = (position_data.length / 3);

			const _index_data = [ ...region.indices.map((elm) => elm + qwe) ];
			// const _index_data = region.indices;

			index_data.push(..._index_data);

			for (let i = 0; i < region.coordinates.length; i += 2) {

				// position_data[(_index * ATTRIBUTE_SIZE_3) + 0] = region.coordinates[i + 0];
				// position_data[(_index * ATTRIBUTE_SIZE_3) + 1] = region.coordinates[i + 1];
				// position_data[(_index * ATTRIBUTE_SIZE_3) + 2] = 0;

				position_data.push(region.coordinates[i + 0], region.coordinates[i + 1], 0);

				// normal_data[(_index * ATTRIBUTE_SIZE_3) + 0] = 0;
				// normal_data[(_index * ATTRIBUTE_SIZE_3) + 1] = 0;
				// normal_data[(_index * ATTRIBUTE_SIZE_3) + 2] = 1;

				normal_data.push(0, 0, 1);

				// uv_data[(_index * ATTRIBUTE_SIZE_2) + 0] = region.coordinates[i + 0] / this.tile.sizes[0];
				// uv_data[(_index * ATTRIBUTE_SIZE_2) + 1] = region.coordinates[i + 1] / this.tile.sizes[1];

				uv_data.push(region.coordinates[i + 0] / this.tile.sizes[0], region.coordinates[i + 1] / this.tile.sizes[1]);
			}

			// _index_data.forEach((_index) => {

			// 	// if (!position_data[_index * ATTRIBUTE_SIZE_3]) {

			// 	position_data[(_index * ATTRIBUTE_SIZE_3) + 0] = region.coordinates[((_index - qwe) * 2) + 0];
			// 	position_data[(_index * ATTRIBUTE_SIZE_3) + 1] = region.coordinates[((_index - qwe) * 2) + 1];
			// 	position_data[(_index * ATTRIBUTE_SIZE_3) + 2] = 0;

			// 	normal_data[(_index * ATTRIBUTE_SIZE_3) + 0] = 0;
			// 	normal_data[(_index * ATTRIBUTE_SIZE_3) + 1] = 0;
			// 	normal_data[(_index * ATTRIBUTE_SIZE_3) + 2] = 1;

			// 	uv_data[(_index * ATTRIBUTE_SIZE_2) + 0] = region.coordinates[((_index - qwe) * 2) + 0] / this.tile.sizes[0];
			// 	uv_data[(_index * ATTRIBUTE_SIZE_2) + 1] = region.coordinates[((_index - qwe) * 2) + 1] / this.tile.sizes[1];
			// 	// }
			// });
		});



		this.mesh.geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(index_data), 1));
		// this.mesh.geometry.index = null;
		this.mesh.geometry.setAttribute(

			'position', new THREE.BufferAttribute(new Float32Array(position_data), ATTRIBUTE_SIZE_3),
		);
		this.mesh.geometry.setAttribute(

			'normal', new THREE.BufferAttribute(new Float32Array(normal_data), ATTRIBUTE_SIZE_3),
		);
		this.mesh.geometry.setAttribute(

			'uv', new THREE.BufferAttribute(new Float32Array(uv_data), ATTRIBUTE_SIZE_2),
		);
		this.mesh.geometry.setAttribute(

			'uv2', new THREE.BufferAttribute(this.mesh.geometry.attributes.uv.array, ATTRIBUTE_SIZE_2),
		);
	}
}
