var maingui = require( 'nw.gui' ),
    mainWindow = maingui.Window.get(),
    tray,
    noteLinks =[],
    iterator = 0;

//jQuery document ready shorthand
$( function() {
    noteLinks = process.mainModule.exports.initializeMainGui(maingui);
    if (noteLinks.length === 1) {
        $( '#note-list' ).append( $('<div>', noteLinks[0]) );
    } else {
        for (iterator; iterator < noteLinks.length; iterator++) {
            $( '#note-list' ).append( $('<div>', noteLinks[iterator]) );
        }
    }
    $( '#new-note' ).on( 'click', function() {
        $( '#note-list' ).append( $('<div>', process.mainModule.exports.addNewNote() ) );
    });
});
