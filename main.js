var DateTime = luxon.DateTime;

var newDay = timeNow().startOf('day').plus({ days: 1 });
var newWeek = getNextWeekDate();
var fashionStart = getNextWeekDate().minus({days: 4});
var nextFishingBoat = getNextFishingBoat()
var jumboCactbot = getNextCactbot()

var time = DateTime.now().plus({seconds: 10}).toJSDate();

function timeNow() {
    return DateTime.fromObject({zone: 'Asia/Tokyo'});
}

function getNextFishingBoat() {
    var date = timeNow().startOf('hour');
    if (date.hour % 2 == 0)
        return date.plus({hours: 1});
    else
        return date.plus({hours: 2});
}

function getNextCactbot() {
    var date = timeNow().startOf('hour');

    // We're past 'Sun 11:00' jp time but not finished the week yet.
    if (date.weekday > 7 || ((date.weekday = 7 && date.hour >= 11))){ 
        date = date.plus({week:1});
    }

    // Reset is at 11:00 jp time on Tue.
    return date.set({hour: 11, weekday: 7});
}

function getNextWeekDate() {
    var date = timeNow().startOf('hour');

    // We're past 'Tue 17:00' jp time but not finished the week yet.
    if (date.weekday > 2 || ((date.weekday = 2 && date.hour >= 17))){ 
        date = date.plus({week:1});
    }

    // Reset is at 17:00 jp time on Tue.
    return date.set({hour: 17, weekday: 2});
}

function isFashionOpen() {
    var now = timeNow();
    if ((now >= fashionStart) && (now < newWeek))
        return true;
    else 
        return false;
}

function isCactbotEarly() {
    var now = timeNow();
    if ((now >= now.set({weekday: 7, hour: 11})) && (now < now.set({weekday: 7, hour: 12})))
        return true;
    else 
        return false;
}

$('#daily-card').countdown(newDay.toJSDate())
.on('update.countdown', function(event) {
    $('#daily-timer').html(event.strftime('%H:%M:%S'));

    // If in the last hour
    if (timeNow().hour == newDay.hour){
        $('#daily-card').removeClass('border-secondary');
        $('#daily-card').addClass('border-danger');
    }

})
.on('finish.countdown', function(event) {
    newDay = timeNow().startOf('day').plus({ days: 1 });
    $('#daily-card').countdown(newDay.toJSDate());
    $('#daily-card').countdown('start');

    $('#daily-card').removeClass('border-danger');
    $('#daily-card').addClass('border-success');
});

$('#weekly-card').countdown(newWeek.toJSDate())
.on('update.countdown', function(event) {
    $('#weekly-timer').html(event.strftime('%-D days, %H:%M:%S'));

    // If in the last day
    if (timeNow().day == newWeek.day){
        $('#weekly-card').removeClass('border-secondary');
        $('#weekly-card').addClass('border-warning');
    }

    // If in the last hour
    if (timeNow().hour == newDay.hour){
        $('#weekly-card').removeClass('border-warning');
        $('#weekly-card').addClass('border-danger');
    }
})
.on('finish.countdown', function(event) {
    newWeek = getNextWeekDate();
    $('#weekly-card').countdown(newWeek.toJSDate());
    $('#weekly-card').countdown('start');

    $('#weekly-card').removeClass('border-danger');
    $('#weekly-card').addClass('border-secondary');
});

$('#cactbot-card').countdown(jumboCactbot.toJSDate())
.on('update.countdown', function(event) {
    $('#cactbot-timer').html(event.strftime('%-D days, %H:%M:%S'))

    // If in the last day
    if (timeNow().day == jumboCactbot.day){
        $('#cactbot-card').removeClass('border-secondary');
        $('#cactbot-card').addClass('border-info');
    }
})
.on('finish.countdown', function(event) {
    jumboCactbot = getNextCactbot();
    $('#cactbot-card').countdown(jumboCactbot.toJSDate());
    $('#cactbot-card').countdown('start');
    
    $('#cactbot-card').removeClass('border-info');
    $('#cactbot-card').addClass('border-secondary');
});

