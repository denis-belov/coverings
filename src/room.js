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

		for (const texture in tile_wall.textures) {

			sources[texture] = { source: `${ __STATIC_PATH__ }${ tile_wall.textures[texture] }`, type: 'image' };
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

		for (const texture in tile_floor.textures) {

			sources[texture] = { source: `${ __STATIC_PATH__ }${ tile_floor.textures[texture] }`, type: 'image' };
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

		this.floor = new Floor(this, 'FrontSide');

		this.height = height;

		this.points.length = 0;

		this.points.push(...points);

		this.prev_walls = this.walls.slice();

		this.walls.length = 0;

		this.points.forEach((point, index) => {

			const wall = new Wall(this, 'BackSide', points[index], points[index + 1] || points[0]);

			this.walls.push(wall);

			point.z_index = index;

			point.walls.push(wall);

			coverings_plan_NODE.appendChild(point.circle);
		});

		orbit_controls.target.set(0, this.height / 2, 0);

		this.points.forEach((point) => point.updateStyles());

		this.floor.setTile(this.floor_tile_default);
		this.floor.updateGeometry();

		loader.content = {};

		this.walls.forEach((wall) => {

			for (let i = 0; i < this.prev_walls.length; ++i) {

				if (

					(
						(
							wall.points[0] === this.prev_walls[i].points[0] &&
							wall.points[1] === this.prev_walls[i].points[1]
						) ||
						(
							wall.points[0] === this.prev_walls[i].points[1] &&
							wall.points[1] === this.prev_walls[i].points[0]
						)
					) &&
					this.prev_walls[i].tile
				) {

					wall.copy(this.prev_walls[i]);
				}
			}
		});
	}

	destroyContour () {

		raycastable_meshes.length = 0;

		if (this.floor) {

			scene.remove(this.floor.mesh);
		}

		this.walls.forEach((wall) => scene.remove(wall.mesh));

		this.points.forEach((point) => {

			point.z_index = 0;
			point.walls.length = 0;
		});

		this.points.length = 0;

		coverings_plan_NODE.innerHTML = '';
	}
}
