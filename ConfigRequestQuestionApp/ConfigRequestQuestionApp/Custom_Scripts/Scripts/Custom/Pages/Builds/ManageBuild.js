
/*-------------------------------------------------------------
 * Form Controls
 * ----------------------------------------------------------*/
/*BUILD Form*/
var $buildTitleTxt = $('.manage-build-title h2');
var $buildNameTxt = $('.manage-build-field #build-name');
var $versionDrpDwn = $('.versions-drp-dwn .selectpicker');
var $solutionDrpDwn = $('#solution-meaning.selectpicker');
var $lastUpdatedTxt = $('.manage-build-field #last_update_date');
var $lastUpdatedByTxt = $('.manage-build-field #last_updated_by');
var $verionNumTxt = $('.manage-build-field #version-num');

/*Question Tree*/
var $buildTree = $('#build-js-tree');
var $searchTreeTxt = $('#txt-tree-search');

/*Question Form*/
var $questionSlideOut = $('#question-slide-out');
var $questionTypeDrpDwn = $('.question-type-drp-dwn .selectpicker');
var $questionOptionsList = $('#q-option-list');
var $addQuestionOptionBtn = $('i.q-option-add');
var $deleteQuestionOptionBtn = $('i.q-option-delete');
var $optionsContainer = $('#q-options-container');
var $questionChildrenDrpDwn = $('#q-options-list');
var $questionTabSpinner = $('#q-tab-spinner');
var $questionTabLabel = $('#q-tab-label');

var $questionTitleTxt = $('input#question-title');
var $requiredToggle = $('#required-toggle');

/*-------------------------------------------------------------
 * Form Objects
 * ----------------------------------------------------------*/
var buildData = {};
var currentVersionIDX = 0;
var availableChildren;
var singleClickCalled = false;

/*-------------------------------------------------------------
 * ----------------------------------------------------------*/


//On Load
$(document).ready(function () {
    InitializeForm();   
});

function InitializeForm() {

    var formLoad = new Array;    

    const loadDropDowns = GetDropDowns();

    formLoad.push(loadDropDowns);

    loadDropDowns
        .then((result) => {
            let codeValues = result;
            for (var i = 0; i < codeValues.length; i++) {
                switch (codeValues[i].codeSet) {

                    case 100:
                        $questionTypeDrpDwn.append("<option data-tokens='' value='" + codeValues[i].codeValue + "' >" + codeValues[i].description + "</option>");
                        break;

                    case 200:
                        $solutionDrpDwn.append("<option data-tokens='' value='" + codeValues[i].codeValue + "' >" + codeValues[i].description + "</option>");
                        break;

                    default:
                        break;
                }
                
            }
            $solutionDrpDwn.selectpicker('refresh');
            $questionTypeDrpDwn.selectpicker('refresh');
        })
        .catch((error) => {
            $questionTypeDrpDwn.append("<option data-tokens='' value='1'>Error Loading...</option>");
            $questionTypeDrpDwn.selectpicker('refresh');
            $questionTypeDrpDwn.selectpicker('val', 1).attr('disabled', 'true');
            console.log(error);
        }
        );

    const loadBuildData = BuildDataInitialize(buildRequest = {
        type: getUrlParameter('type'), 
        bID: getUrlParameter('bID'),
        vID: 0 //Defaulting to 0 for now, which will load the current build version.
    });

    formLoad.push(loadBuildData);

    //After DB Calls, BIND Form Objects
    BuildFormBind();

    //Build Data Promise
    loadBuildData
        .then((result) => {

            buildData = result;
            currentVersionIDX = buildData.BuildVersionList.findIndex(x => x.VersionId === parseInt(buildData.SelectedVersion));

            //Bind Question Tree
            QuestionFormBind();
            QuestionTreeBind();            

            //Build Name
            $buildTitleTxt.text(buildData.CurrentBuildName);
            $buildNameTxt.val(buildData.BuildVersionList[currentVersionIDX].BuildName);

            //Solution [MAY NEED TO IMPLEMENT ASYNC/AWAIT ON THIS FUNCTION, so drop down is poplulated before setting value. Working for now.]
            $solutionDrpDwn.selectpicker('val', buildData.BuildVersionList[currentVersionIDX].SolutionCD);

            //Selected Version
            $verionNumTxt.val(buildData.BuildVersionList[currentVersionIDX].VersionNum);

            //Last Updated
            let dateCnvt = new Date(parseInt(buildData.BuildVersionList[currentVersionIDX].VUpdt.substr(6)));
            $lastUpdatedTxt.val(dateCnvt.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }));

            //Last Updated By
            $lastUpdatedByTxt.val(buildData.BuildVersionList[currentVersionIDX].VUpdtName);

            //Add Versions
            for (var i = 0; i < buildData.BuildVersionList.length; i++) {
                $versionDrpDwn.append("<option data-tokens='' value='" + buildData.BuildVersionList[i].VersionId + "' title='Version " + buildData.BuildVersionList[i].VersionNum + "' >" + buildData.BuildVersionList[i].VersionNum + "</option>");
            }
            $versionDrpDwn.selectpicker('refresh');
            $versionDrpDwn.selectpicker('val', buildData.BuildVersionList[currentVersionIDX].VersionId);

        })
        .catch((error) => {
            $('.manage-build-title h2').text("Error loading build..");
            $("#build-name").val("Error: " + error);
        });


    //wait for load
    Promise.all(formLoad).then(() => {
        formLoad.forEach((e, i, arr) => console.log(arr[i]));
        $('.manage-build-loader').hide("slow");
        $('.manage-build-form').removeClass('d-none');
    });

}

