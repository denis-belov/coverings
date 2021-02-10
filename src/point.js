/*
eslint-disable

no-magic-numbers,
*/



// import earcut from 'earcut';
// import * as THREE from 'three';

// import { coverings_plan_NODE } from './dom';

// import Floor from './floor';
// import Wall from './wall';

import modes from './modes';
import cast from './cast';

// import {

// 	// geometry_walls,
// 	// geometry_floor,
// 	// position_data_walls,
// 	// uv_data_walls,
// 	// index_data_floor,
// 	// position_data_floor,
// 	// normal_data_floor,
// 	// uv_data_floor,
// 	// mesh_floor,
// 	scene,
// 	webgl_maximum_anisotropy,
// 	MATERIAL_WIREFRAME,
// } from './three';



// const TEST_ROOM_HEIGHT_METERS = 3;



export default class Point {

	static selected = null;
	// static instances = [];
	// // undo/redo
	// static states = [];



	// static updateSceneCoordinates () {

	// 	Point.instances.forEach((point) => point.updateSceneCoordinates());
	// }

	// // optimize geometries with index buffers ?
	// static updateGeometries () {

	// 	// make for this point only
	// 	Point.updateSceneCoordinates();

	// 	// position_data_floor.length = 0;
	// 	// normal_data_floor.length = 0;
	// 	// uv_data_floor.length = 0;

	// 	// maybe will render walls as single mesh
	// 	Wall.instances.forEach((wall) => wall.updateGeomrtry());



	// 	// const scene_coordinates = [];

	// 	// Point.instances.forEach((point) => scene_coordinates.push(point.scene_x, point.scene_z));

	// 	// index_data_floor.length = 0;
	// 	// index_data_floor.push(...earcut(scene_coordinates).reverse());

	// 	// index_data_floor.forEach((index) => {

	// 	// 	if (!position_data_floor[index * 3]) {

	// 	// 		position_data_floor[(index * 3) + 0] = Point.instances[index].scene_x;
	// 	// 		position_data_floor[(index * 3) + 1] = 0;
	// 	// 		position_data_floor[(index * 3) + 2] = Point.instances[index].scene_z;

	// 	// 		normal_data_floor[(index * 3) + 0] = 0;
	// 	// 		normal_data_floor[(index * 3) + 1] = 1;
	// 	// 		normal_data_floor[(index * 3) + 2] = 0;

	// 	// 		uv_data_floor[(index * 2) + 0] = Point.instances[index].scene_x / 6;
	// 	// 		uv_data_floor[(index * 2) + 1] = Point.instances[index].scene_z / 6;
	// 	// 	}
	// 	// });

	// 	// // eliminate allocation of typed arrays from the function
	// 	// // make walls geometry calculations when toggling orbital mode on and show walls in orbital mode only
	// 	// geometry_floor.setIndex(new THREE.BufferAttribute(new Uint16Array(index_data_floor), 1));
	// 	// geometry_floor.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data_floor), 3));
	// 	// geometry_floor.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normal_data_floor), 3));
	// 	// geometry_floor.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data_floor), 2));
	// 	// geometry_floor.setAttribute('uv2', new THREE.BufferAttribute(geometry_floor.attributes.uv.array, 2));
	// }

	static move ({ movementX, movementY }) {

		Point.selected.move(movementX, movementY);
	}

	// static makeContour (points) {

	// 	const walls = [];

	// 	Point.destroyContour();

	// 	Point.instances.push(...points);

	// 	Point.instances.forEach((point, index) => {

	// 		const wall = new Wall(points[index], points[index + 1] || points[0]);

	// 		walls.push(wall);

	// 		point.z_index = index;

	// 		point.walls.push(wall);

	// 		coverings_plan_NODE.appendChild(point.circle);
	// 	});

	// 	Wall.instances = walls;

	// 	Point.instances.forEach((point) => point.set());
	// }

	// static destroyContour () {

	// 	Point.instances.forEach((point) => {

	// 		point.z_index = 0;
	// 		point.walls.length = 0;
	// 	});

	// 	Point.instances.length = 0;

	// 	coverings_plan_NODE.innerHTML = '';
	// }



