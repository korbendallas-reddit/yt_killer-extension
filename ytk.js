var ytkMenu = '<div id="ytk_menu"><div class="ytk_menu_title"><div id="ytk_menu_close"></div>YouTube Killer</div><div class="ytk_menu_sub_selector"><ul id="ytk_menu_sub_selector_list"></ul></div><div id="ytk_whitelist" class="ytk_menu_submit">White List</div><div id="ytk_blacklist" class="ytk_menu_submit">Black List</div></div>';
var userSubsLink = 'https://www.reddit.com/subreddits/mine/moderator.json';


$('document').ready(function(){

	addYtkHotSpots();

	$('#siteTable').append(ytkMenu);

	var userLink = $('#header-bottom-right > .user > a');
	var user = userLink[0].innerText;
	console.log(user);
	

	generateYtkMenuItems();


	$('#ytk_menu_close').off('click').on('click', function() {
		$('#ytk_menu').css('top', 0);
		$('#ytk_menu').css('left', -99999);
	});

	$('.ytk_menu_sub_selector_list li').off('click').on('click', function(event) {
		subSelect(event);
	});

	$('#ytk_whitelist').off('click').on('click', function() {
		var submitParent = $(event.target).parent();

		ytkSubmit(user, 'whitelist', $(submitParent).attr('thing'));
	});

	$('#ytk_blacklist').off('click').on('click', function(event) {
		var submitParent = $(event.target).parent();
		
		ytkSubmit(user, 'blacklist', $(submitParent).attr('thing'));
	});

});

function generateYtkMenuItems() {

	var currentSub = window.location.href.split('/')[4];

	// Get a list of subs the user mods
	$.getJSON(userSubsLink, function(json) {

		var enableGlobal = false;
		var ytkMenuItems =  '';
		var subList = json.data.children;
		var oddEven = 'even';

		for (var i = 0; i < subList.length; i++) {

			var ytkIsMod = false;

			// Enable global bans for mods of ytk
			if (subList[i].data.display_name == 'yt_killer') {

				enableGlobal = true;
				ytkIsMod = true;

			} else {

				// Check if yt_killer is also a mod
				var modLink = 'https://www.reddit.com/r/' + subList[i].data.display_name + '/about/moderators.json';

				$.getJSON(modLink, function(jsonB) {

					var modList = jsonB.data.children;

					for (var j = 0; j < modList.length; j++) {

						if (modList[j].name == 'yt_killer') {

							ytkIsMod = true;
							break;

						}
	
					}

				});

			}

			// Add the sub to the list
			if (true) {

				var thisSub = '<li id="' + subList[i].data.display_name + '" class="' + oddEven;

				// Automatically select the current sub
				if (subList[i].data.display_name  == currentSub) {

					thisSub = thisSub + ' selected';

				}

				thisSub = thisSub + '">' + subList[i].data.display_name + '</li>';

				ytkMenuItems = ytkMenuItems + thisSub;

				if (oddEven == 'odd') {

					oddEven = 'even';

				} else {

					oddEven = 'odd';

				}

			}

		}
		
		// Prepend 'Toggle all' --OR-- 'Global Ban' item
		if (enableGlobal) {

			ytkMenuItems = '<li class="odd toggle global">Toggle All (Global)</li>' + ytkMenuItems;

		}

		ytkMenuItems = '<li class="odd toggle">Toggle All</li>' + ytkMenuItems;

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

	});

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

		}		

	}

	var submitUri = 'http://localhost/api.py?user=' + user + '&subs=' + selectedSubs + '&state=' + state + '&thing=' + thing;

	$.getJSON(submitUri, function(json) {
		alert(json);
	});

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

		if (links[i].innerHTML.indexOf('youtu.be') > -1 || links[i].innerHTML.indexOf('youtube.com') > -1) {

			var thing = links[i].closest('.thing');
			var thingId = $(thing).attr('id');
			$('<img thing="' + thingId + '" class="ytk_hot_spot" src="http://www.underconsideration.com/brandnew/archives/youtube_ios_icon.png" height="25px" width="25px">').insertAfter($(links[i]));

		}

	}

	ytkHotSpotHandler();

}
// Add the icon next to links on the page (comments section)
function addYtkHotSpotsInComments() {

	var links = $('.thing a');

	for (var i = 0; i < links.length; i++) {
	
		if (links[i].innerHTML.indexOf('youtu.be') > -1 || links[i].innerHTML.indexOf('youtube.com') > -1) {

			var thing = $(links[i]).closest('.thing');
			var thingId = $(thing).attr('id');
			$('<img thing="' + thingId + '" class="ytk_hot_spot" src="http://www.underconsideration.com/brandnew/archives/youtube_ios_icon.png" height="25px" width="25px">').insertAfter($(links[i]));

		}

	}

	ytkHotSpotHandler();

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
