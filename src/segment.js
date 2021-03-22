/*
eslint-disable

max-params,
*/



import * as THREE from 'three';
import earcut from 'earcut';

import {

	raycastable_meshes,
	scene,
	ATTRIBUTE_SIZE_2,
	ATTRIBUTE_SIZE_3,
} from './three';

import Tileable from './tileable';



export default class Segment extends Tileable {

	// change tileable to something
	constructor (room, tileable, polygons) {

		super(room);

		this.tileable = tileable;

		this.polygons = polygons;

		this.tileable.segments.push(this);

		// LOG(this.polygons)
	}

	updateGeometry () {

		const index_data = [];
		const position_data = [];
		const normal_data = [];
		const uv_data = [];



		// this.polygons = polygons;

		this.polygons.forEach((polygon) => {

			const scene_coordinates = [];

			polygon.forEach((coordinates) => scene_coordinates.push(...coordinates));

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

					uv_data[(_index * ATTRIBUTE_SIZE_2) + 0] =
						scene_coordinates[((_index - qwe) * 2) + 0] / this.tile.sizes[0];

					uv_data[(_index * ATTRIBUTE_SIZE_2) + 1] =
						scene_coordinates[((_index - qwe) * 2) + 1] / this.tile.sizes[1];
				}
			});
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

	// rename to destroy
	remove () {

		this.tileable.segments.splice(this.tileable.segments.indexOf(this), 1);

		raycastable_meshes.splice(raycastable_meshes.indexOf(this.mesh), 1);

		scene.remove(this.mesh);
	}
}
