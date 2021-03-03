export const [ coverings_plan_NODE ] = document.getElementsByClassName('coverings-plan');

export const [ selection_NODE ] = document.getElementsByClassName('coverings-selection');

export const [ transparent_IMG, upload_model_INPUT ] = document.getElementById('hidden').children;

export const [

	upload_model_BUTTON,
	add_wall_mode_BUTTON,
	mode_toggle_BUTTON,
	mode_selection_BUTTON,
	apply_segment_BUTTON,
] = document.getElementsByClassName('coverings-actions')[0].children;

export const [ canvas, canvas2 ] = document.getElementsByClassName('coverings-canvases')[0].children;

// LOG(canvas, canvas2)

export const material_BUTTONS = [ 1, 2, 3, 4 ].map((elm) => {

	const BUTTON = document.createElement('div');

	BUTTON.className = 'coverings-actions-switch';

	BUTTON.innerHTML = elm;

	document.getElementsByClassName('coverings-materials')[0].appendChild(BUTTON);

	return BUTTON;
});

export const [ modal ] = document.getElementsByClassName('modal');

export const [

	width_INPUT,
	length_INPUT,
	height_INPUT,
	apply_sizes_BUTTON,
] = document.getElementsByClassName('modal-inner')[0].children[0].children;
