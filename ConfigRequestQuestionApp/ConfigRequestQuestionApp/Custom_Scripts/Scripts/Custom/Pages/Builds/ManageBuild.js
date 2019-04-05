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
var $thisQSearch = $('#this-q-search');

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
var $conditionalToggle = $('#conditional-toggle');

/*-------------------------------------------------------------
 * Form Objects
 * ----------------------------------------------------------*/
var buildData = new Object();
var currentVersionIDX = 0;
var availableChildren;
var singleClickCalled = false;

/*-------------------------------------------------------------
 * ----------------------------------------------------------*/

var errorNotify = (msg, dispType) => {
    $.notify(
        {
        // options
            message: msg
        },
        {
            // settings
            type: dispType
            , placement: {
                from: 'bottom',
                align: 'right'
            }
            ,animate: {
                enter: 'animated fadeInRight',
                exit: 'animated fadeOutRight'
            }
            ,allow_dismiss: 'true'
        }

    );
};

//On Load
$(document).ready(function () {
    InitializeForm();  
});

async function InitializeForm() {

    try {
        var formLoad = new Array;

        const loadDropDowns = await LoadDropDowns();
        formLoad.push(loadDropDowns);

        const loadBuildData = LoadBuildInfo(buildRequest = {
            type: getUrlParameter('type'),
            bID: getUrlParameter('bID'),
            vID: 0 //Defaulting to 0 for now, which will load the current build version.
        });//.catch(new error(e));
        formLoad.push(loadBuildData);

        //After DB Calls, BIND Form Objects
        BuildFormBind();
        QuestionFormBind();

        //wait for load
        Promise.all(formLoad).then(() => {
            formLoad.forEach((e, i, arr) => console.log(arr[i]));
            $('.manage-build-loader').hide("slow");
            $('.manage-build-form').removeClass('d-none');
            RefreshQuestionList();
        });

    } catch (e) {
        console.log(e);
        errorNotify(e, "danger");
    }
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
    $('#question-text-go-back').on('click', (e) => {
        $('#question-text-editor').removeClass('q-show');
        e.stopPropagation();
    });

    $('#what-this-btn').on("click", (e) => {
        $('#question-text-editor').toggleClass("q-show");
        e.stopPropagation();
    });

    //Bind New Options for Questions
    $addQuestionOptionBtn.on("click", (e) => {
        AddQuestionOption(1);
        e.stopPropagation();
    });

    //Bind Delete Options for Questions
    $questionOptionsList.on("click", '.q-option-delete', (e) => {
        $(e.currentTarget).closest("li.q-option-list-item").remove();
        e.stopPropagation();
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
            , "themes": {
                "variant": "large"
            }
        }
        , "plugins": ["dnd", "search", "types"]
        , "types": {
            "root-direct": {
                "icon": "fas fa-archway fa-grip-lines"
                ,"max_children": 1
            }
            ,"root-conditional": {
                "icon": "fas fa-sitemap"
                ,"max_children": -1
            }
            ,"leaf-direct": {
                "icon": "fas fa-grip-lines"
                ,"max_children": 1
            }
            ,"leaf-conditional": {
                "icon": "fas fa-sitemap"
                ,"max_children": -1
            }
        }
    });

    //Bind Tree Search
    var to = false;
    $thisQSearch.keyup(function () {
        if (to) { clearTimeout(to); }
        to = setTimeout(function () {
            var v = $thisQSearch.val();
            $buildTree.jstree(true).search(v);
        }, 250);
    });


    $buildTree.bind(
        "changed.jstree", function (evt, data) {
            //selected node object: data.node;
            //console.log(evt);
            //console.log(data);
            SelectQuestionListItem(data.node.id, true);
        }
    );

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
            LoadQuestionInfo(node[0].id);
            setTimeout(() => singleClickCalled = false, 300);

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
                LoadQuestionInfo(node[0].id);
                popOutQuestion();
            }

            singleClickCalled = false;
        },
        '.jstree-anchor'
    );

    $('#btn-add-question').on('click', () => {
        let node = $buildTree.jstree('get_selected');
        let nodeData; 
        let qIDX;

        if (node.length > 0) {
            nodeData = $buildTree.jstree('get_node', node[0]);
            qIDX = buildData.BuildVersionList[currentVersionIDX].QuestionList.findIndex(x => x.QuestionID == nodeData.id);

            if (!buildData.BuildVersionList[currentVersionIDX].QuestionList[qIDX].IsConditional && nodeData.children.length > 0) {
                errorNotify("A non-conditional question can only have one child!", "danger");
            }
            else {
                console.log(nodeData);
                $buildTree.jstree('create_node', nodeData.id, "New Question", "last", function (cNode) {
                    console.log(cNode);
                    $buildTree.jstree('set_type', cNode, 'leaf-direct');
                    buildData.BuildVersionList[currentVersionIDX].addQuestion(cNode.id, cNode.parent);
                });
            }           
        } else {
            errorNotify("Please select a node to add a question to.", "danger");
        }
    });


}


//async function PopulateQuestions() {

