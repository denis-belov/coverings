/*
eslint-disable

no-new,
*/



// import Loader from 'external-data-loader';

// import { coverings_plan_NODE } from './dom';
// import cast from './cast';
// import textures from './textures';

// import Point from './point';
import * as THREE from 'three';

import Material from './material';
import Floor from './floor';
import Wall from './wall';
// import Segment from './segment';

import {

	scene,
	orbit_controls,
	// raycastable_meshes,
} from './three';



// const loader = new Loader();



const testPointInsideTriangle = (point, triangle_points) => {

	const [ tp1, tp2, tp3 ] = triangle_points;

	const A = 0.5 * (-tp2[1] * tp3[0] + tp1[1] * (-tp2[0] + tp3[0]) + tp1[0] * (tp2[1] - tp3[1]) + tp2[0] * tp3[1]);

	const sign = A < 0 ? -1 : 1;

	const s = (tp1[1] * tp3[0] - tp1[0] * tp3[1] + (tp3[1] - tp1[1]) * point[0] + (tp1[0] - tp3[0]) * point[1]) * sign;

	const t = (tp1[0] * tp2[1] - tp1[1] * tp2[0] + (tp1[1] - tp2[1]) * point[0] + (tp2[0] - tp1[0]) * point[1]) * sign;

	// LOG(point, tp1, tp2, tp3, s > 0 && t > 0 && (s + t) < 2 * A * sign)

	return s > 0 && t > 0 && (s + t) < 2 * A * sign;
};

function sqr (x) {
	return x * x;
}

function dist2 (v, w) {
	return sqr(v[0] - w[0]) + sqr(v[1] - w[1]);
}

// p - point
// v - start point of segment
// w - end point of segment
function distToSegmentSquared (p, v, w) {
	var l2 = dist2(v, w);
	if (l2 === 0) return dist2(p, v);
	var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
	t = Math.max(0, Math.min(1, t));
	return dist2(p, [ v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1]) ]);
}

// p - point
// v - start point of segment
// w - end point of segment
function distToSegment (p, v, w) {
	return Math.sqrt(distToSegmentSquared(p, v, w));
}

const testPointFarFromWalls = (point, points) => {

	for (let i = 0; i < points.length; ++i) {

		const p2 = points[i + 1] || points[0];

		if (distToSegment(point, [ points[i].scene_x, points[i].scene_z ], [ p2.scene_x, p2.scene_z ]) < 0.5) {

			return false;
		}
	}

	return true;
};



export default class Room {

	constructor () {

		this.points = [];

		this.floor = null;

		this.walls = [];

		this.height = 0;
	}

	make (height, points) {

		this.destroy();

		this.floor = new Floor(this);

		this.height = height;

		this.points.push(...points);

		this.points.forEach((point) => {

			point.updateSceneCoordinates();
			// point.updateStyles();
		});

		this.floor.applyMaterial(Material.default.id);
		this.floor.updateGeometry();

		this.points.forEach((point, index) => {

			const wall = new Wall(this, points[index], points[index + 1] || points[0]);

			// wall.updateQuaternionAndPosition();

			this.walls.push(wall);

			point.z_index = index;
		});

		orbit_controls.target.set(0, this.height / 2, 0);

		this.points.forEach((point) => point.updateStyles());

		this.locateSpotlights();
	}

	make2 (height, points) {

		this.destroy();

		this.floor = new Floor(this);

		this.height = height;

		this.points.push(...points);

		this.points.forEach((point) => {

			point.updateSceneCoordinates();
			// point.updateStyles();
		});

		// this.floor.applyMaterial(Material.default.id);
		// this.floor.updateGeometry();

		this.points.forEach((point, index) => {

			const wall = new Wall(this, points[index], points[index + 1] || points[0]);

			wall.updateQuaternionAndPosition();

			this.walls.push(wall);

			point.z_index = index;
		});

		orbit_controls.target.set(0, this.height / 2, 0);

		this.points.forEach((point) => point.updateStyles());
	}

