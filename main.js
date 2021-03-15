const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron')
const fs = require('fs')
const path = require('path')
let win

// =====================Window Creation======================
const createWindow = () => {
	win = new BrowserWindow({
		title: "Notepad",
		show: false,
		icon: 'icon.ico',
		webPreferences: {
			nodeIntegration: true,
			contextIsolation:false
		}
	})
	win.loadFile('public/index.html')

	Menu.setApplicationMenu(menu)
	win.on('ready-to-show', () => {
		win.show();
	})
	win.on('closed', () => {
		app.quit();
	})
	// win.webContents.on('before-input-event', (event, input) => {
	//     if (input.control && input.key.toLowerCase() === 's') {
	    	
	// 		event.preventDefault()
	//     }
	// })
}



// =====================Main Process events==================
app.on('ready', createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
    	app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
	    createWindow()
	}
})

// ==================Renderer Process events=================
let data, filename='';
ipcMain.on('content', (event, res) => {
	data = res;
})





// ======================File Handling=======================
const saveFile = () => {
	if(!filename){
		dialog.showSaveDialog({
			title: 'Select the File Path to save',
			defaultPath: path.join(__dirname),
			buttonLabel: 'Save',
			properties: []
		}).then(file => {
			if (!file.canceled) { 
	            console.log(file.filePath.toString());
	    		fs.writeFile(file.filePath.toString(), data, function (err) { 
	                if (err) throw err;
	                console.log('Saved!');
	                filename=file.filePath.toString()
	                win.webContents.send('save', filename)
	        	})
	    	}
		})
	}
	else{
		fs.writeFile(filename, data, function (err) { 
            if (err) throw err; 
            console.log('Saved!');
            win.webContents.send('save', filename)
    	})
	}
}
const newFile = () => {
	dialog.showSaveDialog({
		title: 'Create New File',
		defaultPath: path.join(__dirname),
		buttonLabel: 'Save',
		properties: []
	}).then(file => {
		if (!file.canceled) { 
            console.log(file.filePath.toString());
    		fs.writeFile(file.filePath.toString(), '', function (err) { 
                if (err) throw err; 
                console.log('Created!');
                filename = file.filePath.toString()
                data = ''
                openFile()
        	})
    	}
	})
}
const openFile = () => {
	if(!filename){
		dialog.showOpenDialog({
			title: 'Select file to open',
			defaultPath: path.join(__dirname),
			buttonLabel: 'Open',
			properties: ['openFile']
		}).then(file => {
			if (!file.canceled) { 
	            console.log(file);
	    		fs.readFile(file.filePaths[0], 'utf-8',function (err, content) { 
	                if (err) throw err;
	                filename = file.filePaths[0];
	                data = content
	                console.log('Opened', content);
	                win.webContents.send('open', {content, filename})
	        	})
	    	}
		})
	}
	else {
		fs.readFile(filename, 'utf-8',function (err, content) {
	        if (err) throw err;
	        data = content
	        console.log('Opened', content);
	        win.webContents.send('open', {content, filename})
		})
	}
}





// =====================Menu Template=========================
let template = [
	{
		label: 'File',
		submenu:[
			{
				label: 'New',
				accelerator: 'CmdOrCtrl+N',
				click: newFile
			},
			{
				label: 'Open',
				accelerator: 'CmdOrCtrl+O',
				click: () => {filename='';openFile();}
			},
			{
				label: 'Save',
				accelerator: 'CmdOrCtrl+S',
				click: saveFile
			},
			{
				label: 'Quit',
				accelerator: 'CmdOrCtrl+Q',
				click: ()=>{app.quit()}
			},
		]
	},
	{
		label: 'Edit',
		submenu: [
			{
				role: 'undo'
			},
			{
				role: 'redo'
			},
			{
				role: 'cut'
			},
			{
				role: 'copy'
			},
			{
				role: 'paste'
			}
		]
	},
	{
		label: 'About',
		submenu:[
			{
				label: 'View Source',
				click(){
					shell.openExternal('https://github.com/Karan9034/notepad-clone')
				}
			}
		]
	}
]
let menu = Menu.buildFromTemplate(template)