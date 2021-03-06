var ytkMenu = '<div id="ytk_menu"><div class="ytk_menu_title"><div id="ytk_menu_close" style="background-image: url(\'' + chrome.extension.getURL('ytk.png') + '\');"></div>YouTube Killer</div><div class="ytk_menu_sub_selector"><ul id="ytk_menu_sub_selector_list"></ul></div><div id="ytk_whitelist" class="ytk_menu_submit">White List</div><div id="ytk_blacklist" class="ytk_menu_submit">Black List</div></div>';


$('document').ready(function() {

	addYtkHotSpots();

	$('#siteTable').append(ytkMenu);	

	generateYtkMenuItems();

});


function generateYtkMenuItems() {

	// Get username
	var user = '';
	var uh = '';

	$.ajaxSetup({ async: false });
	$.getJSON('https://www.reddit.com/api/me.json?raw_json=1', function(json) { user=json.data.name; uh=json.data.modhash; });
	$.ajaxSetup({ async: true });


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
				$.ajaxSetup({ async: false });

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

		ytkSubmit(user, uh, $('#ytk_menu').attr('vidlink'), $('#ytk_menu').attr('author'), 'remove', $('#ytk_menu').attr('thing'));

	});
	$('#ytk_blacklist').off('click').on('click', function(event) {

		ytkSubmit(user, uh, $('#ytk_menu').attr('vidlink'), $('#ytk_menu').attr('author'), 'add', $('#ytk_menu').attr('thing'));

	});

}

var getModdedSubs = function() {

	var subs = '';
	var userSubsLink = 'https://www.reddit.com/subreddits/mine/moderator.json';

	$.ajaxSetup({async: false});
	$.getJSON(userSubsLink, function(json) {

		var subList = json.data.children;

		for (var i = 0; i < subList.length; i++) {

			if (subs.length > 0) {
				subs = subs + ',';
			}

			subs = subs + subList[i].data.display_name;

		}

	});
	$.ajaxSetup({async: true});


	return subs.split(',');
}


// Send to server
function ytkSubmit(user, uh, vidlink, author, state, thing) {

	var selectedSubs = '';
	var menuItems = $('#ytk_menu_sub_selector_list li.selected');

	if (menuItems.length < 1) {
		return;
	}

	for (var i = 0; i < menuItems.length; i++) {

		if (!$(menuItems[i]).hasClass('toggle')) {

			if (selectedSubs.length > 0) {
				selectedSubs = selectedSubs + ',';
			}

			selectedSubs = selectedSubs + $(menuItems[i]).attr('id');

		} else {

			if ($(menuItems[i]).hasClass('global')) {

				selectedSubs = 'YT_Killer';
				break;

			}

		}

		$(menuItems[i]).removeClass('selected');		

	}

	var data = '{ "mod": "' + user + '", "video": "' + vidlink + '", "thing": "' + thing + '", "author": "/u/' + author + '", "bl_wl": "' + state + '", "subs": "' + selectedSubs + '" }';
	//{ "mod": "_korbendallas_", "video": "https://youtube.com", "thing": "t3_asdfg", "author": "/u/d0cr3d", "bl_wl": "add", "subs": "YT_Killer,subbie" }

	try {

		$.ajax({
			method: 'get',
			dataType: 'json',
			url: 'https://layer7.solutions/api/ytk.py?glob=' + btoa(data),
			dataType: 'jsonp',
			headers: { 'Access-Control-Allow-Origin': '*' }
		})
		.done(function(data) {
			$('body').append('<div id="ytk-notification" style="position:fixed;bottom:20px;left:0;width:100%;height:3.0em;line-height:3.0em;font-size:1.4em;font-weight:bold;text-align:center;vertical-align:middle;color:#FFFFFF;background:#E62117;z-index:99999;">Your request has been processed successfully.</div>');
			setTimeout(function() {
				$('#ytk-notification').fadeOut();
			}, 5000);
		})
		.error(function(data) {
			console.log(data);
			$('body').append('<div id="ytk-notification" style="position:fixed;bottom:20px;left:0;width:100%;height:3.0em;line-height:3.0em;font-size:1.4em;font-weight:bold;text-align:center;vertical-align:middle;color:#FFFFFF;background:#E62117;z-index:99999;">An error has occurred, please try again.</div>');
			setTimeout(function() {
				$('#ytk-notification').fadeOut();
			}, 5000);
		});

	} catch(err) {
		console.log(err.message);
		$('body').append('<div id="ytk-notification" style="position:fixed;bottom:20px;left:0;width:100%;height:3.0em;line-height:3.0em;font-size:1.4em;font-weight:bold;text-align:center;vertical-align:middle;color:#FFFFFF;background:#E62117;z-index:99999;">An error has occurred, please try again.</div>');
		setTimeout(function() {
			$('#ytk-notification').fadeOut();
		}, 5000);
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
				var vidlink = $(links[i]).attr('href');
				var author = $(thing).attr('data-author');
				$('<img thing="' + thingId + '" vidlink="' + vidlink + '" author="' + author + '" class="ytk_hot_spot" src="' + chrome.extension.getURL('ytk.png') + '" height="25px" width="25px">').insertAfter($(links[i]));

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

	var links = $('.content a');

	for (var i = 0; i < links.length; i++) {
		
		try {

			if ($(links[i]).attr('href').indexOf('youtu.be') > -1 || $(links[i]).attr('href').indexOf('youtube.com') > -1) {
				
				var thingId = '';

				if ($(links[i]).hasClass('title')) {
					thingId = 'thing_t3_' + window.location.href.split('/')[6];
				} else {
					var thing = $(links[i]).closest('.thing');
					thingId = $(thing).attr('id');
				}

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
			var vidlink = hotSpot.attr('vidlink');
			var author = hotSpot.attr('author');
			$('#ytk_menu').attr('thing', thingId);
			$('#ytk_menu').attr('vidlink', vidlink);
			$('#ytk_menu').attr('author', author);
			
			var hotSpotLocation = hotSpot.offset();

			$('#ytk_menu').css('top', hotSpotLocation.top);
			$('#ytk_menu').css('left', hotSpotLocation.left);
			
			if (hotSpotLocation.right < 300) {

				$('#ytk_menu').css('left', hotSpotLocation.left - 290);

			}

		});

	}

}
