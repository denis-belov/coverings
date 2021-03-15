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
	scene,
	tileable_mesh,
	transform_controls,
} from './three';



const testPointInsideTriangle = (point, triangle_points) => {

	const [ [ tp1, tp2, tp3 ] ] = triangle_points;

	const A = 1/2 * (-tp2[1] * tp3[0] + tp1[1] * (-tp2[0] + tp3[0]) + tp1[0] * (tp2[1] - tp3[1]) + tp2[0] * tp3[1]);

	const sign = A < 0 ? -1 : 1;

	const s = (tp1[1] * tp3[0] - tp1[0] * tp3[1] + (tp3[1] - tp1[1]) * point[0] + (tp1[0] - tp3[0]) * point[1]) * sign;

	const t = (tp1[0] * tp2[1] - tp1[1] * tp2[0] + (tp1[1] - tp2[1]) * point[0] + (tp2[0] - tp1[0]) * point[1]) * sign;

	return s > 0 && t > 0 && (s + t) < 2 * A * sign;
};



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

	const whole =
		tileable_mesh._.userData.parent.tileable ||
		tileable_mesh._.userData.parent;

	modes.selection_mode = 1 - modes.selection_mode;

	if (modes.selection_mode) {

		mode_selection_BUTTON.classList.add('-pressed');

		mode_selection_BUTTON.innerHTML = 'Selection mode';

		selection_NODE.classList.remove('-hidden');

		scene.children.forEach((mesh) => {

			mesh.visible = (

				mesh === whole.mesh ||

				whole.segments.includes(mesh.userData.parent)
			);
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

		scene.children.forEach((mesh) => {

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



	// transform controls appears in the scene by itself, mb some bug or may be solved ?
	transform_controls.detach();
});

// elaborate fast calculation for the case when a whole is being entirely inside a selected segment
apply_segment_BUTTON.addEventListener('click', () => {

	// if (!tileable_mesh._.userData.parent.tileable) {

	const selection_area_meter_width = width * cast.PIXELS_TO_METERS;
	const selection_area_meter_height = height * cast.PIXELS_TO_METERS;
	const selection_area_meter_left = (left + (width * 0.5) - (window.innerWidth * 0.5)) * cast.PIXELS_TO_METERS;
	const selection_area_meter_top = (top + (height * 0.5) - (window.innerHeight * 0.5)) * cast.PIXELS_TO_METERS;



	const whole =
		tileable_mesh._.userData.parent.tileable ?
			tileable_mesh._.userData.parent.tileable :
			tileable_mesh._.userData.parent;



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
	}



	const object_polygons = segment_polygons;



	if (whole.segments.length) {

		const segments = whole.segments.slice();



		const ppp3 = [];

		segments.forEach((_segment) => {

			const subject_polygons = _segment.getPolybooljsTriangles();



			// rename
			const ppp = [];
			const ppp2 = [];



			let object_not_entirely_inside_any_subject_triangle = false;



			for (let k = 0; k < subject_polygons.length; ++k) {

				// object part left after intersection
				const intersection_polygons = polybooljs.intersect(subject_polygons[k], object_polygons);

				intersection_polygons?.regions &&

					ppp2.push(...intersection_polygons.regions);



				// object entirely inside subject
				if (

					!object_not_entirely_inside_any_subject_triangle &&

					object_polygons.regions.filter(

						(region) =>
							region.filter(

								(point) => testPointInsideTriangle(point, subject_polygons[k].regions),
							).length === region.length,
					).length === object_polygons.regions.length
				) {

					// rename
					let xx = 0;
					let yy = 0;
					let ii = 0;

					object_polygons.regions.forEach(

						(region) =>
							region.forEach((coordinate) => {

								xx += coordinate[0];
								yy += coordinate[1];

								++ii;
							}),
					);

					xx /= ii;
					yy /= ii;

					object_polygons.regions.forEach(

						(region) =>
							region.forEach((coordinate) => {

								coordinate[0] -= xx;
								coordinate[0] *= 1000;
							}),
					);

					const difference_polygons1 = polybooljs.difference(subject_polygons[k], object_polygons);

					object_polygons.regions.forEach(

						(region) =>
							region.forEach((coordinate) => {

								coordinate[0] /= 1000;
								coordinate[0] += xx;

								coordinate[1] -= yy;
								coordinate[1] *= 1000;
							}),
					);

					const difference_polygons2 = polybooljs.difference(subject_polygons[k], object_polygons);

					object_polygons.regions.forEach(

						(region) =>
							region.forEach((coordinate) => {

								coordinate[1] /= 1000;
								coordinate[1] += yy;
							}),
					);



					const difference_polygons3 = polybooljs.intersect(difference_polygons1, difference_polygons2);

					ppp.push(...difference_polygons3.regions);

					const difference_polygons4 = polybooljs.xor(difference_polygons1, difference_polygons2);

					ppp.push(...difference_polygons4.regions);



					for (let j = 0; j < subject_polygons.length; ++j) {

						j !== k &&

							ppp.push(subject_polygons[j].regions[0]);
					}



					break;
				}
				// object partially inside subject
				else if (

					object_polygons.regions.filter(

						(region) =>
							region.filter(

								(point) => testPointInsideTriangle(point, subject_polygons[k].regions),
							).length > 0,
					).length > 0
				) {

					object_not_entirely_inside_any_subject_triangle = true;

					const difference_polygons = polybooljs.difference(subject_polygons[k], object_polygons);

					difference_polygons.regions.forEach((region) => ppp.push(region));
				}
				// object entirely outside subject triangle
				else {

					const difference_polygons = polybooljs.difference(subject_polygons[k], object_polygons);

					difference_polygons.regions.forEach((region) => ppp.push(region));
				}
			}



			if (ppp2.length > 0) {

				const segment =
					new Segment(

						null,
						whole,
					);

				segment.mesh.material = segment.material2;

				whole.segments.push(segment);

				segment.setTile(whole.tile);

				segment.updateGeometry(ppp);



				ppp3.push(...ppp2);



				whole.segments.splice(whole.segments.indexOf(_segment), 1);

				scene.remove(_segment.mesh);
			}
		});

		if (ppp3.length > 0) {

			const segment =
				new Segment(

					null,
					whole,
				);

			segment.mesh.material = segment.material2;

			whole.segments.push(segment);

			segment.setTile(whole.tile);

			segment.updateGeometry(ppp3);
		}
	}
	else {

		const subject_polygons = whole.getPolybooljsTriangles();



		// rename
		const ppp = [];
		const ppp2 = [];



		let object_not_entirely_inside_any_subject_triangle = false;



		for (let k = 0; k < subject_polygons.length; ++k) {

			// object part left after intersection
			const intersection_polygons = polybooljs.intersect(subject_polygons[k], object_polygons);

			intersection_polygons?.regions &&

				ppp2.push(...intersection_polygons.regions);



			// object entirely inside subject
			if (

				!object_not_entirely_inside_any_subject_triangle &&

				object_polygons.regions.filter(

					(region) =>
						region.filter(

							(point) => testPointInsideTriangle(point, subject_polygons[k].regions),
						).length === region.length,
				).length === object_polygons.regions.length
			) {

				// rename
				let xx = 0;
				let yy = 0;
				let ii = 0;

				object_polygons.regions.forEach(

					(region) =>
						region.forEach((coordinate) => {

							xx += coordinate[0];
							yy += coordinate[1];

							++ii;
						}),
				);

				xx /= ii;
				yy /= ii;

				object_polygons.regions.forEach(

					(region) =>
						region.forEach((coordinate) => {

							coordinate[0] -= xx;
							coordinate[0] *= 1000;
						}),
				);

				const difference_polygons1 = polybooljs.difference(subject_polygons[k], object_polygons);

				object_polygons.regions.forEach(

					(region) =>
						region.forEach((coordinate) => {

							coordinate[0] /= 1000;
							coordinate[0] += xx;

							coordinate[1] -= yy;
							coordinate[1] *= 1000;
						}),
				);

				const difference_polygons2 = polybooljs.difference(subject_polygons[k], object_polygons);

				object_polygons.regions.forEach(

					(region) =>
						region.forEach((coordinate) => {

							coordinate[1] /= 1000;
							coordinate[1] += yy;
						}),
				);



				const difference_polygons3 = polybooljs.intersect(difference_polygons1, difference_polygons2);

				// difference_polygons3.regions.forEach((region) => ppp.push(region));
				ppp.push(...difference_polygons3.regions);

				const difference_polygons4 = polybooljs.xor(difference_polygons1, difference_polygons2);

				// difference_polygons4.regions.forEach((region) => ppp.push(region));
				ppp.push(...difference_polygons4.regions);



				for (let j = 0; j < subject_polygons.length; ++j) {

					j !== k &&

						ppp.push(subject_polygons[j].regions[0]);
				}



				break;
			}
			// object partially inside subject
			else if (

				object_polygons.regions.filter(

					(region) =>
						region.filter(

							(point) => testPointInsideTriangle(point, subject_polygons[k].regions),
						).length > 0,
				).length > 0
			) {

				object_not_entirely_inside_any_subject_triangle = true;

				const difference_polygons = polybooljs.difference(subject_polygons[k], object_polygons);

				difference_polygons.regions.forEach((region) => ppp.push(region));
			}
			// object entirely outside subject triangle
			else {

				const difference_polygons = polybooljs.difference(subject_polygons[k], object_polygons);

				difference_polygons.regions.forEach((region) => ppp.push(region));
			}
		}



		if (ppp2.length > 0) {

			// LOG(ppp2)

			const segment =
				new Segment(

					null,
					whole,
				);

			segment.mesh.material = segment.material2;

			whole.segments.push(segment);

			segment.setTile(whole.tile);

			segment.updateGeometry(ppp);



			const segment2 =
				new Segment(

					null,
					whole,
				);

			segment2.mesh.material = segment2.material2;

			whole.segments.push(segment2);

			segment2.setTile(whole.tile);

			segment2.updateGeometry(ppp2);



			scene.remove(whole.mesh);
		}
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
