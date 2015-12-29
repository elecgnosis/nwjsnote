(function() {
    var gui = require( 'nw.gui' );
    var tray
    function init() {
        tray = new gui.Tray({
           title: 'nwjsnote',
           tooltip: 'nwjsnote',
           icon: '../img/nwjsnote-dark.png'
        });
    };
    init();
});
