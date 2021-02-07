import Point from './point';

import {

	coverings_plan_NODE,
	add_wall_mode_BUTTON,
} from './dom';

import modes from './modes';



const TIME_TO_WAIT_FOR_APPENDING_WALL = 250;



export default class Wall {

	static selected = null;
	static walls_to_add_new = [];

	static move (evt) {

		const [ point1, point2 ] = Wall.selected.points;

		point1.move(evt.movementX, evt.movementY);
		point2.move(evt.movementX, evt.movementY);
	}



	constructor (point1 = new Point(), point2 = new Point()) {

		this.points = [ point1, point2 ];

		this.pixel_length = 0;

		this.points[0].walls.push(this);
		this.points[1].walls.push(this);

		this.next_wall = null;

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

						Wall.walls_to_add_new.forEach((wall) => wall.rect.classList.remove('-selected'));

						const new_point1 = Wall.walls_to_add_new[0].points[0].centerWith(Wall.walls_to_add_new[0].points[1]);
						const new_point2 = Wall.walls_to_add_new[1].points[0].centerWith(Wall.walls_to_add_new[1].points[1]);

						const [ shared_point ] = [

							...Wall.walls_to_add_new[0].points,
							...Wall.walls_to_add_new[1].points,
						]
							.filter((point) => (Wall.walls_to_add_new[0].points.includes(point) && Wall.walls_to_add_new[1].points.includes(point)));

						const shared_index = Point.instances.indexOf(shared_point);

						const new_points = Point.instances.slice();

						if (Wall.walls_to_add_new[0].next_wall === Wall.walls_to_add_new[1]) {

							new_points.splice(shared_index, 1, new_point1, new_point2);
						}
						else {

							new_points.splice(shared_index, 1, new_point2, new_point1);
						}

						Point.makeContour(new_points);

						Wall.walls_to_add_new.length = 0;
					}, TIME_TO_WAIT_FOR_APPENDING_WALL);
				}
			}
		});

		this.rect.inner = document.createElement('div');

		this.rect.inner.className = 'coverings-plan-rect-inner';

		this.rect.appendChild(this.rect.inner);

		coverings_plan_NODE.appendChild(this.rect);
	}
}