	update (new_points) {

		if (new_points.length > this.points.length) {

			new_points.forEach((point, index) => {

				point.z_index = index;

				if (!this.points.includes(point)) {

					const prev_point = new_points[index - 1] || new_points[new_points.length - 1];
					const next_point = new_points[index + 1] || new_points[0];

					const [ removed_wall ] = prev_point.walls.filter((wall) => next_point.walls.includes(wall));

					prev_point.walls.splice(

						prev_point.walls.indexOf(removed_wall),

						1,
					);

					next_point.walls.splice(

						next_point.walls.indexOf(removed_wall),

						1,
					);

					this.walls.splice(

						this.walls.indexOf(removed_wall),

						1,

						new Wall(this, prev_point, point),

						new Wall(this, point, next_point),
					);

					removed_wall.remove();
				}
			});
		}
		else {

			this.points.forEach((point, index) => {

				// point.z_index = index;

				if (!new_points.includes(point)) {

					const prev_point = this.points[index - 1] || this.points[this.points.length - 1];
					const next_point = this.points[index + 1] || this.points[0];

					prev_point.walls.splice(

						prev_point.walls.indexOf(point.walls.filter((wall) => prev_point.walls.includes(wall))[0]),

						1,
					);

					next_point.walls.splice(

						next_point.walls.indexOf(point.walls.filter((wall) => next_point.walls.includes(wall))[0]),

						1,
					);

					this.walls.splice(

						this.walls.indexOf(point.walls[0]),

						2,

						new Wall(this, prev_point, next_point),
					);

					point.walls.forEach((wall) => wall.remove());

					point.remove();
				}
			});
		}

		this.points = new_points;

		this.points.forEach((point) => {

			point.updateSceneCoordinates();
			point.updateStyles();
		});

		this.floor.updateGeometry();

		// this.points.forEach((point) => point.updateStyles());

		// this.locateSpotlights();
	}

	addSpotLight (x, y, z) {

		let point_remains = false;



		if (

			testPointFarFromWalls(

				[ x, z ],

				this.points,
			)
		) {

			if (this.floor.segments.length) {

				this.floor.segments.forEach((segment) => {

					for (let i = 0; i < segment.mesh.geometry.index.array.length; i += 3) {

						const x1 =
							segment.mesh.geometry.attributes.position.array[segment.mesh.geometry.index.array[i + 0] * 3 + 0];

						const y1 =
							segment.mesh.geometry.attributes.position.array[segment.mesh.geometry.index.array[i + 0] * 3 + 1];



						const x2 =
							segment.mesh.geometry.attributes.position.array[segment.mesh.geometry.index.array[i + 1] * 3 + 0];

						const y2 =
							segment.mesh.geometry.attributes.position.array[segment.mesh.geometry.index.array[i + 1] * 3 + 1];



						const x3 =
							segment.mesh.geometry.attributes.position.array[segment.mesh.geometry.index.array[i + 2] * 3 + 0];

						const y3 =
							segment.mesh.geometry.attributes.position.array[segment.mesh.geometry.index.array[i + 2] * 3 + 1];



						if (

							testPointInsideTriangle(

								[ -x, -z ],

								[
									[ x1, y1 ],

									[ x2, y2 ],

									[ x3, y3 ],
								],
							)
						) {

							point_remains = true;

							break;
						}
					}
				});
			}
			else {

				for (let i = 0; i < this.floor.mesh.geometry.index.array.length; i += 3) {

					const x1 =
						this.floor.mesh.geometry.attributes.position.array[this.floor.mesh.geometry.index.array[i + 0] * 3 + 0];

					const y1 =
						this.floor.mesh.geometry.attributes.position.array[this.floor.mesh.geometry.index.array[i + 0] * 3 + 1];



					const x2 =
						this.floor.mesh.geometry.attributes.position.array[this.floor.mesh.geometry.index.array[i + 1] * 3 + 0];

					const y2 =
						this.floor.mesh.geometry.attributes.position.array[this.floor.mesh.geometry.index.array[i + 1] * 3 + 1];



					const x3 =
						this.floor.mesh.geometry.attributes.position.array[this.floor.mesh.geometry.index.array[i + 2] * 3 + 0];

					const y3 =
						this.floor.mesh.geometry.attributes.position.array[this.floor.mesh.geometry.index.array[i + 2] * 3 + 1];



					if (

						testPointInsideTriangle(

							[ -x, -z ],

							[
								[ x1, y1 ],

								[ x2, y2 ],

								[ x3, y3 ],
							],
						)
					) {

						point_remains = true;

						break;
					}
				}
			}
		}



		// LOG(point_remains)

		if (point_remains) {

			const spot_light = new THREE.SpotLight(0xFFFFFF);
			spot_light.intensity = 1;
			spot_light.distance = 0;
			spot_light.penumbra = 1;
			spot_light.decay = 2;
			spot_light.angle = Math.PI * 0.5;
			spot_light.position.set(x, y, z);

			// spot_light.target.position.y = 0;
			spot_light.target.position.set(x, 0, z);

			scene.add(spot_light);
			scene.add(spot_light.target);

			spot_light.target.userData.type = 'SPOT_LIGHT_TARGET';

			const helper = new THREE.Mesh(new THREE.SphereGeometry(0.1, 4, 4), new THREE.MeshBasicMaterial({ color: 'white' }));
			helper.position.set(x, y, z);
			helper.userData.type = 'SPOT_LIGHT_TARGET';
			scene.add(helper);
		}
		// else {

		// 	const spot_light = new THREE.SpotLight(0xFFFFFF);
		// 	spot_light.intensity = 1;
		// 	spot_light.distance = 0;
		// 	spot_light.penumbra = 1;
		// 	spot_light.decay = 2;
		// 	spot_light.angle = Math.PI * 0.5;
		// 	spot_light.position.set(x, y, z);

		// 	// spot_light.target.position.y = 0;
		// 	spot_light.target.position.set(x, 0, z);

		// 	scene.add(spot_light);
		// 	scene.add(spot_light.target);

		// 	spot_light.target.userData.type = 'SPOT_LIGHT_TARGET';

		// 	const helper = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), new THREE.MeshBasicMaterial({ color: 'blue' }));
		// 	helper.position.set(x, y, z);
		// 	helper.userData.type = 'SPOT_LIGHT_TARGET';
		// 	scene.add(helper);
		// }
	}

