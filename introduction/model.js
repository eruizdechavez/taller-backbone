// 
$(function() {
	var UserModel = Backbone.Model.extend({
		defaults: function() {
			return {
				name: "John Doe",
				age: 18 + parseInt(Math.random() * 20),
				employed: "No"
			};
		}
	});

	var user = new UserModel();

	function updateUser() {
		$("span.name").html(user.attributes.name);
		$("span.age").html(user.attributes.age);
		$("span.employed").html(user.attributes.employed);
	};

	$(".update").click(function(event) {
		user.attributes.name = $("input[name='name']").val();
		user.attributes.age = parseInt($("input[name='age']").val());
		user.attributes.employed = $("input[name='employed']").is(":checked") ? "Yes" : "No";

		updateUser();
	});

	updateUser();
});