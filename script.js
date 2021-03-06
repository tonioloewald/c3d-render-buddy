var version = "C3D Buddy 2.0.1",
    fs = require('fs'),
    gui = require('nw.gui'),
    path = require('path'),
    home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    historyFolder = path.join(home, '/Library/Application Support/Cheetah3D/Render History'),
    child_process = require('child_process');

$('#version').text(version);

function exec(cmd){
    child_process.exec(cmd, function(error, stdout, stderr){
        error = error 
            ?   {
                    error: error,
                    stderr: stderr
                } 
            : 'no error';
        console.log(cmd, stdout, error);
    });
}

$('#debug').on('mouseup', function(){
	gui.Window.get().showDevTools();
});

$('a[target="_blank"]').on('click', function(evt){
	evt.preventDefault();
	console.log(gui, $(this).attr('href'));
	gui.Shell.openExternal($(this).attr('href'));
});

/*
var win = gui.Window.get();
var menubar = new gui.Menu({ type: "menubar" });
win.menu = menubar;
*/

var menu = new gui.Menu();
menu.append( new gui.MenuItem({ 
        label: "Reload",
        click: loadHistory
    }) );
document.body.addEventListener('contextmenu', function(ev) { 
  ev.preventDefault();
  menu.popup(ev.x, ev.y);
  return false;
});

function loadHistory(){
    fs.readdir(historyFolder, function(err, files){
        $('#list').empty();
        
        $.each(files, function(idx, subfolder){
            subfolder = path.join(historyFolder, subfolder);
            fs.stat(subfolder, function(err, stats){
                if(!err && stats.isDirectory()){
                    var image = path.join(subfolder, 'thumbnail.png');
                
                    if( !fs.existsSync(image) ){
                        image = path.join(subfolder, 'image.png');
                    } else if( !fs.existsSync(image) ){
                        image = path.join(subfolder, 'image_00000.png');
                    }
                
                    $('<div>')
                        .addClass('thumb')
                        .attr('data-path', subfolder)
                        .append('<span></span><img src="file://' + image + '">')
                        .prependTo('#list');
                }
            });
        });
    });
}

loadHistory();

/**
    renders a simple table from an plist's dict key/value pairs
*/
function renderDict(infoPath){
    var info = $(fs.readFileSync(infoPath, {encoding: 'utf8'})).find('dict'),
        table = $('<table>');
        
    info.find('text').remove();

    $.each(info.find('key'), function(){
        var term = $(this).text(),
            description = $(this).next().text(),
            tr = $('<tr>')
        $('<th>')
            .text(term)
            .appendTo(tr);
        $('<td>')
            .text(description)
            .appendTo(tr);
        tr.appendTo(table);
        if( term === 'filename' ){
            table.attr('data-orig-file', description);
        }
    });
    
    return table;
}

$(window).on('mouseup', function(evt){
    var target = $(evt.target).closest('.thumb'),
        folder = target.attr('data-path');
        
    if( target.length ){
        var imagePath = path.join(folder, 'image.png'),
            framePath = path.join(folder, 'image_00000.png'),
            moviePath = path.join(folder, 'movie.mov'),
            infoPath = path.join(folder, 'info.plist'),
            table = renderDict(infoPath),
            origFile = table.attr('data-orig-file'),
            preview = $('#preview').empty();
        
        if( fs.existsSync(imagePath) ){
            $('<img>')
                .attr('src', 'file://' + imagePath)
                .appendTo(preview);
            table.appendTo(preview);
            $('<button>')
                .text('Open Image')
                .on('click', function(){
                    exec('open "' + imagePath + '"');
                })
                .appendTo(preview);
        }
        
        if( fs.existsSync(framePath) ){
            $('<img>')
                .attr('src', 'file://' + framePath)
                .appendTo(preview);
            table.appendTo(preview);
            $('<button>')
                .text('Open Movie')
                .on('click', function(){
                    exec('open "' + moviePath + '"');
                })
                .appendTo(preview);
        }
        
        if(origFile){
            if( fs.existsSync( origFile ) ){                
                $('<button>')
                    .text('Open Scene')
                    .on('click', function(){
                        exec('open "' + origFile + '"');
                    })
                    .appendTo(preview);
            } else {
                $('<i>')
                    .text('File no longer exists')
                    .appendTo(preview);
            }
        }
        
        $('<button>')
            .text('Reveal Folder')
            .on('click', function(){
                exec('open "' + folder + '"');
            })
            .appendTo(preview);
	}
});