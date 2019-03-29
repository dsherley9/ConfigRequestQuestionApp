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

    //Bootstrap Notify Default
    $.notifyDefaults({
        type: 'success',
        allow_dismiss: false
    });

    //Quill
    var toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],

        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction

        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],

        ['clean']                                         // remove formatting button
    ];

    var quill = new Quill('#q-editor', {
        modules: {
            toolbar: toolbarOptions
            
        },
        placeholder: "Enter Text..",
        theme: 'snow'
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


function skeleton(source, isArray) {
    var o = Array.isArray(source) ? [] : {};
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            var t = typeof source[key];
            o[key] = t == 'object' ? skeleton(source[key]) : { string: '', number: 0, boolean: false }[t];
        }
    }
    return o;
}

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


/*-----------------------------------------------------------------------
 * Function that will allow you to handle double clicks and single clicks
 * --------------------------------------------------------------------*/

$.fn.singleAndDouble = function (singleClickFunc, doubleClickFunc, optElement) {
    // This means it'll take a minimum of 200ms to take the single
    // click action. If it's too short the single and double actions
    // will be called.
    // The default time between clicks on windows is 500ms (http://en.wikipedia.org/wiki/Double-click)
    // Adjust accordingly. 
    var timeOut = 300;
    var timeoutID = 0;
    var ignoreSingleClicks = false;
    

    this.on('click', optElement, (event) => {
        if (!ignoreSingleClicks) {
            // The double click generates two single click events
            // and then a double click event so we always clear
            // the last timeoutID
            clearTimeout(timeoutID);
            timeoutID = setTimeout(() => singleClickFunc(event), timeOut);
        }
    });

    this.on('dblclick', optElement, (event) => {
        clearTimeout(timeoutID);
        ignoreSingleClicks = true;
        setTimeout(() => ignoreSingleClicks = false, timeOut);
        doubleClickFunc(event);
    });

};


