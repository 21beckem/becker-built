var grapeEditor;
var currentPageId;
function GrapeOnReady(editor) {
    console.log('GrapesJS Studio Editor is ready!', editor);
    addBlockyButtonToTopBar();

    grapeEditor = editor;
    grapeEditor.on('page:select', (page, previousPage) => {currentPageId = page.attributes.id; });

    // add devices
    addAddDevicesBtn();

    // add custom blocks to side panel
    addBasicDivBoxToBlockManager();
    
    // button add onclick
    grapeEditor.Commands.add('open-selected-comp-in-blockly', (e)=>{
        // open code editor and add a block for the on-click
        openBlocklyBtn(openGrapeComponent = window.lastSelectedGrapeComponent.ccid);
    });
    grapeEditor.on('component:selected', onComponentSelected);
}
GrapesJsStudioSDK.createStudioEditor({
    onReady: GrapeOnReady,
    root: '#studio-editor',
    licenseKey: '6e4c45e33f89401f91413cd8bfc327e5a16ca0aea13349f287c73cf50e3f6ea9',
    theme: 'light',
    customTheme: {
        default: {
            colors: {
                global: {
                    background1: "rgba(245, 248, 250, 1)",
                    background2: "rgba(230, 240, 250, 1)",
                    background3: "rgba(255, 255, 255, 1)",
                    backgroundHover: "rgba(225, 235, 245, 1)",
                    text: "rgba(30, 42, 53, 1)",
                    border: "rgba(200, 220, 240, 1)",
                    focus: "rgba(100, 160, 255, 0.8)",
                    placeholder: "rgba(140, 160, 180, 1)"
                },
                primary: {
                    background1: "#529bf0",
                    background3: "#82b8f5",
                    backgroundHover: "#3182e3",
                    text: "rgba(255, 255, 255, 1)"
                },
                component: {
                    background1: "rgba(180, 220, 250, 1)",
                    background2: "rgba(140, 190, 240, 1)",
                    background3: "rgba(100, 160, 230, 1)",
                    text: "rgba(30, 42, 53, 1)"
                },
                selector: {
                    background1: "rgba(90, 150, 230, 1)",
                    background2: "rgba(160, 200, 250, 1)",
                    text: "rgba(255, 255, 255, 1)"
                },
                symbol: {
                    background1: "#529bf0",
                    background2: "#4a8de6",
                    background3: "#407fdb",
                    text: "rgba(255, 255, 255, 1)"
                }
            }
        }
    },
    selectorManager: {
        componentFirst: 1,
    },
    devicePreviewMode: 0,
    canvas: {
        styles: [ 'http://127.0.0.1:5500/grape/custom-canvas-styles.css' ]
    },
    project: {
        default: {
            pages: [
                { name: 'Home', component: '<center><h1>Oh No!</h1><p>Looks like something failed when loading your project, reload to retry</p></center>' },
            ]
        }
    },
    assets: {
        storageType: 'self',
        // Provide a custom upload handler for assets
        onUpload: async ({ files }) => {
            console.log('files', files);
            const body = new FormData();
            for (const file of files) {
                body.append('files', file);
            }
            const response = await fetch('ASSETS_UPLOAD_URL', { method: 'POST', body });
            const result = await response.json();
            // The expected result should be an array of assets, eg.
            // [{ src: 'ASSET_URL' }]
            return result;
        },
        // Provide a custom handler for deleting assets
        onDelete: async ({ assets }) => {
            console.log('assets', assets);
            const body = JSON.stringify(assets);
            await fetch('ASSETS_DELETE_URL', { method: 'DELETE', body });
        }
    },
    storage: {
        type: 'self',
        // Provide a custom handler for saving the project data.
        onSave: async ({ project }) => {
            return localStorage.setItem('grapesjs-project', JSON.stringify(project));
            console.log('all Buttons', findAllButtonsPerPage(project) );
            console.log('project', project);
            throw new Error('Implement your "onSave"!');
            const body = new FormData();
            body.append('project', JSON.stringify(project));
            await fetch('PROJECT_SAVE_URL', { method: 'POST', body });
        },
        // Provide a custom handler for loading project data.
        onLoad: async () => {
            let project = localStorage.getItem('grapesjs-project') || '{}';
            project = JSON.parse(project);
            // set current page id to the first page
            currentPageId = project.pages[0].id;
            // The project JSON is expected to be returned inside an object.
            return { project };
        },
        autosaveChanges: 100,
        autosaveIntervalMs: 10000
    },
    plugins: [
        StudioSdkPlugins_tableComponent.init(),
        StudioSdkPlugins_accordionComponent.init(),
        StudioSdkPlugins_flexComponent.init(),
        StudioSdkPlugins_prosemirror.init(),
        StudioSdkPlugins_canvasGridMode.init()
    ]
});

