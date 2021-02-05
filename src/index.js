// make number consts
// make plan scale



/*
eslint-disable

max-len,
*/



import './index.scss';
import '@babel/polyfill';

import Point from './point';
// import Wall from './wall';

import { animate } from './three';

import './events';



/* eslint-disable no-magic-numbers */
Point.makeContour([

	new Point(-3, -3),

	new Point(-3, 3),

	new Point(3, 3),

	new Point(3, -3),
]);
/* eslint-enable no-magic-numbers */

animate();
