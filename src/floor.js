import earcut from 'earcut';
import * as THREE from 'three';

import Tileable from './tileable';

import {

	ATTRIBUTE_SIZE_2,
	ATTRIBUTE_SIZE_3,
} from './three';



export default class Floor extends Tileable {

	constructor (room) {

		super(room);

		this.mesh2 = new THREE.Mesh(this.mesh.geometry, this.mesh.material);

		// this.type = 'floor';

		this.quaternion
			.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), new THREE.Vector3(1, 0, 0)))
			.multiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1)))
			.multiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, -1, 0)));
	}

	updateGeometry () {

		const index_data_floor = [];
		const position_data_floor = [];
		const normal_data_floor = [];
		const uv_data_floor = [];
		const scene_coordinates = [];

		this.room.points.forEach((point) => {

			point.updateSceneCoordinates();

			scene_coordinates.push(point.scene_x, point.scene_z);
		});

		index_data_floor.push(...earcut(scene_coordinates));

		index_data_floor.forEach((index) => {

			if (!position_data_floor[index * ATTRIBUTE_SIZE_3]) {

				position_data_floor[(index * ATTRIBUTE_SIZE_3) + 0] = -this.room.points[index].scene_x;
				position_data_floor[(index * ATTRIBUTE_SIZE_3) + 1] = -this.room.points[index].scene_z;
				position_data_floor[(index * ATTRIBUTE_SIZE_3) + 2] = 0;

				normal_data_floor[(index * ATTRIBUTE_SIZE_3) + 0] = 0;
				normal_data_floor[(index * ATTRIBUTE_SIZE_3) + 1] = 0;
				normal_data_floor[(index * ATTRIBUTE_SIZE_3) + 2] = 1;

				uv_data_floor[(index * ATTRIBUTE_SIZE_2) + 0] = -this.room.points[index].scene_x / this.tile.sizes[0];
				uv_data_floor[(index * ATTRIBUTE_SIZE_2) + 1] = -this.room.points[index].scene_z / this.tile.sizes[1];
			}
		});

		// eliminate allocation of typed arrays from the function
		// make walls geometry calculations when toggling orbital mode on and show walls in orbital mode only
		this.mesh.geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(index_data_floor), 1));
		this.mesh.geometry.setAttribute(

			'position', new THREE.BufferAttribute(new Float32Array(position_data_floor), ATTRIBUTE_SIZE_3),
		);
		this.mesh.geometry.setAttribute(

			'normal', new THREE.BufferAttribute(new Float32Array(normal_data_floor), ATTRIBUTE_SIZE_3),
		);
		this.mesh.geometry.setAttribute(

			'uv', new THREE.BufferAttribute(new Float32Array(uv_data_floor), ATTRIBUTE_SIZE_2),
		);
		this.mesh.geometry.setAttribute(

			'uv2', new THREE.BufferAttribute(this.mesh.geometry.attributes.uv.array, ATTRIBUTE_SIZE_2),
		);

		this.mesh.quaternion.copy(this.quaternion);
		this.mesh.position.copy(this.position);
		this.mesh.updateMatrix();

		this.mesh.geometry.computeBoundingSphere();
	}
}
