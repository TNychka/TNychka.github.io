function update() {
    "use strict";
	var workTime = 1500;
	var breakTime = 300;
	var rewardTime = 3600;
	var numberOfSessions = 4;
	var currentSession = 0; //work 0, break 1, reward 2
	var continuous = false;
	var clock = workTime;
	var currentSessionTime = workTime;
	var timer = null;
	var currentProgress = 100;
	var interval = 1000;
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

	function clockUpdate(){
		if (clock === 0){
			switch(currentSession){
				case 0: //work
					sessionsRemaining--;
					currentSession = 1;
					currentSessionTime = breakTime;
					clock = breakTime;
					$('.phase').text('Break Time');
					$('.sessionRemaining').text("Sessions Remaining: " + sessionsRemaining);
				break;
				case 1: //break
					if(sessionsRemaining>0){
						currentSession=0;
						currentSessionTime=workTime;
						clock=workTime;
						$('.phase').text('Work Time');
					}else{
						currentSession=2;
						currentSessionTime=rewardTime;
						clock=rewardTime;
						$('.phase').text('Reward Time');
					}
				break;
				case 2: //reward
					resetTimer();
				break;
			}
			if (continuous === false){
				pause();
			}
		} else{
			clock--;
			if (currentSession === 0){
				currentProgress=clock/currentSessionTime;
			} else{
				currentProgress=(currentSessionTime-clock)/currentSessionTime;
			}
		}
		updateText();
		updateProgress();
	};

	function updateProgress(){
		if((clock==0&&currentSession==0)||(currentSession != 0 && clock == currentSessionTime)){
			ctx.clearRect(0,0,370,370);
            alarm.play()
		}else{
			ctx.putImageData(imd,0,0);
			ctx.beginPath();
			ctx.arc(185, 185, 170, -(quart), ((circ) * currentProgress) - quart, false);
			ctx.stroke();
		}
	}

    function updateText() {
        $('.countDown').text((Math.floor(clock/60)>9?(""+Math.floor(clock/60)):("0"+Math.floor(clock/60)))+":"+(clock%60>9?""+clock%60:"0"+clock%60));
		$('.title').text("Focus Time: " + (Math.floor(clock/60)>9 ? (""+Math.floor(clock/60)) : ("0"+Math.floor(clock/60)))+":"+(clock%60>9?""+clock%60:"0"+clock%60));
    }

	$('.play').click(function(){
		if(!timer){
			timer=setInterval(clockUpdate, interval);
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
				case 0:
					currentSessionTime = workTime;
					clock = workTime;
				break;
				case 1:
					currentSessionTime = breakTime;
					clock = breakTime;
				break;
				case 2:
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
		currentSession=0;
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
		currentProgress=100;
		updateProgress();
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
			$(".settings").delay(230).fadeIn("fast");
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

	$("#number-of-sessions" ).slider(
	{
		value:4,
		min:1,
		max:10,
		step:1,
		slide: function(event,ui){
			document.getElementById("input-sessions").value=numberOfSessions=ui.value;
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
		numberOfSessions=document.getElementById("input-sessions").value*60;
		$("#slider-sessions").slider('value',document.getElementById("input-sessions").value);
		resetTimer();
	});

	$('[name="continuous"]').bind("change", function() {
		continuous = !continuous;
	});

    var nightMode = false;
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
