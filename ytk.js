var ytkMenu = '<div id="ytk_menu"><div class="ytk_menu_title"><div id="ytk_menu_close" style="background-image: url(\'' + chrome.extension.getURL('ytk.png') + '\');"></div>YouTube Killer</div><div class="ytk_menu_sub_selector"><ul id="ytk_menu_sub_selector_list"></ul></div><div id="ytk_whitelist" class="ytk_menu_submit">White List</div><div id="ytk_blacklist" class="ytk_menu_submit">Black List</div></div>';


$('document').ready(function() {

	addYtkHotSpots();

	$('#siteTable').append(ytkMenu);	

	generateYtkMenuItems();

});


function generateYtkMenuItems() {

	// Get username
	var user = '';

	$.getJSON('https://www.reddit.com/api/me.json?raw_json=1&sr_detail=true&app=mweb-client', function(json) {
		user=json.data.name;
	});


	var currentSub = '';
	var urlSplit = window.location.href.split('/');
	if (urlSplit[3] == 'r') {
		currentSub = urlSplit[4];
	}

	var subList = getModdedSubs();
	var ytkMenuItems =  '<li class="odd toggle">Toggle All</li>';
	var oddEven = 'even';

	for (var i = 0; i < subList.length; i++) {

		if (subList[i].length > 2) {

			var ytkIsMod = false;

			if (subList[i] == 'YT_Killer') {

				ytkMenuItems = '<li class="odd toggle global">Toggle All [ Global ]</li>' + ytkMenuItems;
				ytkIsMod = true;

			} else {

				// Check if yt_killer is also a mod
				var modLink = 'https://www.reddit.com/r/' + subList[i] + '/about/moderators.json';
			
	
				// Set ajax calls to synchronous
				$.ajaxSetup({
					async: false
				});

				$.getJSON(modLink, function(json) {

					var modList = json.data.children;

					for (var j = 0; j < modList.length; j++) {

						if (modList[j].name == 'YT_Killer') {

							ytkIsMod = true;
							break;

						}
	
					}

				});

				// Set ajax calls back to asynchronous
				$.ajaxSetup({
					async: true
				});

			}

			// Add the sub to the list
			if (ytkIsMod) {
	
				var thisSub = '<li id="' + subList[i] + '" class="' + oddEven;
	
				// Automatically select the current sub
				if (subList[i]  == currentSub) {
					thisSub = thisSub + ' selected';
				}

				thisSub = thisSub + '">' + subList[i] + '</li>';
	
				ytkMenuItems = ytkMenuItems + thisSub;
	
				if (oddEven == 'odd') {
					oddEven = 'even';
				} else {
					oddEven = 'odd';
				}

			}

		}

	}


	// Create the elements and attach event handler
	$('#ytk_menu_sub_selector_list').append(ytkMenuItems);
	var newMenuItems = $('#ytk_menu_sub_selector_list li');

	for (var i = 0; i < newMenuItems.length; i++) {

		newMenuItems[i].addEventListener("click", function(event) {

			var selectedSub = $(event.target);

			if ($(selectedSub).hasClass('selected')) {

				$(selectedSub).removeClass('selected');
		
				if ($(selectedSub).hasClass('toggle')) {

					var allSubs = $('#ytk_menu_sub_selector_list li');

					for (var j = 0; j < allSubs.length; j++) {

						$(allSubs[j]).removeClass('selected');
		
					}

				}

			} else {

				$(selectedSub).addClass('selected');

				if ($(selectedSub).hasClass('toggle')) {

					var allSubs = $('#ytk_menu_sub_selector_list li');

					for (var j = 0; j < allSubs.length; j++) {

						$(allSubs[j]).addClass('selected');

					}
				}
			}
		});

	}

	
	$('#ytk_menu_close').off('click').on('click', function(event) {

		$('#ytk_menu').css('top', '0');
		$('#ytk_menu').css('left', '-99999px');

	});

	$('#ytk_whitelist').off('click').on('click', function() {

		var submitParent = $(event.target).parent();
		ytkSubmit(user, 'whitelist', $(submitParent).attr('thing'));

	});
	$('#ytk_blacklist').off('click').on('click', function(event) {

		var submitParent = $(event.target).parent();
		ytkSubmit(user, 'blacklist', $(submitParent).attr('thing'));

	});

}

