import {

	coverings_plan_NODE,
	add_wall_mode_BUTTON,
} from './dom';

import modes from './modes';

import * as THREE from 'three';

import {

	raycastable_meshes,
	scene,
	ATTRIBUTE_SIZE_1,
	ATTRIBUTE_SIZE_2,
	ATTRIBUTE_SIZE_3,
} from './three';

import cast from './cast';

import Tileable from './tileable';



export default class Wall extends Tileable {

	static selected = null;
	static walls_to_add_new = [];

	static move (evt) {

		const [ point1, point2 ] = Wall.selected.points;

		point1.move2(evt.movementX, evt.movementY);
		point2.move2(evt.movementX, evt.movementY);
	}



	constructor (room, point1, point2) {

		super(room);

		// this.mesh2 = new THREE.Mesh(this.mesh.geometry, this.mesh.material);

		// rename to related_points
		this.points = [ point1, point2 ];

		this.pixel_length = point1.distanceTo(point2);

		!this.points[0].walls.includes(this) &&

			this.points[0].walls.push(this);

		!this.points[1].walls.includes(this) &&

			this.points[1].walls.push(this);

		this.rect = document.createElement('div');
		this.rect.className = 'coverings-plan-rect';

		this.rect.addEventListener('mousedown', (evt) => {

			evt.preventDefault();

			if (!modes.add_wall_mode) {

				window.addEventListener('mousemove', Wall.move);

				Wall.selected = this;
			}
		});

		this.rect.addEventListener('click', () => {

			if (modes.add_wall_mode) {

				this.rect.classList.add('-selected');

				modes.add_wall_mode = 0;

				add_wall_mode_BUTTON.classList.remove('-pressed');

				const new_point = this.points[0].centerWith(this.points[1]);

				const p1_index = this.room.points.indexOf(this.points[0]);
				const p2_index = this.room.points.indexOf(this.points[1]);

				// const old_points = this.room.points.slice();
				const new_points = this.room.points.slice();

				new_points.splice(

					Math.abs(p1_index - p2_index) === 1 ?
						Math.max(p1_index, p2_index) :
						Math.min(p1_index, p2_index),

					0,

					new_point,
				);

				this.room.update(new_points);
			}
		});

		this.rect.inner = document.createElement('div');

		this.rect.inner.className = 'coverings-plan-rect-inner';

		this.rect.appendChild(this.rect.inner);

		this.rect.inner2 = document.createElement('div');

		this.rect.inner2.className = 'coverings-plan-rect-inner2';

		this.rect.appendChild(this.rect.inner2);

		coverings_plan_NODE.appendChild(this.rect);
	}

	updateQuaternionAndPosition () {

		const [ point, next_point ] = this.points;

		const vv1 = new THREE.Vector3(1, 0, 0);

		const vv2 =
			new THREE.Vector3(next_point.scene_x, 0, next_point.scene_z)
				.sub(new THREE.Vector3(point.scene_x, 0, point.scene_z))
				.normalize();

		this.quaternion.setFromUnitVectors(vv1, vv2);

		const position = point.centerWith2(next_point);

		this.position.set(position[0], this.room.height / 2, position[1]);

		this.mesh.quaternion.copy(this.quaternion);
		this.mesh.position.copy(this.position);
		this.mesh.updateMatrix();
	}

	updateGeometry () {

		const [ point, next_point ] = this.points;

		const plane_geometry =
			new THREE.PlaneBufferGeometry(

				// width
				point.distanceTo(next_point) * cast.PIXELS_TO_METERS,

				// height
				this.room.height,
			);

		// const vv1 = new THREE.Vector3(1, 0, 0);

		// const vv2 =
		// 	new THREE.Vector3(next_point.scene_x, 0, next_point.scene_z)
		// 		.sub(new THREE.Vector3(point.scene_x, 0, point.scene_z))
		// 		.normalize();

		// this.quaternion.setFromUnitVectors(vv1, vv2);

		// const position = point.centerWith2(next_point);

		// this.position.set(position[0], this.room.height / 2, position[1]);

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

			// plane_geometry.attributes.uv.array[i + 0] *= this.pixel_length * cast.PIXELS_TO_METERS / this.tile.sizes[0];
			// plane_geometry.attributes.uv.array[i + 1] *= this.room.height / this.tile.sizes[1];

			plane_geometry.attributes.uv.array[i + 0] = plane_geometry.attributes.position.array[(i / 2 * 3) + 0] / this.tile.sizes[0];
			plane_geometry.attributes.uv.array[i + 1] = plane_geometry.attributes.position.array[(i / 2 * 3) + 1] / this.tile.sizes[1];
		}

		this.mesh.geometry.setAttribute(

			'uv', new THREE.BufferAttribute(plane_geometry.attributes.uv.array, ATTRIBUTE_SIZE_2),
		);

		this.mesh.geometry.setAttribute(

			'uv2', new THREE.BufferAttribute(plane_geometry.attributes.uv.array, ATTRIBUTE_SIZE_2),
		);



		this.mesh.geometry.computeBoundingSphere();
	}

	remove () {

		this.segments.forEach((segment) => segment.remove());

		this.segments.length = 0;

		coverings_plan_NODE.removeChild(this.rect);

		if (raycastable_meshes.includes(this.mesh)) {

			raycastable_meshes.splice(raycastable_meshes.indexOf(this.mesh), 1);
		}

		scene.remove(this.mesh);
	}
}
