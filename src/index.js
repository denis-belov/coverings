/* eslint-disable */



import './index.scss';
import '@babel/polyfill';
import * as THREE from 'three';
import getOrbitControls from 'three/examples/js/controls/OrbitControls.js';
import earcut from 'earcut';



getOrbitControls(THREE);



const log = console.log.bind(null);
const [ parent_tag ] = document.getElementsByClassName('coverings');
const [ tile_texture ] = document.getElementById('textures').getElementsByTagName('img');
const [ add_wall_mode_button ] = document.getElementsByClassName('coverings-actions')[0].children;



const [ canvas ] = document.getElementsByTagName('canvas');



let W = window.innerWidth;
let H = window.innerHeight;



let add_wall_mode = 0;
const walls_to_add_new = [];

add_wall_mode_button.addEventListener('click', () => {

	add_wall_mode = 1 - add_wall_mode;

	if (add_wall_mode) {

		add_wall_mode_button.classList.add('-pressed');
	}
	else {

		add_wall_mode_button.classList.remove('-pressed');
	}
});



const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
// renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xFFFFFF);
renderer.clearColor();

const scene = new THREE.Scene();



const position_data = [];

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data), 3));

const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x000000), side: THREE.BackSide });

const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);



const position_data_floor = [];
const uv_data_floor = [];

const geometry_floor = new THREE.BufferGeometry();
geometry_floor.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data_floor), 3));
geometry_floor.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data_floor), 2));

const texture_floor = new THREE.Texture();
texture_floor.image = tile_texture;
texture_floor.wrapS = THREE.RepeatWrapping;
texture_floor.wrapT = THREE.RepeatWrapping;
texture_floor.needsUpdate = true;
log(texture_floor);

const material_floor = new THREE.MeshBasicMaterial({ map: texture_floor, side: THREE.BackSide, wireframe: false });

const mesh_floor = new THREE.Mesh(geometry_floor, material_floor);

scene.add(mesh_floor);



const hemisphere_light = new THREE.HemisphereLight('white', 'white', 1);
scene.add(hemisphere_light);

// const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 1, 10000);
camera.zoom = 10;
camera.updateProjectionMatrix();
// canvas.addEventListener('wheel', (evt) => camera.translateZ(Math.sign(evt.deltaY) * 0.1));

const orbit_controls = new THREE.OrbitControls(camera, canvas);
orbit_controls.enableZoom = false;
orbit_controls.update();

camera.rotateX(-Math.PI * 0.5);
camera.translateZ(100);
camera.lookAt(scene.position);



class Point {

