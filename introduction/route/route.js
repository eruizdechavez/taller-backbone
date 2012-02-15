var router = null;

$(function() {
	router = new AppRouter();
	Backbone.history.start({
		pushState: true,
		root: "/taller-backbone/introduction/route/"
	});
});

// User Model
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

// User Collection
var UserCollection = Backbone.Collection.extend({
	model: UserModel
});

var users = new UserCollection();

var AppRouter = Backbone.Router.extend({
	_view: null,
	_listView: null,
	_addView: null,
	_editView: null,

	routes: {
		"add": "add",
		"view/:id": "view",
		"edit/:id": "edit",
		"*list": "list"
	},

	add: function() {
		console.log("add");

		if (this._listView == null) {
			this._listView = new ListView({model: users});
		}

		this.removeOldView();
		this._view = this._listView;
		this.renderNewView();
	},

	view: function(id) {
		console.log("view", id);

		if (this._listView == null) {
			this._listView = new ListView({model: users});
		}

		this.removeOldView();
		this._view = this._listView;
		this.renderNewView();
	},

	edit: function(id) {
		console.log("edit", id);

		if (this._listView == null) {
			this._listView = new ListView({model: users});
		}

		this.removeOldView();
		this._view = this._listView;
		this.renderNewView();
	},

	list: function() {
		console.log("list");

		if (this._listView == null) {
			this._listView = new ListView({model: users});
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
		this.template = $.trim($("[data-template-name='users-table']").html() || "Row template not found!");
		this.model.on("add", this.addRow);
		this.model.on("remove", this.removeRow);
	},

	destroy: function() {
		this.model.off();
		this.remove();
		return this;
	},

	render: function() {
		this.$el.html(Mustache.render(this.template));
		this.model.each(this.addRow);
		this.delegateEvents();
		return this;
	},

	addUser: function(event) {
		router.navigate("add", true);
	},

	addRow: function(user) {
		if (user.view == null) {
			user.view = new UserView({
				model: user,
				template: $.trim($("[data-template-name='user-row'] tr").html() || "Row template not found!")
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

// User View
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