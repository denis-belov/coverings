import modes from './modes';

import Point from './point';
import Wall from './wall';

import {

	// coverings_plan_NODE,
	upload_model_BUTTON,
	add_wall_mode_BUTTON,
	// mode_toggle_BUTTON,
	upload_model_INPUT,
} from './dom';

import { uploadModel } from './three';



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

// mode_toggle_BUTTON.addEventListener('click', () => {

// 	modes.orbit_mode = 1 - modes.orbit_mode;

// 	if (modes.orbit_mode) {

// 		mode_toggle_BUTTON.innerHTML = 'Orbit mode';

// 		mode_toggle_BUTTON.classList.add('-pressed');

// 		coverings_plan_NODE.classList.add('-hidden');
// 	}
// 	else {

// 		mode_toggle_BUTTON.innerHTML = 'Plan mode';

// 		mode_toggle_BUTTON.classList.remove('-pressed');

// 		coverings_plan_NODE.classList.remove('-hidden');
// 	}
// });

window.addEventListener('mouseup', () => {

	if (Point.selected) {

		Point.selected.circle.classList.remove('-mousedown');

		window.removeEventListener('mousemove', Point.move);
	}

	if (Wall.selected) {

		window.removeEventListener('mousemove', Wall.move);
	}
});
