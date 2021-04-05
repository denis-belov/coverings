// make plan scale



import FileSaver from 'file-saver';
import * as THREE from 'three';
import './index.scss';
import '@babel/polyfill';

// import Loader from 'external-data-loader';

import modes from './modes';
// import textures from './textures';
// import cast from './cast';

import Point from './point';
import Material from './material';
import Wall from './wall';
import Room from './room';
import plan from './plan';

import {

	load_BUTTON,
	material_BUTTONS,
	mode_toggle_BUTTON,
	coverings_plan_NODE,
	load_INPUT,
	modal,
	pick_kitchen_BUTTON,
	pick_bathroom_BUTTON,
	back_BUTTON,
	width_INPUT,
	length_INPUT,
	height_INPUT,
	apply_sizes_BUTTON,
	pick_manual_input_BUTTON,
	room_picker_MODAL,
	manual_input_MODAL,
	texture_transformation_center_NODE,
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



mode_toggle_BUTTON.addEventListener('click', () => {

	modes.orbit_mode = 1 - modes.orbit_mode;

	if (modes.orbit_mode) {

		mode_toggle_BUTTON.innerHTML = 'Orbit mode';

		mode_toggle_BUTTON.classList.add('-pressed');

		coverings_plan_NODE.classList.add('-hidden');

		plan.rooms.forEach((_room) => {

			_room.walls.forEach((wall) => {

				wall.updateQuaternionAndPosition();

				if (wall.segments.length > 0) {

					wall.segments.forEach((segment) => {

						segment.material ||

							segment.applyMaterial(Material.default.id);

						segment.updateGeometry();
					});
				}
				else {

					wall.material ||

						wall.applyMaterial(Material.default.id);

					wall.updateGeometry();
				}
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

			const material_id = `${ __STATIC_PATH__ }/textures/${ BUTTON.innerHTML }/info.json`;

			await tileable_mesh._.userData.parent.applyMaterial(material_id);

			tileable_mesh._.userData.parent.updateGeometry(tileable_mesh._.userData.parent.regions);

			plan.pushState();
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

	load_INPUT.click();
});



apply_sizes_BUTTON.addEventListener('click', async () => {

	await Material.loadDefault();



	const width = parseFloat(width_INPUT.value);
	const length = parseFloat(length_INPUT.value);
	const height = parseFloat(height_INPUT.value);



	const room = new Room();

	plan.rooms = [ room ];



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



pick_kitchen_BUTTON.addEventListener('click', async () => {

	await Material.loadDefault();



	const width = 4;
	const length = 6;
	const height = 2.5;



	const room = new Room();

	plan.rooms = [ room ];



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



pick_bathroom_BUTTON.addEventListener('click', async () => {

	await Material.loadDefault();



	const width = 3;
	const length = 3;
	const height = 2.5;



	const room = new Room();

	plan.rooms = [ room ];



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



// LOG(pick_manual_input_BUTTON)
pick_manual_input_BUTTON.addEventListener('click', () => {

	room_picker_MODAL.style.display = 'none';

	manual_input_MODAL.style.display = 'block';
});



back_BUTTON.addEventListener('click', () => {

	room_picker_MODAL.style.display = 'block';

	manual_input_MODAL.style.display = 'none';
});



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
	}

	if (Wall.selected) {

		window.removeEventListener('mousemove', Wall.move);

		if (

			Wall.selected.points[0].prev_pixel_x !== Wall.selected.points[0].pixel_x ||
			Wall.selected.points[0].prev_pixel_y !== Wall.selected.points[0].pixel_y
		) {

			plan.pushState();

			Wall.selected.points.forEach((point) => {

				point.prev_pixel_x = point.pixel_x;
				point.prev_pixel_y = point.pixel_y;
			});
		}
	}
});

window.addEventListener('keydown', (evt) => {

	evt.preventDefault();

	if (evt.ctrlKey) {

		if (evt.code === 'ArrowLeft') {

			if (tileable_mesh._) {

				texture_transformation_center_NODE.style.display = 'block';

				tileable_mesh._.userData.parent.texture_rotation += Math.PI * 0.01;

				tileable_mesh._.userData.parent.updateGeometry();
			}
		}
		else if (evt.code === 'ArrowRight') {

			if (tileable_mesh._) {

				texture_transformation_center_NODE.style.display = 'block';

				tileable_mesh._.userData.parent.texture_rotation -= Math.PI * 0.01;

				tileable_mesh._.userData.parent.updateGeometry();
			}
		}
	}
	else if (evt.altKey) {

		if (evt.code === 'ArrowLeft') {

			if (tileable_mesh._) {

				texture_transformation_center_NODE.style.display = 'block';

				tileable_mesh._.userData.parent.texture_translation_x -= 0.01;

				tileable_mesh._.userData.parent.updateGeometry();
			}
		}
		else if (evt.code === 'ArrowRight') {

			if (tileable_mesh._) {

				texture_transformation_center_NODE.style.display = 'block';

				tileable_mesh._.userData.parent.texture_translation_x += 0.01;

				tileable_mesh._.userData.parent.updateGeometry();
			}
		}
		else if (evt.code === 'ArrowUp') {

			if (tileable_mesh._) {

				texture_transformation_center_NODE.style.display = 'block';

				tileable_mesh._.userData.parent.texture_translation_y -= 0.01;

				tileable_mesh._.userData.parent.updateGeometry();
			}
		}
		else if (evt.code === 'ArrowDown') {

			if (tileable_mesh._) {

				texture_transformation_center_NODE.style.display = 'block';

				tileable_mesh._.userData.parent.texture_translation_y += 0.01;

				tileable_mesh._.userData.parent.updateGeometry();
			}
		}
	}
});

window.addEventListener('keyup', () => {

	texture_transformation_center_NODE.style.display = 'none';
});

window.addEventListener('keypress', (evt) => {

	evt.preventDefault();

	if (evt.code === 'KeyZ') {

		plan.undo();
	}
	else if (evt.code === 'KeyY') {

		plan.redo();
	}
	else if (evt.code === 'KeyD') {

		if (Point.selected) {

			const new_points = plan.rooms[0].points.slice();

			new_points.splice(new_points.indexOf(Point.selected), 1);

			plan.rooms[0].update(new_points);

			Point.selected = null;

			plan.pushState();
		}
	}
	else if (evt.code === 'KeyS') {

		const blob =
			new Blob([ JSON.stringify(plan.states[plan.states.length - 1]) ], { type: 'text/plain;charset=utf-8' });

		FileSaver.saveAs(blob, 'room.json');
	}
});



const animate = () => {

	requestAnimationFrame(animate);

	renderer.clear();

	if (modes.orbit_mode) {

		orbit_controls.update();

		renderer.render(scene, orbit_camera);
	}
	else {

		renderer.render(scene, plan_camera);
	}
};



animate();