	locateSpotlights () {

		// LOG(this)

		scene.children
			.map((_) => _)
			.forEach((obj) => {

				// LOG(obj.userData.type, obj.userData.type === 'SPOT_LIGHT_TARGET')

				if (obj.type === 'SpotLight' || obj.userData.type === 'SPOT_LIGHT_TARGET') {

					scene.remove(obj);
				}
			});

		let min_x = Infinity;
		let max_x = -Infinity;
		let min_z = Infinity;
		let max_z = -Infinity;

		this.points.forEach((point) => {

			if (point.scene_x < min_x) {

				min_x = point.scene_x;
			}

			if (point.scene_x > max_x) {

				max_x = point.scene_x;
			}

			if (point.scene_z < min_z) {

				min_z = point.scene_z;
			}

			if (point.scene_z > max_z) {

				max_z = point.scene_z;
			}
		});

		const center_x = (min_x + max_x) * 0.5;
		const center_z = (min_z + max_z) * 0.5;

		// LOG(min_x, max_x, min_z, max_z)
		// LOG(this.floor.mesh.geometry.index.array.length)

		for (let x = center_x + 0.5; x < max_x; x += 1) {

			for (let z = center_z + 0.5; z < max_z; z += 1) {

				this.addSpotLight(x, this.height, z);
			}

			for (let z = center_z - 0.5; z > min_z; z -= 1) {

				this.addSpotLight(x, this.height, z);
			}
		}

		for (let x = center_x - 0.5; x > min_x; x -= 1) {

			for (let z = center_z + 0.5; z < max_z; z += 1) {

				this.addSpotLight(x, this.height, z);
			}

			for (let z = center_z - 0.5; z > min_z; z -= 1) {

				this.addSpotLight(x, this.height, z);
			}
		}

		// LOG(scene)
	}

	destroy () {

		this.points.forEach((point) => point.remove());

		this.points.length = 0;

		if (this.floor) {

			this.floor.remove();

			this.floor = null;
		}

		this.walls.forEach((wall) => wall.remove());

		this.walls.length = 0;
	}
}
