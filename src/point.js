import * as THREE from 'three';

import modes from './modes';
import cast from './cast';

import { coverings_plan_NODE } from './dom';

import {

	raycastable_meshes,
	scene,
} from './three';



export default class Point {

	static selected = null;
	// static moved = false;

	static move ({ clientX, clientY }) {

		// Point.moved = true;

		if (Point.selected.walls[0].room.floor.segments.length > 0) {

			Point.selected.walls[0].room.floor.segments.forEach((segment) => segment.remove());

			Point.selected.walls[0].room.floor.segments.length = 0;

			raycastable_meshes.push(Point.selected.walls[0].room.floor.mesh);

			scene.add(Point.selected.walls[0].room.floor.mesh);
		}

		Point.selected.move(clientX, clientY);
	}



	constructor (meter_x = 0, meter_y = 0) {

		// 2D coordinates in window space (pixel)
		this.pixel_x = (meter_x * cast.METERS_TO_PIXELS) + (window.innerWidth / 2);
		this.pixel_y = (meter_y * cast.METERS_TO_PIXELS) + (window.innerHeight / 2);

		this.prev_pixel_x = this.pixel_x;
		this.prev_pixel_y = this.pixel_y;

		this.scene_x = 0;
		this.scene_z = 0;

		this.circle = document.createElement('div');
		this.circle.className = 'coverings-plan-circle';

		this.x = 0;
		this.y = 0;

		// rename to related_walls
		this.walls = [];

		this.circle.addEventListener('mousedown', (evt) => {

			evt.preventDefault();

			if (!modes.add_wall_mode) {

				const last_z_index = this.circle.style.zIndex;

				this.circle.style.zIndex = document.getElementsByClassName('coverings-plan-circle').length - 1 + 12;

				Array.from(document.getElementsByClassName('coverings-plan-circle')).forEach((elm) => {

					if (elm !== this.circle && elm.style.zIndex > last_z_index) {

						--elm.style.zIndex;
					}
				});

				this.circle.classList.add('-mousedown');

				this.x = (evt.offsetX - 30) * 0.5;
				this.y = (evt.offsetY - 30) * 0.5;

				window.addEventListener('mousemove', Point.move);

				Point.selected = this;
			}
		});

		coverings_plan_NODE.appendChild(this.circle);
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

	updateStyles () {

		this.circle.style.left = this.pixel_x;
		this.circle.style.top = this.pixel_y;

		this.updateAdjointWallStyles();
	}

	// doPositionDependentActions () {

	// 	this.updateStyles();

	// 	// this.updateSceneCoordinates();

	// 	this.walls[0].room.floor.updateGeometry();
	// }

	// set (position_x = this.pixel_x, position_y = this.pixel_y) {

	// 	this.pixel_x = position_x;
	// 	this.pixel_y = position_y;

	// 	this.doPositionDependentActions();
	// }

	move (client_x, client_y) {

		this.prev_pixel_x = this.pixel_x;
		this.prev_pixel_y = this.pixel_y;

		const pixel_x = client_x - this.x;
		const pixel_y = client_y - this.y;



		const [ p2 ] = this.walls[0].points.filter((point) => point !== this);

		const this_point = new THREE.Vector3(pixel_x, pixel_y, 0);
		const projected_point_x = new THREE.Vector3();
		const projected_point_y = new THREE.Vector3();

		const plane_x =
			new THREE.Plane()
				.setFromNormalAndCoplanarPoint(

					new THREE.Vector3(1, 0, 0),

					new THREE.Vector3(p2.pixel_x, p2.pixel_y, 0),
				);

		plane_x.projectPoint(this_point, projected_point_x);

		if (projected_point_x.distanceTo(this_point) < 20) {

			this.pixel_x = projected_point_x.x;
		}
		else {

			this.pixel_x = pixel_x;
		}

		const plane_y =
			new THREE.Plane()
				.setFromNormalAndCoplanarPoint(

					new THREE.Vector3(0, 1, 0),

					new THREE.Vector3(p2.pixel_x, p2.pixel_y, 0),
				);

		plane_y.projectPoint(this_point, projected_point_y);

		if (projected_point_y.distanceTo(this_point) < 20) {

			this.pixel_y = projected_point_y.y;
		}
		else {

			this.pixel_y = pixel_y;
		}



		const [ p3 ] = this.walls[1].points.filter((point) => point !== this);

		const _plane_x =
			new THREE.Plane()
				.setFromNormalAndCoplanarPoint(

					new THREE.Vector3(1, 0, 0),

					new THREE.Vector3(p3.pixel_x, p3.pixel_y, 0),
				);

		_plane_x.projectPoint(this_point, projected_point_x);

		if (projected_point_x.distanceTo(this_point) < 20) {

			this.pixel_x = projected_point_x.x;
		}
		// else {

		// 	this.pixel_x = pixel_x;
		// }

		const _plane_y =
			new THREE.Plane()
				.setFromNormalAndCoplanarPoint(

					new THREE.Vector3(0, 1, 0),

					new THREE.Vector3(p3.pixel_x, p3.pixel_y, 0),
				);

		_plane_y.projectPoint(this_point, projected_point_y);

		if (projected_point_y.distanceTo(this_point) < 20) {

			this.pixel_y = projected_point_y.y;
		}
		// else {

		// 	this.pixel_y = pixel_y;
		// }



		this.updateStyles();

		this.walls[0].room.floor.updateGeometry();
	}

	move2 (movement_x = 0, movement_y = 0) {

		this.prev_pixel_x = this.pixel_x;
		this.prev_pixel_y = this.pixel_y;

		this.pixel_x += movement_x;
		this.pixel_y += movement_y;

		this.updateStyles();

		// LOG(this.walls[0].room)

		this.walls[0].room.floor.updateGeometry();
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

	remove () {

		coverings_plan_NODE.removeChild(this.circle);
	}
}
