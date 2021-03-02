// make plan scale



import * as THREE from 'three';
import './index.scss';
import '@babel/polyfill';

import Loader from 'external-data-loader';

import modes from './modes';
// import cast from './cast';

import Point from './point';
import Room from './room';

import {

	material_BUTTONS,
	mode_toggle_BUTTON,
	coverings_plan_NODE,
	modal,
	width_INPUT,
	length_INPUT,
	height_INPUT,
	apply_sizes_BUTTON,
} from './dom';

import {

	renderer,
	scene_floor,
	scene_floor_segments,
	scene_walls,
	scene_wall_segments,
	scene_draggable,
	plan_camera,
	orbit_camera,
	orbit_controls,
	tileable_mesh,
} from './three';

import './events';



const loader = new Loader();



const room = new Room();



// room.makeContour(

// 	3,

// 	[
// 		new Point(-3, -3),

// 		new Point(-3, 3),

// 		new Point(3, 3),

// 		new Point(4.5, -1.5),

// 		new Point(3, -3),
// 	],
// );



room.makeContour(

	2.5,

	[
		new Point(-4 / 2, -2.5 / 2),

		new Point(-4 / 2, 2.5 / 2),

		new Point(4 / 2, 2.5 / 2),

		new Point(4 / 2, -2.5 / 2),
	],
);




mode_toggle_BUTTON.addEventListener('click', () => {

	modes.orbit_mode = 1 - modes.orbit_mode;

	if (modes.orbit_mode) {

		mode_toggle_BUTTON.innerHTML = 'Orbit mode';

		mode_toggle_BUTTON.classList.add('-pressed');

		coverings_plan_NODE.classList.add('-hidden');

		room.walls.forEach((wall) => {

			wall.tile ||

				wall.setTile(room.wall_tile_default);

			// if (!wall.tile) {

			// 	wall.setTile(room.wall_tile_default);
			// }

			wall.updateGeometry();
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

			tileable_mesh._.userData.parent.updateGeometry();
		}
	});
});



// const helpers = [];

apply_sizes_BUTTON.addEventListener('click', () => {

	const width = parseFloat(width_INPUT.value);
	const length = parseFloat(length_INPUT.value);
	const height = parseFloat(height_INPUT.value);

	[
		[ 1.5, height, 1.5 ],
		[ 1.5, height, -1.5 ],
		[ -1.5, height, -1.5 ],
		[ -1.5, height, 1.5 ],
	]
		.forEach((spot_light_position) => {

			const spot_light_floor = new THREE.SpotLight(0xFFFFFF);
			spot_light_floor.intensity = 10;
			spot_light_floor.distance = 0;
			spot_light_floor.penumbra = 1;
			spot_light_floor.decay = 2;
			spot_light_floor.angle = Math.PI * 0.5;
			spot_light_floor.position.set(...spot_light_position);

			spot_light_floor.target.position.y = 0;
			spot_light_floor.target.position.set(...spot_light_position);

			const spot_light_floor_segments = spot_light_floor.clone();
			const spot_light_walls = spot_light_floor.clone();
			const spot_light_wall_segments = spot_light_floor.clone();
			const spot_light_draggable = spot_light_floor.clone();

			scene_floor.add(spot_light_floor);
			scene_floor.add(spot_light_floor.target);

			scene_floor_segments.add(spot_light_floor_segments);
			scene_floor_segments.add(spot_light_floor_segments.target);

			scene_walls.add(spot_light_walls);
			scene_walls.add(spot_light_walls.target);

			scene_wall_segments.add(spot_light_wall_segments);
			scene_wall_segments.add(spot_light_wall_segments.target);

			scene_draggable.add(spot_light_draggable);
			scene_draggable.add(spot_light_draggable.target);

			// const spot_light_helper = new THREE.SpotLightHelper(spot_light);
			// helpers.push(spot_light_helper);
			// scene_floor.add(spot_light_helper);
		});


	room.makeContour(

		height,

		[
			new Point(-length / 2, -width / 2),

			new Point(-length / 2, width / 2),

			new Point(length / 2, width / 2),

			new Point(length / 2, -width / 2),
		],
	);

	modal.style.display = 'none';
});



window.addEventListener('keypress', (evt) => {

	// console.log(Point.selected);

	if (evt.code === 'KeyD' && Point.selected) {

		const new_points = room.points.slice();

		new_points.splice(new_points.indexOf(Point.selected), 1);

		room.makeContour(room.height, new_points);
	}
});



