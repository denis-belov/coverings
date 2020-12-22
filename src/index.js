/* eslint-disable */



// make number consts
// make plan scale



import './index.scss';
import '@babel/polyfill';
import * as THREE from 'three';
import getOrbitControls from 'three/examples/js/controls/OrbitControls.js';
import earcut from 'earcut';



getOrbitControls(THREE);



const ROOM_HEIGHT = 2.5;



const log = console.log.bind(null);
// const [ coverings_NODE ] = document.getElementsByClassName('coverings');
const [ coverings_plan_NODE ] = document.getElementsByClassName('coverings-plan');
const [ tile1_texture, tile2_texture ] = document.getElementById('textures').getElementsByTagName('img');
const [ add_wall_mode_BUTTON, orbit_mode_BUTTON ] = document.getElementsByClassName('coverings-actions')[0].children;



const [ canvas ] = document.getElementsByTagName('canvas');



let W = window.innerWidth;
let H = window.innerHeight;



let add_wall_mode = 0;
const walls_to_add_new = [];

add_wall_mode_BUTTON.addEventListener('click', () => {

	add_wall_mode = 1 - add_wall_mode;

	if (add_wall_mode) {

		add_wall_mode_BUTTON.classList.add('-pressed');
	}
	else {

		add_wall_mode_BUTTON.classList.remove('-pressed');
	}
});

let orbit_mode = 0;

orbit_mode_BUTTON.addEventListener('click', () => {

	orbit_mode = 1 - orbit_mode;

	if (orbit_mode) {

		orbit_mode_BUTTON.innerHTML = 'Switch to plan mode';

		orbit_mode_BUTTON.classList.add('-pressed');

		camera = orbit_camera;

		coverings_plan_NODE.classList.add('-hidden');
	}
	else {

		// disable add_wall_mode_BUTTON

		orbit_mode_BUTTON.innerHTML = 'Switch to orbit mode';

		orbit_mode_BUTTON.classList.remove('-pressed');

		camera = plan_camera;

		coverings_plan_NODE.classList.remove('-hidden');
	}
});



const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xFFFFFF);
renderer.clearColor();

const scene = new THREE.Scene();



const position_data = [];
const uv_data = [];

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data), 3));
geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data), 2));

const texture = new THREE.Texture();
texture.image = tile1_texture;
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.needsUpdate = true;

const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, wireframe: false });

const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);



const position_data_floor = [];
const uv_data_floor = [];

const geometry_floor = new THREE.BufferGeometry();
geometry_floor.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data_floor), 3));
geometry_floor.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data_floor), 2));

const texture_floor = new THREE.Texture();
texture_floor.image = tile2_texture;
texture_floor.wrapS = THREE.RepeatWrapping;
texture_floor.wrapT = THREE.RepeatWrapping;
texture_floor.needsUpdate = true;

const material_floor = new THREE.MeshBasicMaterial({ map: texture_floor, side: THREE.BackSide, wireframe: false });

const mesh_floor = new THREE.Mesh(geometry_floor, material_floor);

scene.add(mesh_floor);



const hemisphere_light = new THREE.HemisphereLight('white', 'white', 1);
scene.add(hemisphere_light);

const plan_camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 1, 1000);
plan_camera.zoom = 10;
plan_camera.updateProjectionMatrix();

plan_camera.rotateX(-Math.PI * 0.5);
plan_camera.translateZ(100);
plan_camera.lookAt(scene.position);

const orbit_camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
orbit_camera.rotateX(-Math.PI * 0.125);
orbit_camera.translateZ(20);

let camera = plan_camera;

const orbit_controls = new THREE.OrbitControls(orbit_camera, canvas);
orbit_controls.enableZoom = true;
orbit_controls.enableDamping = true;
orbit_controls.dumpingFactor = 10;
// orbit_controls.update();



class Point {

