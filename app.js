$(document).ready( function() {
	$('.unanswered-getter').submit( function(event){
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});
	
	$('.inspiration-getter').submit( function(event){
		// remove any previous results from a previous query by a user
		$('.results').html('');
		// get the tag that the user submitted as a query and display the top answerers on Stack Overflow for that tag
		var tag = $(this).find(":first-child").val();
		getAnswerers(tag);
	});
});

// this function takes the question object returned by StackOverflow 
// and creates new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the #views for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
													question.owner.display_name +
												'</a>' +
							'</p>' +
 							'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};

/* This function takes an element from the array "items," which is a property returned from Stack Exchange API 
for Top Answerers for Stack Overflow and returns a modified version of a clone of class .answer according to properties
from the argument given to this function. */
var showAnswerer = function(answerer) {

	// clone class .answerer that has the template for showing information about the answerer
	var answererTemplate = $('.templates .answerer').clone();
	
	var getElem = function(selector) {return answererTemplate.find(selector); }; // helper function to simplify getting child elements from class .answerer 
	
	// declare local variables that will be the elements from .answerer class in order to contain information about answerer
	var	answererName = getElem('.user a'),
		answererReputation = getElem('.reputation'),
		answererScore = getElem('.score'),
		answererPostCount = getElem('.post-count');
	
	// display the answerer's url, name, reputation, score, and post count
	answererName.attr('href', answerer.user.link)  
				.text(answerer.user.display_name); 
	answererReputation.text(answerer.user.reputation); 
	answererScore.text(answerer.score); 
	answererPostCount.text(answerer.post_count);
	
	return answererTemplate; 
};

// this function takes the results object from StackOverflow
// and creates info about search results to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query;
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
	return errorElem;
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = {tagged: tags,
								site: 'stackoverflow',
								order: 'desc',
								sort: 'creation'};
	
	var result = $.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",
		type: "GET",
		})
	.done(function(result){
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);

		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};

/* This function takes a tag searched for on Stack Overflow and appends the information about 
the top answerers on Stack Overflow for that tag to class .results in the DOM. */
var getAnswerers = function(tag) {
	var endPoint = "http://api.stackexchange.com/2.2/tags/" + tag + "/top-answerers/all_time",
		queryStringObj = {site: "stackoverflow"},
		ajaxParams = {
			url: endPoint,
			data: queryStringObj,
			dataType: "jsonp",
			type: "GET"
		};
		
	$.ajax(ajaxParams)
		.done(function(data) { 
			// if AJAX request succeeded, show the number of top answerers for the particular tag and display information about each answerer 
			var searchResults = showSearchResults(tag, data.items.length);
			$('.search-results').html(searchResults); 
			$.each(data.items, function(index, answerer) { 
				$('.results').append(showAnswerer(answerer));
			});
		})
		.fail(function(jqXHR, textStatus, errorThrown) { 
			$('.search-results').append(showError(textStatus));
		});
};