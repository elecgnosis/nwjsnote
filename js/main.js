/*globals
global, require, window, document, $, console, exports, process
*/
var notes = {}, //read in notes from drive to fill this list instead of initializing as empty
    notesOrder = [],
    focusedNote = '',
    fs = require('fs');
exports.setFocusedNote = function(note) {
    focusedNote = note;
};

exports.getFocusedNote = function() {
    return focusedNote;
};

exports.closeNote = function( note ) {
    notes[note].isOpen = false;
    exports.setFocusedNote('');
};

exports.openNote = function( note ) {
    //check to see if the note is already open. If it is, focus that window.
    //Otherwise, open the note and give it focus.
};

exports.setNoteTitle = function( note, title ) {
    notes[note].title = title;
};

exports.addNewNote = function() {
    var noteId = notesOrder.length,
        defaultTitle = ('Note ' + noteId),
        newnote = {},
        gui = window.require('nw.gui');
    exports.setFocusedNote(noteId);
    newnote = {
        title: '',
        isOpen: true,
        isVisible: true,
        gui: gui.Window.open('../html/note.html', {
            width: 200,
            height: 300,
            //toolbar: false, //comment this line out to easily access dev console in note windows.
            title: defaultTitle
        })
    };
    notes[noteId] = newnote; //notesOrder.length is natural, whiles notesOrder[index] starts on 0
    notesOrder[noteId] = noteId;
    return defaultTitle;
};

exports.saveNote = function(noteid, note) {
    var filename = './notes/Note ' + noteid + '.html';
    fs.writeFile(filename, note, 'utf8', function (err) {
        if (err) {
            throw err;
        }
    });
};

exports.listOpenNotes = function() {
    var i = 0,
        openList = '';
    for (i in notes) {
        if (notes.hasOwnProperty(i)) {
            if (notes[i].isOpen) {
                if ( openList === '' ) {
                    openList = i;
                } else {
                    openList = openList + ', ' + i;
                }
            }
        }
        i++
    }
    return openList || false;
};
