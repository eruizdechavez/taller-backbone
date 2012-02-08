// 
$(function() {
	
	var UserModel = Backbone.Model.extend({
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

	var UserCollection = Backbone.Collection.extend({
		model: UserModel
	});

	var users = new UserCollection();

	users.on("add remove", updateTable);

	$(".add").click(function(event) {
		var d = new Date();
		addUser({
			id: d.getTime(),
			name: $("input[name='name']").val(),
			age: parseInt($("input[name='age']").val()),
			employed: $("input[name='employed']").is(":checked") ? "Yes" : "No"
		});
	});

	$("body").on("click", ".delete", function(event){
		removeUser($(event.currentTarget).parent().parent().data("user-id"));
	});

	function addUser(data) {
		try {
			users.add(data);
		} catch (error) {
			console.log(error.message);
		}
	};

	function removeUser(userId) {
		users.remove(users.get(userId));
	};

	function updateTable() {
		var $tbody = $(".users-table tbody");
		var template = $.trim($("[data-template-name='user-row']").html() || "Row template not found!");

		$tbody.empty();

		users.each(function(user){
			$tbody.append(Mustache.render(template, user.toJSON()));
		}, this);
	};
});