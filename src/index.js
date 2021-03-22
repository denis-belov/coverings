// make plan scale



import FileSaver from 'file-saver';
import * as THREE from 'three';
import './index.scss';
import '@babel/polyfill';

import Loader from 'external-data-loader';

import modes from './modes';
// import cast from './cast';

import Point from './point';
import Wall from './wall';
import { Room, Plan } from './room';

import {

	load_BUTTON,
	material_BUTTONS,
	mode_toggle_BUTTON,
	coverings_plan_NODE,
	load_INPUT,
	modal,
	width_INPUT,
	length_INPUT,
	height_INPUT,
	apply_sizes_BUTTON,
} from './dom';

import {

	renderer,
	scene,
	plan_camera,
	orbit_camera,
	orbit_controls,
	tileable_mesh,
} from './three';

import './events';



const loader = new Loader();



const room = new Room();

room.make(

	2.5,

	[
		new Point(-4 / 2, -2.5 / 2),

		new Point(-4 / 2, 2.5 / 2),

		new Point(4 / 2, 2.5 / 2),

		new Point(4 / 2, -2.5 / 2),
	],
);



const plan = new Plan([ room ]);



mode_toggle_BUTTON.addEventListener('click', () => {

	modes.orbit_mode = 1 - modes.orbit_mode;

	if (modes.orbit_mode) {

		mode_toggle_BUTTON.innerHTML = 'Orbit mode';

		mode_toggle_BUTTON.classList.add('-pressed');

		coverings_plan_NODE.classList.add('-hidden');

		plan.rooms.forEach((_room) => {

			_room.walls.forEach((wall) => {

				wall.tile ||

					wall.setTile(Room.wall_tile_default);

				wall.updateGeometry();

				wall.segments.forEach((segment) => {

					segment.mesh.quaternion.copy(wall.quaternion);
					segment.mesh.position.copy(wall.position);
					segment.mesh.updateMatrix();

					segment.tile ||

						segment.setTile(Room.wall_tile_default);

					segment.updateGeometry();

					segment.mesh.geometry.computeBoundingSphere();
				});
			});
		});
	}
	else {

		mode_toggle_BUTTON.innerHTML = 'Plan mode';

		mode_toggle_BUTTON.classList.remove('-pressed');

		coverings_plan_NODE.classList.remove('-hidden');
	}
});



material_BUTTONS.forEach((BUTTON) => {

	BUTTON.addEventListener('click', async () => {

		if (tileable_mesh._) {

			const info = await fetch(

				`${ __STATIC_PATH__ }/textures/${ BUTTON.innerHTML }/info.json`,

				{ method: 'get' },
			)
				.then((response) => response.json());



			if (info.textures) {

				const sources = {};

				for (const texture in info.textures) {

					sources[texture] = { source: `${ __STATIC_PATH__ }${ info.textures[texture] }`, type: 'image' };
				}

				await loader.load({

					sources,

					// progress: () => 0,
				});
			}



			info.textures = loader.content;

			tileable_mesh._.userData.parent.setTile(info);

			loader.content = {};

			tileable_mesh._.userData.parent.updateGeometry(tileable_mesh._.userData.parent.regions);
		}
	});
});



const file_reader = new FileReader();

file_reader.addEventListener('loadend', (evt) => {

	plan.makeFromJson(JSON.parse(evt.target.result));

	load_INPUT.value = null;
});

load_INPUT.addEventListener('change', (evt) => {

	file_reader.readAsText(evt.target.files[0]);
});

load_BUTTON.addEventListener('click', () => {

	// const json = {};

	// json.rooms = [];

	// const room1 = {

	// 	name: 'room1',

	// 	height: plan.rooms[0].height,

	// 	points:

	// 		plan.rooms[0].points.map((elm) => ([ (elm.pixel_x - (window.innerWidth / 2)) * cast.PIXELS_TO_METERS, (elm.pixel_y - (window.innerHeight / 2)) * cast.PIXELS_TO_METERS ])),

	// 	walls:

	// 		plan.rooms[0].walls.map((elm) => {

	// 			return {

	// 				segments:

	// 					elm.segments.map((segment) => segment.polygons),
	// 			};
	// 		}),
	// };

	// json.rooms.push(room1);

	// const blob = new Blob([ JSON.stringify(json) ], { type: 'text/plain;charset=utf-8' });

	// FileSaver.saveAs(blob, 'room.json');

	load_INPUT.click();
});



