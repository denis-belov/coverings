/*
eslint-disable

max-len,
no-magic-numbers,
*/



import earcut from 'earcut';
import * as THREE from 'three';

import { coverings_plan_NODE } from './dom';

import Wall from './wall';

import modes from './modes';
import cast from './cast';

import {

	geometry_walls,
	geometry_floor,
	position_data_walls,
	uv_data_walls,
	position_data_floor,
	uv_data_floor,
	plan_camera,
} from './three';



const TEST_ROOM_HEIGHT_METERS = 3;



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

			position_data_walls.push(

				point.scene_x, 0, point.scene_y,
				point.scene_x, TEST_ROOM_HEIGHT_METERS, point.scene_y,
				next_point.scene_x, 0, next_point.scene_y,

				next_point.scene_x, 0, next_point.scene_y,
				point.scene_x, TEST_ROOM_HEIGHT_METERS, point.scene_y,
				next_point.scene_x, TEST_ROOM_HEIGHT_METERS, next_point.scene_y,
			);

			const wall_pixel_length = point.distanceTo(next_point);

			// tile segment size = (2m,2m)
			uv_data_walls.push(

				0, 0,
				0, TEST_ROOM_HEIGHT_METERS / 2,
				wall_pixel_length * cast.PIXELS_TO_METERS / 2, 0,

				wall_pixel_length * cast.PIXELS_TO_METERS / 2, 0,
				0, TEST_ROOM_HEIGHT_METERS / 2,
				wall_pixel_length * cast.PIXELS_TO_METERS / 2, TEST_ROOM_HEIGHT_METERS / 2,
			);
		});



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
	}

	static makeContour (points) {

		const walls = [];

		Point.destroyContour();

		Point.instances.push(...points);

		Point.instances.forEach((point, index) => {

			const wall = new Wall(points[index], points[index + 1] || points[0]);

			walls.push(wall);

			point.z_index = index;

			point.walls.push(wall);

			coverings_plan_NODE.appendChild(point.circle);
		});

		walls.forEach((wall, index) => (wall.next_wall = walls[index + 1] || walls[0]));

		console.log(walls);

		Point.instances.forEach((point) => point.set());
	}

	static destroyContour () {

		Point.instances.forEach((point) => {

			point.z_index = 0;
			point.walls.length = 0;
		});

		Point.instances.length = 0;

		coverings_plan_NODE.innerHTML = '';
	}



	constructor (meter_x = 0, meter_y = 0) {

		// 2D coordinates in window space (pixel)
		this.pixel_x = (meter_x * cast.METERS_TO_PIXELS) + (window.innerWidth / 2);
		this.pixel_y = (meter_y * cast.METERS_TO_PIXELS) + (window.innerHeight / 2);

		this.z_index = 0;

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

		this.walls = [];
	}

	distanceTo (point) {

		return Math.sqrt(Math.pow(this.pixel_x - point.pixel_x, 2) + Math.pow(this.pixel_y - point.pixel_y, 2));
	}

	centerWith (point) {

		return new Point(

			(((this.pixel_x + point.pixel_x) / 2) - (window.innerWidth / 2)) * cast.PIXELS_TO_METERS,
			(((this.pixel_y + point.pixel_y) / 2) - (window.innerHeight / 2)) * cast.PIXELS_TO_METERS,
		);
	}

	doPositionDependentActions () {

		this.circle.style.left = `${ this.pixel_x - 30 }px`;
		this.circle.style.top = `${ window.innerHeight - this.pixel_y - 30 }px`;

		this.updateAdjointWalls();

		Point.updateGeometries();
	}

	set (position_x = this.pixel_x, position_y = this.pixel_y) {

		this.pixel_x = position_x;
		this.pixel_y = position_y;

		this.doPositionDependentActions();
	}

	move (movement_x = 0, movement_y = 0) {

		this.pixel_x += movement_x;
		this.pixel_y -= movement_y;

		this.doPositionDependentActions();
	}

	updateAdjointWalls () {

		this.walls.forEach((wall) => {

			const [ conjugate_point ] = wall.points.filter((point) => (point !== this));

			wall.pixel_length = this.distanceTo(conjugate_point);

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

		this.scene_x = (this.pixel_x - (window.innerWidth * 0.5)) / plan_camera.zoom;
		this.scene_y = ((window.innerHeight * 0.5) - this.pixel_y) / plan_camera.zoom;
	}

	updateSceneCoordinatesOrbitMode () {

		this.scene_x = (this.pixel_x - (window.innerWidth * 0.5)) * cast.PIXELS_TO_METERS;
		this.scene_y = ((window.innerHeight * 0.5) - this.pixel_y) * cast.PIXELS_TO_METERS;
	}
}
