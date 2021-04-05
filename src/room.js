/*
eslint-disable

no-new,
*/



// import Loader from 'external-data-loader';

// import { coverings_plan_NODE } from './dom';
// import cast from './cast';
// import textures from './textures';

// import Point from './point';
import Material from './material';
import Floor from './floor';
import Wall from './wall';
// import Segment from './segment';

import {

	// scene,
	orbit_controls,
	// raycastable_meshes,
} from './three';



// const loader = new Loader();



export default class Room {

	constructor () {

		this.points = [];

		this.floor = null;

		this.walls = [];

		this.height = 0;
	}

	make (height, points) {

		this.destroy();

		this.floor = new Floor(this);

		this.height = height;

		this.points.push(...points);

		this.points.forEach((point) => {

			point.updateSceneCoordinates();
			// point.updateStyles();
		});

		this.floor.applyMaterial(Material.default.id);
		this.floor.updateGeometry();

		this.points.forEach((point, index) => {

			const wall = new Wall(this, points[index], points[index + 1] || points[0]);

			// wall.updateQuaternionAndPosition();

			this.walls.push(wall);

			point.z_index = index;
		});

		orbit_controls.target.set(0, this.height / 2, 0);

		this.points.forEach((point) => point.updateStyles());
	}

	make2 (height, points) {

		this.destroy();

		this.floor = new Floor(this);

		this.height = height;

		this.points.push(...points);

		this.points.forEach((point) => {

			point.updateSceneCoordinates();
			// point.updateStyles();
		});

		// this.floor.applyMaterial(Material.default.id);
		// this.floor.updateGeometry();

		this.points.forEach((point, index) => {

			const wall = new Wall(this, points[index], points[index + 1] || points[0]);

			wall.updateQuaternionAndPosition();

			this.walls.push(wall);

			point.z_index = index;
		});

		orbit_controls.target.set(0, this.height / 2, 0);

		this.points.forEach((point) => point.updateStyles());
	}

	update (new_points) {

		if (new_points.length > this.points.length) {

			new_points.forEach((point, index) => {

				point.z_index = index;

				if (!this.points.includes(point)) {

					const prev_point = new_points[index - 1] || new_points[new_points.length - 1];
					const next_point = new_points[index + 1] || new_points[0];

					const [ removed_wall ] = prev_point.walls.filter((wall) => next_point.walls.includes(wall));

					prev_point.walls.splice(

						prev_point.walls.indexOf(removed_wall),

						1,
					);

					next_point.walls.splice(

						next_point.walls.indexOf(removed_wall),

						1,
					);

					this.walls.splice(

						this.walls.indexOf(removed_wall),

						1,

						new Wall(this, prev_point, point),

						new Wall(this, point, next_point),
					);

					removed_wall.remove();
				}
			});
		}
		else {

			this.points.forEach((point, index) => {

				// point.z_index = index;

				if (!new_points.includes(point)) {

					const prev_point = this.points[index - 1] || this.points[this.points.length - 1];
					const next_point = this.points[index + 1] || this.points[0];

					prev_point.walls.splice(

						prev_point.walls.indexOf(point.walls.filter((wall) => prev_point.walls.includes(wall))[0]),

						1,
					);

					next_point.walls.splice(

						next_point.walls.indexOf(point.walls.filter((wall) => next_point.walls.includes(wall))[0]),

						1,
					);

					this.walls.splice(

						this.walls.indexOf(point.walls[0]),

						2,

						new Wall(this, prev_point, next_point),
					);

					point.walls.forEach((wall) => wall.remove());

					point.remove();
				}
			});
		}

		this.points = new_points;

		this.points.forEach((point) => {

			point.updateSceneCoordinates();
			point.updateStyles();
		});

		this.floor.updateGeometry();

		// this.points.forEach((point) => point.updateStyles());
	}

	destroy () {

		this.points.forEach((point) => point.remove());

		this.points.length = 0;

		if (this.floor) {

			this.floor.remove();

			this.floor = null;
		}

		this.walls.forEach((wall) => wall.remove());

		this.walls.length = 0;
	}
}
