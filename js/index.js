var maingui = require( 'nw.gui' ),
    mainWindow = maingui.Window.get(),
    tray,
    noteLinks =[],
    iterator = 0;
function DeleteNoteLink(noteId) {
    return $( '<span>', {
        id: 'delete-' + noteId,
        html: '(Delete)&nbsp;',
        onclick: 'deleteNoteLink(' + noteId + ');',
        class: 'delete-note-link'
    });
}

function deleteNoteLink(noteId) {
    $( '#' + noteId ).next().remove();
    $( '#' + noteId ).remove();
    $( '#delete-' + noteId ).remove();
    process.mainModule.exports.deleteNote(noteId);
}

//jQuery document ready shorthand
$( function() {
    var $noteList = $('#note-list');
    noteLinks = process.mainModule.exports.initializeMainGui(maingui);

    if (noteLinks.length === 1) {
        $noteList.append( new DeleteNoteLink(noteLinks[0].id) );
        $noteList.append( $('<div>', noteLinks[0]) );
        $noteList.append( $('<br>') );
    } else {
        for (iterator; iterator < noteLinks.length; iterator++) {
            $noteList.append( new DeleteNoteLink(noteLinks[iterator].id) );
            $noteList.append( $('<div>', noteLinks[iterator]) );
            $noteList.append( $('<br>') );
        }
    }
    $( '#new-note' ).on( 'click', function() {
        var $noteLink = $('<div>', process.mainModule.exports.addNewNote());
        $noteList.append( new DeleteNoteLink($noteLink.attr('id') ) );
        $noteList.append( $noteLink );
        $noteList.append( $('<br>') );
    });
});
