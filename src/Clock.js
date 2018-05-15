"use strict";
(function(){
function update() {

  const sessionEnum = {
    WORK : 0,
    BREAK : 1,
    REWARD : 2
  };

  let clock = {
    workTime: 1500,
    breakTime : 300,
    rewardTime : 1800,
    numberOfSessions : 4,
    currentSessionState : sessionEnum.WORK,
    continuous : false,
    nightMode : false,
    clock : 1500,
    currentSessionTime : 1500,
    timer : null,
    fractionTimeRemaining : 1,
    sessionsRemaining : 4,
  };

  const alarm = new Audio('../lib/A-Tone-His_Self-1266414414.wav');


  $('.countDown').text((Math.floor(clock.clock/60)>9 ? (""+Math.floor(clock.clock/60)) : ("0"+Math.floor(clock.clock/60))) + ":" + (clock.clock%60>9 ? "" + clock.clock%60 : "0" + clock.clock%60));
  document.getElementById("input-work").value = 25;
  document.getElementById("input-break").value = 5;
  document.getElementById("input-reward").value = 30;
  document.getElementById("input-sessions").value = 4;

  const canvas = document.getElementById('progressBar');
  const ctx = canvas.getContext('2d');
  let imd = null;
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
  const circ = Math.PI * 2;
  const quart = Math.PI / 2;
  imd = ctx.getImageData(0, 0, 370, 370);

  updateProgress();
  setEstimatedTimeRemaining();

  function clockUpdate(){
    if (clock.clock === 0){
      switch(clock.currentSessionState){
        case sessionEnum.WORK: //work
          clock.sessionsRemaining--;
          clock.currentSessionState = sessionEnum.BREAK;
          clock.currentSessionTime = clock.breakTime;
          clock.clock = clock.breakTime;
          $('.phase').text('Break Time');
          $('.sessionRemaining').text("Sessions Remaining: " + clock.sessionsRemaining);
          break;
        case sessionEnum.BREAK: //break
          if(clock.sessionsRemaining>0){
            clock.currentSessionState = sessionEnum.WORK;
            clock.currentSessionTime=clock.workTime;
            clock.clock=clock.workTime;
            $('.phase').text('Work Time');
          } else {
            clock.currentSessionState=sessionEnum.REWARD;
            clock.currentSessionTime=clock.rewardTime;
            clock.clock=clock.rewardTime;
            $('.phase').text('Reward Time');
          }
          break;
        case sessionEnum.REWARD: //reward
          resetTimer();
          break;
      }
      if (clock.continuous === false) {
        pause();
      }
    } else {
      clock.clock--;
      if (clock.currentSessionState === sessionEnum.WORK) {
        clock.fractionTimeRemaining=clock.clock/clock.currentSessionTime;
      } else {
        clock.fractionTimeRemaining=(clock.currentSessionTime-clock.clock)/clock.currentSessionTime;
      }
    }
    updateText();
    updateProgress();
  }

  function updateProgress(){
    if (clock.clock == 0) {
      if (clock.currentSessionState==sessionEnum.WORK) {
        ctx.clearRect(0,0,370,370);
      }
      alarm.play();
    } else {
      ctx.putImageData(imd,0,0);
      ctx.beginPath();
      ctx.arc(185, 185, 170, -(quart), ((circ) * clock.fractionTimeRemaining) - quart, false);
      ctx.stroke();
    }
  }

  function updateText() {
    $('.countDown').text((Math.floor(clock.clock/60)>9?(""+Math.floor(clock.clock/60)):("0"+Math.floor(clock.clock/60)))+":"+(clock.clock%60>9?""+clock.clock%60:"0"+clock.clock%60));
    $('.title').text("Focus Time: " + (Math.floor(clock.clock/60)>9 ? (""+Math.floor(clock.clock/60)) : ("0"+Math.floor(clock.clock/60)))+":"+(clock.clock%60>9?""+clock.clock%60:"0"+clock.clock%60));
  }


  function setEstimatedTimeRemaining() {
    const endTime = new Date();
    endTime.setSeconds(endTime.getSeconds() + getTimeRemaining());
    $('.estimatedEndTime').text("Estimated End Time: " + formatAMPM(endTime));
  }

  function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
  }

  function getTimeRemaining() {
    let secondsRemaining = 0;
    switch (clock.currentSessionState) {
      case sessionEnum.WORK:
        secondsRemaining += clock.clock;
        secondsRemaining += clock.rewardTime;
        secondsRemaining += clock.breakTime;
        if (clock.sessionsRemaining == 0) {
          return secondsRemaining;
        } else {
          secondsRemaining += (clock.workTime + clock.breakTime)*(clock.sessionsRemaining-1);
          return secondsRemaining;
        }
        break;
      case sessionEnum.BREAK:
        secondsRemaining += clock.currentSessionTime-clock.clock; //Time on break clock
        secondsRemaining += clock.rewardTime; //Time in reward
        secondsRemaining += (clock.workTime + clock.breakTime)*clock.sessionsRemaining;//Number of blocks of work and break left
        return secondsRemaining;
        break;
      case sessionEnum.REWARD:
        return (clock.currentSessionTime-clock.clock); //Time on reward clock
        break;
    }
  }

  $('.play').click(function(){
    setEstimatedTimeRemaining();
    if(!clock.timer){
      clock.timer=setInterval(clockUpdate, 1000);
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
    switch(clock.currentSessionState){
      case sessionEnum.WORK:
        clock.currentSessionTime = clock.workTime;
        clock.clock = clock.workTime;
        break;
      case sessionEnum.BREAK:
        clock.currentSessionTime = clock.breakTime;
        clock.clock = clock.breakTime;
        break;
      case sessionEnum.REWARD:
        clock.currentSessionTime = clock.rewardTime;
        clock.clock = clock.rewardTime;
        break;
    }
    clock.fractionTimeRemaining=1;
    updateProgress();
    setEstimatedTimeRemaining();
    updateText();
  });

  $('.reset').click(function(){
    $(this).blur();
    resetTimer();
  });

  function pause(){
    setEstimatedTimeRemaining();
    if(clock.timer){
      clearInterval(clock.timer);
      clock.timer=null;
      $('.pause').addClass('active');
      $('.pause').blur();
      $('.play').removeClass('active');
      $('.play').blur();
      $('.reset').removeClass('active');
      $('.reset').blur();
    }
  }

  function resetTimer(){
    clearInterval(clock.timer);
    clock.timer=null;
    clock.currentSessionState=sessionEnum.WORK;
    clock.currentSessionTime=clock.workTime;
    clock.clock=clock.workTime;
    clock.sessionsRemaining=clock.numberOfSessions;
    clock.fractionTimeRemaining=1;
    updateProgress();
    setEstimatedTimeRemaining();
    $('.phase').text("Work Time");
    $('.sessionRemaining').text("Sessions Remaining: "+clock.numberOfSessions);
    $('.countDown').text((Math.floor(clock.clock/60)>9?(""+Math.floor(clock.clock/60)):("0"+Math.floor(clock.clock/60)))+":"+(clock.clock%60>9?""+clock.clock%60:"0"+clock.clock%60));
    $('.title').text("Focus Time: " + (Math.floor(clock.clock/60)>9?(""+Math.floor(clock.clock/60)):("0"+Math.floor(clock.clock/60)))+":"+(clock.clock%60>9?""+clock.clock%60:"0"+clock.clock%60));
    $('.pause').removeClass('active');
    $('.pause').blur();
    $('.play').removeClass('active');
    $('.play').blur();
    $('.reset').removeClass('active');
    $('.reset').blur();
  }

  let settings = 0;

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
      $(".settings").delay(230).css({opacity: 0, display: 'flex'}).animate({
        opacity: 1
      }, 230);
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
        clock.workTime=ui.value*60;
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
        clock.breakTime=ui.value*60;
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
        clock.rewardTime=ui.value*60;
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
        clock.numberOfSessions = ui.value;
        resetTimer();
      }
    });

  $("#input-work").bind("change paste", function() {
    clock.workTime=document.getElementById("input-work").value*60;
    $("#slider-work").slider('value',document.getElementById("input-work").value);
    resetTimer();
  });

  $("#input-break").bind("change paste", function() {
    clock.breakTime=document.getElementById("input-break").value*60;
    $("#slider-break").slider('value',document.getElementById("input-break").value);
    resetTimer();
  });

  $("#input-reward").bind("change paste", function() {
    clock.rewardTime=document.getElementById("input-reward").value*60;
    $("#slider-reward").slider('value',document.getElementById("input-reward").value);
    resetTimer();
  });

  $("#input-sessions").bind("change paste", function() {
    clock.numberOfSessions=document.getElementById("input-sessions").value;
    $("#slider-sessions").slider('value',document.getElementById("input-sessions").value);
    resetTimer();
  });

  $('[name="continuous"]').bind("change", function() {
    clock.continuous = !clock.continuous;
  });

  $('[name="nightmode"]').bind("change", function() {
      if (clock.nightMode) {
        $("body").css({"background-color":"white", "color":"black"});
      } else {
        $("body").css({"background-color":"black", "color":"white"});
      }
      clock.nightMode = !clock.nightMode;
    }
  );
}

$(document).ready(update);
})();