// const selection_area_div = document.createElement('div');

// selection_area_div.className = 'selection_area';

// let x = 0;
// let y = 0;

// const test = (evt) => {

// 	Object.assign(

// 		selection_area_div.style,

// 		{
// 			left: evt.clientX < x ? evt.clientX : x,
// 			top: evt.clientY < y ? evt.clientY : y,
// 			width: Math.abs(evt.clientX - x),
// 			height: Math.abs(evt.clientY - y),
// 		},
// 	);

// 	selection_area_div.setAttribute(

// 		'data-value',

// 		`${ Math.abs((evt.clientX - x) * cast.PIXELS_TO_METERS).toFixed(2) }m
// 		${ Math.abs((evt.clientY - y) * cast.PIXELS_TO_METERS).toFixed(2) }m`,
// 	);
// };

// window.addEventListener('mousedown', (evt) => {

// 	if (modes.selection_mode) {

// 		evt.stopPropagation();

// 		x = evt.clientX;
// 		y = evt.clientY;

// 		Object.assign(

// 			selection_area_div.style,

// 			{
// 				width: 0,
// 				height: 0,
// 				left: x,
// 				top: y,
// 			},
// 		);

// 		document.body.appendChild(selection_area_div);

// 		window.addEventListener('mousemove', test);
// 	}
// });

// window.addEventListener('mouseup', () => {

// 	window.removeEventListener('mousemove', test);

// 	document.body.contains(selection_area_div) &&

// 		document.body.removeChild(selection_area_div);
// });



const gl = renderer.getContext();



const background_material = new THREE.MeshBasicMaterial({

	color: 'grey',
	side: THREE.BackSide,
	transparent: true,
	opacity: 0,
});



const raycaster = new THREE.Raycaster();



window.addEventListener('keypress', (evt) => {

	if (evt.code === 'KeyG') {

		room.walls.forEach((wall, index) => {

			const position_projection =
				new THREE.Vector3()
					.copy(wall.mesh.position)
					.project(orbit_camera);

			const indicator = wall.indicator || document.createElement('div');

			Object.assign(

				indicator.style,

				{
					position: 'absolute',
					width: 20,
					height: 20,
					marginLeft: -10,
					marginTop: -10,
					backgroundColor: 'black',
					color: 'white',
					left: ((position_projection.x * 0.5) + 0.5) * window.innerWidth,
					top: window.innerHeight - (((position_projection.y * 0.5) + 0.5) * window.innerHeight),
				},
			);

			indicator.innerHTML = `${ index },${ wall.mesh.renderOrder },,${ wall.test }\n${ wall.test2 }`;

			wall.indicator = indicator;

			document.body.appendChild(indicator);
		});
	}
});



const plane = new THREE.Plane();

window.addEventListener('keypress', (evt) => {

	if (evt.code === 'KeyG') {

		const helper = new THREE.PlaneHelper(plane);
		scene_walls.add(helper);
	}
});



