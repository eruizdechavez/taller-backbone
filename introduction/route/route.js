var router = null;

$(function() {
	router = new AppRouter();

	Backbone.history.start({
		// pushState: true,
		root: "/taller-backbone/introduction/route/"
	});
});

// User Model
var UserModel = Backbone.Model.extend({
	defaults: function() {
		var d = new Date();
		return {
			id: d.getTime(),
			name: "",
			age: 0,
			employed: ""
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

// User Collection
var UserCollection = Backbone.Collection.extend({
	model: UserModel
});

// Our actual user collection instance
var users = new UserCollection();

// A router for our app, handles changes between views
var AppRouter = Backbone.Router.extend({
	_view: null,

	_addView: null,
	_editView: null,
	_listView: null,

	routes: {
		"add": "add",
		"edit/:id": "edit",
		"*list": "list"
	},

	add: function() {
		if (this._addView == null) {
			this._addView = new AddView();
		}

		this.removeOldView();
		this._view = this._addView;
		this.renderNewView();
	},

	edit: function(id) {
		if (this._editView == null) {
			this._editView = new EditView();
		}

		this._editView.model = users.find(function(item) {
			return item.get("id") === parseInt(id);
		});

		this.removeOldView();
		this._view = this._editView;
		this.renderNewView();
	},

	list: function() {
		router.navigate("", {
			replace: true
		});

		if (this._listView == null) {
			this._listView = new ListView({
				model: users
			});
		}

		this.removeOldView();
		this._view = this._listView;
		this.renderNewView();
	},

	removeOldView: function() {
		$(".content").empty();
	},

	renderNewView: function() {
		$(".content").html(this._view.render().el)
	}
});

// List View
var ListView = Backbone.View.extend({
	template: null,

	events: {
		"click .add": "addUser"
	},

	initialize: function() {
		_.bindAll(this);
		this.template = $.trim($("[data-template-name='users-table']").html() || "Template not found!");
		this.model.on("add", this.addRow);
		this.model.on("remove", this.removeRow);
	},

	render: function() {
		this.$el.html(Mustache.render(this.template));
		this.model.each(this.addRow);
		this.delegateEvents();
		return this;
	},

	addUser: function(event) {
		router.navigate("add", {
			trigger: true
		});
	},

	addRow: function(user) {
		if (user.view == null) {
			user.view = new UserView({
				model: user,
				template: $.trim($("[data-template-name='user-row'] tr").html() || "Template not found!")
			});
		}
		this.$el.find("tbody").append(user.view.render().el);
	},

	removeRow: function(user) {
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
		"click .delete": "removeView",
		"click .edit": "editView"
	},

	initialize: function() {
		_.bindAll(this);

		this.template = this.options.template;
	},

	render: function() {
		this.$el.html(Mustache.render(this.template, this.model.toJSON()));
		this.delegateEvents();
		return this;
	},

	removeView: function() {
		this.model.collection.remove(this.model);
	},

	editView: function() {
		router.navigate("edit/" + this.model.get("id"), {
			trigger: true
		});
	}
});

var AddView = Backbone.View.extend({
	template: null,

	events: {
		"click .add": "addUser"
	},

	initialize: function() {
		_.bindAll(this);
		this.template = $.trim($("[data-template-name='user-form']").html() || "Template not found!");
	},

	render: function() {
		this.$el.html(Mustache.render(this.template, {
			buttonClass: "add",
			buttonLabel: "Add"
		}));
		this.delegateEvents();
		return this;
	},

	addUser: function() {
		try {
			users.add({
				name: $("input[name='name']").val(),
				age: parseInt($("input[name='age']").val()),
				employed: $("input[name='employed']").is(":checked") ? "Yes" : "No"
			});
			router.navigate("", {
				trigger: true
			});
		} catch (error) {
			console.log("Oops! " + error.message);
		}
	}
});

var EditView = Backbone.View.extend({
	template: null,

	events: {
		"click .update": "updateUser"
	},

	initialize: function() {
		_.bindAll(this);
		this.template = $.trim($("[data-template-name='user-form']").html() || "Template not found!");
	},

	render: function() {
		var data = _.extend({
			buttonClass: "update",
			buttonLabel: "Update"
		}, this.model.toJSON());
		this.$el.html(Mustache.render(this.template, data));
		this.delegateEvents();
		return this;
	},

	updateUser: function() {
		try {
			this.model.set({
				name: $("input[name='name']").val(),
				age: parseInt($("input[name='age']").val()),
				employed: $("input[name='employed']").is(":checked") ? "Yes" : "No"
			});
			router.navigate("", {
				trigger: true
			});
		} catch (error) {
			console.log("Oops! " + error.message);
		}
	}
});