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

function finalizeApp() {
    appPayload.notes = notes;
    appPayload.notesOrder = notesOrder;
    appPayload.focusedNote = focusedNote;
    appPayload.mainguiSpecs = mainguiSpecs;
    appPayload.mainWindowSpecs = mainWindowSpecs;
    exports.localStorage.setItem('appPayload', JSON.stringify(appPayload));
}

function Note( title, isOpen, isVisible, width, height, noteId ) {
    this.title = title || 'Note ' + noteId;
    this.isOpen = isOpen && true;
    this.isVisible = isVisible || true;
    this.width = width || 200;
    this.height = height || 300;
    this.xcoord = '';
    this.ycoord = '';
    this.noteId = noteId;
    this.noteText = '';
    this.noteLink = {
                        id: noteId,
                        text: 'Note ' + noteId,
                        onclick: 'process.mainModule.exports.openNote($(this).attr("id"));',
                        class: 'note-link'
                    };
    this.gui = maingui.Window.open('../html/note.html', {
        width: this.width,
        height: this.height,
        title: 'Note ' + noteId,
        toolbar: false, //comment this line out to access dev console in note windows.
        focus: true,
        min_width: 200,
        min_height: 300,
        show: false
    });
}

exports.initializeMainGui = function(gui) {
    initializeApp();
    var noteLinks = [],
        noteId = 0;
    mainWindow = gui.Window.get();
    if (mainWindowSpecs.hasOwnProperty('width')
        && mainWindowSpecs.hasOwnProperty('height') ) {
            mainWindow.resizeTo(mainWindowSpecs.width, mainWindowSpecs.height);
    }
    if ( mainWindowSpecs.hasOwnProperty('xcoord')
        && mainWindowSpecs.hasOwnProperty('ycoord') ) {
            mainWindow.moveTo(mainWindowSpecs.xcoord, mainWindowSpecs.ycoord);
    }
    maingui = gui;
    if (notes.hasOwnProperty(noteId)) {
        if (notesOrder.length === 1) {
            noteLinks.push(notes[noteId].noteLink);
        } else {
            for (noteId; noteId < notesOrder.length; noteId++) {
                noteLinks.push(notes[noteId].noteLink);
            }
        }
    }
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
        targetNote.gui = maingui.Window.open('../html/note.html', {
            width: targetNote.width,
            height: targetNote.height,
            title: targetNote.title,
            toolbar: false,
            focus: true,
            min_width: 200,
            min_height: 300,
            show: false
        });
        targetNote.gui.on( 'loaded', function() {
            targetNote.gui.window.document.getElementById('note').innerHTML = targetNote.noteText;
            targetNote.gui.moveTo(targetNote.xcoord, targetNote.ycoord);
        });
        targetNote.gui.on( 'blur', function() {
            finalizeApp();
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

exports.addNewNote = function() {
    var noteId = notesOrder.length,
        targetNote = {};
    notes[noteId] = new Note( false, true, true, false, false, noteId );
    targetNote = notes[noteId];
    exports.setFocusedNote(noteId);
    exports.saveNote( noteId, '' );
    notesOrder[noteId] = noteId;
    targetNote.gui.on( 'blur', function() {
        finalizeApp();
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
