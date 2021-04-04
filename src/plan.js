/*
eslint-disable

no-new,
*/



import cast from './cast';

import Point from './point';
import Material from './material';
import Room from './room';
import Segment from './segment';

import {

	scene,
	raycastable_meshes,
} from './three';



class Plan {

	constructor () {

		this.rooms = [];

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

				this.rooms[0].points.map(

					(point) =>

						[
							(point.pixel_x - (window.innerWidth / 2)) * cast.PIXELS_TO_METERS,
							(point.pixel_y - (window.innerHeight / 2)) * cast.PIXELS_TO_METERS,
						],
				),

			floor: {

				material: this.rooms[0].floor.material?.id || null,

				segments:

					this.rooms[0].floor.segments.map(

						(segment) => ({

							material: segment.material?.id || null,

							polygons: segment.polygons,
						}),
					),
			},

			walls:

				this.rooms[0].walls.map(

					(wall) => ({

						material: wall.material?.id || null,

						segments:

							wall.segments.map(

								(segment) => ({

									material: segment.material?.id || null,

									polygons: segment.polygons,
								}),
							),
					}),
				),
		};

		state.rooms.push(room1);

		this.states = this.states.slice(0, this.state_index + 1);

		this.states.push(state);

		++this.state_index;
	}

	makeFromJson (json) {

		const new_rooms = [];

		json.rooms &&

			json.rooms.forEach(async (json_room) => {

				const points = json_room.points.map((json_room_point) => new Point(...json_room_point));

				const room = new Room();

				new_rooms.push(room);

				room.make2(json_room.height, points);



				const { floor } = room;

				// floor tile is being set to allow the segments use this after undo or redo action or restoring
				await floor.applyMaterial(json_room.floor.material || Material.default.id);



				if (json_room.floor.segments.length > 0) {

					json_room.floor.segments.forEach(

						async (json_segment) => {

							const segment = new Segment(

								null,
								floor,
								json_segment.polygons,
							);

							// if mode == orbit

							await segment.applyMaterial(json_segment.material || Material.default.id);

							segment.updateGeometry();
						},
					);



					if (raycastable_meshes.includes(floor.mesh)) {

						raycastable_meshes.splice(

							raycastable_meshes.indexOf(floor.mesh),

							1,
						);
					}

					scene.remove(floor.mesh);
				}
				else {

					floor.updateGeometry();
				}



				json_room.walls.forEach(async (json_wall, wall_index) => {

					const wall = room.walls[wall_index];

					// wall tile is being set to allow the segments use this after undo or redo action or restoring

					await wall.applyMaterial(json_wall.material || Material.default.id);



					if (json_wall.segments.length > 0) {

						json_wall.segments.forEach(

							async (json_segment) => {

								const segment = new Segment(

									null,
									wall,
									json_segment.polygons,
								);

								// if mode == orbit

								await segment.applyMaterial(json_segment.material || Material.default.id);

								segment.updateGeometry();
							},
						);



						if (raycastable_meshes.includes(wall.mesh)) {

							raycastable_meshes.splice(

								raycastable_meshes.indexOf(wall.mesh),

								1,
							);
						}

						scene.remove(wall.mesh);
					}
					else {

						wall.updateGeometry();
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



export default new Plan();
