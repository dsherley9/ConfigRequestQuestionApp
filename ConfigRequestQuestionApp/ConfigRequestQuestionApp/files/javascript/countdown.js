/*
	<summary>Performs the countdown to a selected date</summary>
	<param name="monthSetting">The Requested Month</param>
	<param name="daySetting">The Requested Day</param>
	<param name="yearSetting">The Requested Year</param>
	<param name="hourSetting">The Requested Hour</param>
	<param name="minuteSetting">The Requested Minute</param>
	<return>Returns ajaxed response for the countdown(every 1 sec)</return>
*/
(function ($) {
    var monthSetting, daySetting, yearSetting, hourSetting, minuteSetting, container, linksSetting, titleSetting;
    $.fn.CountDown = function (options) {
        var settings = $.extend({
            month: 12,
            day: 12,
            year: 2014,
            hours: 9,
            minute: 30,
            title: "",
            links: "",
        }, options);
        return this.each(function () {
            //create variables
            container = $(this);
            
            //setting variables
            monthSetting = settings.month - 1;
            daySetting = settings.day;
            yearSetting = settings.year;
            hourSetting = settings.hours;
            minuteSetting = settings.minute;
            linksSetting = settings.links;
            titleSetting = settings.title;
            //Create The Boxes for the countdown
            createBoxes(container);

            //find the time needed until you reach the date
            findTimeNeeded(container);

            var timer = setInterval(findTimeNeeded, 1000);
        });
        /*
	  	  <summary>Adds the holders to the selected element</summary>
	  	  <param name="container">The selected element for the plugin</param>
	  	  <returns>Nothings</returns>
		*/
        function createBoxes(container) {
            var boxes = '<div class="countDownHolder">';
            boxes += '<span class="countDownTitleHolder countDownMonth"></span>';
            boxes += '<span class="countDownTitleHolder countDownDays"></span>';
            boxes += '<span class="countDownTitleHolder countDownHours"></span>';
            boxes += '<span class="countDownTitleHolder countDownMinutes"></span>';
            boxes += '<span class="countDownTitleHolder countDownSeconds"></span>';
            boxes += '</div>';
            container.append(boxes);
            var titles = '<h2>Countdown To <a class="countdownLink" href="' + linksSetting + '" target="blank">' + titleSetting + '</a></h2>';
            container.before(titles);
        }
        /*
	  	  <summary>Finds the Time Needed to reach the requested Date</summary>
	  	  <returns>Nothings</returns>
		*/
        function findTimeNeeded() {
            var today = calcTime(-6);
            var NeededDate = new Date(yearSetting, monthSetting, daySetting, hourSetting, minuteSetting);
            var msPerDay = 24 * 60 * 60 * 1000;
            var distance = NeededDate - today;
            var _second = 1000;
            var _minute = _second * 60;
            var _hour = _minute * 60;
            var _day = _hour * 24;

            if (distance <= 0) {
                var months = 0;
                var lastDayOfMonth = 0;
                var days = 0;
                var hours = 0;
                var minutes = 0;
                var seconds = 0;
            } else {
                var months = getMonthDiff(today, NeededDate);
                var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                console.log(months);
                if (months == 0) {
                    console.log('distance');
                    var days = Math.floor(distance / _day);
                } else {
                    var days = lastDayOfMonth.getDate() - today.getDate();
                }
                var hours = Math.floor((distance % _day) / _hour);
                var minutes = Math.floor((distance % _hour) / _minute);
                var seconds = Math.floor((distance % _minute) / _second);
            }
            //Put the them in the proper Areas
            container.find('.countDownMonth').html('<span class="countDownNumber">' + months + '</span><br><span class="countDownTitle">Months</span>');
            container.find('.countDownDays').html('<span class="countDownNumber">' + days + '</span><br><span class="countDownTitle">Days</span>');
            container.find('.countDownHours').html('<span class="countDownNumber">' + hours + '</span><br><span class="countDownTitle">Hours</span>');
            container.find('.countDownMinutes').html('<span class="countDownNumber">' + minutes + '</span><br><span class="countDownTitle">Minutes</span>');
            container.find('.countDownSeconds').html('<span class="countDownNumber">' + seconds + '</span><br><span class="countDownTitle">Seconds</span>');
            console.log(months + " months " + days + " days " + hours + ":" + minutes + ":" + seconds);
            //Gives class deactive to elements that no longer will have anything showing on it
            container.find('.countDownTitleHolder').each(function () {
                var number = $(this).find('.countDownNumber').text();
                var text = $(this).find('.countDownTitle').text();
                if (number == 0) {
                    if (text == "Seconds" && minutes == 0 && hours == 0 && days == 0 && months == 0) {
                        $(this).addClass('deactive');
                    } else if (text == "Minutes" && hours == 0 && days == 0 && months == 0) {
                        $(this).addClass('deactive');
                    } else if (text == "Hours" && days == 0 && months == 0) {
                        $(this).addClass('deactive');
                    } else if (text == "Days" && months == 0) {
                        $(this).addClass('deactive');
                    } else if (text == "Months" && months == 0) {
                        $(this).addClass('deactive');
                    }
                }
            });
        }
        /*
	  	  <summary>Adds the holders to the selected element</summary>
	  	  <param name="today">Todays Date</param>
		  <param name="NeededDate">The Requested Date</param>
	  	  <returns>Months Needed to reach Needed date</returns>
		*/
        function getMonthDiff(today, NeededDate) {
            var months = (NeededDate.getFullYear() - today.getFullYear()) * 12;
            months -= today.getMonth() + 1;
            months += NeededDate.getMonth();
            return months <= 0 ? 0 : months;
        }
        /*
	  	  <summary>Adds the holders to the selected element</summary>
	  	  <param name="offset">The offset of time based on TimeZones</param>
	  	  <returns>Returns the current date and time based on the offset</returns>
		*/
        function calcTime(offset) {
            var date = new Date();
            var utc = date.getTime() + (360 * 60000);
            var nd = new Date(utc + (3600000 * offset));
            return nd;
        }
    };
}(jQuery));