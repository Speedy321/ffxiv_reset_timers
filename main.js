var DateTime = luxon.DateTime;

var newDay = timeNowJP().startOf('day').plus({days: 1}).toUTC();
var newWeek = getNextWeekDate();
var fashionStart = getNextWeekDate().minus({days: 4});
var nextFishingBoat = getNextFishingBoat();
var jumboCactbot = getNextCactbot();

function timeNowJP() {
    return DateTime.fromObject({zone: 'Asia/Tokyo'});
}

function timeNow() {
    return timeNowJP().toUTC();
}

function getNextFishingBoat() {
    var date = timeNowJP().startOf('hour');
    if (date.hour % 2 == 0)
        return date.plus({hours: 1}).toUTC();
    else
        return date.plus({hours: 2}).toUTC();
}

function getNextCactbot() {
    var date = timeNowJP().startOf('hour');

    // We're past 'Sun 11:00' jp time but not finished the week yet.
    if (date.weekday > 7 || ((date.weekday = 7 && date.hour >= 11))){ 
        date = date.plus({week:1});
    }

    // Reset is at 11:00 jp time on Tue.
    return date.set({hour: 11, weekday: 7}).toUTC();
}

function getNextWeekDate() {
    var date = timeNowJP().startOf('hour');

    // We're past 'Tue 17:00' jp time but not finished the week yet.
    if (date.weekday > 2 || ((date.weekday = 2 && date.hour >= 17))){ 
        date = date.plus({week:1});
    }

    // Reset is at 17:00 jp time on Tue.
    return date.set({hour: 17, weekday: 2}).toUTC();
}

function getNextHousingDeadline() {
    var housingBegin = DateTime.fromISO("2022-06-13T23:59:00.000", {zone: 'Asia/Tokyo'});
    var timeSinceBegin = timeNowJP().diff(housingBegin, "days");

    var daysUntilNextLoop = (Math.ceil((timeSinceBegin.days / 9)) * 9); // Get the next multiple of 9 days.
    var nextLoopDate = housingBegin.plus({"days":daysUntilNextLoop});

    if(isHousingOpen())
        return nextLoopDate.minus({"days": 4}); // If housing is open, the next deadline is the closing after 5 days.
    else
        return nextLoopDate // Else it's the loop reset date.
}

function isHousingOpen() {
    var housingBegin = DateTime.fromISO("2022-06-13T23:59:00.000", {zone: 'Asia/Tokyo'});
    var timeSinceBegin = timeNowJP().diff(housingBegin, "days");

    if ((timeSinceBegin.days % 9) < 5) // 5 days open, the last 4 closed.
        return true;
    else
        return false;
}

function isFashionOpen() {
    var now = timeNowJP();
    if ((now >= fashionStart) && (now < newWeek))
        return true;
    else 
        return false;
}

function isCactbotEarly() {
    var now = timeNowJP();
    if ((now >= now.set({weekday: 7, hour: 11})) && (now < now.set({weekday: 7, hour: 12})))
        return true;
    else 
        return false;
}

$('#daily-card').countdown(newDay.toJSDate())
.on('update.countdown', function(event) {
    $('#daily-timer').html(event.strftime('%H:%M:%S'));

    // If in the last hour
    if (timeNow().hour == newDay.minus({hour: 1}).hour){
        $('#daily-card').removeClass('border-secondary');
        $('#daily-card').addClass('border-danger');
    }

})
.on('finish.countdown', function(event) {
    newDay = timeNowJP().startOf('day').plus({ days: 1 }).toUTC();

    $('#daily-card').countdown(newDay.toJSDate());
    $('#daily-card').countdown('start');

    $('#daily-card').removeClass('border-danger');
    $('#daily-card').addClass('border-secondary');
});

