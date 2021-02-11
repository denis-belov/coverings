// make plan scale



import './index.scss';
import '@babel/polyfill';

import Loader from 'external-data-loader';

import modes from './modes';

import Point from './point';
import Room from './room';

import { material_BUTTONS } from './dom';

import {

	renderer,
	scene,
	plan_camera,
	orbit_camera,
	orbit_controls,
	tileable_mesh,
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
	],
);



const loader = new Loader();



material_BUTTONS.forEach((BUTTON) => {

	BUTTON.addEventListener('click', async () => {

		if (tileable_mesh._) {

			const info = await fetch(

				`${ __STATIC_PATH__ }/textures/${ BUTTON.innerHTML }/info.json`,

				{
					method: 'get',
				},
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

			tileable_mesh._.userData.parent.setTile(info.sizes, loader.content);

			loader.content = {};

			room.updateGeometries();
		}
	});
});



(async () => {

	const info_floor = await fetch(

		`${ __STATIC_PATH__ }/textures/3/info.json`,

		{
			method: 'get',
		},
	)
		.then((response) => response.json());

	if (info_floor.textures) {

		const sources = {};

		for (const texture in info_floor.textures) {

			sources[texture] = { source: `${ __STATIC_PATH__ }${ info_floor.textures[texture] }`, type: 'image' };
		}

		await loader.load({

			sources,

			// progress: () => 0,
		});
	}

	room.floor.setTile(info_floor.sizes, loader.content);

	loader.content = {};

	room.updateGeometries();

	const info_walls = await fetch(

		`${ __STATIC_PATH__ }/textures/4/info.json`,

		{
			method: 'get',
		},
	)
		.then((response) => response.json());

	if (info_walls.textures) {

		const sources = {};

		for (const texture in info_walls.textures) {

			sources[texture] = { source: `${ __STATIC_PATH__ }${ info_walls.textures[texture] }`, type: 'image' };
		}

		await loader.load({

			sources,

			// progress: () => 0,
		});
	}

	room.walls.forEach((wall) => wall.setTile(info_walls.sizes, loader.content));

	loader.content = {};

	room.updateGeometries();
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
