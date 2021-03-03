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
	renderer2,
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



// const raycaster = new THREE.Raycaster();



// window.addEventListener('keypress', (evt) => {

// 	if (evt.code === 'KeyG') {

// 		room.walls.forEach((wall, index) => {

// 			// LOG(

// 			// 	new THREE.Vector3(

// 			// 		wall.mesh.geometry.attributes.position.array[0],
// 			// 		wall.mesh.geometry.attributes.position.array[1],
// 			// 		wall.mesh.geometry.attributes.position.array[2],
// 			// 	)
// 			// 		.applyQuaternion(wall.quaternion)
// 			// 		.add(wall.position)
// 			// 		.project(orbit_camera),

// 			// 	new THREE.Vector3(

// 			// 		wall.mesh.geometry.attributes.position.array[3],
// 			// 		wall.mesh.geometry.attributes.position.array[4],
// 			// 		wall.mesh.geometry.attributes.position.array[5],
// 			// 	)
// 			// 		.applyQuaternion(wall.quaternion)
// 			// 		.add(wall.position)
// 			// 		.project(orbit_camera),

// 			// 	new THREE.Vector3(

// 			// 		wall.mesh.geometry.attributes.position.array[6],
// 			// 		wall.mesh.geometry.attributes.position.array[7],
// 			// 		wall.mesh.geometry.attributes.position.array[8],
// 			// 	)
// 			// 		.applyQuaternion(wall.quaternion)
// 			// 		.add(wall.position)
// 			// 		.project(orbit_camera),

// 			// 	new THREE.Vector3(

// 			// 		wall.mesh.geometry.attributes.position.array[9],
// 			// 		wall.mesh.geometry.attributes.position.array[10],
// 			// 		wall.mesh.geometry.attributes.position.array[11],
// 			// 	)
// 			// 		.applyQuaternion(wall.quaternion)
// 			// 		.add(wall.position)
// 			// 		.project(orbit_camera),
// 			// );

// 			const position_projection =
// 				new THREE.Vector3()
// 					.copy(wall.mesh.position)
// 					.project(orbit_camera);

// 			const indicator = wall.indicator || document.createElement('div');

// 			Object.assign(

// 				indicator.style,

// 				{
// 					position: 'absolute',
// 					// width: 'min-content',
// 					width: 20,
// 					height: 20,
// 					marginLeft: -10,
// 					marginTop: -10,
// 					backgroundColor: 'black',
// 					color: 'white',
// 					left: ((position_projection.x * 0.5) + 0.5) * window.innerWidth,
// 					top: window.innerHeight - (((position_projection.y * 0.5) + 0.5) * window.innerHeight),
// 				},
// 			);

// 			// indicator.innerHTML = `${ index } - ${ wall.mesh.renderOrder } - ${ wall.test }\n${ wall.test2.join('\n') }`;
// 			indicator.innerHTML = `${ index } - ${ wall.mesh.renderOrder }`;

// 			wall.indicator = indicator;

// 			document.body.appendChild(indicator);
// 		});
// 	}
// });



// const plane = new THREE.Plane();