//    const questionList = await GetQuestions();
//    $('#all-q-datatable').DataTable({
//        data: questionList,
//        "paging": false,
//        "ordering": false,
//        "info": false,
//        "scrollY": "500px",
//        "scrollCollapse": true,
//        "columns": [
//            { "data": "QuestionID" },
//            { "data": "QuestionTitle" },
//        ],
//        "columnDefs": [{
//            "targets": [0],
//            "visible": false,
//        },
//            {
//                "sWidth": "20%",
//                "mData": 1
//                //"targets": [1],
//                //render: $.fn.dataTable.render.ellipsis(30)
//            }

//        ],
//        fixedColumns:false
//    });

//    var table = $('#all-q-datatable').DataTable();

//    $('#all-q-datatable tbody').on('click', 'tr', function () {
//        let data = table.row(this).data();
//        console.log(data);
//        alert('You clicked on ' + data.QuestionTitle + '\'s row');
//    });


//    RefreshQuestionList();
    

//    //console.log(questionList);
//}


function RefreshQuestionList() {

    var options = {
        valueNames: ['QuestionTitle']
    };

    let thisQHTML = "";
    buildData.BuildVersionList[currentVersionIDX].QuestionList.forEach((e, i, arr) => {
        let classList = "";
        let additionalQuestionInfo = "<div class='question-props'>";

        //if in tree, lock question
        if (arr[i].NodeLevel > 0) {
            classList += " locked ";
            additionalQuestionInfo += "<span class='prop-item in-tree fab fa-pagelines' data-placement='left' data-toggle='tooltip' title data-original-title='In Build Tree'></span>";
        } else {
            additionalQuestionInfo += "<span class='prop-item not-in-tree fas fa-circle-notch' data-placement='left' data-toggle='tooltip' title data-original-title='NOT in Build Tree'></span>";
        }

        //if conditional
        if (arr[i].IsConditional) {
            additionalQuestionInfo += "<span class='prop-item conditional fas fa-sitemap' data-placement='left' data-toggle='tooltip' title data-original-title='Conditional'></span>";
        } else {
            additionalQuestionInfo += "<span class='prop-item non-conditional fas fa-grip-lines' data-placement='left' data-toggle='tooltip' title data-original-title='Direct'></span>";
        }

        additionalQuestionInfo += "</div>";

        thisQHTML += "<li id='" + arr[i].QuestionID + "' class='list-group-item list-group-item-action "
            + classList + "'><h6 class='QuestionTitle'>" + arr[i].QuestionTitle + "</h6>" + additionalQuestionInfo + "</li>";
    });

    $('#this-q-list ul.list').append(thisQHTML);
    $('[data-toggle="tooltip"]').tooltip();
    var thisQList = new List('this-q-list', options);


    $("#this-q-list li").on('click', (e) => {
        let $selectedQ = $(e.currentTarget);
        SelectQuestionListItem(e.currentTarget.id);

        if ($selectedQ.find(".question-props .prop-item.in-tree").length > 0) {
            console.log(e.currentTarget.id);
            $buildTree
                .jstree("deselect_all", true)
                .jstree('select_node', e.currentTarget.id, true);
           
           
        }
    });

    //For making the tree tools questions draggable
    $('#this-q-list ul.list li').not(".locked").draggable({
        cursor: 'move',
        helper: 'clone',
        start: function (e, ui) {
            var item = $("<div>", {
                id: "jstree-dnd",
                class: "jstree-default"
            });
            $("<i>", {
                class: "jstree-icon jstree-er"
            }).appendTo(item);
            item.append($(this).text());
            //var idRoot = $(this).attr("id").slice(0, -2);
            //var newId = idRoot + "-" + ($("#tree [id|='" + idRoot + "'][class*='jstree-node']").length + 1);
            var newId = $(this).attr("id");
            console.log(newId);
            return $.vakata.dnd.start(e, {
                jstree: true,
                obj: makeTreeItem(this),
                nodes: [{
                    id: newId,
                    text: $(this).text().trim(),
                    icon: "fas fa-dice-d6"
                }]
            }, item);
        }
    });


    function makeTreeItem(el) {
        return $("<a>", {
            id: $(el).attr("id") + "_anchor",
            class: "jstree-anchor",
            href: "#"
        });
    }
}

function SelectQuestionListItem(questionItem, scrollToPosition = false) {
    let $selectedQ = $('#this-q-list li#' + questionItem);
    $selectedQ.parent().children().removeClass("selected-question");
    $selectedQ.addClass("selected-question");


    let elementIsVisible = isScrolledIntoView($selectedQ, false);

    console.log(elementIsVisible);

    if (!elementIsVisible) {
        scrollToPosition ?
            $('#q-tools-content').scrollTo($selectedQ, 100)
            : null;
    }    
}


function isScrolledIntoView(elem) {
    var docViewTop = elem.parent().scrollTop();
    var docViewBottom = docViewTop + elem.parent().height();

    var elemTop = elem.offset().top;
    var elemBottom = elemTop + elem.height();

    console.log("elemBottom: " + elemBottom);
    console.log("docViewBottom: " + docViewBottom);
    console.log("elemTop: " + elemTop);
    console.log("docViewTop: " + docViewTop);

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
};


