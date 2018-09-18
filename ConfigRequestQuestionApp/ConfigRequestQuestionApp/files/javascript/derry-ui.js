/*
*
* Name: derry-ui.js
* Created: 7/16/2014
* Creator: Aaron Derry
* Last Update: 9/17/2014
* 
* Current Features:
*             Accordion Menu
*             Panoramic Viewer
*             Tabs
*             Image Slider
*
*
*
*Features Currently Working On:
*             Image Attribuation
*				
*
*/
(function ($) {
	$.fn.accordion = function (options) {
		var settings = $.extend({
			duration: "slow",
			heading: "h3",
			content: "div",
			showIcon: "show",
			hideIcon: "hide"
		}, options);
		return this.each(function () {
		    alert("enter");
		//create variables
			//container is the selected container
			//anchors are the tags that are clicked
			//divs are the content that you wish to show on anchor click
			var container, anchors, divs;
				container = $(this);
		//Grab all settings and put them into a variable for easy access
			//Duration Setting is the durration of the animation
			//heading is the opject that is clicked to toggle content
			//content is the area that will toggle display on heading click
			//showIcon is the icon that is shown when content is seen
			//hideIcon is the icon that is shown when content is hidden
			var durationSetting = settings.duration;
			var headingSetting = settings.heading;
			var contentSetting = settings.content;
			var showSetting = settings.showIcon;
			var hideSetting = settings.hideIcon;

		//event listeners on container Or code that you want something to do
			anchors = container.find(headingSetting).addClass('collapse');
			divs = container.find(contentSetting).addClass('childcollapse');
			
			//default Icon
				anchors.addClass(hideSetting);
			
				$(".childcollapse").css("display","none");
				$( ".collapse" ).click(function() {
					var parent = $(this);
					var next = parent.parent().next();
					next.slideToggle( durationSetting, function(){
						if(hideSetting != showSetting){
							if(next.is(":visible")){
								parent.removeClass(hideSetting);
								parent.addClass(showSetting);
							}else{
								parent.addClass(hideSetting);
								parent.removeClass(showSetting);
							}
						}
					});
				});//end clickHeading			
		});
	};
}(jQuery));
(function ($) {
	$.fn.panorama =  function (options) {
		var settings = $.extend({
			rightCursor: "default",
			leftCursor: "default",
			leftIcon: "icon-previous3",
			stopIcon: "icon-stop3",
			rightIcon: "icon-next3"
		}, options);
		return this.each(function () {
			
		//create variables
			//container is the selected container
			//sx is the position of the initial click
			//pressed is a boolean value telling us when the container is clicked and held on
			//offset is the value of which to move the background-position of the container
			//pastOffset is the value to help determine which cursor when pressed should be used.
			//interval is used for the setInterval for when a buttons is clicked
			var container, sx, pressed, offset = 0, pastOffset = 0, interval;
			container = $(this);
			
			
			
			//setting variables
			var leftIconSetting = settings.leftIcon;
			var rightIconSetting = settings.rightIcon;
			var stopIconSetting = settings.stopIcon;
			var rightCursorSetting = settings.rightCursor;
			var leftCursorSetting = settings.leftCursor;
			
			//Create The buttons and append them to container and move them to the bottom
			  makeButtons(container, leftIconSetting, rightIconSetting, stopIconSetting);
			   

			   
			    
			//button control
			$(this).find('.'+leftIconSetting).bind('click touchstart ', function(){
				clearInterval(interval);
					interval = setInterval(function(){
						offset+=1;
						container.css('background-position', offset + 'px');
					}, 10);
			});
			$(this).find('.'+stopIconSetting).bind('click touchstart ', function(){
				clearInterval(interval);
			});
			$(this).find('.'+rightIconSetting).bind('click touchstart  ', function(){
				clearInterval(interval);
					interval = setInterval(function(){
						offset-=1;
						container.css('background-position', offset + 'px');
					}, 10);
			});
			//event listeners on container
			container.bind('mousedown', function (e) {
				clearInterval(interval);
				sx = e.pageX - offset;
				pressed = true;//Container has been clicked on
				e.preventDefault();
			});
			container.bind('touchstart', function(e){
				  e.preventDefault();
				  
				  	pressed = true;
      				var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      				 sx = touch.pageX - offset;
			});
			container.bind('mousemove',function (e) {
				var px;
				 e.preventDefault();
				pastOffset = offset;
				if (pressed) {
					px = e.pageX;
					offset = px - sx;
					x = offset;
					container.css('background-position', offset);
					
				//define the cursor for the movement
					if(pastOffset >= offset && offset != 0){
						//cursor you want when moving picture right
						container.css("cursor", rightCursorSetting);
					}else if(pastOffset <= offset && offset != 0){
						//cursor you want when moving picture left
						container.css("cursor",leftCursorSetting);
					}else{
						//default cursor(Should only enter it on initial press)
						container.css("cursor","default");
					}
				}else{
					container.css("cursor","default");
				}
			});
			container.bind('touchmove', function (e){
				e.preventDefault();
				var px;
				if(pressed){
					clearInterval(interval);
					px =  e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
					px = px.pageX;
					offset = px - sx;
					x = offset;
					container.css('background-position', offset);
				}
			});
			container.bind('mouseup mouseleave touchend', function () {
				pressed = false;
			});
		});
	};
	function makeButtons(container, leftIconSetting, rightIconSetting, stopIconSetting){
		var buttons = "<span class='panButton'>";
			buttons += " <button class='"+leftIconSetting+"' title='Move Image Left'></button>";
			buttons += " <button class='"+stopIconSetting+"' title='Stop Image'></button>";
			buttons += " <button class='"+rightIconSetting+"' title='Move Image Right'></button><br /><br />";
			buttons += "</span>";

			container.append(buttons);

		var height = container.height() - 50;
		$('.panButton').css("bottom", ('-'+height+'px'));
	}  
}(jQuery));
(function ($) {
	$.fn.tabs = function (options) {
		var settings = $.extend({
			active:  "",
			heading: "li",
			content: "div",
			navHolder: "ul"
		}, options);
		return this.each(function () {
			
		//create variables
			//container is the selected container
			//anchors is the selected content
			//content is the what is displayed
			var container, anchors, content, navHolder;
			container = $(this);
			
		//Grab all settings and put them into a variable for easy access
			//heading is the tag that is clicked to show content
			//content is the tag of the object that is being shown
			var headingSetting = settings.heading;
			var contentSetting = settings.content;
			var activeSetting = settings.active;
			var navHolderSetting = settings.navHolder;
		//event listeners on container Or code that you want something to do
			anchors = container.find( headingSetting );
			content = container.find(contentSetting);
			navHolder = container.find(navHolderSetting).first().addClass(' Nav-Holder');
			$(content).css("display","none");
			$(content).first().css("display","block");
			$(anchors).click(function(){
				var parent = $(this).parent().attr('class');
				if(parent.search("Nav-Holder")  >= 0){
					var changingIndex = $( this ).index();
					changingIndex++;
					$(content).css("display","none");
					container.find((contentSetting+":nth-of-type("+changingIndex+")")).css("display","block");
					$(headingSetting).removeClass(activeSetting);
					$(this).addClass(activeSetting);
				}
			});
		});
	};
}(jQuery));

