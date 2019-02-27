﻿//-----------------------------------------------//
// PAGE Load
//-----------------------------------------------//
$(document).ready(function () {

    //BIND flatpickr to DATETIME controls
    $(".f-datepicker").flatpickr({
        altInput: true,
        altFormat: "F j, Y h:i K",
        dateFormat: "Y-m-d",
        enableTime: true,
    });

    /* Initialise datatables */
   //$('#myTable').DataTable({
   //     "scrollY": '50vh',//$(window).height() * 50 / 100,
   //     "scrollCollapse": true
   // });

    $('#myTable').DataTable({
        "scrollY": '45vh',//$(window).height() * 50 / 100,
        "scrollCollapse": true,
        initComplete: function () {
            this.api().columns().every(function () {
                var column = this;
                var select = $('<select class="browser-default custom-select"><option value=""></option></select>')
                    .appendTo($(column.header('div.row.myTable-column-filter')))
                    .on('change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );

                        column
                            .search(val ? '^' + val + '$' : '', true, false)
                            .draw();
                    });

                column.data().unique().sort().each(function (d, j) {
                    select.append('<option value="' + d + '">' + d + '</option>');
                });
            });
        }
    });

    //BIND Dropdowns
    $('body')
        .on('mouseenter mouseleave', '.dropdown', toggleDropdown)
        .on('click', '.dropdown-menu a', toggleDropdown);


    //Initial Tabular Form

    if (window.location.href.indexOf("Builds/build/") > -1) {
        BuildQuestionFormBind();
    }

    /*-----------------
     TREE FUNCTIONS
     -----------------*/

    if (window.location.href.indexOf("/Builds/ManageBuild") > -1) {

        switch (getUrlParameter('type')) {

            case "Edit":

                var data = {};
                data.bID = getUrlParameter('bID');
                data.vID = 0; //Defaulting to 0 for now, which will load the current build version.
                //data.vID = getUrlParameter('vID');

                $.ajax({
                    type: "POST",
                    url: "/Builds/GetBuildTree",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(data),
                    dataType: "json",
                    success: function (result, status, xhr) {

                        //version_id to load
                        var _versionID = result.SelectedVersion;
                        var vIDX = result.BuildVersionList.findIndex(x => x.VersionId === _versionID);

                        //Bind Current Tree
                        $('#build-js-tree').jstree({
                            'core': {
                                'data': result.BuildVersionList[vIDX].JSTree
                                , "check_callback": true
                            }
                            , "plugins": ["dnd", "search"]
                        });

                        //Build Name
                        $('.manage-build-title h2').text(result.BuildVersionList[vIDX].BuildName);
                        $('.manage-build-field #build-name').val(result.BuildVersionList[vIDX].BuildName);

                        //Solution
                        $('.manage-build-field #solution-meaning').val(result.BuildVersionList[vIDX].SolutionMeaning);

                        //Selected Version
                        $('.manage-build-field #version-num').val(result.BuildVersionList[vIDX].VersionNum);

                        //Add Versions
                        for (var i = 0; i < result.BuildVersionList.length; i++) {
                            $('.versions-drp-dwn button').append(' ' + result.BuildVersionList[i].VersionNum);

                            //if current version (future implementation)
                            //style='background-color:#6c757d; color:#fff;'
                            $('.versions-drp-dwn .dropdown-menu').append("<a class='dropdown-item' value='" + result.BuildVersionList[i].VersionId + "'>" + result.BuildVersionList[i].VersionNum + "</a>");
                        }

                        //Last Updated
                        var date = result.BuildVersionList[vIDX].VUpdt;
                        //var nowDate = new Date(parseInt(date.substr(6)));
                        //var tempDate = "";
                        //tempDate += nowDate.format("ddd mmm dd yyyy HH:MM:ss") + " ";
                        $('.manage-build-field #last_update_date').val(date);

                        //Last Updated By
                        $('.manage-build-field #last_updated_by').val(result.BuildVersionList[vIDX].VUpdtName);

                        //Bind Tree Search
                        var to = false;
                        $('#txt-tree-search').keyup(function () {
                            if (to) { clearTimeout(to); }
                            to = setTimeout(function () {
                                var v = $('#txt-tree-search').val();
                                $('#build-js-tree').jstree(true).search(v);
                            }, 250);
                        });

                        //Troubleshooting
                        //$('#json-troubleshoot').append(JSON.stringify(result));

                        $('.manage-build-loader').hide("slow");
                        $('.manage-build-form').removeClass('d-none');
                    },
                    error: function (xhr, status, error) {
                        $("#build-js-tree").html("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText);
                    }
                });
                
                break;

            default:

                $('.manage-build-loader').hide();
                $('.manage-build-form').removeClass('d-none');
                break;
        }


    }
});