var getModdedSubs = function() {

	var subs = '';
	var userSubsLink = 'https://www.reddit.com/subreddits/mine/moderator.json';

	$.ajaxSetup({
		async: false
	});
	$.getJSON(userSubsLink, function(json) {

		var subList = json.data.children;

		for (var i = 0; i < subList.length; i++) {

			if (subs.length > 0) {
				subs = subs + ',';
			}

			subs = subs + subList[i].data.display_name;

		}

	});
	$.ajaxSetup({
		async: true
	});


	return subs.split(',');
}


// Send to server
function ytkSubmit(user, state, thing) {

	var selectedSubs = '';
	var menuItems = $('#ytk_menu_sub_selector_list li');

	for (var i = 0; i < menuItems.length; i++) {

		if ($(menuItems[i]).hasClass('selected')) {

			if (!$(menuItems[i]).hasClass('toggle')) {

				if (selectedSubs.length > 0) {
					selectedSubs = selectedSubs + ',';
				}

				selectedSubs = selectedSubs + $(menuItems[i]).attr('id');

			} else {

				if ($(menuItems[i]).hasClass('global')) {

					selectedSubs = 'global';
					break;

				}

			}

			$(menuItems[i]).removeClass('selected');

		}		

	}

	var submitUri = 'https://localhost/api.py?user=' + user + '&subs=' + selectedSubs + '&state=' + state + '&thing=' + thing;

	try {

		$.getJSON(submitUri, function(json) {
			alert(json);
		});

	} catch(err) {
		console.log(err.message);
	}

	$('#ytk_menu').css('top', '0');
	$('#ytk_menu').css('left', '-99999px');

	
	return;

}


// Add the icon next to links on the page (regular sub page)
function addYtkHotSpots() {

	// Handle comments differently than the sub
	if (window.location.href.split('/').length > 7) {

		addYtkHotSpotsInComments();

		return;

	}

	var links = $('.thing.link p.title > a.title');

	for (var i = 0; i < links.length; i++) {

		try {

			if ($(links[i]).attr('href').indexOf('youtu.be') > -1 || $(links[i]).attr('href').indexOf('youtube.com') > -1) {

				var thing = links[i].closest('.thing');
				var thingId = $(thing).attr('id');
				$('<img thing="' + thingId + '" class="ytk_hot_spot" src="' + chrome.extension.getURL('ytk.png') + '" height="25px" width="25px">').insertAfter($(links[i]));

			}

		} catch(err) {
			console.log(err.message);
		}

	}

	ytkHotSpotHandler();


	return;

}


// Add the icon next to links on the page (comments section)
function addYtkHotSpotsInComments() {

	var links = $('a');

	for (var i = 0; i < links.length; i++) {
		
		try {

			if ($(links[i]).attr('href').indexOf('youtu.be') > -1 || $(links[i]).attr('href').indexOf('youtube.com') > -1) {
	
				var thing = $(links[i]).closest('.thing');
				var thingId = $(thing).attr('id');
				$('<img thing="' + thingId + '" class="ytk_hot_spot" src="' + chrome.extension.getURL('ytk.png') + '" height="25px" width="25px">').insertAfter($(links[i]));

			}

		} catch(err) {
			console.log(err.message);
		}

	}

	ytkHotSpotHandler();


	return;

}


// Handle click events
function ytkHotSpotHandler() {

	var hotSpots = $('.ytk_hot_spot');

	for (var i = 0; i < hotSpots.length; i++) {

		hotSpots[i].addEventListener("click", function(event) {
			
			var hotSpot = $(event.target);
			var thingId = hotSpot.attr('thing');
			$('#ytk_menu').attr('thing', thingId);
			
			var hotSpotLocation = hotSpot.offset();

			$('#ytk_menu').css('top', hotSpotLocation.top);
			$('#ytk_menu').css('left', hotSpotLocation.left);
			
			if (hotSpotLocation.right < 300) {

				$('#ytk_menu').css('left', hotSpotLocation.left - 290);

			}

		});

	}

}
