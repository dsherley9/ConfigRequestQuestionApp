//-----------------------------------------------//
// Global
//-----------------------------------------------//

$(document).ready(function () {

    //BIND flatpickr to DATETIME controls
    $(".f-datepicker").flatpickr({
        altInput: true,
        altFormat: "F j, Y h:i K",
        dateFormat: "Y-m-d",
        enableTime: true
    });

    //Bind Bootstrap Tool Tips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

    //Bind All Select Pickers
    $('.selectpicker').selectpicker();

    //BIND Dropdowns
    //$('body')
    //    .on('mouseenter mouseleave', '.dropdown', toggleDropdown)
    //    .on('click', '.dropdown-menu a', toggleDropdown);
    //});


    //function toggleDropdown(e) {
    //    let _d = $(e.target).closest('.dropdown'),
    //        _m = $('.dropdown-menu', _d);
    //    setTimeout(function () {
    //        let shouldOpen = e.type !== 'click' && _d.is(':hover');
    //        _m.toggleClass('show', shouldOpen);
    //        _d.toggleClass('show', shouldOpen);
    //        $('[data-toggle="dropdown"]', _d).attr('aria-expanded', shouldOpen);
    //    }, e.type === 'mouseleave' ? 300 : 0);
});




var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};



