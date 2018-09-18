$(document).ready(function () {


    //Perform Functions
    $("#RosterTable").DataTable();
    performCountDown();
    performRotation();
    performHover();
    performRemoves();
    performCalendar();
    performImageEnlarge();
    

});
function performImageEnlarge() {

    $(".group1").colorbox({ rel: 'group1', transition: "fade", width: "75%", height: "75%" });
    $(".group2").colorbox({ rel: 'group2', transition: "fade", width: "75%", height: "75%" });
    
}
   
function performRemoves() {
    var removeText = $('form').parent().contents().filter(function () {
        return this.nodeType === 3
    });
    removeText.remove();
}
    function performHover(){
        $('.hoverNews, .showNews').on('hover', function () {
            $(this).parent().find('.showNews').show();   
        });
        $('.hoverNews, .showNews').on('mouseleave', function () {
            $(this).parent().find('.showNews').hide();
        });
        $('.ItemDiv, .MoreInfo').on('hover', function () {
            $(this).find('.MoreInfo').show();
        });
        $('.ItemDiv, .MoreInfo').on('mouseleave', function () {
            $(this).find('.MoreInfo').hide();
        });
    }
/*
 <summary>Performs the countdown plugin call</summary>
 <returns>Nothing</returns>
*/
function performCountDown() {
    var domain = document.domain;
    // domain = "http://" + domain + "/files/countdownchange.txt";
    domain = "http://localhost:62658/files/countdownchange.txt";
    var file = domain;
    var spit;
    $.get(file, function (data) {
        spit = data.split('\n');
        var date = spit[0];
        var time = spit[1];
        var title = spit[2];
        var links = spit[3];

        var dateSplit = date.split('/');
        var timeSplit = time.split(':');
        var month = dateSplit[0];
        var day = dateSplit[1];
        var year = dateSplit[2];
        var hour = timeSplit[0];
        var minute = timeSplit[1];
        $('#fall').CountDown({
            month: month,
            day: day,
            year: year,
            hours: hour,
            minute: minute,
            title: title,
            links: links,
        });
    });
}
/*
 <summary>Performs the image rotation</summary>
 <returns>Nothing</returns>
*/
function performRotation() {
    var domain = document.domain;
    // domain = "http://" + domain + "/files/rotationTabs.txt";
    domain = "http://localhost:62658/files/rotationTabs.txt";
    $('.introrotation').rotation({
        special: false,
        pullFromFeed: false,
        whichFeed: "newsFeed",/* newsFeed, spotlightFeed, ""(both) */
        csvLocation: domain,
        limit: 3,
    });
}