	constructor (x = 0, y = 0, push = 1) {

		this.x = x;
		this.y = y;
		this.z = Point.instances.length;

		this.scene_x = 0;
		this.scene_y = 0;

		this.circle = document.createElement('div');
		this.circle.className = 'coverings-plan-circle';

		this.circle.style.left = `${ this.x - 30 }px`;
		this.circle.style.top = `${ H - this.y - 30 }px`;

		this.circle.addEventListener('mousedown', (evt) => {

			evt.preventDefault();

			if (!add_wall_mode) {

				const last_z = this.z;

				this.z = Point.instances.length - 1;
				this.circle.style.zIndex = this.z + 12;

				Point.instances.forEach((point) => {

					if (point !== this && point.z > last_z) {

						point.circle.style.zIndex = --point.z + 12;
					}
				});

				this.circle.classList.add('-mousedown');

				window.addEventListener('mousemove', Point.move);

				Point.selected = this;
			}
		});

		coverings_plan_NODE.appendChild(this.circle);

		this.walls = [];

		if (push) {

			Point.instances.push(this);
		}
	}

	set (x = this.x, y = this.y) {

		this.x = x;
		this.y = y;

		this.circle.style.left = `${ this.x - 30 }px`;
		this.circle.style.top = `${ H - this.y - 30 }px`;

		this.updateWalls();
		this.updateGeometries();
	}

	move (movementX, movementY) {

		this.x += movementX;
		this.y -= movementY;

		this.circle.style.left = `${ this.x - 30 }px`;
		this.circle.style.top = `${ H - this.y - 30 }px`;

		this.updateWalls();
		this.updateGeometries();
	}

	updateWalls () {

		this.walls.forEach((wall) => {

			const [ conjugate_point ] = wall.points.filter((point) => (point !== this));

			wall.size = Math.sqrt(Math.pow(this.x - conjugate_point.x, 2) + Math.pow(this.y - conjugate_point.y, 2));

			wall.rect.style.width = `${ wall.size + 30 }px`;
			wall.rect.style.left = `${ ((this.x + conjugate_point.x - wall.size) * 0.5) - 15 }px`;
			wall.rect.style.top = `${ (H - this.y + H - conjugate_point.y) * 0.5 - 15 }px`;
			wall.rect.inner.innerHTML = `${ (wall.size * 0.02).toFixed(2) } m`;
			const points_vector = { x: conjugate_point.x - this.x, y: conjugate_point.y - this.y };
			let angle = Math.acos(

				points_vector.x
				/
				(
					Math.sqrt(1 + 0)
					*
					Math.sqrt(points_vector.x * points_vector.x + points_vector.y * points_vector.y)
				)
			);

			if (this.y > conjugate_point.y) {

				angle *= -1;
			}

			if (wall.points.indexOf(this) === 0) {

				if (this.x > conjugate_point.x) {

					wall.rect.inner.style.transform = 'translate(0px, -17px) rotate(180deg)';
				}
				else {

					wall.rect.inner.style.transform = 'translate(0px, -17px) rotate(0deg)';
				}
			}
			else {

				if (this.x > conjugate_point.x) {

					wall.rect.inner.style.transform = 'translate(0px, -2px) rotate(180deg)';
				}
				else {

					wall.rect.inner.style.transform = 'translate(0px, -2px) rotate(0deg)';
				}
			}

			wall.rect.style.transform = `rotate(${ -angle / Math.PI * 180 }deg)`;
		});
	}