	constructor (x = 0, y = 0) {

		this.x = x;
		this.y = y;
		this.z = Point.instances.length;

		this.scene_x = 0;
		this.scene_y = 0;


		this.circle = document.createElement('div');
		this.circle.className = 'coverings-circle';

		this.circle.style.left = `${ this.x - 30 }px`;
		this.circle.style.top = `${ H - this.y - 30 }px`;

		this.circle.addEventListener('mousedown', (evt) => {

			evt.preventDefault();

			if (!add_wall_mode) {

				const last_z = this.z;

				this.z = Point.instances.length - 1;
				this.circle.style.zIndex = this.z + 2;

				Point.instances.forEach((point) => {

					if (point !== this && point.z > last_z) {

						point.circle.style.zIndex = --point.z + 2;
					}
				});

				this.circle.classList.add('-mousedown');

				window.addEventListener('mousemove', Point.move);

				Point.selected = this;
			}
		});

		parent_tag.appendChild(this.circle);

		this.walls = [];

		Point.instances.push(this);
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

			const distance_between_points = Math.sqrt(Math.pow(this.x - conjugate_point.x, 2) + Math.pow(this.y - conjugate_point.y, 2));

			wall.rect.style.width = `${ distance_between_points + 30 }px`;
			wall.rect.style.left = `${ ((this.x + conjugate_point.x - distance_between_points) * 0.5) - 15 }px`;
			wall.rect.style.top = `${ (H - this.y + H - conjugate_point.y) * 0.5 - 15 }px`;
			wall.rect.inner.innerHTML = `${ (distance_between_points * 0.1).toFixed(2) } m`;
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

	updateGeometries () {

		Point.instances.forEach((point) => 	point.updateSceneCoordinates());

		position_data.length = 0;
		position_data_floor.length = 0;
		uv_data_floor.length = 0;

		Wall.instances.forEach((wall) => {

			position_data.push(
	
				wall.points[0].scene_x, 0, wall.points[0].scene_y,
				wall.points[0].scene_x, 3, wall.points[0].scene_y,
				wall.points[1].scene_x, 0, wall.points[1].scene_y,
	
				wall.points[1].scene_x, 0, wall.points[1].scene_y,
				wall.points[0].scene_x, 3, wall.points[0].scene_y,
				wall.points[1].scene_x, 3, wall.points[1].scene_y,
			);
		});



		const resolution = H / W;

		const scene_coordinates = [];
		const uv_coordinates = [];

		Point.instances.forEach((point) => {

			scene_coordinates.push(point.scene_x, point.scene_y);
			uv_coordinates.push(point.x / W * 10, point.y / H * 10 * resolution);
		});

		earcut(scene_coordinates).forEach((index) => {

			position_data_floor.push(scene_coordinates[(index * 2) + 0], 0, scene_coordinates[(index * 2) + 1]);
			uv_data_floor.push(uv_coordinates[(index * 2) + 0], uv_coordinates[(index * 2) + 1]);
		});



		// eliminate allocation of typed arrays from the function
		geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data), 3));
		geometry_floor.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data_floor), 3));
		geometry_floor.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data_floor), 2));
	}

	updateSceneCoordinates () {

		this.scene_x = (this.x - window.innerWidth * 0.5) * 0.1;
		this.scene_y = (window.innerHeight * 0.5 - this.y) * 0.1;
	}

	destroy () {

		parent_tag.remove(this.circle);

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

		this.points[0].walls.push(this);
		this.points[1].walls.push(this);

		this.rect = document.createElement('div');
		this.rect.className = 'coverings-rect';

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

					console.log(walls_to_add_new);

					add_wall_mode_button.classList.remove('-pressed');

					setTimeout(() => {

						Wall.instances.forEach((wall) => wall.rect.classList.remove('-selected'));

						const [ shared_point ] = [ ...walls_to_add_new[0].points, ...walls_to_add_new[1].points ].filter((point) => (walls_to_add_new[0].points.includes(point) && walls_to_add_new[1].points.includes(point)));

						walls_to_add_new.length = 0;

						log(shared_point, Point.instances.indexOf(shared_point));
					}, 250);
				}
			}
		});

		this.rect.inner = document.createElement('div');

		this.rect.inner.className = 'coverings-rect-inner';

		this.rect.appendChild(this.rect.inner);

		parent_tag.appendChild(this.rect);

		Wall.instances.push(this);
	}

	destroy () {

		this.rect.remove(this.rect.inner);

		parent_tag.remove(this.rect);

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



const wall1 = new Wall(new Point(0 + (W * 0.5) - 25, 0 + (H * 0.5) - 25), new Point(0 + (W * 0.5) - 25,   100 + (H * 0.5) - 25));
const wall2 = new Wall(wall1.points[1],                                   new Point(100 + (W * 0.5) - 25, 100 + (H * 0.5) - 25));
const wall3 = new Wall(wall2.points[1],                                   new Point(100 + (W * 0.5) - 25, 0   + (H * 0.5) - 25));
const wall4 = new Wall(wall3.points[1],                                   new Point(25  + (W * 0.5) - 25, 0   + (H * 0.5) - 25));
const wall5 = new Wall(wall4.points[1],                                   wall1.points[0]                                      );

Point.instances.forEach((point) => point.set());

const animate = () => {

	requestAnimationFrame(animate);

	geometry.attributes.position.needsUpdate = true;
	geometry_floor.attributes.position.needsUpdate = true;

	// texture_floor.rotation += 0.01;

	renderer.render(scene, camera);
};

animate();
