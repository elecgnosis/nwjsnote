/*globals
global, require, window, document, $, console
*/
global.notes = {}; //read in notes from drive to fill this list instead of initializing as empty
global.notesOrder = [];
global.focusedNote = '';

global.setFocusedNote = function(note) {
    global.focusedNote = note;
};

global.getFocusedNote = function() {
    return global.focusedNote;
};

global.addNewNote = function( newnote ) {
    global.notes[global.notesOrder.length] = newnote; //notesOrder.length is natural, whiles notesOrder[index] starts on 0
    global.notesOrder[global.notesOrder.length] = global.notesOrder.length;
};
