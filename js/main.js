var notes = {}, //read in notes from drive to fill this list instead of initializing as empty
    notesOrder = [],
    focusedNote = '',
    maingui = null,
    mainguiSpecs = {},
    mainWindow = null,
    mainWindowSpecs = {},
    tray = null,
    appPayload = {},
    LocalStorage = require('node-localStorage').LocalStorage,
    fs = require('fs'),
    pj = require('../package.json');
    exports.localStorage = new LocalStorage('./cache');

function initializeApp() {
    appPayload = exports.localStorage.getItem('appPayload');
    if (appPayload === null) {
        appPayload = {
            notes: notes,
            notesOrder: notesOrder,
            focusedNote: '',
            mainguiSpecs: mainguiSpecs,
            mainWindowSpecs: mainWindowSpecs
        };
    } else {
        appPayload = JSON.parse(appPayload);
        notes = appPayload.notes;
        notesOrder = appPayload.notesOrder;
        focusedNote = appPayload.focusedNote;
        mainguiSpecs = appPayload.mainguiSpecs;
        mainWindowSpecs = appPayload.mainWindowSpecs;
    }
}

//convenient method for acting on all notes in the notes Array.
function actOnAllNotes(action) {
    var noteId = 0;
    if (notes.hasOwnProperty(noteId)) {
        //notes has at least one entry
        if (notesOrder.length === 1) {
            //single entry, no iteration
            action(notes[noteId]);
        } else {
            //multiple entries, iterate
            for (noteId; noteId < notesOrder.length; noteId++) {
                action(notes[noteId]);
            }
        }
    }
    // } else {
    //     return false; //no entries
    // }
    // return true; //action complete
}

function updateAppCache() {
    appPayload.notes = notes;
    appPayload.notesOrder = notesOrder;
    appPayload.focusedNote = focusedNote;
    appPayload.mainguiSpecs = mainguiSpecs;
    appPayload.mainWindowSpecs = mainWindowSpecs;
    exports.localStorage.setItem('appPayload', JSON.stringify(appPayload));
}

function finalizeApp() {
    actOnAllNotes(function(note) {
        note.isOpen = false;
    });
    updateAppCache();
}

function Note( title, width, height, noteId ) {
    this.title = title || 'Note ' + noteId;
    this.isOpen = true; // is this note open in the current session? initializes true.
    this.isVisible = true; // was this note open on the last session? initializes true.
    this.isDeleted = false;
    this.width = width || 200;
    this.height = height || 300;
    this.xcoord = '';
    this.ycoord = '';
    this.noteId = noteId;
    this.noteText = '';
    this.noteLink = {
                        id: noteId,
                        text: 'Note ' + noteId,
                        onclick: "process.mainModule.exports.openNote($(this).attr('id'));",
                        class: 'note-link'
                    };
    this.gui = maingui.Window.open('../html/note.html', {
        icon: "img/nwjsnote-light-v5-tray-32x.png",
		width: this.width,
        height: this.height,
        title: 'Note ' + noteId,
        //toolbar: false, //comment this line out to access dev console in note windows.
        min_width: 200,
        min_height: 300,
        show: false
    });
}

exports.initializeMainGui = function(gui) {
    initializeApp();
    maingui = gui;
    var noteLinks = [];
    mainWindow = gui.Window.get();
    if (mainWindowSpecs.hasOwnProperty('width')
        && mainWindowSpecs.hasOwnProperty('height') ) {
            mainWindow.resizeTo(mainWindowSpecs.width, mainWindowSpecs.height);
    }
    if ( mainWindowSpecs.hasOwnProperty('xcoord')
        && mainWindowSpecs.hasOwnProperty('ycoord') ) {
            mainWindow.moveTo(mainWindowSpecs.xcoord, mainWindowSpecs.ycoord);
    }

    actOnAllNotes(function(note) {
        if (!note.isDeleted) {
            noteLinks.push(note.noteLink);
            if (note.isVisible) {
                exports.openNote(note.noteId);
            }
        }
    });
    mainWindow.on( 'close', function() {
        finalizeApp();
        maingui.App.quit();
    });
    tray = new maingui.Tray({
        title: 'nwjsnote',
        tooltip: 'nwjsnote desktop note-taking app',
        icon: 'img/nwjsnote-light-v5-tray-32x.png'
    });
    mainWindow.on( 'move', function(x, y) {
        mainWindowSpecs.xcoord = x;
        mainWindowSpecs.ycoord = y;
    });
    mainWindow.on( 'resize', function(width, height) {
        mainWindowSpecs.width = width;
        mainWindowSpecs.height = height;
    });
    mainWindow.show();
    return noteLinks;
};

exports.setFocusedNote = function(note) {
    focusedNote = note;
};

exports.getFocusedNote = function() {
    return focusedNote;
};

exports.getNotesOrder = function() {
    return notesOrder;
};

exports.closeNote = function( noteId ) {
    notes[noteId].gui.close(true);
    notes[noteId].isOpen = false;
    notes[noteId].isVisible = false;
    exports.setFocusedNote('');
};

exports.openNote = function( note ) {
    var targetNote = notes[note];
    if ( targetNote.isOpen ) {
        targetNote.gui.focus();
    } else {
        targetNote.isOpen = true;
        targetNote.isVisible = true;
        targetNote.gui = maingui.Window.open('../html/note.html', {
            icon: "img/nwjsnote-light-v5-tray-32x.png",
            width: targetNote.width,
            height: targetNote.height,
            title: targetNote.title,
            //toolbar: false,
            min_width: 200,
            min_height: 300,
            show: false
        });
        targetNote.gui.moveTo(targetNote.xcoord, targetNote.ycoord);
        targetNote.gui.on( 'loaded', function() {
            targetNote.gui.window.document.getElementById('note').innerHTML = targetNote.noteText;
            targetNote.gui.focus();
        });
        targetNote.gui.on( 'blur', function() {
            updateAppCache();
        });
        targetNote.gui.on( 'move', function(x, y) {
            targetNote.xcoord = x;
            targetNote.ycoord = y;
        });
        targetNote.gui.on( 'resize', function(width, height) {
            targetNote.width = width;
            targetNote.height = height;
        });
    }

    exports.setFocusedNote(note);
};

exports.setNoteTitle = function( note, title ) {
    notes[note].title = title;
};

exports.saveNote = function(noteId, noteText) {
    notes[noteId].noteText = noteText;
};

exports.deleteNote = function(noteId) {
    notes[noteId].isDeleted = true;
    exports.closeNote(noteId);
};

exports.addNewNote = function() {
    var noteId = notesOrder.length,
        targetNote = {};
    notes[noteId] = new Note( false, false, false, noteId );
    targetNote = notes[noteId];
    exports.setFocusedNote(noteId);
    exports.saveNote( noteId, '' );
    notesOrder[noteId] = noteId;
    targetNote.gui.on( 'loaded', function() {
        targetNote.gui.focus();
    });
    targetNote.gui.on( 'blur', function() {
        updateAppCache();
    });
    targetNote.gui.on( 'move', function(x, y) {
        targetNote.xcoord = x;
        targetNote.ycoord = y;
    });
    targetNote.gui.on( 'resize', function(width, height) {
        targetNote.width = width;
        targetNote.height = height;
    });
    return notes[noteId].noteLink;
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