const animate = () => {

	requestAnimationFrame(animate);

	renderer.clear();
	renderer2.clear();

	if (modes.orbit_mode) {

		orbit_controls.update();



		// gl.disable(gl.DEPTH_TEST);

		// renderer.render(scene_floor, orbit_camera);
		// renderer.render(scene_floor_segments, orbit_camera);

		// room.walls.forEach((wall) => (wall.mesh.renderOrder = 0));

		// orbit_camera.updateMatrixWorld();

		// const test = [];

		// room.walls.forEach((wall) => {

		// 	const a =
		// 		new THREE.Vector3(

		// 			wall.mesh.geometry.attributes.position.array[0] * 0.99,
		// 			wall.mesh.geometry.attributes.position.array[1] * 0.99,
		// 			wall.mesh.geometry.attributes.position.array[2],
		// 		)
		// 			.applyQuaternion(wall.quaternion)
		// 			.add(wall.position)
		// 			.project(orbit_camera);

		// 	const b =
		// 		new THREE.Vector3(

		// 			wall.mesh.geometry.attributes.position.array[3] * 0.99,
		// 			wall.mesh.geometry.attributes.position.array[4] * 0.99,
		// 			wall.mesh.geometry.attributes.position.array[5],
		// 		)
		// 			.applyQuaternion(wall.quaternion)
		// 			.add(wall.position)
		// 			.project(orbit_camera);

		// 	const c =
		// 		new THREE.Vector3(

		// 			wall.mesh.geometry.attributes.position.array[6] * 0.99,
		// 			wall.mesh.geometry.attributes.position.array[7] * 0.99,
		// 			wall.mesh.geometry.attributes.position.array[8],
		// 		)
		// 			.applyQuaternion(wall.quaternion)
		// 			.add(wall.position)
		// 			.project(orbit_camera);

		// 	const d =
		// 		new THREE.Vector3(

		// 			wall.mesh.geometry.attributes.position.array[9] * 0.99,
		// 			wall.mesh.geometry.attributes.position.array[10] * 0.99,
		// 			wall.mesh.geometry.attributes.position.array[11],
		// 		)
		// 			.applyQuaternion(wall.quaternion)
		// 			.add(wall.position)
		// 			.project(orbit_camera);

		// 	// LOG(

		// 	// 	Math.min(

		// 	// 		Math.min(a.z, b.z),

		// 	// 		Math.min(c.z, d.z)
		// 	// 	),
		// 	// )

		// 	test.push(

		// 		{
		// 			wall,

		// 			depth: Math.min(

		// 				Math.min(a.z, b.z),

		// 				Math.min(c.z, d.z),
		// 			),
		// 		},
		// 	);
		// });

		// const test2 = test.sort((a, b) => (b.depth - a.depth));

		// test2.forEach((elm, index) => (elm.wall.mesh.renderOrder = index));

		// room.walls.forEach((wall) => {

		// 	wall.mesh.updateMatrixWorld();

		// 	// plane
		// 	// 	.setFromNormalAndCoplanarPoint(

		// 	// 		new THREE.Vector3(

		// 	// 			wall.mesh.geometry.attributes.normal.array[0],
		// 	// 			wall.mesh.geometry.attributes.normal.array[1],
		// 	// 			wall.mesh.geometry.attributes.normal.array[2],
		// 	// 		)
		// 	// 			.applyQuaternion(wall.quaternion),

		// 	// 		wall.position,
		// 	// 	);

		// 	const aa =
		// 		new THREE.Vector3(

		// 			wall.mesh.geometry.attributes.position.array[0],
		// 			wall.mesh.geometry.attributes.position.array[1],
		// 			wall.mesh.geometry.attributes.position.array[2],
		// 		)
		// 			.applyQuaternion(wall.quaternion)
		// 			.add(wall.position);

		// 	const bb =
		// 		new THREE.Vector3(

		// 			wall.mesh.geometry.attributes.position.array[3],
		// 			wall.mesh.geometry.attributes.position.array[4],
		// 			wall.mesh.geometry.attributes.position.array[5],
		// 		)
		// 			.applyQuaternion(wall.quaternion)
		// 			.add(wall.position);

		// 	const cc =
		// 		new THREE.Vector3(

		// 			wall.mesh.geometry.attributes.position.array[6],
		// 			wall.mesh.geometry.attributes.position.array[7],
		// 			wall.mesh.geometry.attributes.position.array[8],
		// 		)
		// 			.applyQuaternion(wall.quaternion)
		// 			.add(wall.position);

		// 	const dd =
		// 		new THREE.Vector3(

		// 			wall.mesh.geometry.attributes.position.array[9],
		// 			wall.mesh.geometry.attributes.position.array[10],
		// 			wall.mesh.geometry.attributes.position.array[11],
		// 		)
		// 			.applyQuaternion(wall.quaternion)
		// 			.add(wall.position);

		// 	let test = 0;

		// 	room.walls.forEach((_wall) => {

		// 		if (_wall !== wall) {

		// 			const a =
		// 				new THREE.Vector3(

		// 					_wall.mesh.geometry.attributes.position.array[0] * 0.99,
		// 					_wall.mesh.geometry.attributes.position.array[1] * 0.99,
		// 					_wall.mesh.geometry.attributes.position.array[2],
		// 				)
		// 					.applyQuaternion(_wall.quaternion)
		// 					.add(_wall.position);

		// 			const b =
		// 				new THREE.Vector3(

		// 					_wall.mesh.geometry.attributes.position.array[3] * 0.99,
		// 					_wall.mesh.geometry.attributes.position.array[4] * 0.99,
		// 					_wall.mesh.geometry.attributes.position.array[5],
		// 				)
		// 					.applyQuaternion(_wall.quaternion)
		// 					.add(_wall.position);

		// 			const c =
		// 				new THREE.Vector3(

		// 					_wall.mesh.geometry.attributes.position.array[6] * 0.99,
		// 					_wall.mesh.geometry.attributes.position.array[7] * 0.99,
		// 					_wall.mesh.geometry.attributes.position.array[8],
		// 				)
		// 					.applyQuaternion(_wall.quaternion)
		// 					.add(_wall.position);

		// 			const d =
		// 				new THREE.Vector3(

		// 					_wall.mesh.geometry.attributes.position.array[9] * 0.99,
		// 					_wall.mesh.geometry.attributes.position.array[10] * 0.99,
		// 					_wall.mesh.geometry.attributes.position.array[11],
		// 				)
		// 					.applyQuaternion(_wall.quaternion)
		// 					.add(_wall.position);

		// 			const ray_a = new THREE.Ray(a, a.clone().sub(orbit_camera.position).normalize());
		// 			const ray_b = new THREE.Ray(b, b.clone().sub(orbit_camera.position).normalize());
		// 			const ray_c = new THREE.Ray(c, c.clone().sub(orbit_camera.position).normalize());
		// 			const ray_d = new THREE.Ray(d, d.clone().sub(orbit_camera.position).normalize());

		// 			const intersection_a = new THREE.Vector3();
		// 			const intersection_b = new THREE.Vector3();
		// 			const intersection_c = new THREE.Vector3();
		// 			const intersection_d = new THREE.Vector3();

		// 			if (

		// 				// !ray_a.intersectPlane(plane, intersection_a) &&
		// 				// !ray_b.intersectPlane(plane, intersection_b) &&
		// 				// !ray_c.intersectPlane(plane, intersection_c) &&
		// 				// !ray_d.intersectPlane(plane, intersection_d)

		// 				!ray_a.intersectTriangle(aa, bb, cc, false, intersection_a) && !ray_a.intersectTriangle(cc, bb, dd, false, intersection_a) &&
		// 				!ray_b.intersectTriangle(aa, bb, cc, false, intersection_b) && !ray_b.intersectTriangle(cc, bb, dd, false, intersection_b) &&
		// 				!ray_c.intersectTriangle(aa, bb, cc, false, intersection_c) && !ray_c.intersectTriangle(cc, bb, dd, false, intersection_c) &&
		// 				!ray_d.intersectTriangle(aa, bb, cc, false, intersection_d) && !ray_d.intersectTriangle(cc, bb, dd, false, intersection_d)
		// 			) {

		// 				++test;
		// 				// wall.mesh.renderOrder;
		// 				// _wall.mesh.renerOrder = wall.mesh.renderOrder - 1;
		// 			}
		// 			// else {

		// 			// 	++wall.mesh.renderOrder;
		// 			// }
		// 		}
		// 	});

		// 	if (test === room.walls.length - 1) {

		// 		wall.mesh.renderOrder = test;
		// 	}
		// });

		// room.walls.forEach((wall) => (wall.mesh.renderOrder = 0));

		// orbit_camera.updateMatrixWorld();

		// room.walls.forEach((wall) => {

		// 	if (wall.mesh.renderOrder === 1110) {

		// 		wall.mesh.updateMatrixWorld();

		// 		plane
		// 			.setFromNormalAndCoplanarPoint(

		// 				new THREE.Vector3(

		// 					wall.mesh.geometry.attributes.normal.array[0],
		// 					wall.mesh.geometry.attributes.normal.array[1],
		// 					wall.mesh.geometry.attributes.normal.array[2],
		// 				)
		// 					.applyQuaternion(wall.quaternion),

		// 				wall.position,
		// 			);

		// 		room.walls.forEach((_wall) => {

		// 			if (_wall !== wall) {

		// 				const a =
		// 					new THREE.Vector3(

		// 						_wall.mesh.geometry.attributes.position.array[0] * 0.99,
		// 						_wall.mesh.geometry.attributes.position.array[1] * 0.99,
		// 						_wall.mesh.geometry.attributes.position.array[2],
		// 					)
		// 						.applyQuaternion(_wall.quaternion)
		// 						.add(_wall.position);

		// 				const b =
		// 					new THREE.Vector3(

		// 						_wall.mesh.geometry.attributes.position.array[3] * 0.99,
		// 						_wall.mesh.geometry.attributes.position.array[4] * 0.99,
		// 						_wall.mesh.geometry.attributes.position.array[5],
		// 					)
		// 						.applyQuaternion(_wall.quaternion)
		// 						.add(_wall.position);

		// 				const c =
		// 					new THREE.Vector3(

		// 						_wall.mesh.geometry.attributes.position.array[6] * 0.99,
		// 						_wall.mesh.geometry.attributes.position.array[7] * 0.99,
		// 						_wall.mesh.geometry.attributes.position.array[8],
		// 					)
		// 						.applyQuaternion(_wall.quaternion)
		// 						.add(_wall.position);

		// 				const d =
		// 					new THREE.Vector3(

		// 						_wall.mesh.geometry.attributes.position.array[9] * 0.99,
		// 						_wall.mesh.geometry.attributes.position.array[10] * 0.99,
		// 						_wall.mesh.geometry.attributes.position.array[11],
		// 					)
		// 						.applyQuaternion(_wall.quaternion)
		// 						.add(_wall.position);

		// 				const ray_a = new THREE.Ray(a, a.clone().sub(orbit_camera.position).normalize());
		// 				const ray_b = new THREE.Ray(b, b.clone().sub(orbit_camera.position).normalize());
		// 				const ray_c = new THREE.Ray(c, c.clone().sub(orbit_camera.position).normalize());
		// 				const ray_d = new THREE.Ray(d, d.clone().sub(orbit_camera.position).normalize());

		// 				const intersection_a = new THREE.Vector3();
		// 				const intersection_b = new THREE.Vector3();
		// 				const intersection_c = new THREE.Vector3();
		// 				const intersection_d = new THREE.Vector3();

		// 				if (

		// 					!ray_a.intersectPlane(plane, intersection_a) &&
		// 					!ray_b.intersectPlane(plane, intersection_b) &&
		// 					!ray_c.intersectPlane(plane, intersection_c) &&
		// 					!ray_d.intersectPlane(plane, intersection_d)
		// 				) {

		// 					++wall.mesh.renderOrder;
		// 				}
		// 			}
		// 		});
		// 	}
		// });

		// renderer.render(scene_walls, orbit_camera);
		// renderer.render(scene_wall_segments, orbit_camera);



		gl.enable(gl.DEPTH_TEST);



		// renderer.render(scene_floor, orbit_camera);
		// renderer.render(scene_walls, orbit_camera);



		// scene_floor.overrideMaterial = background_material;
		// scene_walls.overrideMaterial = background_material;

		// renderer.render(scene_floor, orbit_camera);
		// renderer.render(scene_walls, orbit_camera);

		// scene_floor.overrideMaterial = null;
		// scene_walls.overrideMaterial = null;

		// gl.disable(gl.DEPTH_TEST);

		// renderer.render(scene_floor, orbit_camera);
		// renderer2.render(scene_floor_segments, orbit_camera);

		renderer.render(scene_walls, orbit_camera);

		// scene_floor.overrideMaterial = background_material;
		scene_walls.overrideMaterial = background_material;

		// renderer2.render(scene_floor, orbit_camera);
		// room.walls.forEach((wall) => {

		// 	// wall.mesh.quaternion.multiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0)));
		// 	wall.mesh.rotateY(Math.PI);
		// 	wall.mesh.updateMatrix();
		// });
		renderer2.render(scene_walls, orbit_camera);
		// room.walls.forEach((wall) => {

		// 	wall.mesh.rotateY(-Math.PI);
		// 	wall.mesh.updateMatrix();
		// });

		// scene_floor.overrideMaterial = null;
		scene_walls.overrideMaterial = null;

		renderer2.render(scene_wall_segments, orbit_camera);

		// renderer.render(scene_draggable, orbit_camera);

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
