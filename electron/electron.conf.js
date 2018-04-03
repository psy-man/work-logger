const {app, BrowserWindow, ipcMain, Menu} = require('electron');
const schedule = require('node-schedule');
const {onSubmit, findIssue} = require('./server');
const url = require('url');
const path = require('path');

const isDev = process.env.DEVELOPMENT;

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: isDev ? 800 : 600,
    resizable: true,
    maximizable: false
  });

  if (isDev) {
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  win.on('closed', () => {
    win = null;
  });

  const template = [{
    label: "WT Logger",
    submenu: [
      { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
    ]}, {
    label: "Edit",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" }
    ]}
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('ready', () => {
  createWindow();
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('submit', onSubmit);
ipcMain.on('findIssue', findIssue);

const reminder = schedule.scheduleJob('00 18 * * *', function() {
  win.webContents.send('reminder');
});
