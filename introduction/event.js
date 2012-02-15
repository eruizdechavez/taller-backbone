// Example of event dispatching and handling.
$(function(){
	
	// jQuery
	$(window).on("erickrdch.sayHi", function(event, target, message, dude){
		target.html("Howdy " + message + "!");
		alert("En el Window");
	});

	$(".buttonCont").on("erickrdch.sayHi", function(event){
		$(this).css("background-color", "#bada55");
		alert("En el Div");
	});

	$("body").on("erickrdch.sayHi", function(event, target, message, dude){
		$(this).css("background-color", "#cccccc");
		alert("En el Body");
	});

	$(".sayHi").click(function(event){
		$(this).trigger("erickrdch.sayHi", [$(".console"), "Erick", "blashadow"]);
	});


	// Backbone
	var controller = _.extend({}, Backbone.Events);
	controller.on("erickrdch.sayBye", function(target, message){
		target.html("Come back soon " + message + "!");
	});

	$(".sayBye").click(function(event){
		controller.trigger("erickrdch.sayBye", $(".console"), "Erick");
	});
});