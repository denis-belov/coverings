/* eslint-disable */



import './index.scss';
import '@babel/polyfill';
import * as THREE from 'three';
import getOrbitControls from 'three/examples/js/controls/OrbitControls.js';



getOrbitControls(THREE);



const [ parent_tag ] = document.getElementsByClassName('coverings');
const [ tile_texture ] = document.getElementById('textures').getElementsByTagName('img');
const log = console.log.bind(null);



const [ plan_canvas, scene_canvas ] = document.getElementsByTagName('canvas');

plan_canvas.style.zIndex = 0;
scene_canvas.style.zIndex = 1;

let W = window.innerWidth;
let H = window.innerHeight;



plan_canvas.width = W;
plan_canvas.height = H;



const renderer = new THREE.WebGLRenderer({ canvas: scene_canvas, antialias: true });
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

const material_floor = new THREE.MeshBasicMaterial({ map: texture_floor, side: THREE.BackSide });

const mesh_floor = new THREE.Mesh(geometry_floor, material_floor);

scene.add(mesh_floor);



const hemisphere_light = new THREE.HemisphereLight('white', 'white', 1);
scene.add(hemisphere_light);

// const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 1, 10000);
camera.zoom = 10;
camera.updateProjectionMatrix();
scene_canvas.addEventListener('wheel', (evt) => camera.translateZ(Math.sign(evt.deltaY) * 0.1));

const orbit_controls = new THREE.OrbitControls(camera, scene_canvas);
orbit_controls.enableZoom = false;
orbit_controls.update();

camera.rotateX(-Math.PI * 0.5);
camera.translateZ(100);
camera.lookAt(scene.position);



// const plan_ctx = plan_canvas.getContext('2d');



// let drawPlan = null;



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

			const last_z = this.z;

			this.z = Point.instances.length - 1;
			this.circle.style.zIndex = this.z + 3;

			Point.instances.forEach((point) => {

				if (point !== this && point.z > last_z) {

					point.circle.style.zIndex = --point.z + 3;
				}
			});

			this.circle.classList.add('-mousedown');

			window.addEventListener('mousemove', Point.move);

			Point.selected = this;
		});

		parent_tag.appendChild(this.circle);

		this.walls = [];

		Point.instances.push(this);
	}

	set (x = 0, y = 0) {

		this.x = x;
		this.y = y;

		this.circle.style.left = `${ this.x - 30 }px`;
		this.circle.style.top = `${ H - this.y - 30 }px`;
	}

	updatePosition (movementX, movementY) {

		this.x += movementX;
		this.y -= movementY;

		this.circle.style.left = `${ this.x - 30 }px`;
		this.circle.style.top = `${ H - this.y - 30 }px`;
	}

	updateWalls () {

		this.walls.forEach((wall) => {

			const [ conjugate_point ] = wall.points.filter((point) => (point !== this));

			const distance_between_points = Math.sqrt(Math.pow(this.x - conjugate_point.x, 2) + Math.pow(this.y - conjugate_point.y, 2));

			wall.rect.style.width = `${ distance_between_points + 30 }px`;
			wall.rect.style.left = `${ ((this.x + conjugate_point.x - distance_between_points) * 0.5) - 15 }px`;
			wall.rect.style.top = `${ (H - this.y + H - conjugate_point.y) * 0.5 - 15 }px`;
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

			wall.rect.style.transform = `rotate(${ -angle / Math.PI * 180 }deg)`;
		});

		// drawPlan();
	}

	updateSceneCoordinates () {

		this.scene_x = (this.x - window.innerWidth * 0.5) * 0.1;
		this.scene_y = (window.innerHeight * 0.5 - this.y) * 0.1;
	}

	move () {

		this.updatePosition(movementX, movementY);
		this.updateWalls();
	}

	static set (x, y) {

		Point.selected.set(x, y);
		Point.selected.updateWalls();
	}

	static move ({ movementX, movementY }) {

		Point.selected.updatePosition(movementX, movementY);
		Point.selected.updateWalls();



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

		Point.instances.forEach((point) => {

			// Point.selected = point;

			// Point.move({ movementX: (window.innerWidth * 0.5) - avX, movementY: (window.innerHeight * 0.5) - avY });

			point.updateSceneCoordinates();
		});

		position_data.length = 0;
		position_data_floor.length = 0;
		uv_data_floor.length = 0;

		let last_wall = Wall.instances[0];

		const p1 = last_wall.points[0];
		let last_p3 = last_wall.points[1];

		Wall.instances.forEach((wall, wall_index) => {

			position_data.push(

				wall.points[0].scene_x, 0, wall.points[0].scene_y,
				wall.points[0].scene_x, 3, wall.points[0].scene_y,
				wall.points[1].scene_x, 0, wall.points[1].scene_y,

				wall.points[1].scene_x, 0, wall.points[1].scene_y,
				wall.points[0].scene_x, 3, wall.points[0].scene_y,
				wall.points[1].scene_x, 3, wall.points[1].scene_y,
			);

				if (wall_index < Wall.instances.length - 2) {

					const p2 = last_p3;

					const [ next_wall ] = p2.walls.filter((_wall) => (_wall !== last_wall));

					last_wall = next_wall;

					const [ p3 ] = next_wall.points.filter((point) => (point !== p2));

					position_data_floor.push(

						p1.scene_x, 0, p1.scene_y,
						p2.scene_x, 0, p2.scene_y,
						p3.scene_x, 0, p3.scene_y,
					);

					const resolution = H / W;

					uv_data_floor.push(

						p1.x / W * 10, p1.y / H * 10 * resolution,
						p2.x / W * 10, p2.y / H * 10 * resolution,
						p3.x / W * 10, p3.y / H * 10 * resolution,
					);

					last_p3 = p3;
				}
		});

		// log(uv_data_floor);

		geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data), 3));
		geometry_floor.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position_data_floor), 3));
		geometry_floor.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv_data_floor), 2));
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

			window.addEventListener('mousemove', Wall.move);

			Wall.selected = this;
		});

		parent_tag.appendChild(this.rect);

		Wall.instances.push(this);
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



// drawPlan = () => {

// 	plan_ctx.clearRect(0, 0, W, H);

// 	Wall.instances.forEach((wall) => {

// 		plan_ctx.beginPath();
// 		plan_ctx.moveTo(wall.points[0].x, wall.points[0].y);
// 		plan_ctx.lineWidth = 10;
// 		plan_ctx.lineCap = 'square';
// 		plan_ctx.lineTo(wall.points[1].x, wall.points[1].y);
// 		plan_ctx.stroke();
// 	});
// };



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



// drawPlan();



const wall1 = new Wall(new Point(0 + (W * 0.5) - 25, 0 + (H * 0.5) - 25), new Point(0 + (W * 0.5) - 25,   100 + (H * 0.5) - 25));
const wall2 = new Wall(wall1.points[1],                                   new Point(100 + (W * 0.5) - 25, 100 + (H * 0.5) - 25));
const wall3 = new Wall(wall2.points[1],                                   new Point(100 + (W * 0.5) - 25, 0   + (H * 0.5) - 25));
const wall4 = new Wall(wall3.points[1],                                   new Point(25  + (W * 0.5) - 25, 0   + (H * 0.5) - 25));
const wall5 = new Wall(wall4.points[1],                                   wall1.points[0]                                      );

const animate = () => {

	requestAnimationFrame(animate);

	geometry.attributes.position.needsUpdate = true;
	geometry_floor.attributes.position.needsUpdate = true;

	// texture_floor.rotation += 0.01;

	renderer.render(scene, camera);
};

animate();
