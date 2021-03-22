/*
eslint-disable

no-new,
*/



import Loader from 'external-data-loader';

// import { coverings_plan_NODE } from './dom';
import cast from './cast';

import Point from './point';
import Floor from './floor';
import Wall from './wall';
import Segment from './segment';

import {

	scene,
	orbit_controls,
	raycastable_meshes,
} from './three';



const loader = new Loader();



export class Room {

	static floor_tile_default = null;
	static wall_tile_default = null;

	static loadDefaultTextures = async () => {

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

		Room.floor_tile_default = {

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

		Room.wall_tile_default = {

			sizes: tile_wall.sizes,

			textures: loader.content,
		};

		loader.content = {};
	}

	constructor () {

		this.points = [];

		this.floor = null;

		this.walls = [];

		this.height = 0;
	}

	async make (height, points) {

		if (!Room.floor_tile_default || !Room.wall_tile_default) {

			await Room.loadDefaultTextures();
		}

		this.destroy();

		this.floor = new Floor(this);

		this.height = height;

		this.points.push(...points);

		this.points.forEach((point, index) => {

			const wall = new Wall(this, points[index], points[index + 1] || points[0]);

			this.walls.push(wall);

			point.z_index = index;
		});

		orbit_controls.target.set(0, this.height / 2, 0);

		this.points.forEach((point) => point.updateStyles());

		this.floor.setTile(Room.floor_tile_default);
		this.floor.updateGeometry();
	}

	update (new_points) {

		this.walls.length = 0;

		if (new_points.length > this.points.length) {

			new_points.forEach((point, index) => {

				point.z_index = index;

				if (!this.points.includes(point)) {

					const prev_point = new_points[index - 1] || new_points[new_points.length - 1];
					const next_point = new_points[index + 1] || new_points[0];

					new Wall(this, prev_point, point);
					new Wall(this, point, next_point);

					const [ removed_wall ] = prev_point.walls.filter((wall) => next_point.walls.includes(wall));

					prev_point.walls.splice(

						prev_point.walls.indexOf(removed_wall),

						1,
					);

					next_point.walls.splice(

						next_point.walls.indexOf(removed_wall),

						1,
					);

					removed_wall.remove();
				}
			});
		}
		else {

			let removed_point = null;

			this.points.forEach((point, index) => {

				// point.z_index = index;

				if (!new_points.includes(point)) {

					const prev_point = this.points[index - 1] || this.points[this.points.length - 1];
					const next_point = this.points[index + 1] || this.points[0];

					new Wall(this, prev_point, next_point);

					prev_point.walls.splice(

						prev_point.walls.indexOf(point.walls.filter((wall) => prev_point.walls.includes(wall))[0]),

						1,
					);

					next_point.walls.splice(

						next_point.walls.indexOf(point.walls.filter((wall) => next_point.walls.includes(wall))[0]),

						1,
					);

					point.walls.forEach((wall) => wall.remove());

					removed_point = point;
				}
			});

			removed_point.remove();
		}

		this.points = new_points;

		this.floor.updateGeometry();

		this.points.forEach((point) => {

			this.walls.push(point.walls[0]);

			point.updateStyles();
		});
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



export class Plan {

	constructor (rooms) {

		this.rooms = rooms;

		this.states = [];

		this.state_index = -1;
	}

	pushState () {

		const state = {};

		state.rooms = [];

		const room1 = {

			name: 'room1',

			height: this.rooms[0].height,

			points:

				this.rooms[0].points.map((elm) => ([ (elm.pixel_x - (window.innerWidth / 2)) * cast.PIXELS_TO_METERS, (elm.pixel_y - (window.innerHeight / 2)) * cast.PIXELS_TO_METERS ])),

			walls:

			this.rooms[0].walls.map((elm) => {

					return {

						segments:

							elm.segments.map((segment) => segment.polygons),
					};
				}),
		};

		state.rooms.push(room1);

		this.states = this.states.slice(0, this.state_index + 1);

		this.states.push(state);

		++this.state_index;

		// LOG(this.states, this.state_index)
	}

	makeFromJson (json) {

		// this.destroy();

		const new_rooms = [];

		json.rooms &&

			json.rooms.forEach(async (json_room) => {

				const points = json_room.points.map((json_room_point) => new Point(...json_room_point));

				const room = new Room();

				// this.rooms.push(room);
				new_rooms.push(room);

				await room.make(json_room.height, points);

				json_room.walls.forEach((wall, wall_index) => {

					if (wall.segments.length > 0) {

						wall.segments.map(

							(json_room_wall_segment) =>
								new Segment(

									null,
									room.walls[wall_index],
									json_room_wall_segment,
								),
						);



						raycastable_meshes.splice(

							raycastable_meshes.indexOf(room.walls[wall_index].mesh),

							1,
						);

						scene.remove(room.walls[wall_index].mesh);
					}
				});
			});

		this.destroy();

		this.rooms = new_rooms;
	}

	undo () {

		if (this.state_index > 0) {

			this.makeFromJson(this.states[--this.state_index]);
		}
	}

	redo () {

		if (this.state_index < this.states.length - 1) {

			this.makeFromJson(this.states[++this.state_index]);
		}
	}

	destroy () {

		this.rooms.forEach((room) => room.destroy());

		this.rooms.length = 0;
	}
}
