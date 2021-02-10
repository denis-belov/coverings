// make number consts
// make plan scale



/*
eslint-disable

no-magic-numbers,
*/



import './index.scss';
import '@babel/polyfill';

import Loader from 'external-data-loader';

import modes from './modes';

import Point from './point';
import Room from './room';

import {

	// coverings_plan_NODE,
	// upload_model_BUTTON,
	// add_wall_mode_BUTTON,
	// mode_toggle_BUTTON,
	// upload_model_INPUT,
	// floor_tile_SELECT,
	material_BUTTONS,
	// canvas,
} from './dom';

import {

	renderer,
	scene,
	// floor_scene,
	plan_camera,
	orbit_camera,
	orbit_controls,
	tilable_mesh,
} from './three';

import './events';



const room = new Room();



room.makeContour(

	3,

	[
		new Point(-3, -3),

		new Point(-3, 3),

		new Point(3, 3),

		new Point(4.5, -1.5),

		new Point(3, -3),

		// new Point(1.5, -4.5),
	],
);



const loader = new Loader();



// let wall_index = 0;

material_BUTTONS.forEach((BUTTON) => {

	BUTTON.addEventListener('click', async () => {

		// console.log(tilable_mesh._);

		if (tilable_mesh._) {

			// console.log(evt);

			const info = await fetch(

				BUTTON.innerHTML,

				{
					method: 'get',
				},
			)
				.then((response) => response.json());

			if (info.textures) {

				const sources = {};

				for (const texture in info.textures) {

					sources[texture] = { source: info.textures[texture], type: 'image' };
				}

				await loader.load({

					sources,

					// progress: () => 0,
				});
			}

			// console.log(loader);

			tilable_mesh._.userData.parent.setTile(info.sizes, loader.content);

			// room.walls[wall_index++];

			loader.content = {};
		}
	});
});



(async () => {

	const info = await fetch(

		'/textures/1/info.json',

		{
			method: 'get',
		},
	)
		.then((response) => response.json());

	if (info.textures) {

		const sources = {};

		for (const texture in info.textures) {

			sources[texture] = { source: info.textures[texture], type: 'image' };
		}

		await loader.load({

			sources,

			// progress: () => 0,
		});
	}

	room.floor.setTile(info.sizes, loader.content);

	room.walls.forEach((wall) => wall.setTile(info.sizes, loader.content));

	loader.content = {};
})();



const animate = () => {

	requestAnimationFrame(animate);

	if (modes.orbit_mode) {

		orbit_controls.update();

		renderer.render(scene, orbit_camera);
	}
	else {

		renderer.render(scene, plan_camera);
	}
};

animate();
