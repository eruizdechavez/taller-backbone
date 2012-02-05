// Example of event dispatching and handling.
$(function(){
	
	// jQuery
	$(window).on("erickrdch.sayHi", function(event, target, message){
		target.html("Howdy " + message + "!");
	});

	$(".sayHi").click(function(event){
		$(this).trigger("erickrdch.sayHi", [$(".console"), "Erick"]);
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