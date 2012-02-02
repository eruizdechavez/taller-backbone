(function($) {

	// A tweet model. Represents the data of each tweet.
	// Properties from Twitter API
	var TweetModel = Backbone.Model.extend({
		defaults: {
			created_at: "",
			from_user: "",
			from_user_id: 0,
			from_user_id_str: "",
			from_user_name: "",
			geo: null,
			id: 0,
			id_str: "",
			iso_language_code: "",
			metadata: {},
			profile_image_url: "",
			profile_image_url_https: "",
			source: "",
			text: "",
			to_user: null,
			to_user_id: null,
			to_user_id_str: null,
			to_user_name: null
		}
	});

	// A collection of Tweets
	var TweetCollection = Backbone.Collection.extend({
		// By setting a model, all raw objects will be 
		// automatically transformed on instances of provided model.
		model: TweetModel
	});

	// Visual representation of a Tweet (UI)
	var TweetView = Backbone.View.extend({
		// HTML Tag node
		tagName: "li",

		// Class name for our HTML Tag
		className: "tweet",

		// Template placeholder
		template: "",

		// Constructor of the view
		initialize: function() {
			// This Underscore method will save the reference of "this"
			// to all methods of this class, including event handlers, 
			// AJAX responses, etc. Really handy 8)!
			_.bindAll(this);

			// Read the template from the HTML to keep JavaScript code
			// organized, clean and readable
			this.template = $("[template='tweet']").html().trim();
		},

		// Declarative events
		events: {
			// "event selector(optional)" : "methodName"
			"click": "select"
		},

		// A click handler
		select: function() {
			this.$el.toggleClass("selected");
		},

		// Show time! Use our data model and create a visual
		// representation for the user.
		render: function() {
			// Use Mustache to render our template and provide it our
			// model as a plain object :{D
			this.$el.html(Mustache.render(this.template, this.model.toJSON()));

			// Delegate events each time render is called, otherwise we'll 
			// lose functionality
			this.delegateEvents();

			// It is a good practice to return "this" on render, so others
			// chan chain the render and read the "el" on one line
			return this;
		}
	});

	// A model for our search view? Yes!
	var TweetSearchModel = Backbone.Model.extend({
		defaults: {
			query: null,
			sinceId: "",
			rpp: 10,
			resultType: "popular",
			refreshInterval: 10000,
			template: ""
		}
	});

	// TweetSearch view
	var TweetSearch = Backbone.View.extend({
		// Some properties to aid us here and there ;)
		className: "tweets",

		// TweetCollection placeholder
		collection: null,

		// Declarative events
		events: {
			// "event selector(optional)" : "methodName"
			"click .title .edit": "editQuery",
			"click .title .delete": "deleteSearch",
			"click .title-edit .save": "saveEdit",
			"click .title-edit .cancel": "cancelEdit"
		},

		// Constructor of the view
		initialize: function() {
			// This Underscore method will save the reference of "this"
			// to all methods of this class, including event handlers, 
			// AJAX responses, etc. Really handy 8)!
			_.bindAll(this);

			// No query, no search :(
			if (!this.options.hasOwnProperty("query")) {
				throw "Cannot create a Search without a query string";
			}

			// Views by default receive and set some contructor parameters
			// like model, el, tagName and className; we can pass whatever
			// we like on the constructor and read it from "options"

			// This time, we take all non-default options from the constructor
			// and set them as our model.
			this.model = new TweetSearchModel(this.options);

			// Initialize our model events
			this.model.on("change:query change:template", this.render);

			// Initialize our collection and its events
			this.collection = new TweetCollection();
			this.collection.on("add", this.addOne);
			this.collection.on("remove", this.removeOne);

			// What? many events? Yes, in this case we want to catch 'em all!
			this.collection.on("add reset remove", this.updateCounter);

			// Start the party!
			this.getTweets();
		},

		// Get some data to display
		getTweets: function() {
			// No query? :( No loop!
			if (this.model.get("query") == null) {
				return;
			}

			$.ajax({
				// Info at: https://dev.twitter.com/docs/api/1/get/search
				url: "http://search.twitter.com/search.json",

				// Cross-domain GET request? No problem, use JSONP :D
				dataType: "jsonp",

				// Feed the API with some parameters ...
				data: {
					q: this.model.get("query"),
					since_id: this.model.get("sinceId"),
					rpp: this.model.get("rpp"),
					result_type: this.model.get("resultType")
				},

				// And handle the response
				success: this.getTweetsSuccess
			});
		},

		// More gests to the party? Let them in!
		getTweetsSuccess: function(data) {
			// Here, "this" is not the DOM nor the AJAX object, "this"
			// is our view because we saved the scope on the constructor
			// using _.bindAll(this). I <3 _.bindAll
			// Error present? Oops! :'(
			if (data.hasOwnProperty("error")) {
				throw "API Error:" + data.error;
			}

			// Sort results so we can add 'em on the right order on 
			// our views
			data.results = _.sortBy(data.results, function(item) {
				return item.id;
			});


			// Save most recent id for next request
			this.model.set("sinceId", data.max_id);

			
			// _.each is more flexible than $.each cause _.each allows to 
			// save "this" and access is inside the loop.
			_.each(data.results, function(item) {
				// Add new models to the collection. 
				// Backbone Collections do not like duplicated IDs, hence
				// watch for duplicated ids (API Cache).
				try {
					this.collection.add(item);
				} catch (error) {
					// TODO: Add some code to handle errors here.
				}
			}, this);

			// Schedule a new fetch
			setTimeout(this.getTweets, this.model.get("refreshInterval"));
		},

		// Each add to our collection is binded here. We'll receive 1 
		// item at a time
		addOne: function(item) {
			// No view on our model? Create one and save it for later
			if (item.view == null) {
				item.view = new TweetView({
					model: item
				});
				// Render newly created view
				item.view.render();
			}

			// Prepend our view to the DOM
			this.$(".tweets-ul").prepend(item.view.el);
			item.view.$el.slideDown();
		},

		// Each remove to our collection is binded here. We'll receive 1 
		// item at a time
		removeOne: function(item) {
			// Just in case we had items on our collection that didn't
			// get a view
			if (item.view != null) {
				// Remove the view from the DOM
				item.view.remove();
			}

			// And remove the properties from the Model
			item.clear();
		},

		// Time to see the result of our hard work
		render: function() {
			// Use Mustache to render our template and provide it our
			// model as a plain object :{D
			// Notice we are just rendering the container. Each tweet
			// rendering is handled appart.
			this.$el.html(Mustache.render(this.model.get("template"), this.model.toJSON()));

			// Our model here is a Backbone Collection and those have _ 
			// methods proxied, so we use collection.each instead of 
			// _.each(collection)
			this.delegateEvents();

			// It is a good practice to return "this" on render, so others
			// chan chain the render and read the "el" on one line
			return this;
		},

		// Handle click on edit button
		editQuery: function() {
			this.$(".term-edit").val(this.model.get("query"));
			this.$(".title-edit").show();
			this.$(".title").hide();
		},

		// Handle click on cancel button
		cancelEdit: function() {
			this.$(".title-edit").hide();
			this.$(".title").show();
		},

		// Handle click on save button
		saveEdit: function() {
			this.model.set({
				query: this.$(".term-edit").val(),
				sinceId: ""
			});
			this.collection.reset();
		},

		// Handle click on delete button
		deleteSearch: function() {
			this.model.set("query", null);
			this.collection.reset();
			this.remove();
		},

		// Nice, something changed on the collection, time
		// for some updates on the counter
		updateCounter: function() {
			this.$(".found").html(this.collection.size());
		}
	});

	// Main view. Defines main logic of the applicaiton.
	var BackboneDemo = Backbone.View.extend({

		// Constructor of the view
		initialize: function() {
			// This Underscore method will save the reference of "this"
			// to all methods of this class, including event handlers, 
			// AJAX responses, etc. Really handy 8)!
			_.bindAll(this);
		},

		// Declarative events
		events: {
			// "event selector(optional)" : "methodName"
			"click div.search button.add": "addSearch"
		},

		// Click handler of the button
		addSearch: function() {
			// Get the input value and use it to create a new Search Box
			this.createSearch($("div.search input:text.query").val());

			// Be nice with the users, return the focus to the input
			// so they can keep adding boxes with less clicks
			$("div.search input:text.query").val("").focus();
		},

		createSearch: function(query) {
			// Create a new Search Box using the provided query string
			var search = new TweetSearch({
				query: query,
				resultType: "mixed",
				// mixed/recent/popular
				template: $("[template='tweetsearch']").html().trim()
			});

			// Render the box and make it appear with a fade in effect
			this.$(".lists").append(search.render().el);
			search.$el.fadeIn();
		}
	});

	// On document load...
	$(function() {
		// ... start the application :)
		var demo = new BackboneDemo({
			el: "body"
		});

		// Add some default elements to show something on the screen 8)
		demo.createSearch("javascript");
		demo.createSearch("php");
	});

})(jQuery);