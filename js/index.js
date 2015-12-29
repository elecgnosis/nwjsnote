/*globals
global, require, window, document, $, console
*/
var gui = require( 'nw.gui' ),
    maingui = gui.Window.get(),
    tray,
    NOTE_TEXT = 'note text',
    NOTE_TITLE = 'note title',
    newnote = {
        NOTE_TEXT: '',
        NOTE_TITLE: ''
    };

function init() {
    tray = new gui.Tray({
        title: 'nwjsnote',
        tooltip: 'nwjsnote',
        icon: '../img/nwjsnote-dark.png'
    });
}
init();

$( function() {
    $( '#new-note' ).on( 'click', function() {
        var defaultTitle = 'Note ' + global.notesOrder.length;
        global.addNewNote(newnote);
        global.setFocusedNote( global.notesOrder.length - 1 );
        $( '#note-list' ).append( '<a href="../notes/'
            + (global.notesOrder.length - 1)
            + '.html"><div id="'
            + defaultTitle
            + '" target="_blank">'
            + defaultTitle
            + '</div></a>' );
        gui.Window.open('../html/note.html', {
            width: 200,
            height: 300,
            //toolbar: false,
            title: defaultTitle
        });
    });
});
