function update() {
    "use strict";
    var session = {
        WORK : 0,
        BREAK : 1,
        REWARD : 2
    };
    var workTime = 1500;
    var breakTime = 300;
    var rewardTime = 3600;
    var numberOfSessions = 4;
    var currentSession = session.WORK;
    var continuous = false;
    var nightMode = false;
    var clock = workTime;
    var currentSessionTime = workTime;
    var timer = null;
    var fractionTimeRemaining = 100;
    var sessionsRemaining = 4;

    var alarm = new Audio('src/A-Tone-His_Self-1266414414.wav');

    $('.countDown').text((Math.floor(clock/60)>9 ? (""+Math.floor(clock/60)) : ("0"+Math.floor(clock/60))) + ":" + (clock%60>9 ? "" + clock%60 : "0" + clock%60));
    document.getElementById("input-work").value = 25;
    document.getElementById("input-break").value = 5;
    document.getElementById("input-reward").value = 30;
    document.getElementById("input-sessions").value = 4;

    var canvas = document.getElementById('progressBar');
    var ctx = canvas.getContext('2d');
    var imd = null;
    var imdg = null;
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#99CC33';
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 15.0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 3;
    ctx.shadowColor = '#656565';
    var circ = Math.PI * 2;
    var quart = Math.PI / 2;
    imd = ctx.getImageData(0, 0, 370, 370);
    updateProgress();
    setEstimatedTimeRemaining();

    function clockUpdate(){
        if (clock === 0){
            switch(currentSession){
                case session.WORK: //work
                    sessionsRemaining--;
                    currentSession = session.BREAK;
                    currentSessionTime = breakTime;
                    clock = breakTime;
                    $('.phase').text('Break Time');
                    $('.sessionRemaining').text("Sessions Remaining: " + sessionsRemaining);
                    break;
                case session.BREAK: //break
                    if(sessionsRemaining>0){
                        currentSession = session.WORK;
                        currentSessionTime=workTime;
                        clock=workTime;
                        $('.phase').text('Work Time');
                    }else{
                        currentSession= session.REWARD;
                        currentSessionTime=rewardTime;
                        clock=rewardTime;
                        $('.phase').text('Reward Time');
                    }
                    break;
                case session.REWARD: //reward
                    resetTimer();
                    break;
            }
            if (continuous === false){
                pause();
            }
        } else{
            clock--;
            if (currentSession === session.WORK){
                fractionTimeRemaining=clock/currentSessionTime;
            } else{
                fractionTimeRemaining=(currentSessionTime-clock)/currentSessionTime;
            }
        }
        updateText();
        updateProgress();
    }

    function updateProgress(){
        if((clock==0&&currentSession==session.WORK)||(currentSession != session.WORK && clock == currentSessionTime)){
            ctx.clearRect(0,0,370,370);
            alarm.play();
        }else{
            ctx.putImageData(imd,0,0);
            ctx.beginPath();
            ctx.arc(185, 185, 170, -(quart), ((circ) * fractionTimeRemaining) - quart, false);
            ctx.stroke();
        }
    }

    function updateText() {
        $('.countDown').text((Math.floor(clock/60)>9?(""+Math.floor(clock/60)):("0"+Math.floor(clock/60)))+":"+(clock%60>9?""+clock%60:"0"+clock%60));
        $('.title').text("Focus Time: " + (Math.floor(clock/60)>9 ? (""+Math.floor(clock/60)) : ("0"+Math.floor(clock/60)))+":"+(clock%60>9?""+clock%60:"0"+clock%60));
    }


    function setEstimatedTimeRemaining() {
        var endTime = new Date();
        endTime.setSeconds(endTime.getSeconds() + getTimeRemaining());
        $('.estimatedEndTime').text("Estimated End Time: " + formatAMPM(endTime));
    }

    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        return hours + ':' + minutes + ' ' + ampm;
    }

    function getTimeRemaining() {
		var secondsRemaining = 0;
		switch (currentSession) {
			case session.WORK:
                secondsRemaining += clock;
                secondsRemaining += rewardTime;
                secondsRemaining += breakTime;
                if (sessionsRemaining == 0) {
                	return secondsRemaining;
				} else {
                    secondsRemaining += (workTime + breakTime)*(sessionsRemaining-1);
                    return secondsRemaining;
				}
				break;
			case session.BREAK:
				secondsRemaining += currentSessionTime-clock; //Time on break clock
                secondsRemaining += rewardTime; //Time in reward
                secondsRemaining += (workTime + breakTime)*sessionsRemaining;//Number of blocks of work and break left
				return secondsRemaining;
				break;
			case session.REWARD:
				return (currentSessionTime-clock); //Time on reward clock
				break;
		}
    }

    $('.play').click(function(){
        setEstimatedTimeRemaining();
        if(!timer){
            timer=setInterval(clockUpdate, 1000);
            $('.play').addClass('active');
            $('.play').blur();
            $('.pause').removeClass('active');
            $('.pause').blur();
            $('.reset').removeClass('active');
            $('.reset').blur();
        }
    });

    $('.pause').click(pause);

    $('.retry').click(function(){
        $(this).blur();
        pause();
        switch(currentSession){
            case session.WORK:
                currentSessionTime = workTime;
                clock = workTime;
                break;
            case session.BREAK:
                currentSessionTime = breakTime;
                clock = breakTime;
                break;
            case session.REWARD:
                currentSessionTime=rewardTime;
                clock=rewardTime;
                break;
        }
        updateText();
    });

    $('.reset').click(function(){
        $(this).blur();
        resetTimer();
    });

    function pause(){
        setEstimatedTimeRemaining();
        if(timer){
            clearInterval(timer);
            timer=null;
            $('.pause').addClass('active');
            $('.pause').blur();
            $('.play').removeClass('active');
            $('.play').blur();
            $('.reset').removeClass('active');
            $('.reset').blur();
        }
    }

    function resetTimer(){
        clearInterval(timer);
        timer=null;
        currentSession=session.WORK;
        currentSessionTime=workTime;
        clock=workTime;
        sessionsRemaining=numberOfSessions;
        $('.phase').text("Work Time");
        $('.sessionRemaining').text("Sessions Remaining: "+numberOfSessions);
        $('.countDown').text((Math.floor(clock/60)>9?(""+Math.floor(clock/60)):("0"+Math.floor(clock/60)))+":"+(clock%60>9?""+clock%60:"0"+clock%60));
        $('.title').text("Focus Time: " + (Math.floor(clock/60)>9?(""+Math.floor(clock/60)):("0"+Math.floor(clock/60)))+":"+(clock%60>9?""+clock%60:"0"+clock%60));
        $('.pause').removeClass('active');
        $('.pause').blur();
        $('.play').removeClass('active')
        $('.play').blur();
        $('.reset').removeClass('active')
        $('.reset').blur();
        fractionTimeRemaining=100;
        updateProgress();
        setEstimatedTimeRemaining();
    }

    var settings=0;

    $('.TimerNavButton').click(function(){
        if(settings!=0){
            $('.TimerNavButton').toggleClass('active');
            $('.SettingsNavButton').toggleClass('active');
            settings=0;
            $(".clock").delay(230).fadeIn("fast");
            $(".controls").delay(230).fadeIn("fast");
            $(".settings").fadeOut("fast");
        }
    });

    $('.SettingsNavButton').click(function(){
        if(settings!=1){
            pause();
            $('.TimerNavButton').toggleClass('active');
            $('.SettingsNavButton').toggleClass('active');
            settings=1;
            $(".clock").fadeOut("fast");
            $(".controls").fadeOut("fast");
            $(".settings").delay(230).fadeIn("fast").css("display", "flex");
        }
    });

    $("#slider-work" ).slider(
        {
            value:25,
            min:1,
            max:60,
            step:1,
            slide: function(event,ui){
                document.getElementById("input-work").value=ui.value;
                workTime=ui.value*60;
                resetTimer();
            }
        });

    $("#slider-break" ).slider(
        {
            value:5,
            min:1,
            max:60,
            step:1,
            slide: function(event,ui){
                document.getElementById("input-break").value=ui.value;
                breakTime=ui.value*60;
                resetTimer();
            }
        });

    $("#slider-reward" ).slider(
        {
            value:30,
            min:1,
            max:60,
            step:1,
            slide: function(event,ui){
                document.getElementById("input-reward").value=ui.value;
                rewardTime=ui.value*60;
                resetTimer();
            }
        });

    $("#slider-sessions" ).slider(
        {
            value:4,
            min:1,
            max:10,
            step:1,
            slide: function(event,ui){
                document.getElementById("input-sessions").value=ui.value;
                numberOfSessions = ui.value;
                resetTimer();
            }
        });

    $("#input-work").bind("change paste", function() {
        workTime=document.getElementById("input-work").value*60;
        $("#slider-work").slider('value',document.getElementById("input-work").value);
        resetTimer();
    });

    $("#input-break").bind("change paste", function() {
        breakTime=document.getElementById("input-break").value*60;
        $("#slider-break").slider('value',document.getElementById("input-break").value);
        resetTimer();
    });

    $("#input-reward").bind("change paste", function() {
        rewardTime=document.getElementById("input-reward").value*60;
        $("#slider-reward").slider('value',document.getElementById("input-reward").value);
        resetTimer();
    });

    $("#input-sessions").bind("change paste", function() {
        numberOfSessions=document.getElementById("input-sessions").value;
        $("#slider-sessions").slider('value',document.getElementById("input-sessions").value);
        resetTimer();
    });

    $('[name="continuous"]').bind("change", function() {
        continuous = !continuous;
    });

    $('[name="nightmode"]').bind("change", function() {
            if (nightMode) {
                $("body").css({"background-color":"white", "color":"black"});
            } else {
                $("body").css({"background-color":"black", "color":"white"});
            }
            nightMode = !nightMode;
        }
    );
}

$(document).ready(update);
