/*
	<summary></summary>
	<param name="special">A boolean variable to tell if something needs to be shown on a date range (Giving Tuesday)</param>
	<param name="pullFromFeed">A boolean to see if something should be pulled from news feed on the page</param>
	<param name="whichFeed">A value to see what feed on the page to pull from News or Spotlight (For both leave default)</param>
	<param name="csvLocation">Location of file to change the elements in the image rotation with out code</param>
	<returns>The rotation</returns>
*/

(function ($) {
    $.fn.rotation = function (options) {
        var settings = $.extend({
            special: true,
            pullFromFeed: false,
            whichFeed: "",
            csvLocation: '#',
            limit: 3,
        }, options);
        return this.each(function () {
            //create variables
            var container = $(this);
            var description = "";
            var mouseIn = false;

            var infoLink;
            var title;
            var description;
            var link;
            var imageSrc;
            var imageAlt;
            //Grab Setting Variables
            var specialSetting = settings.special;
            var pullFromFeedSetting = settings.pullFromFeed;
            var csvLocationSetting = settings.csvLocation;
            var whichFeedSetting = settings.whichFeed;
            var limitSetting = settings.limit;

            if (specialSetting) {
                
                var today = calcTime(-6);
                //Months in dates start with 0 not 1.
                var startDate = new Date(2016, 1, 25);//Date you want it to start showing
                var endDate = new Date(2017, 0, 31);//The last date it will show
                today.setHours(0, 0, 0, 0);
                if (today.getTime() <= endDate.getTime() && today.getTime() >= startDate.getTime()) {
                    
                    var output = '<h1>GOOD MORNING!!!!!! VIETNAM!!!!!!!!</h1>';
                    output += 'I got the date check working, now with a date range.<br />';
                    output += 'I also got it so that the rotation does not sure if we have a special thing we want to show like giving tuesday.<br /><br />';
                    container.html(output);
                } else {
                    testWhereToPull(pullFromFeedSetting, container, csvLocationSetting, whichFeedSetting, limitSetting);
                }
            } else {
                testWhereToPull(pullFromFeedSetting, container, csvLocationSetting, whichFeedSetting, limitSetting);
            }
            createButtons(container);



            //set interval for rotation
            var interval = intervals(container);


            //set link for the info tag
            var newItem = container.find('.introrotation-item:visible').find('.introrotation-title a').attr('href');
            $('.introrotation-info').parent('a').attr('href', newItem);
            var newItemTitle = container.find('.introrotation-item:visible').find('.introrotation-title a').text();
            $('.introrotation-info > span').text("Click Here to learn more about " + newItemTitle);

            //mouse Entered/Leave functionality
            container.mouseenter(function () {
                mouseIn = true;
                clearInterval(interval);
            });

            container.mouseleave(function () {
                mouseIn = false;
                var whatClass = container.find('.playPauseButton');
                if (whatClass.hasClass('playing')) {
                    interval = intervals(container);
                }
            });

            //Button Functinality
            $('.preButton').click(function () {
                clearInterval(interval);
                var item = container.find('.introrotation-item:visible');
                $(item).fadeOut('slow', function () {
                    if ($(item).prev('.introrotation-item').length > 0) {
                        $(item).css('display', 'none');
                        $(item).prev('.introrotation-item').fadeIn();
                    } else {
                        $(item).css('display', 'none');
                        container.find('.introrotation-item').last().fadeIn();
                    }
                    var newItem = container.find('.introrotation-item:visible').find('.introrotation-title a').attr('href');
                    $('.introrotation-info').parent('a').attr('href', newItem);
                    var newItemTitle = container.find('.introrotation-item:visible').find('.introrotation-title a').text();
                    $('.introrotation-info > span').text("Click Here to learn more about " + newItemTitle);
                });
            });

            $('.nextButton').click(function () {
                clearInterval(interval);
                var item = container.find('.introrotation-item:visible');
                $(item).fadeOut('slow', function () {
                    if ($(item).next('.introrotation-item').length > 0) {
                        $(item).css('display', 'none');
                        $(item).next('.introrotation-item').fadeIn();
                    } else {
                        $(item).css('display', 'none');
                        container.find('.introrotation-item').first().fadeIn();
                    }
                    var newItem = container.find('.introrotation-item:visible').find('.introrotation-title a').attr('href');
                    $('.introrotation-info').parent('a').attr('href', newItem);
                    var newItemTitle = container.find('.introrotation-item:visible').find('.introrotation-title a').text();
                    $('.introrotation-info > span').text("Click Here to learn more about " + newItemTitle);
                });
            });

            $('.playPauseButton').click(function () {
                if ($(this).hasClass('playing')) {
                    $(this).removeClass('playing');
                    $(this).addClass('paused');
                    $(this).removeClass('icon-pause');
                    $(this).addClass('icon-play');
                    $(this).parent().parent().find('.introrotation-item').find('p').addClass("hiddenOpacity");
                    $(this).find('.visuallyhidden').html("Play Rotation");
                    clearInterval(interval);
                } else {
                    $(this).removeClass('paused');
                    $(this).addClass('playing');
                    $(this).removeClass('icon-play');
                    $(this).addClass('icon-pause');
                    $(this).find('.visuallyhidden').html("Stop Rotation");
                    $(this).parent().parent().find('.introrotation-item').find('p').removeClass("hiddenOpacity");
                    interval = setInterval(intervals());
                }
            })
            $(window).load(function () {
                var newItem = container.find('.introrotation-item:visible').find('.introrotation-title a').attr('href');
                $('.introrotation-info').parent('a').attr('href', newItem);
                var newItemTitle = container.find('.introrotation-item:visible').find('.introrotation-title a').text();
                $('.introrotation-info > span').text("Click Here to learn more about " + newItemTitle);
            })

        });
        /*
		  <summary>Code to test where to pull the elements for rotation from and then set up</summary>
		  <param name="pullFromFeedSetting">Boolean to see if to pull from news feed on page</param>
		  <param name="container">Selected Element which to put the rotation to</param>
		  <param name="csvLocationSetting">Location of file holding objects for the rotation(if not pulling from feed)</param>
		  <return> Nothing</return>
		*/
        function testWhereToPull(pullFromFeedSetting, container, csvLocationSetting, whichFeedSetting, limitSetting) {
            var charLimit = 155;
            if (pullFromFeedSetting) {
                if (whichFeedSetting != "") {
                    $('.' + whichFeedSetting + " " + '.news-item').each(function () {
                        imageSrc = "http:" + $(this).find('img').attr('src');
                        imageAlt = $(this).find('img').attr('alt');
                        title = $(this).find('.news-link-wrap a').text();
                        link = $(this).find('.news-link-wrap a').attr('href');
                        description = $(this).find('.news-description').html();

                        imageSrc = imageSrc.replace('75x75', '480x320');
                        if (imageAlt == "") {
                            imageAlt = description;
                        }

                        var output = "<div class='introrotation-item'>";
                        output += "<div class='introrotation-image'>";
                        output += "<img src='" + imageSrc + "' alt='" + imageAlt + "' />";
                        output += "</div>";
                        output += "<div class='introrotation-text'>";
                        output += "<h1 class='introrotation-title'><a href='" + link + "'>" + title + "</a></h1>";
                        output += "<p>" + description + "</p>";
                        output += "</div>";
                        output += "</div>";
                        container.prepend(output);
                    });
                } else {
                    $('.news-item').each(function () {
                        imageSrc = "http:" + $(this).find('img').attr('src');
                        imageAlt = $(this).find('img').attr('alt');
                        title = $(this).find('.news-link-wrap a').text();
                        link = $(this).find('.news-link-wrap a').attr('href');
                        description = $(this).find('.news-description').html();

                        imageSrc = imageSrc.replace('75x75', '480x320');

                        if (imageAlt == "") {
                            imageAlt = description;
                        }

                        var output = "<div class='introrotation-item'>";
                        output += "<div class='introrotation-image'>";
                        output += "<img src='" + imageSrc + "' alt='" + imageAlt + "' />";
                        output += "</div>";
                        output += "<div class='introrotation-text'>";
                        output += "<h1 class='introrotation-title'><a href='" + link + "'>" + title + "</a></h1>";
                        output += "<p>" + description + "</p>";
                        output += "</div>";
                        output += "</div>";
                        container.prepend(output);
                    });
                }
            } else {
                var file = csvLocationSetting;
                if (file.lastIndexOf('.csv') == file.length - '.csv'.length) {
                    $.get(file, function (data) {
                        var count = 0;
                        var array = data.split('\n');
                        for (var i = 0; i < array.length - 1; i++) {
                            var array2 = array[i].split(",");
                            var title = array2[0];
                            var desc = array2[1];

                            title = title.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/""/g, '&quot;').replace(/"/g, '').replace(/'/g, '&apos;');
                            desc = desc.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/""/g, '&quot;').replace(/"/g, '').replace(/'/g, '&apos;');

                            if (desc.length > charLimit) {
                                var currentLastCharacter = desc.charAt(charLimit - 1);
                                if (currentLastCharacter == ".") {
                                    desc = desc.substring(0, charLimit) + "..";
                                } else if (currentLastCharacter == " ") {
                                    desc = desc.substring(0, charLimit) + "...";
                                    desc = replaceAt(desc, charLimit - 1, "");
                                } else {
                                    desc = desc.substring(0, charLimit) + "...";
                                }
                            }

                            var imgSrc = array2[2];
                            var imgAlt = array2[3];
                            var storyLink = "";
                            if (typeof array2[4] === 'undefined') {
                                storyLink = "";
                            } else if (array2[4].length <= 1) {
                                storyLink = "";
                            } else {
                                storyLink = array2[4];
                            }
                            var output = "<div class='introrotation-item'>";
                            output += "<div class='introrotation-image'>";
                            output += "<img src='" + imgSrc + "' alt='" + imgAlt + "' />";
                            output += "</div>";
                            output += "<div class='introrotation-text'>";
                            output += "<h1 class='introrotation-title'><a href='" + storyLink + "'>" + title + "</a></h1>";
                            output += "<p>" + desc + "</p>";
                            output += "</div>";
                            output += "</div>";
                            container.prepend(output);

                            console.log("Count: " + count);
                            if (count >= (limitSetting - 1)) {
                                console.log("Limit Reach");
                                break;
                            }
                            count++;
                        }

                    });
                } else {
                    $.get(file, function (data) {
                        //tab delimeted
                        var output = "";
                        var count = 0;
                        var array = data.split('\n');
                        for (var i = 0; i < array.length - 1; i++) {
                            var array2 = array[i].split("\t");
                            var title = array2[0];
                            var desc = array2[1];
                            console.log(desc.length);

                            title = title.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/""/g, '&quot;').replace(/"/g, '').replace(/'/g, '&apos;');
                            desc = desc.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/""/g, '&quot;').replace(/"/g, '').replace(/'/g, '&apos;');


                            if (desc.length > charLimit) {
                                var currentLastCharacter = desc.charAt(charLimit - 1);
                                if (currentLastCharacter == ".") {
                                    desc = desc.substring(0, charLimit) + "..";
                                } else if (currentLastCharacter == " ") {
                                    desc = desc.substring(0, charLimit) + "...";
                                    desc = replaceAt(desc, charLimit - 1, "");
                                } else {
                                    desc = desc.substring(0, charLimit) + "...";
                                }
                            }
                            var imgSrc = array2[2];
                            var imgAlt = array2[3];
                            var storyLink = "";
                            if (typeof array2[4] === 'undefined') {
                                storyLink = "";
                            } else if (array2[4].length <= 1) {
                                storyLink = "";
                            } else {
                                storyLink = array2[4];
                            }
                            console.log("Test: " + storyLink);
                            if (storyLink.length <= 1) {
                                output = "<div class='introrotation-item'>";
                                output += "<div class='introrotation-image'>";
                                output += "<img src='" + imgSrc + "' alt='" + imgAlt + "' />";
                                output += "</div>";
                                output += "<div class='introrotation-text'>";
                                output += "<h1 class='introrotation-title'>" + title + "</h1>";
                                output += "<p>" + desc + " </br></p>";
                                output += "</div>";
                                output += "</div>";
                            } else {
                                output = "<div class='introrotation-item'>";
                                output += "<div class='introrotation-image'>";
                                output += "<img src='" + imgSrc + "' alt='" + imgAlt + "' />";
                                output += "</div>";
                                output += "<div class='introrotation-text'>";
                                output += "<h1 class='introrotation-title'><a href='" + storyLink + "'>" + title + "</a></h1>";
                                output += "<p>" + desc + " </br><a class='moreLink' href='" + storyLink + "'>[Read The Rest]</a></p>";
                                output += "</div>";
                                output += "</div>";
                            }
                            container.prepend(output);
                            console.log("Count: " + count);
                            if (count >= (limitSetting - 1)) {
                                console.log("Limit Reach");
                                break;
                            }
                            count++;
                        }
                    });
                }


            }
            $('.introrotation-item').css('display', 'none');
            $('.introrotation-item').first().css('display', 'block');

            newItem = container.find('.introrotation-item:visible').find('.introrotation-title a').attr('href');
            $('.introrotation-info').parent('a').attr('href', newItem);

            newItemTitle = container.find('.introrotation-item:visible').find('.introrotation-title a').text();
            $('.introrotation-info > span').text("Click Here to learn more about " + newItemTitle);


        }
        /*
		 <summary>Creats and interval for the rotation to move on its own every 5 seconds</summary>
		 <param name="container">Selected Element which to put the rotation to</param>
		 <returns>Nothing</returns>
		*/
        function intervals(container) {
            var whatClass = container.find('.playPauseButton');
            console.log(container.find('.playPauseButton'));
            var intervalSet = 0;
            if (whatClass.hasClass('playing')) {
                intervalSet = setInterval(function () {
                    var item = container.find('.introrotation-item:visible');
                    $(item).fadeOut('slow', function () {
                        if ($(item).next('.introrotation-item').length > 0) {
                            $(item).css('display', 'none');
                            $(item).next('.introrotation-item').fadeIn();
                        } else {
                            $(item).css('display', 'none');
                            container.find('.introrotation-item').first().fadeIn();
                        }
                        var newItem = container.find('.introrotation-item:visible').find('.introrotation-title a').attr('href');
                        var newItemTitle = container.find('.introrotation-item:visible').find('.introrotation-title a').text();
                        $('.introrotation-info').parent('a').attr('href', newItem);
                        $('.introrotation-info > span').text("Click Here to learn more about " + newItemTitle);
                    });
                }, 5000);
            }
            return intervalSet;
        }
        /*
		 <summary>Creates the buttons to manually change the rotation</summary>
		 <param name="container">Selected Element which to put the rotation to</param>
		 <returns>Nothing</returns>
		*/
        function createButtons(container) {
            var buttons = '<span class="buttonHolder">'
            buttons += '<button class="preButton icon-backward" ><span class="visuallyhidden">Previous Image in Rotation</span></button>';
            buttons += '<button class="playPauseButton playing icon-pause" ><span class="visuallyhidden">Stop Rotation</span></button>';
            buttons += '<button class="nextButton icon-forward" ><span class="visuallyhidden">Next Image in Rotation</span></button>';
            buttons += '</span>';
            container.append(buttons);
        }
        /*
	  	  <summary>Gets Current Time</summary>
	  	  <param name="offset">The offset of time based on TimeZones</param>
	  	  <returns>Returns the current date and time based on the offset</returns>
		*/
        function calcTime(offset) {
            var date = new Date();
            var utc = date.getTime() + (360 * 60000);
            var nd = new Date(utc + (3600000 * offset));
            return nd;
        }
        /*
  		  <summary>Replace the character at an index of a string </summary>
  		  <param name="str">A string</param>
  		  <param name="index">Index of the string to change</param>
  		  <param name="character">What character is being put in place at index</param>
  		  <returns>Returns str with index character changed to the character given</returns>
  		*/
        function replaceAt(str, index, character) {
            return str.substr(0, index) + character + str.substr(index + 1);
        }
    };
}(jQuery));