apply_sizes_BUTTON.addEventListener('click', () => {

	const width = parseFloat(width_INPUT.value);
	const length = parseFloat(length_INPUT.value);
	const height = parseFloat(height_INPUT.value);



	plan.rooms[0].make(

		height,

		[
			new Point(-length / 2, -width / 2),

			new Point(-length / 2, width / 2),

			new Point(length / 2, width / 2),

			new Point(length / 2, -width / 2),
		],
	);



	[
		[ 1.5, height, 1.5 ],
		[ 1.5, height, -1.5 ],
		[ -1.5, height, -1.5 ],
		[ -1.5, height, 1.5 ],
	]
		.forEach((spot_light_position) => {

			const spot_light = new THREE.SpotLight(0xFFFFFF);
			spot_light.intensity = 10;
			spot_light.distance = 0;
			spot_light.penumbra = 1;
			spot_light.decay = 2;
			spot_light.angle = Math.PI * 0.5;
			spot_light.position.set(...spot_light_position);

			// spot_light.target.position.y = 0;
			// spot_light.target.position.set(...spot_light_position);

			scene.add(spot_light);
			scene.add(spot_light.target);
		});

	modal.style.display = 'none';

	plan.pushState();
});



window.addEventListener('keypress', (evt) => {

	if (evt.code === 'KeyD' && Point.selected) {

		const new_points = room.points.slice();

		new_points.splice(new_points.indexOf(Point.selected), 1);

		room.update(new_points);
	}
});



// let animation_allowed = true;



window.addEventListener('mouseup', () => {

	if (Point.selected) {

		Point.selected.circle.classList.remove('-mousedown');

		window.removeEventListener('mousemove', Point.move);

		if (

			Point.selected.prev_pixel_x !== Point.selected.pixel_x ||
			Point.selected.prev_pixel_y !== Point.selected.pixel_y
		) {

			plan.pushState();

			Point.selected.prev_pixel_x = Point.selected.pixel_x;
			Point.selected.prev_pixel_y = Point.selected.pixel_y;
		}

		Point.selected = null;
	}

	if (Wall.selected) {

		window.removeEventListener('mousemove', Wall.move);

		if (

			Wall.selected.points[0].prev_pixel_x !== Wall.selected.points[0].pixel_x ||
			Wall.selected.points[0].prev_pixel_y !== Wall.selected.points[0].pixel_y
		) {

			// LOG(

			// 	Wall.selected.points[0].prev_pixel_x, Wall.selected.points[0].pixel_x,
			// 	Wall.selected.points[0].prev_pixel_y, Wall.selected.points[0].pixel_y,
			// )

			plan.pushState();

			Wall.selected.points.forEach((point) => {

				point.prev_pixel_x = point.pixel_x;
				point.prev_pixel_y = point.pixel_y;
			});
		}

		Wall.selected = null;
	}
});

window.addEventListener('keypress', (evt) => {

	if (evt.code === 'KeyZ') {

		// animation_allowed = false;

		plan.undo();

		// setTimeout(() => {

		// 	animation_allowed = true;

		// 	// LOG(1)
		// }, 0);
	}
	else if (evt.code === 'KeyY') {

		plan.redo();
	}
});



const animate = () => {

	requestAnimationFrame(animate);

	// if (animation_allowed) {

	renderer.clear();

	if (modes.orbit_mode) {

		orbit_controls.update();

		renderer.render(scene, orbit_camera);
	}
	else {

		renderer.render(scene, plan_camera);
	}
	// }
};



animate();