const animate = () => {

	requestAnimationFrame(animate);

	// helpers.forEach((helper) => helper.update());

	renderer.clear();

	if (modes.orbit_mode) {

		orbit_controls.update();



		gl.disable(gl.DEPTH_TEST);

		renderer.render(scene_floor, orbit_camera);
		renderer.render(scene_floor_segments, orbit_camera);

		// room.walls.forEach((wall) => (wall.mesh.renderOrder = 0));

		orbit_camera.updateMatrixWorld();

		room.walls.forEach((wall) => {

			wall.mesh.updateMatrixWorld();

			wall.mesh.renderOrder = 0;
			wall.test = [];
			wall.test2 = [];

			const a =
				new THREE.Vector3(

					wall.mesh.geometry.attributes.position.array[0],
					wall.mesh.geometry.attributes.position.array[1],
					wall.mesh.geometry.attributes.position.array[2],
				)
					// .applyMatrix4(wall.mesh.matrixWorld);
					.applyQuaternion(wall.quaternion)
					.add(wall.position);

			const b =
				new THREE.Vector3(

					wall.mesh.geometry.attributes.position.array[3],
					wall.mesh.geometry.attributes.position.array[4],
					wall.mesh.geometry.attributes.position.array[5],
				)
			// .applyMatrix4(wall.mesh.matrixWorld);
			.applyQuaternion(wall.quaternion)
			.add(wall.position);

			const c =
				new THREE.Vector3(

					wall.mesh.geometry.attributes.position.array[6],
					wall.mesh.geometry.attributes.position.array[7],
					wall.mesh.geometry.attributes.position.array[8],
				)
			// .applyMatrix4(wall.mesh.matrixWorld);
			.applyQuaternion(wall.quaternion)
			.add(wall.position);

			const d =
				new THREE.Vector3(

					wall.mesh.geometry.attributes.position.array[9],
					wall.mesh.geometry.attributes.position.array[10],
					wall.mesh.geometry.attributes.position.array[11],
				)
			// .applyMatrix4(wall.mesh.matrixWorld);
			.applyQuaternion(wall.quaternion)
			.add(wall.position);



			const line_a = new THREE.Line3(orbit_camera.position, a);
			const line_b = new THREE.Line3(orbit_camera.position, b);
			const line_c = new THREE.Line3(orbit_camera.position, c);
			const line_d = new THREE.Line3(orbit_camera.position, d);

			room.walls.forEach((_wall, _index) => {

				if (_wall !== wall) {

					// const a =
					// 	new THREE.Vector3(

					// 		_wall.mesh.geometry.attributes.position.array[0],
					// 		_wall.mesh.geometry.attributes.position.array[1],
					// 		_wall.mesh.geometry.attributes.position.array[2],
					// 	)
					// 		.applyQuaternion(_wall.quaternion)
					// 		.add(_wall.position);

					// const b =
					// 	new THREE.Vector3(

					// 		_wall.mesh.geometry.attributes.position.array[3],
					// 		_wall.mesh.geometry.attributes.position.array[4],
					// 		_wall.mesh.geometry.attributes.position.array[5],
					// 	)
					// 		.applyQuaternion(_wall.quaternion)
					// 		.add(_wall.position);

					// const c =
					// 	new THREE.Vector3(

					// 		_wall.mesh.geometry.attributes.position.array[6],
					// 		_wall.mesh.geometry.attributes.position.array[7],
					// 		_wall.mesh.geometry.attributes.position.array[8],
					// 	)
					// 		.applyQuaternion(_wall.quaternion)
					// 		.add(_wall.position);

					// const d =
					// 	new THREE.Vector3(

					// 		_wall.mesh.geometry.attributes.position.array[9],
					// 		_wall.mesh.geometry.attributes.position.array[10],
					// 		_wall.mesh.geometry.attributes.position.array[11],
					// 	)
					// 		.applyQuaternion(_wall.quaternion)
					// 		.add(_wall.position);



					// raycaster
					// 	.set(orbit_camera.position, new THREE.Vector3().copy(a).sub(orbit_camera.position).normalize());

					// const [ da ] = raycaster
					// 	.intersectObject(_wall.mesh);

					// raycaster
					// 	.set(orbit_camera.position, new THREE.Vector3().copy(b).sub(orbit_camera.position).normalize());

					// const [ db ] = raycaster
					// 	.intersectObject(_wall.mesh);

					// raycaster
					// 	.set(orbit_camera.position, new THREE.Vector3().copy(c).sub(orbit_camera.position).normalize());

					// const [ dc ] = raycaster
					// 	.intersectObject(_wall.mesh);

					// raycaster
					// 	.set(orbit_camera.position, new THREE.Vector3().copy(d).sub(orbit_camera.position).normalize());

					// const [ dd ] = raycaster
					// 	.intersectObject(_wall.mesh);



					// orbit_camera.updateMatrixWorld();



					plane
						.setFromNormalAndCoplanarPoint(

							new THREE.Vector3(

								_wall.mesh.geometry.attributes.normal.array[0],
								_wall.mesh.geometry.attributes.normal.array[1],
								_wall.mesh.geometry.attributes.normal.array[2],
							)
								.applyQuaternion(_wall.quaternion),

							_wall.position,
						);
					// LOG(plane.constant)
					// helper.updateMatrixWorld();

					const intersection_a = new THREE.Vector3();
					const intersection_b = new THREE.Vector3();
					const intersection_c = new THREE.Vector3();
					const intersection_d = new THREE.Vector3();

					plane.intersectLine(line_a, intersection_a);
					plane.intersectLine(line_b, intersection_b);
					plane.intersectLine(line_c, intersection_c);
					plane.intersectLine(line_d, intersection_d);

					// const camera_direction = new THREE.Vector3();

					// orbit_camera.getWorldDirection(camera_direction);


					// LOG(Math.abs(orbit_camera.position.distanceTo(intersection_a) - orbit_camera.position.distanceTo(a)))



					if (

						// orbit_camera.position.distanceTo(_wall.position) > orbit_camera.position.distanceTo(wall.position) &&

						(
							orbit_camera.position.distanceTo(intersection_a) > orbit_camera.position.distanceTo(a) &&
							new THREE.Vector3().copy(a).sub(orbit_camera.position).dot(new THREE.Vector3().copy(a).sub(intersection_a)) < 0 &&
							Math.abs(orbit_camera.position.distanceTo(intersection_a) - orbit_camera.position.distanceTo(a)) > 0.1
						) ||

						(
							orbit_camera.position.distanceTo(intersection_b) > orbit_camera.position.distanceTo(b) &&
							new THREE.Vector3().copy(b).sub(orbit_camera.position).dot(new THREE.Vector3().copy(b).sub(intersection_b)) < 0 &&
							Math.abs(orbit_camera.position.distanceTo(intersection_b) - orbit_camera.position.distanceTo(b)) > 0.1
						) ||

						(
							orbit_camera.position.distanceTo(intersection_c) > orbit_camera.position.distanceTo(c) &&
							new THREE.Vector3().copy(c).sub(orbit_camera.position).dot(new THREE.Vector3().copy(c).sub(intersection_c)) < 0 &&
							Math.abs(orbit_camera.position.distanceTo(intersection_c) - orbit_camera.position.distanceTo(c)) > 0.1
						) ||

						(
							orbit_camera.position.distanceTo(intersection_d) > orbit_camera.position.distanceTo(d) &&
							new THREE.Vector3().copy(d).sub(orbit_camera.position).dot(new THREE.Vector3().copy(d).sub(intersection_d)) < 0 &&
							Math.abs(orbit_camera.position.distanceTo(intersection_d) - orbit_camera.position.distanceTo(d)) > 0.1
						)

						// (da && da.distance < orbit_camera.position.distanceTo(a)) ||
						// (db && db.distance < orbit_camera.position.distanceTo(b)) ||
						// (dc && dc.distance < orbit_camera.position.distanceTo(c)) ||
						// (dd && dd.distance < orbit_camera.position.distanceTo(d))
					) {

						wall.test.push(_index);

						wall.test2.push(

							[ intersection_a.x.toFixed(2), intersection_a.y.toFixed(2), intersection_a.z.toFixed(2) ],
							[ intersection_b.x.toFixed(2), intersection_b.y.toFixed(2), intersection_b.z.toFixed(2) ],
							[ intersection_c.x.toFixed(2), intersection_c.y.toFixed(2), intersection_c.z.toFixed(2) ],
							[ intersection_d.x.toFixed(2), intersection_d.y.toFixed(2), intersection_d.z.toFixed(2) ],
						);

						++wall.mesh.renderOrder;
						// --_wall.mesh.renderOrder;
					}
					// else {

					// 	--_wall.mesh.renderOrder;
					// }
				}
			});
		});

		renderer.render(scene_walls, orbit_camera);
		renderer.render(scene_wall_segments, orbit_camera);



		gl.enable(gl.DEPTH_TEST);

		scene_floor.overrideMaterial = background_material;

		renderer.render(scene_floor, orbit_camera);

		scene_floor.overrideMaterial = null;

		scene_walls.overrideMaterial = background_material;

		renderer.render(scene_walls, orbit_camera);

		scene_walls.overrideMaterial = null;

		renderer.render(scene_draggable, orbit_camera);

		// gl.disable(gl.BLEND);
		// gl.enable(gl.DEPTH_TEST);

		// renderer.render(scene_draggable, orbit_camera);

		// scene_floor.children.forEach((child) => {

		// 	renderer.render(child, orbit_camera);
		// });
	}
	else {

		gl.disable(gl.DEPTH_TEST);

		renderer.render(scene_floor, plan_camera);
		renderer.render(scene_floor_segments, plan_camera);
		renderer.render(scene_walls, plan_camera);
		renderer.render(scene_wall_segments, plan_camera);

		// gl.enable(gl.DEPTH_TEST);
	}
};

// LOG(scene_floor.children.filter((_object) => _object))
// LOG(scene_floor.children.indexOf(scene_floor.children.filter((_object) => _object.userData?.parent?.type === 'wall')[0]));

animate();
