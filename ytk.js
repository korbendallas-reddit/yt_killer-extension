var ytkMenu = '<div id="ytk_menu"><div class="ytk_menu_title">YouTube Killer<div id="ytk_menu_close"></div></div><div class="ytk_menu_sub_selector"><ul id="ytk_menu_sub_selector_list"></ul></div><div id="ytk_whitelist" class="ytk_menu_submit">White List</div><div id="ytk_blacklist" class="ytk_menu_submit">Black List</div></div>';
var userSubsLink = 'https://www.reddit.com/subreddits/mine/moderator.json';


$('document').ready(function(){

	$('#siteTable').append(ytkMenu);

	var userLink = $('#header-bottom-right > .user > a');
	var user = userLink[0].innerText;
	console.log(user);
	

	generateYtkMenuItems();


	$('#ytk_menu_close').off('click').on('click', function() {
		$('#ytk_menu').hide();
	});

	$('.ytk_menu_sub_selector_list li').off('click').on('click', function(event) {
		subSelect(event);
	});

	$('#ytk_whitelist').off('click').on('click', function() {
		ytkSubmit(user, 'whitelist');
	});

	$('#ytk_blacklist').off('click').on('click', function() {
		ytkSubmit(user, 'blacklist');
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

					console.log(jsonB);
					var modList = jsonB.data.children;

					for (var j = 0; j < modList.length; j++) {
						console.log(modList[j].name);
						if (modList[j].name == 'yt_killer') {

							ytkIsMod = true;
							break;

						}
	
					}

				});

			}

			// Add the sub to the list
			if (ytkIsMod) {

				var thisSub = '<li id="' + subList[i].data.display_name + '" class="' + oddEven;

				// Automatically select the current sub
				if (thisSub == currentSub) {

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

						var allSubs = $('.ytk_menu_sub_selector_list li');

						for (var j = 0; j < allSubs.length; j++) {

							allSubs[j].removeClass('selected');
		
						}
					}
				

				} else {

					$(selectedSub).addClass('selected');

					if ($(selectedSub).hasClass('toggle')) {

						var allSubs = $('.ytk_menu_sub_selector_list li');

						for (var j = 0; j < allSubs.length; j++) {

							allSubs[j].addClass('selected');

						}
					}

				}
			});

		}

	});

}


function ytkSubmit(user, state) {

	var menuItems = $('#ytk_menu_sub_selector_list li');
	var selectedSubs = '';

	for (var i = 0; i < menuItems.length; i++) {

		if ($(menuItems[i]).hasClass('selected')) {

			if (!$(menuItems[i]).hasClass('toggle')) {

				if (i == 0) {

					selectedSubs = selectedSubs + ',';

				}

				selectedSubs = selectedSubs + menuItems[i].id;

			} else {

				if ($(menuItems[i]).hasClass('global')) {

					selectedSubs = 'global';
					break;

				}

			}

		}		

	}

}








