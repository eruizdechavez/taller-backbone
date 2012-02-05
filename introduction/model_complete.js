// 
$(function() {
	var User = Backbone.Model.extend({
		defaults: function() {
			return {
				name: "John Doe",
				age: 18 + parseInt(Math.random() * 20),
				employed: "No"
			};
		},

		validate: function(attributes) {
			if (!_.isNumber(attributes.age) || _.isNaN(attributes.age)) {
				return "Age is not a number";
			}

			if (attributes.age < 18) {
				return "Sorry, just 18 and older";
			}
		}
	});

	var user = new User();

	user.on("change", updateUser);
	
	user.on("error", function(model, error){
		console.log("Oops :'( " + error)
	});

	function updateUser() {
		$("span.name").html(user.get("name"));
		$("span.age").html(user.get("age"));
		$("span.employed").html(user.get("employed"));
	};

	$(".update").click(function(event) {
		user.set({
			name: $("input[name='name']").val(),
			age: parseInt($("input[name='age']").val()),
			employed: $("input[name='employed']").is(":checked") ? "Yes" : "No"
		});
	});

	updateUser();
});