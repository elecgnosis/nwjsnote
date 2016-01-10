var notes = {},
    notesOrder = [],
    maingui = null,
    mainguiSpecs = {},
    mainWindow = null,
    mainWindowSpecs = {},
    tray = null,
    traymenu = null,
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
            mainguiSpecs: mainguiSpecs,
            mainWindowSpecs: mainWindowSpecs
        };
    } else {
        appPayload = JSON.parse(appPayload);
        notes = appPayload.notes;
        notesOrder = appPayload.notesOrder;
        mainguiSpecs = appPayload.mainguiSpecs;
        mainWindowSpecs = appPayload.mainWindowSpecs;
    }
}

//convenient method for acting on every note in notes[].
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
}

function updateAppCache() {
    appPayload.notes = notes;
    appPayload.notesOrder = notesOrder;
    appPayload.mainguiSpecs = mainguiSpecs;
    appPayload.mainWindowSpecs = mainWindowSpecs;
    exports.localStorage.setItem('appPayload', JSON.stringify(appPayload));
}

function finalizeApp() {
    mainWindow.hide();
    actOnAllNotes(function(note) {
        note.gui.hide();
        note.isOpen = false;
    });
    updateAppCache();
}

function saveNote(noteId, noteText) {
    notes[noteId].noteText = noteText;
}

function updateNotePosition (noteId, x, y) {
    var targetNote = notes[noteId];
    targetNote.xcoord = x;
    targetNote.ycoord = y;
}

function updateNoteSize (noteId, w, h) {
    var targetNote = notes[noteId];
    targetNote.width = w;
    targetNote.height = h;
}

function closeNote ( noteId ) {
    notes[noteId].gui.close(true);
    notes[noteId].isOpen = false;
    notes[noteId].isVisible = false;
}

function makeNoteWindow( gui, note ) {
    var newWindow = gui.Window.open( '../html/note.html', {
        icon: "img/nwjsnote-light-v5-tray-32x.png",
		width: note.width,
        height: note.height,
        x: note.xcoord,
        y: note.ycoord,
        title: note.title,
        toolbar: false, //comment this line out to access dev console in note windows.
        min_width: 200,
        min_height: 300,
        show: false
    } );
    newWindow.on( 'loaded', function() {
        newWindow.window.document.getElementById('note').innerHTML = note.noteText;
        newWindow.window.document.getElementById('note').addEventListener( 'input', function() {
            saveNote( note.noteId, newWindow.window.document.getElementById('note').innerHTML);
        });
        newWindow.show();
        newWindow.focus();
    });
    newWindow.on( 'move', function(x, y) {
        updateNotePosition(note.noteId, x, y);
    });
    newWindow.on( 'resize', function(width, height) {
        updateNoteSize(note.noteId, width, height);
    });
    newWindow.on( 'blur', function() {
        updateAppCache();
    });
    newWindow.on( 'close', function() {
        closeNote( note.noteId );
    });
    return newWindow;
}

function setNoteWindowText( noteId ) {
    notes[noteId].gui.window.document.getElementById('note').innerHTML = notes[noteId].noteText;
}

function Note( noteId ) {
    this.title = 'Note ' + noteId;
    this.isOpen = true; // is this note open in the current session? initializes true.
    this.isVisible = true; // was this note open on the last session? initializes true.
    this.isDeleted = false;
    this.width = 200;
    this.height = 300;
    this.xcoord = '';
    this.ycoord = '';
    this.noteId = noteId;
    this.noteText = '';
    this.noteLink = {
        id: noteId,
        text: 'Note ' + noteId,
        onclick: 'process.mainModule.exports.openNote(' + noteId + ');',
        class: 'note-link'
    };
    this.gui = makeNoteWindow( maingui, this );
}

function showAllOpenNotes() {
    actOnAllNotes(function(note) {
        if (!note.isDeleted && note.isOpen) {
            note.gui.focus();
        }
    });
}

exports.initializeMainGui = function(gui) {
    var noteLinks = [],
        traymenuexit,
        traymenushowallopen,
        traymenuopenall;
    initializeApp();
    maingui = gui;
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

    traymenu = new maingui.Menu();
    traymenuexit = new maingui.MenuItem({label: 'Exit' });
    traymenuexit.click = function() {
        mainWindow.close();
    };
    traymenushowallopen = new maingui.MenuItem({label: 'Show All Open Notes'});
    traymenushowallopen.click = function() {
        showAllOpenNotes();
    }

    traymenu.append(traymenushowallopen);
    traymenu.append(traymenuexit);
    tray.menu = traymenu;

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

exports.getNotesOrder = function() {
    return notesOrder;
};

exports.openNote = function( noteId ) {
    var targetNote = notes[noteId];
    if ( targetNote.isOpen ) {
        targetNote.gui.focus();
    } else {
        targetNote.isOpen = true;
        targetNote.isVisible = true;
        targetNote.gui = makeNoteWindow( maingui, targetNote );
    }
};

exports.setNoteTitle = function( note, title ) {
    notes[note].title = title;
};

exports.deleteNote = function(noteId) {
    notes[noteId].isDeleted = true;
    closeNote(noteId);
};

exports.addNewNote = function() {
    var noteId = notesOrder.length,
        targetNote = {};
    notes[noteId] = new Note( noteId );
    targetNote = notes[noteId];
    notesOrder[noteId] = noteId;
    return targetNote.noteLink;
};

exports.listOpenNotes = function() {
    var openList = '';
    actOnAllNotes(function(note) {
        if (note.isOpen) {
            if ( openList === '' ) {
                openList = note.noteId.toString();
            } else {
                openList = openList + ', ' + note.noteId;
            }
        }
    });
    return openList || false;
};
