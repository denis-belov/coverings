// make number consts
// make plan scale



/*
eslint-disable

max-len,
*/



import './index.scss';
import '@babel/polyfill';

import Point from './point';
import Wall from './wall';

import { animate } from './three';

import './events';



/*
eslint-disable

no-magic-numbers,
no-new,
*/
const wall1 = new Wall(new Point(-3, -3), new Point(-3, 3));
const wall2 = new Wall(wall1.points[1], new Point(3, 3));
const wall3 = new Wall(wall2.points[1], new Point(3, -3));
// const wall4 = new Wall(wall3.points[1], new Point(-1, 3));
new Wall(wall3.points[1], wall1.points[0]);
/*
eslint-enable

no-magic-numbers,
no-new,
*/

Point.instances.forEach((point) => point.set());

animate();
