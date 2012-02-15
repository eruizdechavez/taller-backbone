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
		return {
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

var users = new UserCollection();

var AppRouter = Backbone.Router.extend({
	_view: null,

	_addView: null,
	_editView: null,
	_detailView: null,
	_listView: null,

	routes: {
		"add": "add",
		"edit/:id": "edit",
		"detail/:id": "detail",
		"*list": "list"
	},

	add: function() {
		console.log("add");

		if (this._addView == null) {
			this._addView = new AddView();
		}

		this.removeOldView();
		this._view = this._addView;
		this.renderNewView();
	},

	edit: function(id) {
		console.log("edit", id);

		if (this._editView == null) {
			this._editView = new EditView();
		}

		this.removeOldView();
		this._view = this._editView;
		this.renderNewView();
	},

	detail: function(id) {
		console.log("detail", id);

		if (this._detailView == null) {
			this._detailView = new DetailView();
		}

		this.removeOldView();
		this._view = this._detailView;
		this.renderNewView();
	},

	list: function() {
		console.log("list");

		router.navigate("", {replace: true});

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
		this.template = $.trim($("[data-template-name='users-table']").html() || "Row template not found!");
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

var AddView = Backbone.View.extend({
	template: null,

	events: {
		"click .add": "addUser"
	},

	initialize: function() {
		_.bindAll(this);
		this.template = $.trim($("[data-template-name='user-form']").html() || "Row template not found!");
	},

	render: function() {
		this.$el.html(Mustache.render(this.template));
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
			router.navigate("", {trigger: true});
		} catch (error) {
			console.log("Oops! " + error.message);
		}
	}
});

var EditView = Backbone.View.extend({
	template: null,

	events: {
		"click .add": "saveUser"
	},

	initialize: function() {
		_.bindAll(this);
		this.template = $.trim($("[data-template-name='user-form']").html() || "Row template not found!");
	},

	render: function() {
		this.$el.html(Mustache.render(this.template, this.model.toJSON()));
		this.delegateEvents();
		return this;
	},

	saveUser: function() {
		
	}
});

var DetailView = Backbone.View.extend({
	template: null,

	events: {
		// "click .add": "addUser"
	},

	initialize: function() {
		_.bindAll(this);
		this.template = $.trim($("[data-template-name='user-form']").html() || "Row template not found!");
	},

	render: function() {
		this.$el.html(Mustache.render(this.template));
		this.delegateEvents();
		return this;
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
		this.delegateEvents();
		return this;
	},

	removeView: function() {
		this.model.collection.remove(this.model);
	}
});