function QuestionFormBind() {

    $questionTypeDrpDwn.on('changed.bs.select', (e) => {
        //console.log($(e.currentTarget).val());
        $(e.currentTarget).val() == 2 || $(e.currentTarget).val() == 3 || $(e.currentTarget).val() == 4 ? $optionsContainer.show() : $optionsContainer.hide();
    });
    
}


function QuestionTreeBind() {

    //Bind Current Tree
    $buildTree.jstree({
        'core': {
            'data': buildData.BuildVersionList[currentVersionIDX].JSTree
            , "check_callback": true
        }
        , "plugins": ["dnd", "search"]
    });
    
    //Bind Tree Search
    var to = false;
    $searchTreeTxt.keyup(function () {
        if (to) { clearTimeout(to); }
        to = setTimeout(function () {
            var v = $searchTreeTxt.val();
            $buildTree.jstree(true).search(v);
        }, 250);
    });


    /*-------------------------------------------------------------------------------------------------
     * This is very important for the JSTree. It's a handler for single and double clicks. Though it 
     * looks redundant, it's NOT. When using "select_node.jstree", a 'dblclick' would call it 
     * twice. This means that it was calling all the question load functions multiple times. This 
     * handles double clicks and single clicks and makes sure there is only one call. Will significantly
     * speed up processing.
     * ------------------------------------------------------------------------------------------------*/
    var singleClickCalled = false;
    $buildTree.singleAndDouble(
        (e) => {
            $questionTabLabel.text("Loading...");
            $questionTabSpinner.show();
            singleClickCalled = true;
            //console.log('Single Click Captured');
            //console.log(e.target);
            let node = $(e.target).closest("li");
            LoadQuestionTab(node[0].id);
            setTimeout(()=>singleClickCalled = false, 300);

        },
        (e) => {
            if (singleClickCalled) {
                // This is actually an error state
                // it should never happen. The timeout would need
                // to be adjusted because it may be too close
                // console.log('Single & Double Click Captured');
            }
            else {
                //console.log('Double Click Captured');
                //console.log(e.target);
                $questionTabLabel.text("Loading...");
                $questionTabSpinner.show();
                let node = $(e.target).closest("li");
                LoadQuestionTab(node[0].id);  
                popOutQuestion();
            }

            singleClickCalled = false;
        },
        '.jstree-anchor' 
    );
}

function popOutQuestion() {
    setTimeout(() => {
        $questionSlideOut.hasClass("q-show") ? null : $questionSlideOut.addClass("q-show");
    }, 200);
    
}

function LoadQuestionTab(loadID) {
            /*Selected Info*/
            let selectedQuestion = $buildTree.jstree('get_node', parseInt(loadID));
            availableChildren = new Array();

            let qIDX = buildData.BuildVersionList[currentVersionIDX].QuestionList.findIndex(x => x.QuestionID === parseInt(loadID));
            let qTitle = buildData.BuildVersionList[currentVersionIDX].QuestionList[qIDX].QuestionTitle;
            //get children so if the end user wants to make conditional, they know what questions they can select;
            availableChildren.splice(0, availableChildren.length);//resets array, and references to array
            selectedQuestion.children.forEach((e, i, arr) => availableChildren.push(arr[i]));

            //clear child questions drop down
            $questionChildrenDrpDwn.children().remove().end();


            //Always reset options form with 0    
            ResetQuestionOptions(0);

            let qTypeMeaning = buildData.BuildVersionList[currentVersionIDX].QuestionList[qIDX].QTypeMeaning;
            if (qTypeMeaning === "MULTISELECT" || qTypeMeaning === "YESNO" || qTypeMeaning === "RADIOBUTTONS") {

                //Add option controls to form
                AddQuestionOption(buildData.BuildVersionList[currentVersionIDX].QuestionList[qIDX].QOptions.length);

                //Populate controls with existing data

                let qI = 0;
                $questionOptionsList.find('.q-option-list-item').not('#new-option-placeholder').each(
                    function () {
                        //load option
                        $(this).find('.q-option-text-input')
                            .val(buildData.BuildVersionList[currentVersionIDX].QuestionList[qIDX].QOptions[qI].LabelText);
                        $(this).find('.selectpicker')
                            .selectpicker('val', buildData.BuildVersionList[currentVersionIDX].QuestionList[qIDX].QOptions[qI].ChildID)
                            .selectpicker('refresh');
                        //next option
                        ++qI;
                    });
            }


            $('#question-slide-out .question-tab-inner').attr('data-original-title', qTitle);
            $questionTabLabel.text(qTitle.substring(0, 10) + "...");

            //Set Question Info
            $questionTitleTxt.val(buildData.BuildVersionList[currentVersionIDX].QuestionList[qIDX].QuestionTitle);
            $questionTypeDrpDwn.selectpicker('val', buildData.BuildVersionList[currentVersionIDX].QuestionList[qIDX].QTypeCD);

            buildData.BuildVersionList[currentVersionIDX].QuestionList[qIDX].IsRequired ? $requiredToggle.bootstrapToggle('off') : $requiredToggle.bootstrapToggle('on');

            $questionSlideOut.removeClass('d-none').addClass('show-slide');
            $('#question-text-editor').removeClass('d-none').addClass('show-slide');
            $questionTabSpinner.hide('slow');
}



