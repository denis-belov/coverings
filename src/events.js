/*
eslint-disable

max-statements,
*/



import * as THREE from 'three';
import polybooljs from 'polybooljs';

import modes from './modes';
import cast from './cast';

import Point from './point';
import Wall from './wall';
import Segment from './segment';

import {

	// coverings_plan_NODE,
	upload_model_BUTTON,
	add_wall_mode_BUTTON,
	// mode_toggle_BUTTON,
	mode_selection_BUTTON,
	apply_segment_BUTTON,
	upload_model_INPUT,
	selection_NODE,
} from './dom';

import {

	uploadModel,
	plan_camera,
	scene_floor,
	scene_floor_segments,
	scene_walls,
	scene_wall_segments,
	tileable_mesh,
	// ATTRIBUTE_SIZE_1,
	ATTRIBUTE_SIZE_2,
	ATTRIBUTE_SIZE_3,
} from './three';



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



const selection_area_div = document.createElement('div');

selection_area_div.className = 'selection_area';

let x = 0;
let y = 0;

let width = 0;
let height = 0;
let left = 0;
let top = 0;

const selection_area_div_coords = [];

const mousemove_selection_area_function = (evt) => {

	selection_area_div_coords.length = 0;

	left = evt.clientX < x ? evt.clientX : x;
	top = evt.clientY < y ? evt.clientY : y;
	width = Math.abs(evt.clientX - x);
	height = Math.abs(evt.clientY - y);

	Object.assign(

		selection_area_div.style,

		{
			left,
			top,
			width,
			height,
		},
	);

	selection_area_div_coords.push(

		left,
		top + height,

		left,
		top,

		left + width,
		top,

		left + width,
		top,

		left + width,
		top + height,

		left,
		top + height,
	);

	selection_area_div.setAttribute(

		'data-value',

		`${ Math.abs((evt.clientX - x) * cast.PIXELS_TO_METERS).toFixed(2) }m
		${ Math.abs((evt.clientY - y) * cast.PIXELS_TO_METERS).toFixed(2) }m`,
	);
};

const mouseup_selection_area_function = () => {

	window.removeEventListener('mousemove', mousemove_selection_area_function);
	window.removeEventListener('mouseup', mouseup_selection_area_function);

	// LOG(width, height)

	if (width > 0 && height > 0) {

		apply_segment_BUTTON.style.display = 'inline-block';
	}
	else {

		apply_segment_BUTTON.style.display = 'none';
	}
};

window.addEventListener('mousedown', (evt) => {

	if (modes.selection_mode) {

		evt.stopPropagation();

		// width = 0;
		// height = 0;

		x = evt.clientX;
		y = evt.clientY;

		Object.assign(

			selection_area_div.style,

			{
				width: 0,
				height: 0,
				left: x,
				top: y,
			},
		);

		document.body.appendChild(selection_area_div);

		window.addEventListener('mousemove', mousemove_selection_area_function);
		window.addEventListener('mouseup', mouseup_selection_area_function);
	}
});



mode_selection_BUTTON.addEventListener('click', () => {

	if (!tileable_mesh._.userData.parent.tileable) {

		const whole = tileable_mesh._.userData.parent;

		modes.selection_mode = 1 - modes.selection_mode;

		if (modes.selection_mode) {

			mode_selection_BUTTON.classList.add('-pressed');

			mode_selection_BUTTON.innerHTML = 'Selection mode';

			selection_NODE.classList.remove('-hidden');

			scene_floor.children.forEach((mesh) => {

				mesh.visible = (mesh === whole.mesh);
			});

			scene_floor_segments.children.forEach((mesh) => {

				mesh.visible = whole.segments.includes(whole.mesh.userData.parent);
			});

			// LOG(scene_walls.children)

			scene_walls.children.forEach((mesh) => {

				// LOG(mesh === whole.mesh)

				mesh.visible = (mesh === whole.mesh);
			});

			scene_wall_segments.children.forEach((mesh) => {

				mesh.visible = whole.segments.includes(whole.mesh.userData.parent);
			});

			plan_camera.rotation.set(0, Math.PI, 0);
			plan_camera.position.set(0, 0, 0);
			plan_camera.translateZ(1);

			whole.mesh.material = whole.material2;

			whole.mesh.quaternion.set(0, 0, 0, 1);
			whole.mesh.position.set(0, 0, 0);
			whole.mesh.updateMatrix();

			whole.segments.forEach((segment) => {

				segment.mesh.material = segment.material2;

				segment.mesh.quaternion.set(0, 0, 0, 1);
				segment.mesh.position.set(0, 0, 0);
				segment.mesh.updateMatrix();
			});

			modes.orbit_mode = 0;
		}
		else {

			mode_selection_BUTTON.classList.remove('-pressed');

			apply_segment_BUTTON.style.display = 'none';

			mode_selection_BUTTON.innerHTML = 'Tile mode';

			selection_NODE.classList.add('-hidden');

			scene_floor.children.forEach((mesh) => {

				mesh.visible = true;
			});

			scene_floor_segments.children.forEach((mesh) => {

				mesh.visible = true;
			});

			scene_walls.children.forEach((mesh) => {

				mesh.visible = true;
			});

			scene_wall_segments.children.forEach((mesh) => {

				mesh.visible = true;
			});

			plan_camera.rotation.set(-Math.PI * 0.5, 0, 0);
			plan_camera.position.set(0, 0, 0);
			plan_camera.translateZ(1);

			whole.mesh.material = whole.material;

			whole.mesh.quaternion.copy(whole.quaternion);
			whole.mesh.position.copy(whole.position);
			whole.mesh.updateMatrix();

			whole.segments.forEach((segment) => {

				segment.mesh.material = segment.material;

				segment.mesh.quaternion.copy(whole.quaternion);
				segment.mesh.position.copy(whole.position);
				segment.mesh.updateMatrix();

				// segment.mesh.geometry.computeBoundingSphere();
			});

			document.body.contains(selection_area_div) &&

				document.body.removeChild(selection_area_div);

			modes.orbit_mode = 1;
		}
	}
});

