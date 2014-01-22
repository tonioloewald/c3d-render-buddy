var fs = require('fs'),
    gui = require('nw.gui'),
    path = require('path'),
    home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    historyFolder = path.join(home, '/Library/Application Support/Cheetah3D/Render History');

$('#debug').on('mouseup', function(){
	gui.Window.get().showDevTools();
});

fs.readdir(historyFolder, function(err, files){
    $.each(files, function(idx, subfolder){
        subfolder = path.join(historyFolder, subfolder);
        fs.stat(subfolder, function(err, stats){
            if(!err && stats.isDirectory()){
                var thumb = path.join(subfolder, 'thumbnail.png');
                $('<div>')
                    .addClass('thumb')
                    .css('background-image', 'url("file://' + thumb + '")')
                    .appendTo('#main');
            }
        });
    });
});