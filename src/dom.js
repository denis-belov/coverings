export const [ coverings_plan_NODE ] = document.getElementsByClassName('coverings-plan');

export const [ selection_NODE ] = document.getElementsByClassName('coverings-selection');

export const [ transparent_IMG, upload_model_INPUT, load_INPUT ] = document.getElementById('hidden').children;

export const [

	load_BUTTON,
	upload_model_BUTTON,
	add_wall_mode_BUTTON,
	mode_toggle_BUTTON,
	mode_selection_BUTTON,
	apply_segment_BUTTON,
] = document.getElementsByClassName('coverings-actions')[0].children;

export const [ canvas ] = document.getElementsByTagName('canvas');

// LOG(canvas, canvas2)

export const material_BUTTONS = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ].map((elm) => {

	const BUTTON = document.createElement('div');

	BUTTON.className = 'coverings-actions-switch';

	BUTTON.innerHTML = elm;

	document.getElementsByClassName('coverings-materials')[0].appendChild(BUTTON);

	return BUTTON;
});

export const [ modal ] = document.getElementsByClassName('modal');

export const [

	// // width_INPUT,
	// // length_INPUT,
	// // height_INPUT,
	// pick_kitchen_BUTTON,
	// pick_bathroom_BUTTON,
	// pick_manual_input_BUTTON,
	// // apply_sizes_BUTTON,
	room_picker_MODAL,
	manual_input_MODAL,
] = document.getElementsByClassName('modal-inner')[0].children;

// LOG(room_picker_MODAL)

export const [

	// width_INPUT,
	// length_INPUT,
	// height_INPUT,
	pick_kitchen_BUTTON,
	pick_bathroom_BUTTON,
	pick_manual_input_BUTTON,
	// apply_sizes_BUTTON,
	// room_picker_MODAL,
	// manual_input_MODAL,
] = room_picker_MODAL.children;

export const [

	back_BUTTON,
	width_INPUT,
	length_INPUT,
	height_INPUT,
	// pick_kitchen_BUTTON,
	// pick_bathroom_BUTTON,
	// pick_manual_input_BUTTON,
	apply_sizes_BUTTON,
	// room_picker_MODAL,
	// manual_input_MODAL,
] = manual_input_MODAL.children;

// LOG(apply_sizes_BUTTON)
