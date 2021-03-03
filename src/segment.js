/*
eslint-disable

max-params,
*/



import * as THREE from 'three';
import earcut from 'earcut';
// import polygon_clipping from 'polygon-clipping';
import polybooljs from 'polybooljs';

import {

	// ATTRIBUTE_SIZE_1,
	ATTRIBUTE_SIZE_2,
	ATTRIBUTE_SIZE_3,
} from './three';

// import cast from './cast';

import Tileable from './tileable';



export default class Segment extends Tileable {

	// change tileable to something
	constructor (room, scene, tileable, meter_width, meter_height, meter_left, meter_top) {

		super(room, scene);

		// LOG(tileable.mesh.userData.parent.type)

		// tileable.object3d.add(this.mesh);

		this.tileable = tileable;

		this.meter_width = meter_width;
		this.meter_height = meter_height;

		this.meter_left = meter_left;
		this.meter_top = meter_top;

		this.z_index = this.tileable.z_index++;

		// this.material.depthWrite = false;
		// this.material.depthTest = false;
		// this.material.needsUpdate = true;

		// this.mesh.renderOrder = this.z_index;
	}

	updateGeometry () {

		const index_data = [];
		const position_data = [];
		const normal_data = [];
		const uv_data = [];
		const scene_coordinates = [];

		const segment_geometry = new THREE.PlaneBufferGeometry(this.meter_width, this.meter_height);

		const segment_polygons = { regions: [] };

		for (let i = 0; i < segment_geometry.index.array.length; i += 3) {

			const index1 = segment_geometry.index.array[i + 0] * 3;
			const index2 = segment_geometry.index.array[i + 1] * 3;
			const index3 = segment_geometry.index.array[i + 2] * 3;

			segment_polygons.regions.push(

				[
					[
						segment_geometry.attributes.position.array[index1 + 0] - this.meter_left,
						segment_geometry.attributes.position.array[index1 + 1] - this.meter_top,
					],

					[
						segment_geometry.attributes.position.array[index2 + 0] - this.meter_left,
						segment_geometry.attributes.position.array[index2 + 1] - this.meter_top,
					],

					[
						segment_geometry.attributes.position.array[index3 + 0] - this.meter_left,
						segment_geometry.attributes.position.array[index3 + 1] - this.meter_top,
					],
				],
			);

			// segment_polygons.inverted = true;
		}



		const tileable_polygons = { regions: [] };

		const tileable_geometry = this.tileable.mesh.geometry;

		for (let i = 0; i < tileable_geometry.index.array.length; i += 3) {

			const index1 = tileable_geometry.index.array[i + 0] * 3;
			const index2 = tileable_geometry.index.array[i + 1] * 3;
			const index3 = tileable_geometry.index.array[i + 2] * 3;

			tileable_polygons.regions.push(

				[
					[
						tileable_geometry.attributes.position.array[index1 + 0],
						tileable_geometry.attributes.position.array[index1 + 1],
					],

					[
						tileable_geometry.attributes.position.array[index2 + 0],
						tileable_geometry.attributes.position.array[index2 + 1],
					],

					[
						tileable_geometry.attributes.position.array[index3 + 0],
						tileable_geometry.attributes.position.array[index3 + 1],
					],
				],
			);

			// tileable_polygons.inverted = true;
		}



		// const intersection_polygons = polybooljs.intersect(segment_polygons, tileable_polygons);
		const intersection_polygons = polybooljs.differenceRev(segment_polygons, tileable_polygons);

		LOG(intersection_polygons?.regions);

		intersection_polygons?.regions &&

			intersection_polygons.regions.forEach((region) => {

				scene_coordinates.length = 0;

				// LOG(index, position_data.length / 3)

				region.forEach((coordinates) => scene_coordinates.push(...coordinates));

				const qwe = (position_data.length / 3);

				const _index_data = [ ...earcut(scene_coordinates).map((elm) => elm + qwe) ];

				index_data.push(..._index_data);

				LOG(index_data)

				_index_data.forEach((_index) => {

					// const _index = index - qwe;

					LOG(_index)

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

			LOG(position_data)

			// index_data.push(...earcut(scene_coordinates).map((elm) => elm));

			// index_data.forEach((_index) => {

			// 	if (!position_data[_index * ATTRIBUTE_SIZE_3]) {

			// 		position_data[(_index * ATTRIBUTE_SIZE_3) + 0] = scene_coordinates[(_index * 2) + 0];
			// 		position_data[(_index * ATTRIBUTE_SIZE_3) + 1] = scene_coordinates[(_index * 2) + 1];
			// 		position_data[(_index * ATTRIBUTE_SIZE_3) + 2] = 0;

			// 		normal_data[(_index * ATTRIBUTE_SIZE_3) + 0] = 0;
			// 		normal_data[(_index * ATTRIBUTE_SIZE_3) + 1] = 0;
			// 		normal_data[(_index * ATTRIBUTE_SIZE_3) + 2] = 1;

			// 		uv_data[(_index * ATTRIBUTE_SIZE_2) + 0] = scene_coordinates[(_index * 2) + 0] / this.tile.sizes[0];
			// 		uv_data[(_index * ATTRIBUTE_SIZE_2) + 1] = scene_coordinates[(_index * 2) + 1] / this.tile.sizes[1];
			// 	}
			// });


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
		// this.tileable.mesh2.geometry.setAttribute(

		// 	'uv', new THREE.BufferAttribute(new Float32Array(uv_data), ATTRIBUTE_SIZE_2),
		// );
		// this.tileable.mesh2.geometry.setAttribute(

		// 	'uv2', new THREE.BufferAttribute(this.mesh.geometry.attributes.uv.array, ATTRIBUTE_SIZE_2),
		// );

		// this.tileable.mesh2.quaternion.copy(this.quaternion);
		// this.tileable.mesh2.position.copy(this.position);
		// this.tileable.mesh2.updateMatrix();

		// this.tileable.mesh2.geometry.computeBoundingSphere();

		// this.mesh.quaternion.copy(this.tileable.quaternion);
		// this.mesh.position.copy(this.tileable.position);
		// this.mesh.updateMatrix();

		// this.mesh.geometry.computeBoundingSphere();

		this.tileable.mesh.visible = false;
	}
}
