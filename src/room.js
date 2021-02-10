/*
eslint-disable

no-magic-numbers,
*/



// import earcut from 'earcut';
// import * as THREE from 'three';

import { coverings_plan_NODE } from './dom';

import Floor from './floor';
import Wall from './wall';

// import modes from './modes';
// import cast from './cast';

import {

	// geometry_walls,
	// geometry_floor,
	// position_data_walls,
	// uv_data_walls,
	// index_data_floor,
	// position_data_floor,
	// normal_data_floor,
	// uv_data_floor,
	// mesh_floor,
	// scene,
	// webgl_maximum_anisotropy,
	// MATERIAL_WIREFRAME,
	orbit_camera,
	orbit_controls,
} from './three';



// const TEST_ROOM_HEIGHT_METERS = 3;




export default class Room {

	constructor () {

		this.points = [];

		this.floor = new Floor(this);

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

			const wall = new Wall(this, points[index], points[index + 1] || points[0]);

			this.walls.push(wall);

			point.z_index = index;

			point.walls.push(wall);

			coverings_plan_NODE.appendChild(point.circle);
		});

		// Wall.instances = walls;

		this.points.forEach((point) => point.set());

		orbit_camera.position.set(0, 10, 0);
		// orbit_camera.lookAt(0, this.height * 0.5, 0);
		orbit_controls.target.set(0, this.height * 0.5, 0);
		// console.log(orbit_camera);

		// orbit_camera.updateMatrixWorld();
	}

	destroyContour () {

		this.points.forEach((point) => {

			point.z_index = 0;
			point.walls.length = 0;
		});

		this.points.length = 0;

		coverings_plan_NODE.innerHTML = '';
	}

	// updatePointSceneCoordinates () {

	// 	this.points.forEach((point) => point.updateSceneCoordinates());
	// }

	updateGeometries () {

		this.points.forEach((point) => point.updateSceneCoordinates());

		this.floor.updateGeometry();

		this.walls.forEach((wall) => wall.updateGeometry());
	}
}
