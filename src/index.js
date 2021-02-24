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
	scene1,
	scene2,
	scene3,
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

			const spot_light = new THREE.SpotLight(0xFFFFFF);
			spot_light.intensity = 10;
			spot_light.distance = 0;
			spot_light.penumbra = 1;
			spot_light.decay = 2;
			spot_light.angle = Math.PI * 0.5;
			spot_light.position.set(...spot_light_position);
			scene1.add(spot_light);

			spot_light.target.position.set(...spot_light_position);
			spot_light.target.position.y = 0;
			scene1.add(spot_light.target);

			const spot_light2 = spot_light.clone();
			scene2.add(spot_light2);

			spot_light2.target.position.set(...spot_light_position);
			spot_light2.target.position.y = 0;
			scene2.add(spot_light2.target);

			// spot_lights.push(spot_light);

			// const spot_light_helper = new THREE.SpotLightHelper(spot_light);
			// helpers.push(spot_light_helper);
			// scene1.add(spot_light_helper);
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



const animate = () => {

	requestAnimationFrame(animate);

	// helpers.forEach((helper) => helper.update());

	renderer.clearColor();

	if (modes.orbit_mode) {

		orbit_controls.update();

		gl.disable(gl.DEPTH_TEST);

		renderer.render(scene1, orbit_camera);
		renderer.render(scene2, orbit_camera);

		gl.enable(gl.DEPTH_TEST);

		renderer.render(scene3, orbit_camera);

		// scene1.children.forEach((child) => {

		// 	renderer.render(child, orbit_camera);
		// });
	}
	else {

		renderer.render(scene1, plan_camera);
	}
};

animate();
