var maingui = require( 'nw.gui' ),
    mainWindow = maingui.Window.get(),
    tray;

$( function() {
    process.mainModule.exports.initializeMainGui(maingui);

    // mainWindow.on('close', function() {
    //     maingui.App.quit();
    // });

    $( '#new-note' ).on( 'click', function() {
        var noteId = process.mainModule.exports.addNewNote(),
            $note = $('<div>', {
                id: noteId,
                text: 'Note ' + noteId,
                onclick: "process.mainModule.exports.openNote($(this).attr('id'));"
            });
        // 
        // $note.click(function() {
        //     console.log('Note ' + $(this).attr('id') + ' clicked.' );
        //     //handle existing note click
        //     process.mainModule.exports.openNote($(this).attr('id'));
        // });
        $( '#note-list' ).append( $note );
    });
});
