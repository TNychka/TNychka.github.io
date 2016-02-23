function settings() {
	var settings=0;
	$('.TimerNavButton').click(function(){
		if(settings!=0){
			$('.TimerNavButton').toggleClass('active');
			$('.SettingsNavButton').toggleClass('active');
			settings=0;
			$(".clock").toggle(true);
			$(".controls").toggle(true);
			$(".settings").toggle(false);
		}
	});
	
	$('.SettingsNavButton').click(function(){
		if(settings!=1){
			$('.TimerNavButton').toggleClass('active');
			$('.SettingsNavButton').toggleClass('active');
			settings=1;
			$(".clock").toggle(false);
			$(".controls").toggle(false);
			$(".settings").toggle(true);
		}
	});
	$(function(){$("#slider-work" ).slider();});
	$(function(){$("#slider-break" ).slider();});
	$(function(){$("#slider-reward" ).slider();});
	$(function(){$("#number-of-sessions" ).slider();});
	
	$("#input-work").bind("change paste", function() {
		workTime=60;
		resetTime();
	});	
}
$(document).ready(settings);