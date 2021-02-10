/*
eslint-disable

max-len,
*/



// make string constants



// import Loader from 'external-data-loader';

import modes from './modes';

import Point from './point';
import Wall from './wall';

// import cast from './cast';

import {

	coverings_plan_NODE,
	upload_model_BUTTON,
	add_wall_mode_BUTTON,
	mode_toggle_BUTTON,
	upload_model_INPUT,
	// floor_tile_SELECT,
	// canvas,
} from './dom';

import {

	// camera,
	// orbit_camera,
	// plan_camera,
	uploadModel,
	// tilable_mesh,
} from './three';


// console.log(Loader);



// const loader = new Loader();



const file_reader = new FileReader();

file_reader.addEventListener('loadend', (evt) => {

	uploadModel(evt);

	upload_model_INPUT.value = null;
});

upload_model_INPUT.addEventListener('change', (evt) => {

	file_reader.readAsArrayBuffer(evt.target.files[0]);
});

upload_model_BUTTON.addEventListener('click', () => {

	upload_model_INPUT.click();
});



add_wall_mode_BUTTON.addEventListener('click', () => {

	modes.add_wall_mode = 1 - modes.add_wall_mode;

	if (modes.add_wall_mode) {

		add_wall_mode_BUTTON.classList.add('-pressed');
	}
	else {

		add_wall_mode_BUTTON.classList.remove('-pressed');
	}
});

mode_toggle_BUTTON.addEventListener('click', () => {

	modes.orbit_mode = 1 - modes.orbit_mode;

	if (modes.orbit_mode) {

		mode_toggle_BUTTON.innerHTML = 'Orbit mode';

		mode_toggle_BUTTON.classList.add('-pressed');

		coverings_plan_NODE.classList.add('-hidden');

		// camera._ = orbit_camera;
	}
	else {

		// disable add_wall_mode_BUTTON

		mode_toggle_BUTTON.innerHTML = 'Plan mode';

		mode_toggle_BUTTON.classList.remove('-pressed');

		coverings_plan_NODE.classList.remove('-hidden');

		// camera._ = plan_camera;
	}

	// Point.updateGeometries();
});

window.addEventListener('mouseup', () => {

	if (Point.selected) {

		Point.selected.circle.classList.remove('-mousedown');

		window.removeEventListener('mousemove', Point.move);

		// Point.selected = null;
	}

	if (Wall.selected) {

		window.removeEventListener('mousemove', Wall.move);

		// Wall.selected = null;
	}

	// Point.states.push(Point.instances.slice());
});

window.addEventListener('keydown', (evt) => {

	if (evt.code === 'KeyD' && Point.instances.length > 3) {

		const new_points = Point.instances.slice();

		new_points.splice(new_points.indexOf(Point.selected), 1);

		Point.makeContour(new_points);
	}
	else if (evt.code === 'KeyZ') {

		Point.makeContour(Point.states.pop());
	}
});

// let wall_index = 0;

// floor_tile_SELECT.addEventListener('change', async () => {

// 	if (tilable_mesh._) {

// 		// console.log(evt);

// 		const info = await fetch(

// 			'/textures/1/info.json',

// 			{
// 				method: 'get',
// 			},
// 		)
// 			.then((response) => response.json());

// 		if (info.textures) {

// 			const sources = {};

// 			for (const texture in info.textures) {

// 				sources[texture] = { source: info.textures[texture], type: 'image' };
// 			}

// 			await loader.load({

// 				sources,

// 				// progress: () => 0,
// 			});
// 		}

// 		// console.log(loader);

// 		console.log(tilable_mesh._);

// 		[ ... ].setTile(info.sizes, loader.content);

// 		loader.content = {};
// 	}
// });

// window.addEventListener('wheel', (evt) => {

// 	// if (!modes.orbit_mode) {

// 	// 	const asd = Math.sign(evt.deltaY);

// 	// 	cast.METERS_TO_PIXELS += asd;

// 	// 	plan_camera.zoom = cast.METERS_TO_PIXELS;

// 	// 	plan_camera.updateProjectionMatrix();
// 	// }

// 	orbit_camera.zoom += Math.sign(evt.deltaY) * 0.1;

// 	console.log(orbit_camera.zoom);

// 	orbit_camera.updateProjectionMatrix();
// });
