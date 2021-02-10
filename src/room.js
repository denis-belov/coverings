import { coverings_plan_NODE } from './dom';

import Floor from './floor';
import Wall from './wall';

import {

	scene,
	orbit_controls,
	raycastable_meshes,
} from './three';



export default class Room {

	constructor () {

		this.points = [];

		this.floor = new Floor(this, 'FrontSide');

		this.walls = [];

		this.height = 0;
	}

	makeContour (height, points) {

		this.destroyContour();

		this.height = height;

		this.points.length = 0;

		this.points.push(...points);

		this.walls.length = 0;

		this.points.forEach((point, index) => {

			const wall = new Wall(this, 'BackSide', points[index], points[index + 1] || points[0]);

			this.walls.push(wall);

			point.z_index = index;

			point.walls.push(wall);

			coverings_plan_NODE.appendChild(point.circle);
		});


		this.points.forEach((point) => point.set());

		orbit_controls.target.set(0, this.height / 2, 0);
	}

	destroyContour () {

		raycastable_meshes.length = 0;

		this.walls.forEach((wall) => scene.remove(wall.mesh));

		this.points.forEach((point) => {

			point.z_index = 0;
			point.walls.length = 0;
		});

		this.points.length = 0;

		coverings_plan_NODE.innerHTML = '';
	}

	updateGeometries () {

		this.points.forEach((point) => point.updateSceneCoordinates());

		this.floor.updateGeometry();

		this.walls.forEach((wall) => wall.updateGeometry());
	}
}