function popOutQuestion() {
    setTimeout(() => {
        $questionSlideOut.hasClass("q-show") ? null : $questionSlideOut.addClass("q-show");
    }, 200);
    
}

function AddQuestionOption(cntOptions) {
    var newOptionHTML = "";
    let addedOptions = [];

    for (var i = 0; i < cntOptions; i++) {

        let newOptionID = $('ul.q-option-list .q-option-list-item').not('#new-option-placeholder').length + 1 + i;
        newOptionHTML += '<li id="q-option-list-item-' + newOptionID + '" class="q-option-list-item"><div class="q-option-manage"><i class="q-option-manage-icon q-option-delete far fa-2 fa-minus-square"></i></div ><input class="form-control q-option-text-input" type="text" value="">';
        newOptionHTML += '<select class="show-tick q-option-child-input selectpicker" title="Choose a child question..." data-style="btn-outline-primary" data-width="100%" data-live-search="true">';
        addedOptions.push(newOptionID);

        //load child drop down
        for (var j = 0; j < availableChildren.length; j++) {
            let qIDX = buildData.BuildVersionList[currentVersionIDX].QuestionList.findIndex(x => x.QuestionID == availableChildren[j]);
            newOptionHTML += "<option data-tokens='' value='"
                + availableChildren[j] + "' >"
                + buildData.BuildVersionList[currentVersionIDX]
                    .QuestionList[qIDX]
                    .QuestionTitle + "</option>";
        }
        newOptionHTML += '</select></li>';
    }

    $("#new-option-placeholder").before(newOptionHTML);

    while (addedOptions.length > 0) {
        $("#q-options-container .q-option-list #q-option-list-item-" + addedOptions.pop() + " .q-option-child-input").selectpicker('refresh');
    }

    
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

function LoadQuestionInfo(loadID) {

    /*Selected Info*/
    let selectedQuestion = $buildTree.jstree('get_node', loadID);
    availableChildren = new Array();

    let qIDX = buildData.BuildVersionList[currentVersionIDX].QuestionList.findIndex(x => x.QuestionID == loadID);
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
    buildData.BuildVersionList[currentVersionIDX].QuestionList[qIDX].IsConditional ? $conditionalToggle.bootstrapToggle('off') : $conditionalToggle.bootstrapToggle('on');

    $questionSlideOut.removeClass('d-none').addClass('show-slide');
    $('#question-text-editor').removeClass('d-none').addClass('show-slide');
    $questionTabSpinner.hide('slow');
}

async function LoadBuildInfo() {
    try {
        
        //Get Data
        buildData = await GetBuildData(buildRequest = {
            type: getUrlParameter('type'),
            bID: getUrlParameter('bID'),
            vID: 0 //Defaulting to 0 for now, which will load the current build version.
        });


        //Build Functions
        buildData.addVersion = () => { };
        buildData.templateVersion = skeleton(buildData.BuildVersionList[0]);
        buildData.templateVersion.JSTree.splice(1);
        buildData.templateVersion.QuestionList.splice(1);
        buildData.templateVersion.QuestionList[0].QOptions.splice(1);
        for (let i = 0; i < buildData.BuildVersionList.length; i++) {
            //Add Build Version List Functions
            buildData.BuildVersionList[i].addQuestion = function (nID, pID) {
                let newQ = Object.assign({}, buildData.templateVersion.QuestionList[0]);
                newQ.QuestionTitle = "New Question";
                newQ.parentQID = pID;
                newQ.QuestionID = nID;
                newQ.QTypeCD = 1;
                newQ.QTypeMeaning = "FREETEXT";
                this.QuestionList.push(newQ);
             };

            for (let j = 0; j < buildData.BuildVersionList[i].QuestionList.length; j++) {
                 //Add Question List Functions
                buildData.BuildVersionList[i].QuestionList[j].xyz = () => { };

                for (var k = 0; k < buildData.BuildVersionList[i].QuestionList[j].QOptions.length; k++) {
                    //Add Question Options Functions
                    buildData.BuildVersionList[i].QuestionList[j].QOptions[k].xyz = () => { };
                }
            }
        }

        currentVersionIDX = buildData.BuildVersionList.findIndex(x => x.VersionId === parseInt(buildData.SelectedVersion));

        //Bind Question Tree
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

        return (true);

    } catch (err) {
        $('.manage-build-title h2').text("Error loading build..");
        $("#build-name").val("Error: " + err);
        errorNotify(err, "danger");
        return err;
    }
}

async function LoadDropDowns() {

    try {
        let codeValues = await GetDropDowns();
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

        return Promise.resolve(true);

    } catch (e) {
        $questionTypeDrpDwn.append("<option data-tokens='' value='1'>Error Loading...</option>");
        $questionTypeDrpDwn.selectpicker('refresh');
        $questionTypeDrpDwn.selectpicker('val', 1).attr('disabled', 'true');
        return new error(e);
    }
}

async function GetBuildData(buildRequest) {
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


async function GetQuestions() {

    try {

        let result;
        let data = {};

        result = $.ajax({
            type: "POST",
            url: "/Builds/GetAllQuestions",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
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


