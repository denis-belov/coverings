import materials from './materials';



export const [ coverings_plan_NODE ] = document.getElementsByClassName('coverings-plan');

export const [ upload_model_INPUT ] = document.getElementById('hidden').children;

export const [

	upload_model_BUTTON,
	add_wall_mode_BUTTON,
	mode_toggle_BUTTON,
] = document.getElementsByClassName('coverings-actions')[0].children;

export const [ canvas ] = document.getElementsByTagName('canvas');

export const material_BUTTONS = materials.map((elm) => {

	const BUTTON = document.createElement('div');

	BUTTON.className = 'coverings-actions-switch';

	BUTTON.innerHTML = elm;

	document.getElementsByClassName('coverings-materials')[0].appendChild(BUTTON);

	return BUTTON;
});
