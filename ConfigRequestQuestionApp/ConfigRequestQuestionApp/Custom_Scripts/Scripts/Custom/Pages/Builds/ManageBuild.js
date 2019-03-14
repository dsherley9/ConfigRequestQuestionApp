
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
var $questionChildrenDrpDwn = $('.q-option-child-input.selectpicker');
var $questionOptionsList = $('ul.q-option-list');
var $addQuestionOptionBtn = $('i.q-option-add');
var $deleteQuestionOptionBtn = $('i.q-option-delete');
var $optionsContainer = $('#q-options-container')

var $questionTitleTxt = $('input#question-title');
var $requiredToggle = $('#required-toggle');

/*-------------------------------------------------------------
 * Form Objects
 * ----------------------------------------------------------*/
var buildData = {};
var currentVersionIDX = 0;

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

    /*Selected Info*/
    var selectedQuestion;
    var availableChildren = new Array();

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


    $buildTree.on("select_node.jstree", (e, data) => {
        //alert("node_id: " + data.node.id);
        //get node object
        selectedQuestion = (data.node);
        //get children so if the end user wants to make conditional, they know what questions they can select;
        availableChildren.splice(0, availableChildren.length);//resets array, and references to array
        selectedQuestion.children.forEach((e, i, arr) => availableChildren.push(arr[i]));

        //clear child questions drop down
        $questionChildrenDrpDwn.children().remove().end();

        //load child drop down
        for (var i = 0; i < availableChildren.length; i++) {
            let qIDX = buildData.BuildVersionList[currentVersionIDX].QuestionList.findIndex(x => x.QuestionID === parseInt(availableChildren[i]));
            $questionChildrenDrpDwn.append("<option data-tokens='' value='" +
                availableChildren[i]
                + "' >" + buildData.BuildVersionList[currentVersionIDX]
                    .QuestionList[qIDX]
                    .QuestionTitle + "</option>");
        }
        $questionChildrenDrpDwn.selectpicker('refresh');

        var qIDX = buildData.BuildVersionList[currentVersionIDX].QuestionList.findIndex(x => x.QuestionID === parseInt(selectedQuestion.id));
        var qTitle = buildData.BuildVersionList[currentVersionIDX].QuestionList[qIDX].QuestionTitle;

        $('#question-slide-out .question-tab-inner').attr('data-original-title', qTitle);
        $('#question-slide-out .question-tab-inner').text(qTitle.substring(0, 10) + "...");


        //Set Question Info
        $questionTitleTxt.val(buildData.BuildVersionList[currentVersionIDX].QuestionList[qIDX].QuestionTitle);
        $questionTypeDrpDwn.selectpicker('val', buildData.BuildVersionList[currentVersionIDX].QuestionList[qIDX].QTypeCD);

        buildData.BuildVersionList[currentVersionIDX].QuestionList[qIDX].IsRequired ? $requiredToggle.bootstrapToggle('off') : $requiredToggle.bootstrapToggle('on');

        $questionSlideOut.removeClass('d-none').addClass('show-slide');
        $('#question-text-editor').removeClass('d-none').addClass('show-slide');
    });

    //No double click event, have to manually bind.
    //https://github.com/vakata/jstree/issues/515
    $buildTree.on('dblclick', '.jstree-anchor', function (e) {
        var instance = $.jstree.reference(this),
            node = instance.get_node(this);

        $questionSlideOut.hasClass("q-show") ? null : $questionSlideOut.addClass("q-show");

    });

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
    });

    $('#what-this-btn').on("click", () => {
        $('#question-text-editor').toggleClass("q-show");
    });

    //Bind New Options for Questions
    var newOptionHTML = ('<li class="q-option-list-item"><div class="q-option-manage"><i class="q-option-manage-icon q-option-delete far fa-2 fa-minus-square"></i></div ><input class="form-control q-option-text-input" type="text" value="">');
    //newOptionHTML = newOptionHTML + '<select class="show-tick q-option-child-input selectpicker" title="Choose a child question..." data-style="btn-outline-primary" data-width="100%" data-live-search="true">';
    //newOptionHTML = newOptionHTML + $questionChildrenDrpDwn.eq(0).clone().html() + '</select>';

    $addQuestionOptionBtn.on("click", () => {
        $("#new-option-placeholder").before(newOptionHTML + $('div.q-option-child-input')[0].outerHTML);
        console.log($('div.q-option-child-input').eq(0).find('select').outerHTML);//.eq(0).clone().html());
        //console.log($questionChildrenDrpDwn.eq(0).clone().html());
    });
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


