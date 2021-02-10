import {

	coverings_plan_NODE,
	add_wall_mode_BUTTON,
} from './dom';

import modes from './modes';

import * as THREE from 'three';

import {

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



	constructor (room, side, point1, point2) {

		super(room, side);

		// rename to related_points
		this.points = [ point1, point2 ];

		this.pixel_length = 0;

		console.log(this.points);
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

		const wall_data_index = [];
		const wall_data_position = [];
		const wall_data_normal = [];
		const wall_data_uv = [];

		const plane_geometry =
			new THREE.PlaneBufferGeometry(

				point.distanceTo(next_point) * cast.PIXELS_TO_METERS,
				this.room.height,
			);

		const vv1 = new THREE.Vector3(1, 0, 0);
		const vv2 = new THREE.Vector3(next_point.scene_x, 0, next_point.scene_z)
			.sub(new THREE.Vector3(point.scene_x, 0, point.scene_z)).normalize();

		const quat = new THREE.Quaternion().setFromUnitVectors(vv1, vv2);

		const position = point.centerWith2(next_point);

		wall_data_index.push(...plane_geometry.index.array);
		wall_data_position.push(...plane_geometry.attributes.position.array);
		wall_data_normal.push(...plane_geometry.attributes.normal.array);
		wall_data_uv.push(...plane_geometry.attributes.uv.array);

		for (let i = 0; i < wall_data_uv.length; i += 2) {

			wall_data_uv[i + 0] *= this.pixel_length * cast.PIXELS_TO_METERS / this.tile_sizes[0];
			wall_data_uv[i + 1] *= this.room.height / this.tile_sizes[1];
		}

		this.geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(wall_data_index), 1));
		this.geometry.setAttribute(

			'position', new THREE.BufferAttribute(new Float32Array(wall_data_position), ATTRIBUTE_SIZE_3),
		);
		this.geometry.setAttribute(

			'normal', new THREE.BufferAttribute(new Float32Array(wall_data_normal), ATTRIBUTE_SIZE_3),
		);
		this.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(wall_data_uv), ATTRIBUTE_SIZE_2));
		this.geometry.setAttribute(

			'uv2', new THREE.BufferAttribute(this.geometry.attributes.uv.array, ATTRIBUTE_SIZE_2),
		);

		this.mesh.quaternion.identity();
		this.mesh.applyQuaternion(quat);
		this.mesh.position.set(position[0], this.room.height / 2, position[1]);
	}
}