$('#cactbot-early').countdown(jumboCactbot.plus({hour: 1}).toJSDate())
.on('update.countdown', function(event) {
   $('#cactbot-early-timer').html(event.strftime('%M:%S'));

    // If in the last hour
    if (timeNow().hour == newDay.hour){
        $('#cactbot-card').removeClass('border-secondary');
        $('#cactbot-card').addClass('border-success');

        $('#cactbot-early').removeClass('d-none');
    }
})
.on('finish.countdown', function(event) {
    $('#cactbot-early').countdown(jumboCactbot.plus({hour: 1}).toJSDate());
    $('#cactbot-early').countdown('start');

    $('#cactbot-early').addClass('d-none');
    
    $('#cactbot-card').removeClass('border-success');
    $('#cactbot-card').addClass('border-secondary');
});

$('#fishing-card').countdown(nextFishingBoat.toJSDate())
.on('update.countdown', function(event) {
    $('#fishing-timer').html(event.strftime('%H:%M:%S'))

    // If we're not in the first 15 mins
    if (   ((timeNow().hour < nextFishingBoat.hour) && (timeNow().minute > 15))
        || (timeNow().hour == nextFishingBoat.minus({hour: 1}).hour)){
            $('#fishing-card').removeClass('border-success');
            $('#fishing-card').addClass('border-secondary');
    }
})
.on('finish.countdown', function(event) {
    nextFishingBoat = getNextFishingBoat();
    $('#fishing-card').countdown(nextFishingBoat.toJSDate());
    $('#fishing-card').countdown('start');
    
    $('#fishing-card').removeClass('border-secondary');
    $('#fishing-card').addClass('border-success');
});

function setFashionTimer() {
    fashionStart = getNextWeekDate().minus({days: 4});

    if(isFashionOpen()){
        $('#fashion-card').removeClass('border-secondary');
        $('#fashion-card').addClass('border-success');

        $('#fashion-txt').html('Fashion Report available for: ')

        $('#fashion-card').countdown(newWeek.toJSDate())
        .on('update.countdown', function(event) {
            $('#fashion-timer').html(event.strftime('%-D days, %H:%M:%S'))
        })
        .on('finish.countdown', function(event) {
            setFashionTimer()
        });
    } else {
        $('#fashion-card').removeClass('border-success');
        $('#fashion-card').addClass('border-secondary');
        
        $('#fashion-txt').html('Fashion Report will open in: ')

        $('#fashion-card').countdown(fashionStart.toJSDate())
        .on('update.countdown', function(event) {
            $('#fashion-timer').html(event.strftime('%-D days, %H:%M:%S'))
        })
        .on('finish.countdown', function(event) {
            setFashionTimer()
        });
    }
}
setFashionTimer();

//event stuff
var fanfest = new TimeableEvent(
    "Digital Fanfest", 
    DateTime.fromObject({zone: 'America/Vancouver', month: 5, day: 14, hour: 18}).startOf('hour'), 
    "Make sure you're up to date on the <a target='_blank' href='https://fanfest.finalfantasyxiv.com/2021/na/'>official website</a>.",
    DateTime.fromObject({zone: 'America/Vancouver', month: 5, day: 16, hour: 4}).startOf('hour')
);

var ffestmoggle = new TimeableEvent(
    "Moggle Treasure Festival",
    DateTime.fromObject({zone: 'America/Vancouver', month: 5, day: 14, hour: 1}).startOf('hour'),
    "<a target='_blank' href='https://na.finalfantasyxiv.com/lodestone/special/mogmog-collection/202105/dubrw051tv'>Lodestone page</a>.",
    DateTime.fromObject({zone: 'America/Vancouver', month: 6, day: 14, hour: 7, minute: 59}).startOf('minute')
);

var uznairphoto = new TimeableEvent(
    "Uznair Challenge",
    DateTime.fromObject({zone: 'America/Vancouver', month: 5, day: 14, hour: 1}).startOf('hour'),
    "<a target='_blank' href='https://na.finalfantasyxiv.com/lodestone/topics/detail/3dfc23b4ecdae8971145dfb67df9c3ca7a09920d'>Lodestone page</a>.",
    DateTime.fromObject({zone: 'America/Vancouver', month: 5, day: 21, hour: 7, minute: 59}).startOf('minute')
);