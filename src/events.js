/*
eslint-disable

max-len,
*/



// make string constants



import modes from './modes';

import Point from './point';
import Wall from './wall';

import {

	add_wall_mode_BUTTON,
	orbit_mode_BUTTON,
	coverings_plan_NODE,
} from './dom';

import {

	camera,
	orbit_camera,
	plan_camera,
} from './three';



add_wall_mode_BUTTON.addEventListener('click', () => {

	modes.add_wall_mode = 1 - modes.add_wall_mode;

	if (modes.add_wall_mode) {

		add_wall_mode_BUTTON.classList.add('-pressed');
	}
	else {

		add_wall_mode_BUTTON.classList.remove('-pressed');
	}
});

orbit_mode_BUTTON.addEventListener('click', () => {

	modes.orbit_mode = 1 - modes.orbit_mode;

	if (modes.orbit_mode) {

		orbit_mode_BUTTON.innerHTML = 'Switch to plan mode';

		orbit_mode_BUTTON.classList.add('-pressed');

		coverings_plan_NODE.classList.add('-hidden');

		camera._ = orbit_camera;
	}
	else {

		// disable add_wall_mode_BUTTON

		orbit_mode_BUTTON.innerHTML = 'Switch to orbit mode';

		orbit_mode_BUTTON.classList.remove('-pressed');

		coverings_plan_NODE.classList.remove('-hidden');

		camera._ = plan_camera;
	}

	Point.updateGeometries();
});

window.addEventListener('mouseup', () => {

	if (Point.selected) {

		Point.selected.circle.classList.remove('-mousedown');

		window.removeEventListener('mousemove', Point.move);

		Point.selected = null;
	}

	if (Wall.selected) {

		window.removeEventListener('mousemove', Wall.move);

		Wall.selected = null;
	}
});
