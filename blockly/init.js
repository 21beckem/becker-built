Blockly.defineBlocksWithJsonArray(CUSTOM_BLOCKS);
const workspace = Blockly.inject('blocklyDiv', {
    toolbox: TOOLBOX,
    zoom: {
        controls: true,
        wheel: true,
        startScale: 1,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
    },
    trashcan: true,
    move: {
        scrollbars: true,
        drag: true,
        wheel: true
    }
});

// autosave
let saveDelay;
const saveNow = () => {
    document.getElementById('saveBtn').disabled = true;
    const state = Blockly.serialization.workspaces.save(workspace);
    localStorage.setItem('workspace-state', JSON.stringify(state));
}
const autoSave = () => {
    document.getElementById('saveBtn').disabled = false;
    clearTimeout(saveDelay);
    saveDelay = setTimeout(saveNow, 1000);
};

// load state
async function loadState() {

    await new Promise(r => setTimeout(r, 500)); // placeholder for loading the project from a file

    const state = JSON.parse(localStorage.getItem('workspace-state'));
    if (state) {
        Blockly.serialization.workspaces.load(state, workspace);
    }
    window.dispatchEvent( new Event('blocklyLoaded') );
    document.getElementById('blocklyDiv').classList.remove('loading');
}
loadState();

// automatically disable the option to re-enable orphans
Blockly.ContextMenuRegistry.registry.getItem('blockDisable').preconditionFn = function ( /** @type {!Blockly.ContextMenuRegistry.Scope} */ scope ) {
    function isOrphan(block) {
        const parent = /** @type {Blockly.BlockSvg} */ (block.getParent());
        if (parent && isOrphan(parent)) {
            return true;
        }
        return !parent && !!(block.outputConnection || block.previousConnection);
    }
    const block = scope.block;
    if ( !block.isInFlyout && block.workspace.options.disable && block.isEditable() ) {
        if (block.getInheritedDisabled() || isOrphan(block)) {
            return 'disabled';
        }
        return 'enabled';
    }
    return 'hidden';
};

// register changelistener functions
workspace.addChangeListener((c)=>{
    Blockly.Events.disableOrphans(c);
    autoSave(c);
});

// get code
function getBlocklyCode() {
    return Blockly.JavaScript.workspaceToCode(workspace);
}