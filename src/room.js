import Loader from 'external-data-loader';

import { coverings_plan_NODE } from './dom';

import Floor from './floor';
import Wall from './wall';

import {

	scene,
	orbit_controls,
	raycastable_meshes,
} from './three';



const loader = new Loader();



export default class Room {

	constructor () {

		this.points = [];

		this.floor = null;

		this.walls = [];

		this.height = 0;

		this.floor_tile_default = null;

		this.wall_tile_default = null;
	}

	async loadDefaultTextures () {

		const tile_floor = await fetch(

			`${ __STATIC_PATH__ }/textures/3/info.json`,

			{ method: 'get' },
		)
			.then((response) => response.json());



		const tile_wall = await fetch(

			`${ __STATIC_PATH__ }/textures/4/info.json`,

			{ method: 'get' },
		)
			.then((response) => response.json());



		let sources = {};

		for (const texture in tile_floor.textures) {

			sources[texture] = { source: `${ __STATIC_PATH__ }${ tile_floor.textures[texture] }`, type: 'image' };
		}

		await loader.load({

			sources,

			// progress: () => 0,
		});

		this.floor_tile_default = {

			sizes: tile_floor.sizes,

			textures: loader.content,
		};

		loader.content = {};



		sources = {};

		for (const texture in tile_wall.textures) {

			sources[texture] = { source: `${ __STATIC_PATH__ }${ tile_wall.textures[texture] }`, type: 'image' };
		}

		await loader.load({

			sources,

			// progress: () => 0,
		});

		this.wall_tile_default = {

			sizes: tile_wall.sizes,

			textures: loader.content,
		};

		loader.content = {};
	}

	async makeContour (height, points) {

		if (!this.floor_tile_default || !this.wall_tile_default) {

			await this.loadDefaultTextures();
		}

		this.destroyContour();

		this.floor = new Floor(this);

		this.height = height;

		this.points.length = 0;

		this.points.push(...points);

		// this.prev_walls = this.walls.slice();

		this.walls.length = 0;

		this.points.forEach((point, index) => {

			const wall = new Wall(this, points[index], points[index + 1] || points[0]);

			this.walls.push(wall);

			point.z_index = index;

			!point.walls.includes(wall) &&

				point.walls.push(wall);

			coverings_plan_NODE.appendChild(point.circle);
		});

		orbit_controls.target.set(0, this.height / 2, 0);

		this.points.forEach((point) => point.updateStyles());

		this.floor.setTile(this.floor_tile_default);
		this.floor.updateGeometry();
	}

	updateContour () {

		this.walls.length = 0;

		this.points.forEach((point, index) => {

			point.z_index = index;

			if (!point.walls.length) {

				const prev_point = this.points[index - 1] || this.points[this.points.length - 1];
				const next_point = this.points[index + 1] || this.points[0];

				const wall1 = new Wall(this, prev_point, point);
				const wall2 = new Wall(this, point, next_point);

				const [ removed_wall ] = prev_point.walls.filter((wall) => next_point.walls.includes(wall));

				prev_point.walls.splice(

					prev_point.walls.indexOf(removed_wall),

					1,

					wall1,
				);

				next_point.walls.splice(

					next_point.walls.indexOf(removed_wall),

					1,

					wall2,
				);

				this.walls.push(wall1, wall2);

				!point.walls.includes(wall1) &&

					point.walls.push(wall1);

				!point.walls.includes(wall2) &&

					point.walls.push(wall2);

				removed_wall.remove();

				coverings_plan_NODE.appendChild(point.circle);
			}
		});

		this.points.forEach((point) => point.updateStyles());

		// this.floor.setTile(this.floor_tile_default);
		this.floor.updateGeometry();
	}

	destroyContour () {

		scene.children
			.filter((_object) => _object.userData.parent)
			.forEach((mesh) => {

				raycastable_meshes.splice(raycastable_meshes.indexOf(mesh), 1);

				scene.remove(mesh);
			});

		this.points.forEach((point) => {

			point.z_index = 0;
			point.walls.length = 0;
		});

		this.points.length = 0;

		coverings_plan_NODE.innerHTML = '';
	}
}