//-----------------------------------------------//
// Global
//-----------------------------------------------//

function toggleDropdown(e) {
    let _d = $(e.target).closest('.dropdown'),
        _m = $('.dropdown-menu', _d);
    setTimeout(function () {
        let shouldOpen = e.type !== 'click' && _d.is(':hover');
        _m.toggleClass('show', shouldOpen);
        _d.toggleClass('show', shouldOpen);
        $('[data-toggle="dropdown"]', _d).attr('aria-expanded', shouldOpen);
    }, e.type === 'mouseleave' ? 300 : 0);
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


//-----------------------------------------------//
// Builds Table
//-----------------------------------------------//

//Bind Click

$("#myTable tbody tr").on("click", function (e) {
    var buildURL = $(this).data('request-url');
    window.location = buildURL;
    //alert(buildURL);
});


//-----------------------------------------------//
// Question Form
//-----------------------------------------------//

var stackQueue = new Array();
var previousQueue = 0;
var firstQID = 0

function BuildQuestionFormBind() {

    //Set first question as current
    firstQID = $('.question-inner').first().attr('class').match(/QID-(\d+)?/)[1];
    ShowQuestion(firstQID);


    //BIND Question Click
    $('#build-question-list ul li').on("click", function () {
        var directQID;

        if ($(this).hasClass('QID-f-sum')){
            directQID = "f-sum";
        } else if ($(this).hasClass('QID-f-thanks')){
            directQID = "f-thanks";
        } else {
            directQID = this.className.match(/QID-(\d+)?/)[1];
        }
        
        HideCurrentQuestion();
        ShowQuestion(directQID);
    });


    //BIND Next Question Click
    $('button.next-btn').on("click", function () {

        //Validate input
        if (!ValidateClientQuestionInput()) {
            alert("Whoops, looks like you missed something!");
        }
        else {
            //var optionSelect = new Array();

            var nextQID = 0;
            var queueID = 0;

            //Determine the next QID
            if ($('.question-inner.cur-q .question-form-input').find(".Input-Control").hasClass("Conditional")) {
                //If conditional, push conditional ID (Next QID) to queue

                //For each control that is checked, push to queue and selected options
                $($('.question-inner.cur-q .question-form-input').find(".Input-Control").get().reverse()).each(function () {
                    queueID = this.className.match(/childQ-(\d+)?/)[1];
                    if ($(this).is(":checked")) {
                        if (!($("#build-question-list ul li.QID-" + queueID).hasClass("in-pth") || $.inArray(queueID, stackQueue) !==-1 )) {
                            stackQueue.push(queueID);
                        }
                    } else {
                        RemovePath(queueID);
                    }

                });

                 //Get from queued, should always be one if within
                nextQID = stackQueue.length > 0 ? stackQueue.pop() : 0;

            } else {//Direct relationship path, only one child

                //Get Next Direct QID
                if (!$('.question-inner.cur-q').hasClass("QID-f-sum")) {
                    //childQ-X = Child Question
                    $($('.question-inner.cur-q .question-form-input').find(".Input-Control").get()).each(function () {
                        nextQID = this.className.match(/childQ-(\d+)?/)[1];
                    });
                } else {
                    nextQID = 0;
                }
              
            }

            //if not equal to 0, there is still a child to go to
            if (!(nextQID == 0)) {
                HideCurrentQuestion();
                ShowQuestion(nextQID);
            }
            else {

                //checkqueue
                if (stackQueue.length > 0) {
                    nextQID = stackQueue.pop();

                    //if pushed a end path or 0 is in there, move till a child is found
                    while (nextQID == 0) {
                        nextQID = stackQueue.pop();
                    }

                    if (!(nextQID == 0)) {
                        HideCurrentQuestion();
                        ShowQuestion(nextQID);
                    } else { ValidateEndPath();}
                }
                else {ValidateEndPath();}                
            }
        }
    });


    function ValidateEndPath() {

        var nextItems = $("#build-question-list ul li.cur-q").nextAll('li');

        if (nextItems.hasClass('in-pth') &&
                !(nextItems.filter('li.in-pth').first().hasClass('QID-f-sum')
                ||nextItems.filter('li.in-pth').first().hasClass('QID-f-thanks'))
            ) {
            //alert("There is a next item in path.");
            HideCurrentQuestion();
            let QID = nextItems.closest('li.in-pth').attr('class').match(/QID-(\d+)?/)[1];
            ShowQuestion(QID);
        }
        else {
            if ($('.question-inner.cur-q').hasClass("QID-f-sum")) {
                //go to thank you
                HideCurrentQuestion();
                ShowQuestion("f-thanks");
            } else {
                //go to summary
                HideCurrentQuestion();
                ShowQuestion("f-sum");

            }
        }
    }

    function RemovePath(QID) {
        let childQ;
        let stillQueuedIDX;

        $("#build-question-list ul li.QID-" + QID).addClass('d-none').removeClass('in-pth');
        $('.question-inner.QID-' + QID).addClass('d-none').removeClass('in-pth');

        //if child in-pth, remove
        $($('.question-inner.QID-' + QID + ' .question-form-input').find(".Input-Control").get()).each(function () {
            childQ = this.className.match(/childQ-(\d+)?/)[1];

                //Check if conditional path is queued, if 
                stillQueuedIDX = $.inArray(childQ, stackQueue);

                switch (stillQueuedIDX) {
                    case -1: //<-not queued
                        //check if in path
                        if ($("#build-question-list ul li.QID-" + childQ).hasClass('in-pth')) {
                            RemovePath(childQ);
                        }
                        break;
                    default: //still queued
                        stackQueue.splice(stillQueuedIDX, 1);
                }
        });
    }

    function HideCurrentQuestion() {
        //Hide Current Question and Remove as Current
        $('.question-inner.cur-q').removeClass("cur-q").addClass("d-none");
        $("#build-question-list ul li.cur-q").removeClass('cur-q active');
    }

    function ShowQuestion(nQID) {
        //Display Next Question and Set as Current
        $("#build-question-list ul li.QID-" + nQID).removeClass('d-none').addClass('cur-q in-pth active');
        $('.question-inner.QID-' + nQID).removeClass('d-none').addClass('cur-q in-pth');

        //if on parent, disable previous button
        if (nQID == firstQID) {$('button.prev-btn').attr('disabled', true);}else {$('button.prev-btn').attr('disabled', false);}
        //if on end, disable button
        if (nQID == "f-thanks") { $('button.next-btn').attr('disabled', true); } else { $('button.next-btn').attr('disabled', false) }

        //Scroll to current question
        $('#build-question-list').scrollTo($('#build-question-list ul li.cur-q'), 100);

        //Update Percentage Complete
        var percent = $('#build-question-list ul li.cur-q').attr('class').match(/PERC-(\d+\.?\d{0,9}|\.\d{1,9})?/)[1];

        $("#build-form-progress-inner").css("width", percent + "%");
        $("#build-form-progress-inner").attr("aria-valuenow", percent);
    }

    function ValidateClientQuestionInput() {
        var validInput = false;
        var inputControls = [];
        inputControls = $('.question-inner.cur-q .question-form-input').find(".Input-Control");
        //alert(inputControls.length);

        //check that atleast one is checked
        if ($('.question-inner.cur-q').hasClass("MULTISELECT")) {
            for (var i = 0; i < inputControls.length; i++) {
                if ($(inputControls[i]).prop("checked")) {
                    validInput = true;
                    break; //if found one, can exit
                }
            }
        }
        else { /*Temporary till all controls are done**/
            validInput = true;
        }

        //if input required, check input
        if (inputControls.prop("required")) {
            return validInput;
        } else //check for null input, and WARN?
        {
            validInput = true;
            //alert("Not required!");
            return validInput;
        }
    }

    /*
        Load in all items that are in the path to the summar page with the results they gave
        No values needing to be passed in
        does not return anything - writes out to the QID-f-sum class the results
    */
    function loadSummaryPage() {
        var htmlValue = "<ul>"
        $(".question-inner.in-pth").each(function () {
            htmlValue += "<li>" + $(this).find(".question-form-title h2").text() + "</li>";
            htmlValue += "<ul>"
            $(this).find("input[type=checkbox]").each(function () {
                if ($(this).is(":checked")) {
                    htmlValue += "<li>" + $(this).val() + "</li>"
                }  
            })

            htmlValue += "</ul>"

        });
        htmlValue += "</ul>"

        $(htmlValue).insertAfter($('.QID-f-sum').find('h2'));

      
    }


    $('button.prev-btn').on("click", function () {

        var prevQ;

        if ($('.question-inner.cur-q').hasClass("QID-f-thanks")) {
            prevQ = "f-sum";   
        }
        else
        {
            prevQ = $("#build-question-list ul li.cur-q").closest('li').prevAll(".in-pth").attr('class').match(/QID-(\d+)?/)[1];
        }
         
        //var prevQ = $("#build-question-list ul li.cur-q").attr('class').match(/parentQ-(\d+)?/)[1];
        HideCurrentQuestion();
        ShowQuestion(prevQ);
        //alert("enter previous" + prevQ);
    });
}