(function ($) {
	$.fn.imageSlider = function (options) {
		var settings = $.extend({
			imageHolderDiv: ".RssItem",
			timeFrame: 10000,
			prevImage: '',
			stopImage: '',
			playImage: '',
			nextImage: ''
		}, options);
		return this.each(function () {
			
		//create variables
			//container is the selected container
			var container, i = 0, interval, enter;
				container = $(this);
			
		//Grab all settings and put them into a variable for easy access
			var imageHolderDivSetting = settings.imageHolderDiv;
			var timeFrameSetting = settings.timeFrame;
			var prevImageSetting = settings.prevImage;
			var stopImageSetting = settings.stopImage;
			var playImageSetting = settings.playImage;
			var nextImageSetting = settings.nextImage;

		//event listeners on container Or code that you want something to do something
			container.find(imageHolderDivSetting).each(function(){
				$(this).css("display","none");
			});
			container.find(imageHolderDivSetting).first().css("display","block");
			 makeButtons(container, prevImageSetting, stopImageSetting, playImageSetting, nextImageSetting);
			 
			 interval = setInterval(function(){
				
				var item = container.find(imageHolderDivSetting +':visible');
					$(item).fadeOut('slow',function(){
						if($(item).next(imageHolderDivSetting).length > 0){
							$(item).next(imageHolderDivSetting).fadeIn();
						}else{
							container.find(imageHolderDivSetting).first().fadeIn();
						}
					});
				
			},timeFrameSetting);
			
			$('.derry-ui-prev-image').click(function(){
					clearInterval(interval);
					var item = container.find(imageHolderDivSetting +':visible');
					$(item).fadeOut('slow',function(){
						if($(item).prev(imageHolderDivSetting).length > 0){
							$(item).prev(imageHolderDivSetting).fadeIn();
						}else{
							container.find(imageHolderDivSetting).last().fadeIn();
						}
					});
			});
			container.mouseenter(function(){
					clearInterval(interval);
					
					enter = true;
			});
			container.mouseleave(function(){
				enter = false;
				clearInterval(interval);
				if($('.derry-ui-play-image').is(':visible'))
				{
					//do nothing
				}else{
					interval = setInterval(function(){
						var item = container.find(imageHolderDivSetting +':visible');
							$(item).fadeOut('slow',function(){
								if($(item).next(imageHolderDivSetting).length > 0){
									$(item).next(imageHolderDivSetting).fadeIn();
								}else{
									container.find(imageHolderDivSetting).first().fadeIn();
								}
							});
						},timeFrameSetting);
				}		
			});
						
			$('.derry-ui-stop-image').click(function(){
					clearInterval(interval);
					$('.derry-ui-play-pause').toggle();
			});
			$('.derry-ui-play-image').click(function(){
				clearInterval(interval);
					var item = container.find(imageHolderDivSetting +':visible');
					$(item).fadeOut('slow',function(){
						if($(item).next(imageHolderDivSetting).length > 0){
							$(item).next(imageHolderDivSetting).fadeIn();
						}else{
							container.find(imageHolderDivSetting).first().fadeIn();
						}
					});
					interval = setInterval(function(){
					var item = container.find(imageHolderDivSetting +':visible');
						$(item).fadeOut('slow',function(){
							if($(item).next(imageHolderDivSetting).length > 0){
								$(item).next(imageHolderDivSetting).fadeIn();
							}else{
								container.find(imageHolderDivSetting).first().fadeIn();
							}
						});
					},timeFrameSetting);
						$('.derry-ui-play-pause').toggle();
			});
			$('.derry-ui-next-image').click(function(){
					clearInterval(interval);

					var item = container.find(imageHolderDivSetting +':visible');
					$(item).fadeOut('slow',function(){
						$(item).css('display','none');
						if($(item).next(imageHolderDivSetting).length > 0){
							$(item).next(imageHolderDivSetting).fadeIn();
						}else{
							container.find(imageHolderDivSetting).first().fadeIn();
						}
					});
			});
			function makeButtons(container, prevImageSetting, stopImageSetting, playImageSetting, nextImageSetting){
				var buttons = '<div class="buttonHolder">';
					buttons +=	'<button class="derry-ui-prev-image '+prevImageSetting+'" title="Prev Student Organization"><span class="visuallyhidden"Previous</span></button>';
					buttons +=	'<button class="derry-ui-stop-image derry-ui-play-pause '+stopImageSetting+'" title="Stop Slider"><span class="visuallyhidden">Stop</span></button>';
					buttons +=	'<button class="derry-ui-play-image derry-ui-play-pause '+playImageSetting+'" title="Play Slider" style="display:none;"><span class="visuallyhidden">Play</span></button>';
					buttons +=	'<button class="derry-ui-next-image '+nextImageSetting+'" title="Next Student Organization"><span class="visuallyhidden">Next</span></button>';
					buttons += '</div>';
				container.append(buttons);
			}	
		});
	};
}(jQuery));