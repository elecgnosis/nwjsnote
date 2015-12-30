/*globals
global, require, window, document, $, console
*/
var gui = require( 'nw.gui' ),
    maingui = gui.Window.get(),
    tray;
    
function init() {
    tray = new gui.Tray({
        title: 'nwjsnote',
        tooltip: 'nwjsnote',
        icon: '../img/nwjsnote-dark.png'
    });
}
init();

$( function() {
    //close all note windows when the main program window is closed.
    maingui.on('close', function() {
        gui.App.quit();
    });

    $( '#new-note' ).on( 'click', function() {
        var defaultTitle = process.mainModule.exports.addNewNote(),
            $note = $('<div>', {
                id: defaultTitle.split(' ')[1],
                text: defaultTitle
            });

        $note.click(function() {
            console.log('Note ' + $(this).attr('id') + ' clicked.' );
            //handle existing note click
        });
        $( '#note-list' ).append( $note );
    });
});
