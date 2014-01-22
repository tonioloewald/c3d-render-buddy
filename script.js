var fs = require('fs'),
    gui = require('nw.gui'),
    path = require('path'),
    home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    historyFolder = path.join(home, '/Library/Application Support/Cheetah3D/Render History'),
    child_process = require('child_process');

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

fs.readdir(historyFolder, function(err, files){
    $.each(files, function(idx, subfolder){
        subfolder = path.join(historyFolder, subfolder);
        fs.stat(subfolder, function(err, stats){
            if(!err && stats.isDirectory()){
                var thumb = path.join(subfolder, 'thumbnail.png');
                $('<div>')
                    .addClass('thumb')
                    .attr('data-path', subfolder)
                    .css('background-image', 'url("file://' + thumb + '")')
                    .appendTo('#list');
            }
        });
    });
});

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
    var target = $(evt.target),
        folder = target.attr('data-path');
        
    if( target.is('.thumb') ){
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
                    .text('Open Scene in Cheetah 3D')
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