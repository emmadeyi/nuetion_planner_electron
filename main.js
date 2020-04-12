const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu } = electron;

// SET ENV
process.env.NODE_ENV = 'production';


let mainWindow;

// Listen for app to be ready
app.on('ready', function () {
    // create new window
    mainWindow = new BrowserWindow({});

    // Load HTML to the created window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);
});

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            // {
            //     label: "About App"
            // },
            {
                label: 'Quit',
                accelerator: process.platforn == 'darwin' ?
                    'Command+Q' : 'ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
]

// add dev tools if not in prod
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: "Developer Tools",
        submenu: [
            {
                label: "Toggle DevTools", accelerator: process.platforn == 'darwin' ?
                    'Command+I' : 'ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                },
            },
            {
                role: 'reload'
            }
        ]
    })
}