// make plan scale



import * as THREE from 'three';
import './index.scss';
import '@babel/polyfill';

import Loader from 'external-data-loader';

import modes from './modes';

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
	scene,
	plan_camera,
	orbit_camera,
	orbit_controls,
	tileable_mesh,
} from './three';

import './events';



const loader = new Loader();



const room = new Room();



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

			tileable_mesh._.userData.parent.updateGeometry(tileable_mesh._.userData.parent.regions);
		}
	});
});



apply_sizes_BUTTON.addEventListener('click', () => {

	const width = parseFloat(width_INPUT.value);
	const length = parseFloat(length_INPUT.value);
	const height = parseFloat(height_INPUT.value);



	room.makeContour(

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
});



window.addEventListener('keypress', (evt) => {

	if (evt.code === 'KeyD' && Point.selected) {

		const new_points = room.points.slice();

		new_points.splice(new_points.indexOf(Point.selected), 1);

		room.makeContour(room.height, new_points);
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
