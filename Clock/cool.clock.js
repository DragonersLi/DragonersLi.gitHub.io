document.addEventListener('DOMContentLoaded', function(){
    var date = new Date(),
        time = {
            s : date.getSeconds(),
            m : date.getMinutes(),
            h : date.getHours()
        },
        hands = {
            s : document.querySelector('#secondHand-layer'),
            m : document.querySelector('#minuteHand-layer'),
            h : document.querySelector('#hourHand-layer')
        },
        angle = {
            s : 360/60*time.s,
            m : 360/60*(time.m+time.s/60),
            h : 360/12*(time.h+time.m/60+time.s/3600)
        },
    clock = document.querySelector('#clock');

    /*** Chrome,Safari ***/
    hands.s.style.webkitTransform = 'rotate(' + angle.s + 'deg)';
    hands.m.style.webkitTransform = 'rotate(' + angle.m + 'deg)';
    hands.h.style.webkitTransform = 'rotate(' + angle.h + 'deg)';
    /***    FireFox    ***/
    hands.s.style.mozTransform    = 'rotate(' + angle.s + 'deg)';
    hands.m.style.mozTransform    = 'rotate(' + angle.m + 'deg)';
    hands.h.style.mozTransform    = 'rotate(' + angle.h + 'deg)';
    /***     IE10+     ***/
    hands.s.style.msTransform     = 'rotate(' + angle.s + 'deg)';
    hands.m.style.msTransform     = 'rotate(' + angle.m + 'deg)';
    hands.h.style.msTransform     = 'rotate(' + angle.h + 'deg)';
    /***     Opera     ***/
    hands.s.style.oTransform      = 'rotate(' + angle.s + 'deg)';
    hands.m.style.oTransform      = 'rotate(' + angle.m + 'deg)';
    hands.h.style.oTransform      = 'rotate(' + angle.h + 'deg)';
    /*** Other Browser ***/
    hands.s.style.transform       = 'rotate(' + angle.s + 'deg)';
    hands.m.style.transform       = 'rotate(' + angle.m + 'deg)';
    hands.h.style.transform       = 'rotate(' + angle.h + 'deg)';

    clock.classList.add('move');
}, false);