/*
eslint-disable

max-len,
no-magic-numbers,
*/



import earcut from 'earcut';
import * as THREE from 'three';

import { coverings_plan_NODE } from './dom';

import modes from './modes';
import cast from './cast';

import {

	geometry_walls,
	geometry_floor,
	position_data_walls,
	uv_data_walls,
	position_data_floor,
	uv_data_floor,
	camera,
} from './three';



const TEST_ROOM_HEIGHT = 3;



export default class Point {

	static selected = null;
	static instances = [];



	static updateSceneCoordinates () {

		if (modes.orbit_mode) {

			Point.instances.forEach((point) => point.updateSceneCoordinatesOrbitMode());
		}
		else {

			Point.instances.forEach((point) => point.updateSceneCoordinatesPlanMode());
		}
	}

	// optimize geometries with index buffers ?
	static updateGeometries () {

		// make for this point only
		Point.updateSceneCoordinates();

		position_data_walls.length = 0;
		uv_data_walls.length = 0;
		position_data_floor.length = 0;
		uv_data_floor.length = 0;

		Point.instances.forEach((point, point_index, point_array) => {

			const next_point = point_array[point_index + 1] || point_array[0];

			const [ wall ] = point.walls.filter((_wall) => _wall.points.includes(next_point));

			position_data_walls.push(

				point.scene_x, 0, point.scene_y,
				point.scene_x, TEST_ROOM_HEIGHT, point.scene_y,
				next_point.scene_x, 0, next_point.scene_y,

				next_point.scene_x, 0, next_point.scene_y,
				point.scene_x, TEST_ROOM_HEIGHT, point.scene_y,
				next_point.scene_x, TEST_ROOM_HEIGHT, next_point.scene_y,
			);

			// tile segment size = (2m,2m)
			uv_data_walls.push(

				0, 0,
				0, TEST_ROOM_HEIGHT / 2,
				wall.pixel_length * cast.PIXELS_TO_METERS / 2, 0,

				wall.pixel_length * cast.PIXELS_TO_METERS / 2, 0,
				0, TEST_ROOM_HEIGHT / 2,
				wall.pixel_length * cast.PIXELS_TO_METERS / 2, TEST_ROOM_HEIGHT / 2,
			);
		});

		// Wall.instances.forEach((wall) => {

		// 	// log(rate);

		// 	position_data_walls.push(

		// 		wall.points[0].scene_x, 0, wall.points[0].scene_y,
		// 		wall.points[0].scene_x, TEST_ROOM_HEIGHT * 5, wall.points[0].scene_y,
		// 		wall.points[1].scene_x, 0, wall.points[1].scene_y,

		// 		wall.points[1].scene_x, 0, wall.points[1].scene_y,
		// 		wall.points[0].scene_x, TEST_ROOM_HEIGHT * 5, wall.points[0].scene_y,
		// 		wall.points[1].scene_x, TEST_ROOM_HEIGHT * 5, wall.points[1].scene_y,
		// 	);
		// 	log(wall.points[0].scene_x, wall.points[0].pixel_y);

		// 	uv_data_walls.push(

		// 		0, 0,
		// 		0, TEST_ROOM_HEIGHT,
		// 		wall.pixel_length * 0.02, 0,

		// 		wall.pixel_length * 0.02, 0,
		// 		0, TEST_ROOM_HEIGHT,
		// 		wall.pixel_length * 0.02, TEST_ROOM_HEIGHT,
		// 	);
		// });



		const resolution = window.innerHeight / window.innerWidth;

		const scene_coordinates = [];
		const uv_coordinates = [];

		Point.instances.forEach((point) => {

			scene_coordinates.push(point.scene_x, point.scene_y);
			uv_coordinates.push(point.pixel_x / window.innerWidth * 50, point.pixel_y / window.innerHeight * 50 * resolution);
		});

		const tri = earcut(scene_coordinates);

		tri.forEach((index) => {

			position_data_floor.push(scene_coordinates[(index * 2) + 0], 0, scene_coordinates[(index * 2) + 1]);
			uv_data_floor.push(uv_coordinates[(index * 2) + 0], uv_coordinates[(index * 2) + 1]);
		});



		// eliminate allocation of typed arrays from the function
		// make walls geometry calculations when toggling orbital mode on and show walls in orbital mode only
		geometry_walls.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data_walls), 3));
		geometry_walls.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data_walls), 2));
		geometry_floor.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data_floor), 3));
		geometry_floor.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data_floor), 2));
	}

	static move ({ movementX, movementY }) {

		Point.selected.move(movementX, movementY);



		// let minX = 999999;
		// let maxX = -999999;
		// let minY = 999999;
		// let maxY = -999999;

		// Point.instances.forEach((point) => {

		// 	if (point.pixel_y < minX) {

		// 		minX = point.pixel_y;
		// 	}

		// 	if (point.pixel_y > maxX) {

		// 		maxX = point.pixel_y;
		// 	}

		// 	if (point.y < minY) {

		// 		minY = point.y;
		// 	}

		// 	if (point.y > maxY) {

		// 		maxY = point.y;
		// 	}
		// });

		// let avX = (minX + maxX) * 0.5;
		// let avY = (minY + maxY) * 0.5;
	}



	constructor (meter_x = 0, meter_y = 0, push = 1) {

		// 2D coordinates in window space (pixel)
		this.pixel_x = (meter_x * cast.METERS_TO_PIXELS) + (window.innerWidth / 2);
		this.pixel_y = (meter_y * cast.METERS_TO_PIXELS) + (window.innerHeight / 2);

		// z-index
		this.z_index = Point.instances.length;

		this.scene_x = 0;
		this.scene_y = 0;

		this.circle = document.createElement('div');
		this.circle.className = 'coverings-plan-circle';

		this.circle.style.left = `${ this.pixel_x - 30 }px`;
		this.circle.style.top = `${ window.innerHeight - this.pixel_y - 30 }px`;

		this.circle.addEventListener('mousedown', (evt) => {

			evt.preventDefault();

			if (!modes.add_wall_mode) {

				const last_z_index = this.z_index;

				this.z_index = Point.instances.length - 1;
				this.circle.style.zIndex = this.z_index + 12;

				Point.instances.forEach((point) => {

					if (point !== this && point.z_index > last_z_index) {

						point.circle.style.zIndex = --point.z_index + 12;
					}
				});

				this.circle.classList.add('-mousedown');

				window.addEventListener('mousemove', Point.move);

				Point.selected = this;
			}
		});

		coverings_plan_NODE.appendChild(this.circle);

		this.walls = [];

		if (push) {

			Point.instances.push(this);
		}
	}

	set (pixel_x = this.pixel_x, pixel_y = this.pixel_y) {

		this.pixel_x = pixel_x;
		this.pixel_y = pixel_y;

		this.circle.style.left = `${ this.pixel_x - 30 }px`;
		this.circle.style.top = `${ window.innerHeight - this.pixel_y - 30 }px`;

		this.updateWalls();

		Point.updateGeometries();
	}

	move (movementX, movementY) {

		this.pixel_x += movementX;
		this.pixel_y -= movementY;

		this.circle.style.left = `${ this.pixel_x - 30 }px`;
		this.circle.style.top = `${ window.innerHeight - this.pixel_y - 30 }px`;

		this.updateWalls();

		Point.updateGeometries();
	}

	updateWalls () {

		this.walls.forEach((wall) => {

			const [ conjugate_point ] = wall.points.filter((point) => (point !== this));

			wall.pixel_length = Math.sqrt(Math.pow(this.pixel_x - conjugate_point.pixel_x, 2) + Math.pow(this.pixel_y - conjugate_point.pixel_y, 2));

			wall.rect.style.width = `${ wall.pixel_length + 30 }px`;
			wall.rect.style.left = `${ ((this.pixel_x + conjugate_point.pixel_x - wall.pixel_length) * 0.5) - 15 }px`;
			wall.rect.style.top = `${ ((window.innerHeight - this.pixel_y + window.innerHeight - conjugate_point.pixel_y) * 0.5) - 15 }px`;
			wall.rect.inner.innerHTML = `${ (wall.pixel_length * cast.PIXELS_TO_METERS).toFixed(2) } m`;
			const points_vector = { pixel_x: conjugate_point.pixel_x - this.pixel_x, pixel_y: conjugate_point.pixel_y - this.pixel_y };
			let angle = Math.acos(

				points_vector.pixel_x /
				(
					// ?
					Math.sqrt(1 + 0) *
					Math.sqrt((points_vector.pixel_x * points_vector.pixel_x) + (points_vector.pixel_y * points_vector.pixel_y))
				),
			);

			if (this.pixel_y > conjugate_point.pixel_y) {

				angle = -Math.abs(angle);
			}

			if (wall.points.indexOf(this) === 0) {

				if (this.pixel_x > conjugate_point.pixel_x) {

					wall.rect.inner.style.transform = 'translate(0px, -17px) rotate(180deg)';
				}
				else {

					wall.rect.inner.style.transform = 'translate(0px, -17px) rotate(0deg)';
				}
			}
			else if (this.pixel_x > conjugate_point.pixel_x) {

				wall.rect.inner.style.transform = 'translate(0px, -2px) rotate(180deg)';
			}
			else {

				wall.rect.inner.style.transform = 'translate(0px, -2px) rotate(0deg)';
			}

			wall.rect.style.transform = `rotate(${ -angle / Math.PI * 180 }deg)`;
		});
	}

	updateSceneCoordinatesPlanMode () {

		this.scene_x = (this.pixel_x - (window.innerWidth * 0.5)) / camera._.zoom;
		this.scene_y = ((window.innerHeight * 0.5) - this.pixel_y) / camera._.zoom;
	}

	updateSceneCoordinatesOrbitMode () {

		this.scene_x = (this.pixel_x - (window.innerWidth * 0.5)) * cast.PIXELS_TO_METERS;
		this.scene_y = ((window.innerHeight * 0.5) - this.pixel_y) * cast.PIXELS_TO_METERS;
	}

	destroy () {

		if (Point.instances.includes(this)) {

			Point.instances.splice(Point.instances.indexOf(this), 1);
		}

		coverings_plan_NODE.removeChild(this.circle);

		delete this;
	}
}
