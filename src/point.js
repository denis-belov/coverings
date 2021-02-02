/*
eslint-disable

max-len,
*/



import {

	modes,
	coverings_plan_NODE,

} from './modes';

export default class Point {

	static selected = null;
	static instances = [];

	constructor (x = 0, y = 0, push = 1) {

		this.x = x;
		this.y = y;
		this.z = Point.instances.length;

		this.scene_x = 0;
		this.scene_y = 0;

		this.circle = document.createElement('div');
		this.circle.className = 'coverings-plan-circle';

		this.circle.style.left = `${ this.x - 30 }px`;
		this.circle.style.top = `${ window.innerHeight - this.y - 30 }px`;

		this.circle.addEventListener('mousedown', (evt) => {

			evt.preventDefault();

			if (!modes.add_wall_mode) {

				const last_z = this.z;

				this.z = Point.instances.length - 1;
				this.circle.style.zIndex = this.z + 12;

				Point.instances.forEach((point) => {

					if (point !== this && point.z > last_z) {

						point.circle.style.zIndex = --point.z + 12;
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

	set (x = this.x, y = this.y) {

		this.x = x;
		this.y = y;

		this.circle.style.left = `${ this.x - 30 }px`;
		this.circle.style.top = `${ window.innerHeight - this.y - 30 }px`;

		this.updateWalls();
		Point.updateGeometries();
	}

	move (movementX, movementY) {

		this.x += movementX;
		this.y -= movementY;

		this.circle.style.left = `${ this.x - 30 }px`;
		this.circle.style.top = `${ window.innerHeight - this.y - 30 }px`;

		this.updateWalls();
		Point.updateGeometries();
	}

	updateWalls () {

		this.walls.forEach((wall) => {

			const [ conjugate_point ] = wall.points.filter((point) => (point !== this));

			wall.size = Math.sqrt(Math.pow(this.x - conjugate_point.x, 2) + Math.pow(this.y - conjugate_point.y, 2));

			wall.rect.style.width = `${ wall.size + 30 }px`;
			wall.rect.style.left = `${ ((this.x + conjugate_point.x - wall.size) * 0.5) - 15 }px`;
			wall.rect.style.top = `${ (window.innerHeight - this.y + window.innerHeight - conjugate_point.y) * 0.5 - 15 }px`;
			wall.rect.inner.innerHTML = `${ (wall.size * 0.02).toFixed(2) } m`;
			const points_vector = { x: conjugate_point.x - this.x, y: conjugate_point.y - this.y };
			let angle = Math.acos(

				points_vector.x /
				(
					Math.sqrt(1 + 0) *
					Math.sqrt((points_vector.x * points_vector.x) + (points_vector.y * points_vector.y))
				),
			);

			if (this.y > conjugate_point.y) {

				angle *= Math.sign(angle);
			}

			if (wall.points.indexOf(this) === 0) {

				if (this.x > conjugate_point.x) {

					wall.rect.inner.style.transform = 'translate(0px, -17px) rotate(180deg)';
				}
				else {

					wall.rect.inner.style.transform = 'translate(0px, -17px) rotate(0deg)';
				}
			}
			else if (this.x > conjugate_point.x) {

				wall.rect.inner.style.transform = 'translate(0px, -2px) rotate(180deg)';
			}
			else {

				wall.rect.inner.style.transform = 'translate(0px, -2px) rotate(0deg)';
			}

			wall.rect.style.transform = `rotate(${ -angle / Math.PI * 180 }deg)`;
		});
	}

	// optimize geometries with index buffers ?
	static updateGeometries () {

		// make for this point only
		Point.instances.forEach((point) => point.updateSceneCoordinates());

		position_data.length = 0;
		uv_data.length = 0;
		position_data_floor.length = 0;
		uv_data_floor.length = 0;

		Point.instances.forEach((point, point_index, point_array) => {

			const next_point = point_array[point_index + 1] || point_array[0];

			const [ wall ] = point.walls.filter((wall) => wall.points.includes(next_point));

			position_data.push(

				point.scene_x, 0, point.scene_y,
				point.scene_x, ROOM_HEIGHT * 5, point.scene_y,
				next_point.scene_x, 0, next_point.scene_y,

				next_point.scene_x, 0, next_point.scene_y,
				point.scene_x, ROOM_HEIGHT * 5, point.scene_y,
				next_point.scene_x, ROOM_HEIGHT * 5, next_point.scene_y,
			);
			// log(wall.points[0].scene_x, wall.points[0].x);

			uv_data.push(

				0, 0,
				0, ROOM_HEIGHT,
				wall.size * 0.02, 0,

				wall.size * 0.02, 0,
				0, ROOM_HEIGHT,
				wall.size * 0.02, ROOM_HEIGHT,
			);
		});

		// Wall.instances.forEach((wall) => {

		// 	// log(rate);

		// 	position_data.push(

		// 		wall.points[0].scene_x, 0, wall.points[0].scene_y,
		// 		wall.points[0].scene_x, ROOM_HEIGHT * 5, wall.points[0].scene_y,
		// 		wall.points[1].scene_x, 0, wall.points[1].scene_y,

		// 		wall.points[1].scene_x, 0, wall.points[1].scene_y,
		// 		wall.points[0].scene_x, ROOM_HEIGHT * 5, wall.points[0].scene_y,
		// 		wall.points[1].scene_x, ROOM_HEIGHT * 5, wall.points[1].scene_y,
		// 	);
		// 	log(wall.points[0].scene_x, wall.points[0].x);

		// 	uv_data.push(

		// 		0, 0,
		// 		0, ROOM_HEIGHT,
		// 		wall.size * 0.02, 0,

		// 		wall.size * 0.02, 0,
		// 		0, ROOM_HEIGHT,
		// 		wall.size * 0.02, ROOM_HEIGHT,
		// 	);
		// });



		const resolution = window.innerHeight / window.innerWidth;

		const scene_coordinates = [];
		const uv_coordinates = [];

		Point.instances.forEach((point, i) => {

			scene_coordinates.push(point.scene_x, point.scene_y);
			uv_coordinates.push(point.x / window.innerWidth * 50, point.y / window.innerHeight * 50 * resolution);
		});

		const tri = earcut(scene_coordinates);

		tri.forEach((index) => {

			position_data_floor.push(scene_coordinates[(index * 2) + 0], 0, scene_coordinates[(index * 2) + 1]);
			uv_data_floor.push(uv_coordinates[(index * 2) + 0], uv_coordinates[(index * 2) + 1]);
		});



		// eliminate allocation of typed arrays from the function
		geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data), 3));
		geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data), 2));
		geometry_floor.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data_floor), 3));
		geometry_floor.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data_floor), 2));
	}

	updateSceneCoordinates () {

		this.scene_x = (this.x - window.innerWidth * 0.5) * 0.1;
		this.scene_y = (window.innerHeight * 0.5 - this.y) * 0.1;
	}

	destroy () {

		if (Point.instances.includes(this)) {

			Point.instances.splice(Point.instances.indexOf(this), 1);
		}

		coverings_plan_NODE.removeChild(this.circle);

		delete this;
	}

	static move ({ movementX, movementY }) {

		Point.selected.move(movementX, movementY);



		// let minX = 999999;
		// let maxX = -999999;
		// let minY = 999999;
		// let maxY = -999999;

		// Point.instances.forEach((point) => {

		// 	if (point.x < minX) {

		// 		minX = point.x;
		// 	}

		// 	if (point.x > maxX) {

		// 		maxX = point.x;
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
}
