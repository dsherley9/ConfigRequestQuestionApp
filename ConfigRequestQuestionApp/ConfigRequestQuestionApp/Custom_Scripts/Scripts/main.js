//-----------------------------------------------//
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
    Tabular();

});


//-----------------------------------------------//
// Global Dropdown
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

function Tabular() {

    //Set first question as current
    $('.question-inner').first().removeClass('d-none').addClass('cur-q in-pth');

    //Unhide first question
    $('#build-question-list ul li').first().removeClass('d-none').addClass('cur-q in-pth active');

    ////Disable previous button since first question
    //$('button.PreviousQuestion').first().prop('disabled', true);


    //Next Question Click
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
                    if ($(this).is(":checked")) {
                        queueID = this.className.match(/childQ-(\d+)?/)[1];
                        stackQueue.push(queueID);
                    }
                });

                 //Get from queued, should always be one if within
                nextQID = stackQueue.pop();

            } else {//Direct relationship path, only one child

                //Get Next Direct QID
                if (!$('.question-inner.cur-q').hasClass("f-sum")) {
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
                ShowNextQuestion(nextQID);
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
                        ShowNextQuestion(nextQID);
                    } else {
                        //alert("No More Items in the list");

                        if ($('.question-inner.cur-q').hasClass("f-sum")) {
                            //go to thank you
                            HideCurrentQuestion();
                            ShowNextQuestion("f-thanks");
                        } else {
                            //go to summary
                            HideCurrentQuestion(); 
                            ShowNextQuestion("f-sum");
                            
                        }
                    }
                }
                else {
                    //alert("No More Items in the list");
                    if ($('.question-inner.cur-q').hasClass("f-sum")) {
                        //go to thank you
                        HideCurrentQuestion();
                        ShowNextQuestion("f-thanks");
                    } else {
                        //go to summary
                        HideCurrentQuestion();
                        loadSummaryPage();
                        ShowNextQuestion("f-sum");
                    }
                }                
            }
        }
    });

    function HideCurrentQuestion() {
        //Hide Current Question and Remove as Current
        $('.question-inner.cur-q').removeClass("cur-q").addClass("d-none");
        $("#build-question-list ul li.cur-q").removeClass('cur-q active');
    }

    function ShowNextQuestion(nQID) {
        //Display Next Question and Set as Current
        $("#build-question-list ul li." + nQID).removeClass('d-none').addClass('cur-q in-pth active');
        $('.question-inner.' + nQID).removeClass('d-none').addClass('cur-q in-pth');
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
        does not return anything - writes out to the f-sum class the results
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

        $(htmlValue).insertAfter($('.f-sum').find('h2'));

      
    }


    $('button.prev-btn').on("click", function () {
        alert("enter previous");
    });
}

