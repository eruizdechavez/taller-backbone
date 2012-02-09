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

	var UsersView = Backbone.View.extend({
		el: "body",

		events: {
			"click .add": "addUser"
		},

		initialize: function() {
			_.bindAll(this);

			this.model = new UserCollection();
			this.model.on("add", this.userAdded);
			this.model.on("remove", this.userRemoved);
		},

		addUser: function(event) {
			var d = new Date();
			try {
				this.model.add({
					id: d.getTime(),
					name: $("input[name='name']").val(),
					age: parseInt($("input[name='age']").val()),
					employed: $("input[name='employed']").is(":checked") ? "Yes" : "No"
				});
			} catch (error) {
				console.log(error.message);
			}
		},

		userAdded: function(user) {
			if (user.view == null) {
				user.view = new UserView({
					model: user,
					template: $.trim($("[data-template-name='user-row'] tr").html() || "Row template not found!")
				});
			}
			this.$el.find(".users-table tbody").append(user.view.render().el);
		},

		userRemoved: function(user) {
			if (user.view != null) {
				user.view.remove();
			}
			user.clear();
		}
	});

	var UserView = Backbone.View.extend({
		tagName: "tr",
		template: null,

		events: {
			"click .delete": "removeView"
		},

		initialize: function() {
			_.bindAll(this);

			this.template = this.options.template;
		},

		render: function() {
			this.$el.html(Mustache.render(this.template, this.model.toJSON()));
			return this;
		},

		removeView: function() {
			this.model.collection.remove(this.model);
		}
	});

	var view = new UsersView();
});