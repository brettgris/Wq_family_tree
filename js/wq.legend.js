// JavaScript Document

$(document).ready(function(){
	$("#legend img").animate({top:'35px'});
	var legendUp=true;
  $("#legend img").click(function(){
    if (legendUp==false){
		$(this).animate({top:'35px'});
		$(this).attr("src", "img/legend.png");
		legendUp=true;
	}
	else {
		$(this).animate({top:'180px'});
		$(this).attr("src", "img/legend_down.png");
		legendUp=false;
	}
  });
});