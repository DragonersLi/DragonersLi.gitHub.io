$(function () {
    var $wrapper = $('#wrapper');

    function centerSolarSystem() {
        var scale = Math.min(1, (window.innerWidth - 24) / 1100);

        $wrapper.css({
            opacity: 1,
            zoom: 1,
            left: '50%',
            top: 'calc(50% - 32px)',
            transform: 'translate(-50%, -50%) scale(' + scale + ')',
            transformOrigin: 'center'
        });
    }

    centerSolarSystem();
    $(window).on('resize', centerSolarSystem);

    $(document).on('wheel touchmove', function (event) {
        event.preventDefault();
    });
});