$('#weekly-card').countdown(newWeek.toJSDate())
.on('update.countdown', function(event) {
    $('#weekly-timer').html(event.strftime('%-D days, %H:%M:%S'));

    // If in the last 24h
    const hoursUntilReset = newWeek.diff(timeNow(), "hours").hours;
    if (hoursUntilReset < 24){
        $('#weekly-card').removeClass('border-secondary');
        $('#weekly-card').addClass('border-warning');
        
        // If in the last hour
        if (timeNow().hour == newWeek.minus({hour: 1}).hour){
            $('#weekly-card').removeClass('border-warning');
            $('#weekly-card').addClass('border-danger');
        }
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

    // If in the last 24h
    const hoursUntilReset = jumboCactbot.diff(timeNow(), "hours").hours;
    if (hoursUntilReset < 24){
        $('#cactbot-card').removeClass('border-secondary');
        $('#cactbot-card').addClass('border-warning');
    }
})
.on('finish.countdown', function(event) {
    jumboCactbot = getNextCactbot();
    $('#cactbot-card').countdown(jumboCactbot.toJSDate());
    $('#cactbot-card').countdown('start');
    
    $('#cactbot-card').removeClass('border-warning');
    $('#cactbot-card').addClass('border-secondary');
});

var cactbotEarly = jumboCactbot.plus({day: -7, hour: 1});
var hoursToNext = timeNow().diff(jumboCactbot, "hours").hours

if (hoursToNext > 167)
    cactbotEarly = jumboCactbot.plus({hour: 1});

$('#cactbot-early').countdown(cactbotEarly.toJSDate())
.on('update.countdown', function(event) {
    $('#cactbot-early-timer').html(event.strftime('%M:%S'));
    
    // We're in the first hour of the cactbot
    hoursToNext = jumboCactbot.diff(timeNow(), "hours").hours
    if (hoursToNext > 167){
        $('#cactbot-card').removeClass('border-secondary');
        $('#cactbot-card').addClass('border-info');

        $('#cactbot-early').removeClass('d-none');
    }
})
.on('finish.countdown', function(event) {
    cactbotEarly = jumboCactbot.plus({hour: 1});
    $('#cactbot-early').countdown(cactbotEarly.toJSDate());
    $('#cactbot-early').countdown('start');

    $('#cactbot-early').addClass('d-none');
    
    $('#cactbot-card').removeClass('border-info');
    $('#cactbot-card').addClass('border-secondary');
});

$('#fishing-card').countdown(nextFishingBoat.toJSDate())
.on('update.countdown', function(event) {
    $('#fishing-timer').html(event.strftime('%H:%M:%S'))

    // If we're not in the first 15 mins
    const minsToNextBoat = nextFishingBoat.diff(timeNow(), "minutes").minutes;
    if (minsToNextBoat < 105){
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

function setHousingTimer() {
    var nextHousingDeadline = getNextHousingDeadline()

    if(isHousingOpen()){
        $('#housing-card').removeClass('border-secondary');
        $('#housing-card').addClass('border-success');

        $('#housing-txt').html('Housing lottery is open. It will close in:')

        $('#housing-card').countdown(nextHousingDeadline.toJSDate())
        .on('update.countdown', function(event) {
            $('#housing-timer').html(event.strftime('%-D days, %H:%M:%S'))
        })
        .on('finish.countdown', function(event) {
            setHousingTimer()
        });
    } else {
        $('#housing-card').removeClass('border-success');
        $('#housing-card').addClass('border-secondary');
        
        $('#housing-txt').html('Next housing lottery opens in:')

        $('#housing-card').countdown(nextHousingDeadline.toJSDate())
        .on('update.countdown', function(event) {
            $('#housing-timer').html(event.strftime('%-D days, %H:%M:%S'))
        })
        .on('finish.countdown', function(event) {
            setHousingTimer()
        });
    }
}
setHousingTimer();

//event stuff
var fanfest = new TimeableEvent(
    "fanfest",
    "Digital Fanfest", 
    DateTime.fromObject({zone: 'America/Vancouver', month: 5, day: 14, hour: 18}).startOf('hour').toUTC(), 
    "Make sure you're up to date on the <a target='_blank' href='https://fanfest.finalfantasyxiv.com/2021/na/'>official website</a>.",
    DateTime.fromObject({zone: 'America/Vancouver', month: 5, day: 16, hour: 4}).startOf('hour').toUTC()
);

var ffestmoggle = new TimeableEvent(
    "moogletreasures",
    "Moggle Treasure Festival",
    DateTime.fromObject({zone: 'America/Vancouver', month: 5, day: 14, hour: 1}).startOf('hour').toUTC(),
    "<a target='_blank' href='https://na.finalfantasyxiv.com/lodestone/special/mogmog-collection/202105/dubrw051tv'>Lodestone page</a>.",
    DateTime.fromObject({zone: 'America/Vancouver', month: 6, day: 14, hour: 7, minute: 59}).startOf('minute').toUTC()
);

var nextLL = new TimeableEvent(
    "liveletter",
    "Live letter LXXI - patch 6.2 part 1",
    DateTime.fromObject({zone: "America/Vancouver", month: 7, day: 1, hour: 4}).startOf('hour').toUTC(),
    "<a target='_blank' href='https://na.finalfantasyxiv.com/lodestone/topics/detail/64cdbeaaa0761db550e4a143b5a8cee363c3d490'>Lodestone page</a>."
)

var freeLogin = new TimeableEvent(
    "freelog",
    "Free Login Campaign - Play up to 96 hours!",
    DateTime.fromObject({zone: "America/Vancouver", month: 6, day: 15, hour: 1}).startOf('hour').toUTC(),
    "<a target='_blank' href='https://na.finalfantasyxiv.com/lodestone/special/freelogincampaign/'>More informations</a>.",
    DateTime.fromObject({zone: "America/Vancouver", month: 6, day: 30, hour: 7, minute: 59}).startOf('minute').toUTC()
)
