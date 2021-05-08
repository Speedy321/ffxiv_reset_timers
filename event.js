var DateTime = luxon.DateTime;

function timeNow() {
    return DateTime.fromObject({zone: 'Asia/Tokyo'});
}

class TimeableEvent {
    constructor(eventName, startDate, htmlDesc, endDate=null){
        this.name = eventName.replace(/\s+/g, '-');
        this.startDate = startDate;
        this.endDate = endDate;
        this.txtWaiting = eventName + " starts in:";
        this.txtRunning = eventName + " ends in:";
        this.desc = htmlDesc;

        this.cardID = this.name + "-card";
        this.timerID = this.name + "-timer";
        this.txtID = this.name + "-txt";

        this.makeDomRepr();
        $('#'+this.cardID).ready(this.addEventTimer(this));
    }

    addEventTimer(timeableEvent) {
        if(timeNow() < timeableEvent.startDate){
            $("#"+timeableEvent.cardID).countdown(timeableEvent.startDate.toJSDate())
            .on('update.countdown', function(event) {
                $("#"+timeableEvent.timerID).html(event.strftime('%-D days, %H:%M:%S'))
            })
            .on('finish.countdown', function(event) {
                if (timeableEvent.endDate != null){
                    $("#"+timeableEvent.cardID).countdown(timeableEvent.endDate.toJSDate())
                    .on('finish.countdown', function(event) { $("#"+timeableEvent.cardID).addClass('d-none'); });
                    $("#"+timeableEvent.cardID).countdown('start');
                
                    $("#"+timeableEvent.cardID).removeClass('border-secondary');
                    $("#"+timeableEvent.cardID).addClass('border-success');
                
                    $("#"+timeableEvent.txtID).html(timeableEvent.txtRunning);
                } else
                $("#"+timeableEvent.cardID).addClass('d-none');
            });
        } else if(timeNow() < timeableEvent.endDate){
            $("#"+timeableEvent.cardID).countdown(timeableEvent.endDate.toJSDate())
            .on('update.countdown', function(event) { $("#"+timeableEvent.timerID).html(event.strftime('%-D days, %H:%M:%S')) })
            .on('finish.countdown', function(event) { $("#"+timeableEvent.cardID).addClass('d-none'); });

            $("#"+timeableEvent.cardID).removeClass('border-secondary');
            $("#"+timeableEvent.cardID).addClass('border-success');

            $("#"+timeableEvent.txtID).html(timeableEvent.txtRunning);
        } else
        $("#"+timeableEvent.cardID).addClass('d-none');
    }

    makeDomRepr() {
        this.card = $('<div></div>', {
            "id": (this.cardID),
            "class": "card border-secondary",
        }).appendTo('#timer-list');

        var headerBtn = $('<button></button>', {
            "class": "btn card-header",
            "data-toggle": "collapse",
            "data-target": "#collapse-" + this.name,
            "aria-expanded": "true",
            "aria-controls": "collapse-" + this.name
        }).appendTo(this.card);

        var header = $('<div></div>', {"id": "heading-" + this.name, "class": "row"}).appendTo(headerBtn);
        this.timerTxt = $('<h4 id="' + this.txtID + '" class="col">'+this.txtWaiting+'</h4>').appendTo(header);
        this.timer = $('<h4></h4>', { "id": this.timerID, "class": "col text-primary font-weight-bold"}).appendTo(header);

        var collapse = $('<div></div>', {
            "id":"collapse-" + this.name, 
            "class": "collapse hide", 
            "aria-labelledby": "heading-" + this.name,
            "data-parent": "#accordion"
        }).appendTo(this.card);

        var body = $('<div></div>', { "class": "card-body"}).appendTo(collapse);
        $('<p>'+this.desc+'</p>').appendTo(body);
    }
}