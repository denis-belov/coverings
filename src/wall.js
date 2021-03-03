import {

	coverings_plan_NODE,
	add_wall_mode_BUTTON,
} from './dom';

import modes from './modes';

import * as THREE from 'three';

import {

	ATTRIBUTE_SIZE_1,
	ATTRIBUTE_SIZE_2,
	ATTRIBUTE_SIZE_3,
} from './three';

import cast from './cast';

import Tileable from './tileable';



const TIME_TO_WAIT_FOR_APPENDING_WALL = 250;



export default class Wall extends Tileable {

	static selected = null;
	static walls_to_add_new = [];

	static move (evt) {

		const [ point1, point2 ] = Wall.selected.points;

		point1.move(evt.movementX, evt.movementY);
		point2.move(evt.movementX, evt.movementY);
	}



	constructor (room, point1, point2) {

		super(room);

		// this.type = 'wall';

		this.mesh2 = new THREE.Mesh(this.mesh.geometry, this.mesh.material);

		// rename to related_points
		this.points = [ point1, point2 ];

		this.pixel_length = point1.distanceTo(point2);

		this.points[0].walls.push(this);
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

				Wall.walls_to_add_new.push(this);

				if (Wall.walls_to_add_new.length >= 2) {

					modes.add_wall_mode = 0;

					add_wall_mode_BUTTON.classList.remove('-pressed');

					setTimeout(() => {

						Wall.walls_to_add_new.forEach((wall) => wall.rect.classList.remove('-selected'));

						const new_point1 =
							Wall.walls_to_add_new[0].points[0].centerWith(Wall.walls_to_add_new[0].points[1]);
						const new_point2 =
							Wall.walls_to_add_new[1].points[0].centerWith(Wall.walls_to_add_new[1].points[1]);

						const [ shared_point ] = [

							...Wall.walls_to_add_new[0].points,
							...Wall.walls_to_add_new[1].points,
						]
							.filter(

								(point) =>
									(
										Wall.walls_to_add_new[0].points.includes(point) &&
										Wall.walls_to_add_new[1].points.includes(point)
									),
							);

						const shared_index = this.room.points.indexOf(shared_point);

						const new_points = this.room.points.slice();

						if (Wall.walls_to_add_new[0].points[1] === Wall.walls_to_add_new[1].points[0]) {

							new_points.splice(shared_index, 1, new_point1, new_point2);
						}
						else {

							new_points.splice(shared_index, 1, new_point2, new_point1);
						}

						this.room.makeContour(this.room.height, new_points);

						Wall.walls_to_add_new.length = 0;
					}, TIME_TO_WAIT_FOR_APPENDING_WALL);
				}
			}
		});

		this.rect.inner = document.createElement('div');

		this.rect.inner.className = 'coverings-plan-rect-inner';

		this.rect.appendChild(this.rect.inner);

		coverings_plan_NODE.appendChild(this.rect);
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

		// LOG(plane_geometry.attributes.position.array)

		const vv1 = new THREE.Vector3(1, 0, 0);

		const vv2 =
			new THREE.Vector3(next_point.scene_x, 0, next_point.scene_z)
				.sub(new THREE.Vector3(point.scene_x, 0, point.scene_z))
				.normalize();

		this.quaternion.setFromUnitVectors(vv1, vv2);

		const position = point.centerWith2(next_point);

		this.position.set(position[0], this.room.height / 2, position[1]);

		// plane_geometry.applyMatrix4(

		// 	new THREE.Matrix4().compose(

		// 		new THREE.Vector3(position[0], this.room.height / 2, position[1]), quaternion, new THREE.Vector3(1, 1, 1),
		// 	),
		// );

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

			plane_geometry.attributes.uv.array[i + 0] *= this.pixel_length * cast.PIXELS_TO_METERS / this.tile.sizes[0];
			plane_geometry.attributes.uv.array[i + 1] *= this.room.height / this.tile.sizes[1];
		}

		this.mesh.geometry.setAttribute(

			'uv', new THREE.BufferAttribute(plane_geometry.attributes.uv.array, ATTRIBUTE_SIZE_2),
		);

		this.mesh.geometry.setAttribute(

			'uv2', new THREE.BufferAttribute(plane_geometry.attributes.uv.array, ATTRIBUTE_SIZE_2),
		);

		this.mesh.quaternion.copy(this.quaternion);
		this.mesh.position.copy(this.position);
		this.mesh.updateMatrix();

		this.mesh.geometry.computeBoundingSphere();
	}
}