apply_segment_BUTTON.addEventListener('click', () => {

	if (!tileable_mesh._.userData.parent.tileable) {

		const selection_area_meter_width = width * cast.PIXELS_TO_METERS;
		const selection_area_meter_height = height * cast.PIXELS_TO_METERS;
		const selection_area_meter_left = (left + (width * 0.5) - (window.innerWidth * 0.5)) * cast.PIXELS_TO_METERS;
		const selection_area_meter_top = (top + (height * 0.5) - (window.innerHeight * 0.5)) * cast.PIXELS_TO_METERS;



		const whole = tileable_mesh._.userData.parent;



		const segment_geometry = new THREE.PlaneBufferGeometry(selection_area_meter_width, selection_area_meter_height);



		const segment_polygons = { regions: [] };

		for (let i = 0; i < segment_geometry.index.array.length; i += 3) {

			const index1 = segment_geometry.index.array[i + 0] * 3;
			const index2 = segment_geometry.index.array[i + 1] * 3;
			const index3 = segment_geometry.index.array[i + 2] * 3;

			segment_polygons.regions.push(

				[
					[
						segment_geometry.attributes.position.array[index1 + 0] - selection_area_meter_left,
						segment_geometry.attributes.position.array[index1 + 1] - selection_area_meter_top,
					],

					[
						segment_geometry.attributes.position.array[index2 + 0] - selection_area_meter_left,
						segment_geometry.attributes.position.array[index2 + 1] - selection_area_meter_top,
					],

					[
						segment_geometry.attributes.position.array[index3 + 0] - selection_area_meter_left,
						segment_geometry.attributes.position.array[index3 + 1] - selection_area_meter_top,
					],
				],
			);

			// segment_polygons.inverted = true;
		}



		const whole_polygons = { regions: [] };

		for (let i = 0; i < whole.mesh.geometry.index.array.length; i += 3) {

			const index1 = whole.mesh.geometry.index.array[i + 0] * 3;
			const index2 = whole.mesh.geometry.index.array[i + 1] * 3;
			const index3 = whole.mesh.geometry.index.array[i + 2] * 3;

			whole_polygons.regions.push(

				[
					[
						whole.mesh.geometry.attributes.position.array[index1 + 0],
						whole.mesh.geometry.attributes.position.array[index1 + 1],
					],

					[
						whole.mesh.geometry.attributes.position.array[index2 + 0],
						whole.mesh.geometry.attributes.position.array[index2 + 1],
					],

					[
						whole.mesh.geometry.attributes.position.array[index3 + 0],
						whole.mesh.geometry.attributes.position.array[index3 + 1],
					],
				],
			);

			// whole_polygons.inverted = true;
		}



		if (whole.segments.length) {

			whole.segments.forEach((_segment) => {

				const _segment_polygons = { regions: [] };

				for (let i = 0; i < _segment.mesh.geometry.index.array.length; i += 3) {

					const index1 = _segment.mesh.geometry.index.array[i + 0] * 3;
					const index2 = _segment.mesh.geometry.index.array[i + 1] * 3;
					const index3 = _segment.mesh.geometry.index.array[i + 2] * 3;

					_segment_polygons.regions.push(

						[
							[
								_segment.mesh.geometry.attributes.position.array[index1 + 0],
								_segment.mesh.geometry.attributes.position.array[index1 + 1],
							],

							[
								_segment.mesh.geometry.attributes.position.array[index2 + 0],
								_segment.mesh.geometry.attributes.position.array[index2 + 1],
							],

							[
								_segment.mesh.geometry.attributes.position.array[index3 + 0],
								_segment.mesh.geometry.attributes.position.array[index3 + 1],
							],
						],
					);

					// whole_polygons.inverted = true;
				}



				const difference_polygons = polybooljs.differenceRev(segment_polygons, _segment_polygons);

				difference_polygons?.regions &&

					difference_polygons.regions.forEach((region) => {

						const segment =
							new Segment(

								null,
								whole.points ? 3 : 1,
								whole,
							);

						segment.mesh.material = segment.material2;

						whole.segments.push(segment);

						segment.setTile(whole.tile);

						segment.updateGeometry(region);
					});
			});
		}
		else {

			const difference_polygons = polybooljs.differenceRev(segment_polygons, whole_polygons);

			difference_polygons?.regions &&

				difference_polygons.regions.forEach((region) => {

					const segment =
						new Segment(

							null,
							whole.points ? 3 : 1,
							whole,
						);

					segment.mesh.material = segment.material2;

					whole.segments.push(segment);

					segment.setTile(whole.tile);

					segment.updateGeometry(region);
				});
		}



		const intersection_polygons = polybooljs.intersect(segment_polygons, whole_polygons);

		intersection_polygons?.regions &&

			intersection_polygons.regions.forEach((region) => {

				const segment =
					new Segment(

						null,
						whole.points ? 3 : 1,
						whole,
					);

				segment.mesh.material = segment.material2;

				whole.segments.push(segment);

				segment.setTile(whole.tile);

				segment.updateGeometry(region);
			});



		scene_walls.remove(whole.mesh);
	}

	apply_segment_BUTTON.style.display = 'none';
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