	constructor (meter_x = 0, meter_y = 0) {

		// 2D coordinates in window space (pixel)
		this.pixel_x = (meter_x * cast.METERS_TO_PIXELS) + (window.innerWidth / 2);
		this.pixel_y = (meter_y * cast.METERS_TO_PIXELS) + (window.innerHeight / 2);

		// this.z_index = 0;

		this.scene_x = 0;
		this.scene_z = 0;

		this.circle = document.createElement('div');
		this.circle.className = 'coverings-plan-circle';

		this.circle.addEventListener('mousedown', (evt) => {

			evt.preventDefault();

			if (!modes.add_wall_mode) {

				console.log(this.circle.style.zIndex);

				const last_z_index = this.circle.style.zIndex;

				// this.z_index = document.getElementsByClassName('coverings-plan-circle').length - 1;
				this.circle.style.zIndex = document.getElementsByClassName('coverings-plan-circle').length - 1 + 12;

				Array.from(document.getElementsByClassName('coverings-plan-circle')).forEach((elm) => {

					if (elm !== this.circle && elm.style.zIndex > last_z_index) {

						--elm.style.zIndex;
					}
				});

				this.circle.classList.add('-mousedown');

				window.addEventListener('mousemove', Point.move);

				Point.selected = this;
			}
		});

		// rename to related_walls
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

	centerWith2 (point) {

		return [

			(((this.pixel_x + point.pixel_x) / 2) - (window.innerWidth / 2)) * cast.PIXELS_TO_METERS,
			(((this.pixel_y + point.pixel_y) / 2) - (window.innerHeight / 2)) * cast.PIXELS_TO_METERS,
		];
	}

	doPositionDependentActions () {

		this.circle.style.left = this.pixel_x;
		this.circle.style.top = this.pixel_y;

		this.updateAdjointWallStyles();

		this.walls[0].room.updateGeometries();
	}

	set (position_x = this.pixel_x, position_y = this.pixel_y) {

		this.pixel_x = position_x;
		this.pixel_y = position_y;

		this.doPositionDependentActions();
	}

	move (movement_x = 0, movement_y = 0) {

		this.pixel_x += movement_x;
		this.pixel_y += movement_y;

		this.doPositionDependentActions();
	}

	updateAdjointWallStyles () {

		this.walls.forEach((wall) => {

			const [ conjugate_point ] = wall.points.filter((point) => (point !== this));

			wall.pixel_length = this.distanceTo(conjugate_point);

			wall.rect.style.width = `${ wall.pixel_length + 30 }px`;
			wall.rect.style.left = `${ ((this.pixel_x + conjugate_point.pixel_x - wall.pixel_length) * 0.5) - 15 }px`;
			wall.rect.style.top = `${ ((this.pixel_y + conjugate_point.pixel_y) * 0.5) - 15 }px`;
			wall.rect.inner.innerHTML = `${ (wall.pixel_length * cast.PIXELS_TO_METERS).toFixed(2) } m`;

			const points_vector =
				{
					pixel_x: conjugate_point.pixel_x - this.pixel_x,
					pixel_y: conjugate_point.pixel_y - this.pixel_y,
				};

			let angle = Math.acos(

				points_vector.pixel_x /
				(
					// ?
					Math.sqrt(1 + 0) *
					Math.sqrt(

						(points_vector.pixel_x * points_vector.pixel_x) +
						(points_vector.pixel_y * points_vector.pixel_y),
					)
				),
			);

			if (this.pixel_y > conjugate_point.pixel_y) {

				angle = -Math.abs(angle);
			}

			if (wall.points.indexOf(this) === 0) {

				if (this.pixel_x > conjugate_point.pixel_x) {

					wall.rect.inner.style.transform = 'translate(0px, -2px) rotate(180deg)';
				}
				else {

					wall.rect.inner.style.transform = 'translate(0px, -2px) rotate(0deg)';
				}
			}
			else if (this.pixel_x > conjugate_point.pixel_x) {

				wall.rect.inner.style.transform = 'translate(0px, -17px) rotate(180deg)';
			}
			else {

				wall.rect.inner.style.transform = 'translate(0px, -17px) rotate(0deg)';
			}

			wall.rect.style.transform = `rotate(${ angle / Math.PI * 180 }deg)`;
		});
	}

	updateSceneCoordinates () {

		this.scene_x = (this.pixel_x - (window.innerWidth * 0.5)) * cast.PIXELS_TO_METERS;
		this.scene_z = (this.pixel_y - (window.innerHeight * 0.5)) * cast.PIXELS_TO_METERS;
	}
}
