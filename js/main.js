var notes = {}, //read in notes from drive to fill this list instead of initializing as empty
    notesOrder = [],
    focusedNote = '',
    maingui,
    mainWindow,
    tray,
    fs = require('fs'),
    pj = require('../package.json');

function Note( title, isOpen, isVisible, width, height, noteId ) {
    this.title = title ? title : 'Note ' + noteId;
    this.isOpen = isOpen && true;
    this.isVisible = true;
    this.width = width ? width : 200;
    this.height = height ? height : 300;
    this.noteId = noteId;
    this.gui = maingui.Window.open('../html/note.html', {
        width: this.width,
        height: this.height,
        title: 'Note ' + noteId,
        toolbar: false, //comment this line out to easily access dev console in note windows.
        focus: true,
        min_width: 200,
        min_height: 300,
        show: false
    });
}

exports.initializeMainGui = function(gui) {
    mainWindow = gui.Window.get();
    maingui = gui;
    mainWindow.on( 'close', function() {
        fs.writeFile('./html/index.html',
            mainWindow.window.document.getElementsByTagName('html')[0].innerHTML,
            'utf8', function (err) {
                if (err) {
                    throw err;
                } else {
                    maingui.App.quit();
                }
        });

    });
    tray = new maingui.Tray({
        title: 'nwjsnote',
        tooltip: 'nwjsnote desktop note-taking app',
        icon: 'nwjsnote-light-v5-tray-16x.png'
    });
    mainWindow.show();
};

exports.setFocusedNote = function(note) {
    focusedNote = note;
};

exports.getFocusedNote = function() {
    return focusedNote;
};

exports.closeNote = function( note ) {
    notes[note].gui.close(true);
    notes[note].isOpen = false;
    exports.setFocusedNote('');
};

exports.openNote = function( note ) {
    var targetNote = notes[note];
    if ( targetNote.isOpen ) {
        targetNote.gui.focus();
    } else {
        targetNote.isOpen = true;
        targetNote.gui = maingui.Window.open('../notes/Note ' + note + '.html', {
            width: targetNote.width,
            height: targetNote.height,
            title: targetNote.title,
            toolbar: false,
            focus: true,
            min_width: 200,
            min_height: 300,
            show: false
        });
    }
    exports.setFocusedNote(note);
};

exports.setNoteTitle = function( note, title ) {
    notes[note].title = title;
};

exports.saveNote = function(noteId, note) {
    var filename = './notes/Note ' + noteId + '.html';
    fs.writeFile(filename, note, 'utf8', function (err) {
        if (err) {
            throw err;
        }
    });
};

exports.addNewNote = function() {
    var noteId = notesOrder.length;
    exports.setFocusedNote(noteId);
    exports.saveNote( noteId, '' );
    notes[noteId] = new Note( false, true, true, false, false, noteId );
    notesOrder[noteId] = noteId;

    return notes[noteId].noteId;
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
        i++;
    }
    return openList || false;
};
