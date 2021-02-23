import * as THREE from 'three';

import {

	ATTRIBUTE_SIZE_1,
	ATTRIBUTE_SIZE_2,
	ATTRIBUTE_SIZE_3,
} from './three';

import cast from './cast';

import Tileable from './tileable';



export default class Segment extends Tileable {

	static selected = null;



	constructor (room, side, wall, width, height) {

		super(room, side);

		LOG(room, side, wall, width, height)

		this.wall = wall;

		this.width = width;
		this.height = height;
	}

	updateGeometry () {

		const plane_geometry = new THREE.PlaneBufferGeometry(this.width, this.height);

		if (this.mesh.geometry.index.array.length === 0) {

			this.mesh.geometry.setIndex(new THREE.BufferAttribute(plane_geometry.index.array, ATTRIBUTE_SIZE_1));
		}

		this.mesh.geometry.setAttribute(

			'position', new THREE.BufferAttribute(plane_geometry.attributes.position.array, ATTRIBUTE_SIZE_3),
		);

		this.mesh.geometry.setAttribute(

			'normal', new THREE.BufferAttribute(plane_geometry.attributes.normal.array, ATTRIBUTE_SIZE_3),
		);

		for (let i = 0; i < plane_geometry.attributes.uv.array.length; i += 2) {

			plane_geometry.attributes.uv.array[i + 0] *= this.width / this.tile.sizes[0];
			plane_geometry.attributes.uv.array[i + 1] *= this.height / this.tile.sizes[1];
		}

		this.mesh.geometry.setAttribute(

			'uv', new THREE.BufferAttribute(plane_geometry.attributes.uv.array, ATTRIBUTE_SIZE_2),
		);

		this.mesh.geometry.setAttribute(

			'uv2', new THREE.BufferAttribute(plane_geometry.attributes.uv.array, ATTRIBUTE_SIZE_2),
		);

		this.mesh.quaternion.copy(this.wall.quat);
		this.mesh.position.copy(this.wall.position);
		this.mesh.updateMatrix();

		this.mesh.geometry.computeBoundingSphere();
	}
}
