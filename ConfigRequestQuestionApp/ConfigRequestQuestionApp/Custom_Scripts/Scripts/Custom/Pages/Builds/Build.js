$(document).ready(function () {
    //Initialize Form
    BuildQuestionFormBind();

});



//-----------------------------------------------//
// Question Form
//-----------------------------------------------//

var stackQueue = new Array();
var previousQueue = 0;
var firstQID = 0;

function BuildQuestionFormBind() {

    //Set first question as current
    firstQID = $('.question-inner').first().attr('class').match(/QID-(\d+)?/)[1];
    ShowQuestion(firstQID);


    //BIND Question Click
    $('#build-question-list ul li').on("click", function () {
        var directQID;

        if ($(this).hasClass('QID-f-sum')) {
            directQID = "f-sum";
        } else if ($(this).hasClass('QID-f-thanks')) {
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
                        if (!($("#build-question-list ul li.QID-" + queueID).hasClass("in-pth") || $.inArray(queueID, stackQueue) !== -1)) {
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
                    } else { ValidateEndPath(); }
                }
                else { ValidateEndPath(); }
            }
        }
    });


    function ValidateEndPath() {

        var nextItems = $("#build-question-list ul li.cur-q").nextAll('li');

        if (nextItems.hasClass('in-pth') &&
            !(nextItems.filter('li.in-pth').first().hasClass('QID-f-sum')
                || nextItems.filter('li.in-pth').first().hasClass('QID-f-thanks'))
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
        if (nQID == firstQID) { $('button.prev-btn').attr('disabled', true); } else { $('button.prev-btn').attr('disabled', false); }
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
        else {
            prevQ = $("#build-question-list ul li.cur-q").closest('li').prevAll(".in-pth").attr('class').match(/QID-(\d+)?/)[1];
        }

        //var prevQ = $("#build-question-list ul li.cur-q").attr('class').match(/parentQ-(\d+)?/)[1];
        HideCurrentQuestion();
        ShowQuestion(prevQ);
        //alert("enter previous" + prevQ);
    });
}
