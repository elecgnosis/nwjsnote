/*globals
global, require, window, document, $, console
*/
var gui = require( 'nw.gui' ),
    notegui = gui.Window.get(),
    noteid,
    note,
    noteText;
$(function() {
    if ( !$('.note-id').attr('id') ) {
        noteid = process.mainModule.exports.getFocusedNote();
        $('.note-id').attr('id', noteid);
    } else {
        noteid = $('.note-id').attr('id');
    }
    note = $('html');
    noteText = $('#note');

    notegui.on( 'close', function() {
        process.mainModule.exports.closeNote(noteid);
        notegui.close(true);
    });

    $(window).on( 'focus', function() {
        process.mainModule.exports.setFocusedNote(noteid);
    });

    function updateNote(data) {
        console.log($('html').html());
        //open a new file if necessary, then save continually to it
    };

    noteText.on( 'input', function() {
        updateNote();
    });

    noteText.keydown(function(e) {
    // trap the return key being pressed
    if (e.keyCode === 13) {
      // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
      document.execCommand('insertHTML', false, '<br><br>');
      // prevent the default behaviour of return key pressed
      return false;
    }
  });
});