	// optimize geometries with index buffers ?
	updateGeometries () {

		// make for this point only
		Point.instances.forEach((point) => point.updateSceneCoordinates());

		position_data.length = 0;
		uv_data.length = 0;
		position_data_floor.length = 0;
		uv_data_floor.length = 0;

		Point.instances.forEach((point, point_index, point_array) => {

			const next_point = point_array[point_index + 1] || point_array[0];

			const [ wall ] = point.walls.filter((wall) => wall.points.includes(next_point));

			position_data.push(
	
				point.scene_x, 0, point.scene_y,
				point.scene_x, ROOM_HEIGHT * 5, point.scene_y,
				next_point.scene_x, 0, next_point.scene_y,
	
				next_point.scene_x, 0, next_point.scene_y,
				point.scene_x, ROOM_HEIGHT * 5, point.scene_y,
				next_point.scene_x, ROOM_HEIGHT * 5, next_point.scene_y,
			);
			// log(wall.points[0].scene_x, wall.points[0].x);

			uv_data.push(

				0, 0,
				0, ROOM_HEIGHT,
				wall.size * 0.02, 0,
		
				wall.size * 0.02, 0,
				0, ROOM_HEIGHT,
				wall.size * 0.02, ROOM_HEIGHT,
			);
		});

		// Wall.instances.forEach((wall) => {

		// 	// log(rate);

		// 	position_data.push(
	
		// 		wall.points[0].scene_x, 0, wall.points[0].scene_y,
		// 		wall.points[0].scene_x, ROOM_HEIGHT * 5, wall.points[0].scene_y,
		// 		wall.points[1].scene_x, 0, wall.points[1].scene_y,
	
		// 		wall.points[1].scene_x, 0, wall.points[1].scene_y,
		// 		wall.points[0].scene_x, ROOM_HEIGHT * 5, wall.points[0].scene_y,
		// 		wall.points[1].scene_x, ROOM_HEIGHT * 5, wall.points[1].scene_y,
		// 	);
		// 	log(wall.points[0].scene_x, wall.points[0].x);

		// 	uv_data.push(

		// 		0, 0,
		// 		0, ROOM_HEIGHT,
		// 		wall.size * 0.02, 0,
		
		// 		wall.size * 0.02, 0,
		// 		0, ROOM_HEIGHT,
		// 		wall.size * 0.02, ROOM_HEIGHT,
		// 	);
		// });



		const resolution = H / W;

		const scene_coordinates = [];
		const uv_coordinates = [];

		Point.instances.forEach((point, i) => {

			scene_coordinates.push(point.scene_x, point.scene_y);
			uv_coordinates.push(point.x / W * 50, point.y / H * 50 * resolution);
		});

		const tri = earcut(scene_coordinates);

		tri.forEach((index) => {

			position_data_floor.push(scene_coordinates[(index * 2) + 0], 0, scene_coordinates[(index * 2) + 1]);
			uv_data_floor.push(uv_coordinates[(index * 2) + 0], uv_coordinates[(index * 2) + 1]);
		});



		// eliminate allocation of typed arrays from the function
		geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data), 3));
		geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data), 2));
		geometry_floor.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data_floor), 3));
		geometry_floor.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data_floor), 2));
	}

	updateSceneCoordinates () {

		this.scene_x = (this.x - window.innerWidth * 0.5) * 0.1;
		this.scene_y = (window.innerHeight * 0.5 - this.y) * 0.1;
	}

	destroy () {

		if (Point.instances.includes(this)) {

			Point.instances.splice(Point.instances.indexOf(this), 1);
		}

		coverings_plan_NODE.removeChild(this.circle);

		delete this;
	}

	static move ({ movementX, movementY }) {

		Point.selected.move(movementX, movementY);



		// let minX = 999999;
		// let maxX = -999999;
		// let minY = 999999;
		// let maxY = -999999;

		// Point.instances.forEach((point) => {

		// 	if (point.x < minX) {

		// 		minX = point.x;
		// 	}

		// 	if (point.x > maxX) {

		// 		maxX = point.x;
		// 	}

		// 	if (point.y < minY) {

		// 		minY = point.y;
		// 	}

		// 	if (point.y > maxY) {

		// 		maxY = point.y;
		// 	}
		// });

		// let avX = (minX + maxX) * 0.5;
		// let avY = (minY + maxY) * 0.5;
	}
}

Point.selected = null;
Point.instances = [];



class Wall {

