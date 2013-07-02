function setAlarm(callback, date) {
    var now = new Date();
    return setTimeout(callback, date - now);
}

function clickOnSet(setIndex) {
    var $cardEls = $('.cards-in-play .card');
    var cards = $cardEls.map(function () {
        return JSON.parse($(this).attr('json'));
    });
    var sets = [];
    for (var i = 0; i < 12; i++) {
        for (var j = i + 1; j < 12; j++) {
            for (var k = j + 1; k < 12; k++) {
                A = cards[i].attributes;
                B = cards[j].attributes;
                C = cards[k].attributes;
                if ((A[0] + B[0] + C[0]) % 3 == 0 && (A[1] + B[1] + C[1]) % 3 == 0 && (A[2] + B[2] + C[2]) % 3 == 0 && (A[3] + B[3] + C[3]) % 3 == 0) {
                    console.log((i + 1) + ',' + (j + 1) + ',' + (k + 1));
                    sets.push([i, j, k]);
                };
            }
        }
    }

    setIndex = setIndex || 0;

    if (sets.length <= setIndex) {
        console.log('No sets');
        return;
    }

    for (var i = 0; i < sets[setIndex].length; i++) {
        $($cardEls[sets[setIndex][i]]).trigger('mousedown');
    }
}

var stop = false;

function clickOnSetEvery(ms, setIndex) {
    stop = false;
    var now = new Date();
    var timeToWait = ms - (now.getTime() % ms);
    setTimeout(function() {
        if (stop) {
            return;
        }
        clickOnSet();
        clickOnSetEvery(ms, setIndex);
    }, timeToWait);
}