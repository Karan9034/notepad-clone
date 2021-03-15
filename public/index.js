const { ipcRenderer } = require('electron')
var content, filename;

window.addEventListener('keydown', (e) => {
	const content = $('#content').val();
	if(filename)
		document.title = "Notepad - *" + filename
	else
		document.title = "Notepad"
	ipcRenderer.send('content', content)
})

ipcRenderer.on('open', (e, res) => {
	content = res.content
	filename = res.filename
	$('#content').val(content)
	document.title = "Notepad - " + filename
})

ipcRenderer.on('save', (e, res) => {
	filename = res
	document.title = "Notepad - " + filename	
})