	constructor (point1 = new Point(), point2 = new Point()) {

		this.points = [ point1, point2 ];

		this.size = 0;

		this.points[0].walls.push(this);
		this.points[1].walls.push(this);

		this.rect = document.createElement('div');
		this.rect.className = 'coverings-plan-rect';

		this.rect.addEventListener('mousedown', (evt) => {

			evt.preventDefault();

			if (!add_wall_mode) {

				window.addEventListener('mousemove', Wall.move);

				Wall.selected = this;
			}
		});

		this.rect.addEventListener('click', () => {

			if (add_wall_mode) {

				this.rect.classList.add('-selected');

				walls_to_add_new.push(this);

				if (walls_to_add_new.length >= 2) {

					add_wall_mode = 0;

					add_wall_mode_BUTTON.classList.remove('-pressed');

					setTimeout(() => {

						// rename vars
						walls_to_add_new.forEach((wall) => wall.rect.classList.remove('-selected'));

						const new_x1 = (walls_to_add_new[0].points[0].x + walls_to_add_new[0].points[1].x) * 0.5;
						const new_y1 = (walls_to_add_new[0].points[0].y + walls_to_add_new[0].points[1].y) * 0.5;
						const new_x2 = (walls_to_add_new[1].points[0].x + walls_to_add_new[1].points[1].x) * 0.5;
						const new_y2 = (walls_to_add_new[1].points[0].y + walls_to_add_new[1].points[1].y) * 0.5;

						const new_point1 = new Point(new_x1, new_y1, 0);
						const new_point2 = new Point(new_x2, new_y2, 0);

						const new_wall = new Wall(new_point1, new_point2);

						new_point1.walls.push(walls_to_add_new[0]);
						new_point2.walls.push(walls_to_add_new[1]);

						const [ shared_point ] = [ ...walls_to_add_new[0].points, ...walls_to_add_new[1].points ].filter((point) => (walls_to_add_new[0].points.includes(point) && walls_to_add_new[1].points.includes(point)));

						const shared_index = Point.instances.indexOf(shared_point);

						const index1 = Point.instances.indexOf(walls_to_add_new[0].points.filter((point) => (point !== shared_point))[0]);
						const index2 = Point.instances.indexOf(walls_to_add_new[1].points.filter((point) => (point !== shared_point))[0]);

						walls_to_add_new[0].points = walls_to_add_new[0].points.map((point) => (point === shared_point ? new_point1 : point));
						walls_to_add_new[1].points = walls_to_add_new[1].points.map((point) => (point === shared_point ? new_point2 : point));

						if (shared_index < Point.instances.length - 1 && shared_index > 0) {

							if (index1 > index2) {

								Point.instances.splice(Point.instances.indexOf(shared_point), 1, new_point2, new_point1);
							} else {

								Point.instances.splice(Point.instances.indexOf(shared_point), 1, new_point1, new_point2);
							}
						}
						else {

							if (index1 > index2) {

								Point.instances.splice(Point.instances.indexOf(shared_point), 1, new_point1, new_point2);
							} else {

								Point.instances.splice(Point.instances.indexOf(shared_point), 1, new_point2, new_point1);
							}
						}

						shared_point.destroy();

						Point.instances.forEach((point) => point.set());

						walls_to_add_new.length = 0;
					}, 250);
				}
			}
		});

		this.rect.inner = document.createElement('div');

		this.rect.inner.className = 'coverings-plan-rect-inner';

		this.rect.appendChild(this.rect.inner);

		coverings_plan_NODE.appendChild(this.rect);

		Wall.instances.push(this);
	}

	destroy () {

		Wall.instances.splice(Wall.instances.indexOf(this), 1);

		this.rect.remove(this.rect.inner);

		coverings_plan_NODE.remove(this.rect);

		delete this;
	}

	static move (evt) {

		const [ point1, point2 ] = Wall.selected.points;

		Point.selected = point1;

		Point.move(evt);

		Point.selected = point2;

		Point.move(evt);

		Point.selected = null;
	}
}

Wall.selected = null;
Wall.instances = [];



window.addEventListener('mouseup', () => {

	if (Point.selected) {

		Point.selected.circle.classList.remove('-mousedown');

		window.removeEventListener('mousemove', Point.move);

		Point.selected = null;
	}

	if (Wall.selected) {

		window.removeEventListener('mousemove', Wall.move);

		Wall.selected = null;
	}
});



const wall1 = new Wall(new Point(0 + (W * 0.5) - 150, 0 + (H * 0.5) - 150), new Point(0 + (W * 0.5) - 150,   300 + (H * 0.5) - 150));
const wall2 = new Wall(wall1.points[1],                                   new Point(300 + (W * 0.5) - 150, 300 + (H * 0.5) - 150));
const wall3 = new Wall(wall2.points[1],                                   new Point(300 + (W * 0.5) - 150, 0   + (H * 0.5) - 150));
const wall4 = new Wall(wall3.points[1],                                   new Point(75  + (W * 0.5) - 150, 0   + (H * 0.5) - 150));
const wall5 = new Wall(wall4.points[1],                                   wall1.points[0]                                      );



Point.instances.forEach((point) => point.set());

const animate = () => {

	requestAnimationFrame(animate);

	geometry.attributes.position.needsUpdate = true;
	geometry_floor.attributes.position.needsUpdate = true;

	orbit_controls.update();

	// texture_floor.rotation += 0.01;

	renderer.render(scene, camera);
};

animate();
