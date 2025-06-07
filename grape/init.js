var grapeEditor;
function GrapeOnReady(editor) {
    console.log('GrapesJS Studio Editor is ready!', editor);
    addBlockyButtonToTopBar();

    grapeEditor = editor;
    grapeEditor.on('page:select', (page, previousPage) => {console.log(`New page selected: ${page.attributes.id}. Previous page: ${previousPage.attributes.id}`); });
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
            console.log('all Buttons', findAllButtonsPerPage(project) );
            console.log('project', project);
            throw new Error('Implement your "onSave"!');
            const body = new FormData();
            body.append('project', JSON.stringify(project));
            await fetch('PROJECT_SAVE_URL', { method: 'POST', body });
        },
        // Provide a custom handler for loading project data.
        onLoad: async () => {
            console.log('onLoad');
            throw new Error('Implement your "onLoad"!');
            const response = await fetch('PROJECT_LOAD_URL');
            const project = await response.json();
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
    
    // cancel if not a button
    if (selectedComponent.attributes.type !== 'button') {
        return;
    }
    const defaultToolbar = selectedComponent.get('toolbar');

    // set your command and icon here
    const commandToAdd = 'tlb-settime';
    const commandIcon = 'fa fa-clock';
    
    // check if this command already exists on this component toolbar
    const commandExists = defaultToolbar.some(item => item.command === commandToAdd);
    
    // if it doesn't already exist, add it
    if (!commandExists) {
        selectedComponent.set({
            toolbar: [ ...defaultToolbar, {  attributes: {class: commandIcon}, command: commandToAdd }]
        });
    }
}