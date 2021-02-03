/*
eslint-disable

max-len,
*/



import Point from './point';

import {

	coverings_plan_NODE,
	add_wall_mode_BUTTON,
} from './dom';

import modes from './modes';



const TIME_TO_WAIT_FOR_APPENDING_WALL = 250;



export default class Wall {

	static selected = null;
	static instances = [];
	static walls_to_add_new = [];

	static move (evt) {

		const [ point1, point2 ] = Wall.selected.points;

		Point.selected = point1;

		Point.move(evt);

		Point.selected = point2;

		Point.move(evt);

		Point.selected = null;
	}



	constructor (point1 = new Point(), point2 = new Point()) {

		this.points = [ point1, point2 ];

		this.pixel_length = 0;

		this.points[0].walls.push(this);
		this.points[1].walls.push(this);

		this.rect = document.createElement('div');
		this.rect.className = 'coverings-plan-rect';

		this.rect.addEventListener('mousedown', (evt) => {

			evt.preventDefault();

			if (!modes.add_wall_mode) {

				window.addEventListener('mousemove', Wall.move);

				Wall.selected = this;
			}
		});

		this.rect.addEventListener('click', () => {

			if (modes.add_wall_mode) {

				this.rect.classList.add('-selected');

				Wall.walls_to_add_new.push(this);

				if (Wall.walls_to_add_new.length >= 2) {

					modes.add_wall_mode = 0;

					add_wall_mode_BUTTON.classList.remove('-pressed');

					setTimeout(() => {

						// rename vars
						Wall.walls_to_add_new.forEach((wall) => wall.rect.classList.remove('-selected'));

						const new_x1 = (Wall.walls_to_add_new[0].points[0].pixel_x + Wall.walls_to_add_new[0].points[1].pixel_x) / 2;
						const new_y1 = (Wall.walls_to_add_new[0].points[0].pixel_y + Wall.walls_to_add_new[0].points[1].pixel_y) / 2;
						const new_x2 = (Wall.walls_to_add_new[1].points[0].pixel_x + Wall.walls_to_add_new[1].points[1].pixel_x) / 2;
						const new_y2 = (Wall.walls_to_add_new[1].points[0].pixel_y + Wall.walls_to_add_new[1].points[1].pixel_y) / 2;

						const new_point1 = new Point(new_x1, new_y1, 0);
						const new_point2 = new Point(new_x2, new_y2, 0);

						// const new_wall = new Wall(new_point1, new_point2);
						/* eslint-disable no-new */
						new Wall(new_point1, new_point2);
						/* eslint-enable no-new */

						new_point1.walls.push(Wall.walls_to_add_new[0]);
						new_point2.walls.push(Wall.walls_to_add_new[1]);

						const [ shared_point ] = [ ...Wall.walls_to_add_new[0].points, ...Wall.walls_to_add_new[1].points ].filter((point) => (Wall.walls_to_add_new[0].points.includes(point) && Wall.walls_to_add_new[1].points.includes(point)));

						const shared_index = Point.instances.indexOf(shared_point);

						const index1 = Point.instances.indexOf(Wall.walls_to_add_new[0].points.filter((point) => (point !== shared_point))[0]);
						const index2 = Point.instances.indexOf(Wall.walls_to_add_new[1].points.filter((point) => (point !== shared_point))[0]);

						Wall.walls_to_add_new[0].points = Wall.walls_to_add_new[0].points.map((point) => (point === shared_point ? new_point1 : point));
						Wall.walls_to_add_new[1].points = Wall.walls_to_add_new[1].points.map((point) => (point === shared_point ? new_point2 : point));

						if (shared_index < Point.instances.length - 1 && shared_index > 0) {

							if (index1 > index2) {

								Point.instances.splice(Point.instances.indexOf(shared_point), 1, new_point2, new_point1);
							}
							else {

								Point.instances.splice(Point.instances.indexOf(shared_point), 1, new_point1, new_point2);
							}
						}
						else if (index1 > index2) {

							Point.instances.splice(Point.instances.indexOf(shared_point), 1, new_point1, new_point2);
						}
						else {

							Point.instances.splice(Point.instances.indexOf(shared_point), 1, new_point2, new_point1);
						}

						shared_point.destroy();

						Point.instances.forEach((point) => point.set());

						Wall.walls_to_add_new.length = 0;
					}, TIME_TO_WAIT_FOR_APPENDING_WALL);
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
}