function BuildFormBind() {

    //Question Slide Out Click
    $('#question-slide-out .question-tab').on("click", () => {
        if ($questionSlideOut.hasClass('q-show')) {
            $('#question-text-editor').removeClass('q-show');
        }
        $questionSlideOut.toggleClass("q-show");
    });

    //Body Click -> NOT Question Slide Out
    $(document.body).on("click", (e) => {

        let container = $(".question-slide-out");

        if (!container.is(e.target) && container.has(e.target).length === 0) {
            if ($questionSlideOut.hasClass('q-show')) {
                $questionSlideOut.removeClass('q-show');
                $('#question-text-editor').removeClass('q-show');
            }
        }
    });


    //Inner Question Slide Out - Text Editor
    $('#question-text-go-back').on('click', () => {
        $('#question-text-editor').removeClass('q-show');
        e.stopPropagation();
    });

    $('#what-this-btn').on("click", () => {
        $('#question-text-editor').toggleClass("q-show");
        e.stopPropagation();
    });

    //Bind New Options for Questions
    $addQuestionOptionBtn.on("click", () => {
        AddQuestionOption(1);
        e.stopPropagation();
    });

    //Bind Delete Options for Questions
    $questionOptionsList.on("click", '.q-option-delete', (e) => {
        $(e.currentTarget).closest("li.q-option-list-item").remove();
        e.stopPropagation();
    });

}

function ResetQuestionOptions(cntDefault) {

    $questionOptionsList.children('.q-option-list-item').not('#new-option-placeholder').remove();


    if (cntDefault >= 1) {
        AddQuestionOption(cntDefault);
    }

    //if (callback && typeof callback === 'function') {
    //    callback(optDefault);
    //    // Do some other stuff if callback is exists.
    //}
}

function AddQuestionOption(cntOptions) {
    var newOptionHTML = "";

    for (var i = 0; i < cntOptions; i++) {

        let newOptionID = $('ul.q-option-list .q-option-list-item').not('#new-option-placeholder').length + 1 + i;
        newOptionHTML += '<li id="q-option-list-item-' + newOptionID + '" class="q-option-list-item"><div class="q-option-manage"><i class="q-option-manage-icon q-option-delete far fa-2 fa-minus-square"></i></div ><input class="form-control q-option-text-input" type="text" value="">';
        newOptionHTML += '<select class="show-tick q-option-child-input selectpicker" title="Choose a child question..." data-style="btn-outline-primary" data-width="100%" data-live-search="true">';

        //load child drop down
        for (var j = 0; j < availableChildren.length; j++) {
            let qIDX = buildData.BuildVersionList[currentVersionIDX].QuestionList.findIndex(x => x.QuestionID === parseInt(availableChildren[j]));
            newOptionHTML += "<option data-tokens='' value='"
                + availableChildren[j] + "' >"
                + buildData.BuildVersionList[currentVersionIDX]
                    .QuestionList[qIDX]
                    .QuestionTitle + "</option>";
        }
        newOptionHTML += '</select></li>';
    }

    $("#new-option-placeholder").before(newOptionHTML);
    $("#q-options-container .q-option-list .q-option-child-input").selectpicker('refresh');
}

async function BuildDataInitialize(buildRequest) {
    try {

        let result;

        result = $.ajax({
            type: "POST",
            url: "/Builds/BuildDataInitialize",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(buildRequest),
            dataType: "json"
        });

        return result;

    } catch (err) {
        return new error(err);
    }
}

async function GetDropDowns() {

    var codesets = {};
    //separate code values by "|"
    codesets.codesetQuery = "100|200";

    try {

        let result;

        result = $.ajax({
            type: "POST",
            url: "/Home/GetCodeSet",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(codesets),
            dataType: "json"
        });

        return result;

    } catch (err) {
        return new error(err);
    }

}


function PostBuildData() {
    $.ajax({
        type: "POST",
        url: "/Builds/PostBuildData",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(buildData),
        dataType: "json",
        error: err => console.log(err),
        success: resp => console.log(resp)
    });    
}


