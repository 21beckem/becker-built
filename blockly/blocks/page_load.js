CUSTOM_BLOCKS.push({
	"type": "page_load",
	"tooltip": "When the selected page loads, everything under this will run.",
	"helpUrl": "",
	"message0": "%1",
	"colour": "#529CF0",
	"args0": [
		{
			"type": "field_image",
			"src": "data:image/png;base64,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",
			"width": 180,
			"height": 50,
			"alt": "*",
			"flipRtl": "FALSE"
		}
	],
	"nextStatement": null
});
javascript.javascriptGenerator.forBlock['page_load'] = function() {
	return `class PageLoad {
	static getPageStartValue() {
		let params = new URLSearchParams(window.location.search);
		let startValue = params.get('startValue');
		if (!startValue) {
			return null;
		} else {
			return decodeURIComponent( startValue );
		}
	}
}

`;
}

window.addEventListener('blocklyLoaded', () => {
	// if there isn't already a page_load block, add one
	let state = Blockly.serialization.workspaces.save(workspace);
	
	if ( !state.blocks || !state.blocks.blocks || state.blocks.blocks.filter(x=>x.type=='page_load').length < 1 ) {
		const page_load_block = workspace.newBlock('page_load');
		page_load_block.initSvg();
		page_load_block.render();
		page_load_block.setDeletable(false);
		page_load_block.translate(20,30);
	}
});