function addBasicDivBoxToBlockManager() {
    grapeEditor.BlockManager.add('Box', {
        media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 20h20V4H2v16Zm-1 0V4a1 1 0 0 1 1-1h20a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1Z"/></svg>',
        label: 'Box',
        category: 'Basic',
        content: {
            type: 'Box',
            content: ''
        },
    });
    let addBasicBoxStylesToCanvasHeader = () => {
        let s = document.createElement('style');
        s.innerHTML = `[data-gjs-type="Box"]:empty:before {
    background-color: #ddd;
    color: #000;
    font-size: 16px;
    font-weight: bold;
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", "Open Sans", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 30px;
    padding: 0 10px;
    opacity: 0.3;
    border-radius: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    content: "Empty Box";
}`;
        document.querySelector('iframe.gjs-frame').contentWindow.document.head.appendChild(s);
    }
    grapeEditor.on('canvas:frame:load:head', addBasicBoxStylesToCanvasHeader);
    addBasicBoxStylesToCanvasHeader();
}
function addBlockyButtonToTopBar() {
    let n = document.createElement('div')
    n.classList.add('gs-cmp-tooltip', 'gs-utl-relative');
    n.innerHTML = `<span class="gs-cmp-tooltip-target gs-utl-block gs-utl-cursor-auto"><div class=""><button class="gs-utl-transition-colors gs-utl-cursor-pointer gs-utl-block gs-utl-p-1 gs-utl-text-sm gs-cmp-button gs-utl-rounded gs-theme-ring-focus focus:gs-utl-outline-none focus-visible:gs-utl-ring-2 gs-utl-ring-violet-300 gs-utl-ring-opacity-80 gs-theme-cl-bgA2" type="button" style="padding: 5px 10px; margin: 5px;" onclick="openBlocklyBtn()">Code Blocks</button></div></span>`;
    document.querySelector('.gs-cmp-editor-topbar__wrp-right.gs-utl-flex-1').firstChild.appendChild(n);
}

// add a button open code editor in the toolbar of selected elements
function onComponentSelected() {
    // get the selected componnet and its default toolbar
    const selectedComponent = grapeEditor.getSelected();
    
    // save the last selected component
    window.lastSelectedGrapeComponent = selectedComponent;

    // cancel if not a button
    // if (selectedComponent.attributes.type !== 'button') {
    //     return;
    // }
    
    // check if this command already exists on this component toolbar
    const defaultToolbar = selectedComponent.get('toolbar');
    const commandExists = defaultToolbar.some(item => item.command === 'open-selected-comp-in-blockly');
    
    // if it doesn't already exist, add it
    if (!commandExists) {
        selectedComponent.set({
            toolbar: [ ...defaultToolbar, {
                label: '<svg viewBox="0 0 24 24" role="presentation" class="gs-cmp-icon" style="width: 18px; height: 18px;"><path d="M12.89,3L14.85,3.4L11.11,21L9.15,20.6L12.89,3M19.59,12L16,8.41V5.58L22.42,12L16,18.41V15.58L19.59,12M1.58,12L8,5.58V8.41L4.41,12L8,15.58V18.41L1.58,12Z" style="fill: currentcolor;"></path></svg>',
                command: 'open-selected-comp-in-blockly'
            }]
        });
    }
}

function addAddDevicesBtn() {
    // remove all default devices

    // add device manager device
    grapeEditor.Devices.add({
        id: 'manage_devices_btn',
        name: 'Manage Devices',
    });

    // add all user-created devices.
    // If no deveices are created, add Desktop, Tablet, Mobile Landskape and Mobile Portrait

    
    // when manage devices is clicked
    grapeEditor.on('device:select', (device, previousDevice) => {
        if (device.attributes.id === 'manage_devices_btn') {
            grapeEditor.Devices.select(previousDevice.attributes.id);
            
            // create New Device Form
            let wrapper = document.createElement('div');
            wrapper.innerHTML = `<input type="text" placeholder="Device Name">`
            grapeEditor.Modal.open({
                title: 'Manage Devices',
                content: wrapper
            });
        }
    });
}