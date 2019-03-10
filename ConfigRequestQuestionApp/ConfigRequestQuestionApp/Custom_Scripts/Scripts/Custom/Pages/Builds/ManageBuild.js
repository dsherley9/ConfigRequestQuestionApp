$(document).ready(function () {

    InitializeForm();

    /*-----------------
     TREE FUNCTIONS
     -----------------*/

   function InitializeForm() {

       var formLoad = new Array;
       var $versionDrpDwn = $('.versions-drp-dwn .selectpicker');
       var $questionSlideOut = $('#question-slide-out');
       var $questionTypeDrpDwn = $('.question-type-drp-dwn .selectpicker');
       var $buildTree = $('#build-js-tree');
       var $txtSearchTree = $('#txt-tree-search');

       /*Selected Info*/
       var selectedQuestion;
       var availableChildren = new Array();

       /*Question Objects*/
       var $questionChildrenDrpDwn = $('.q-option-child-input.selectpicker');
       var $questionOptions = $('ul.q-option-list');
       var $addQuestionOption = $('i.q-option-add');

       /*BUILD Info*/
       $buildTitle = $('.manage-build-title h2');
       $buildName = $('.manage-build-field #build-name');


       var newOptionHTML = ('<li class="q-option - list - item"><div class="q-option-manage"><i class="q-option-manage-icon q-option-delete far fa-2 fa-minus-square"></i></div ><input class="form-control q-option-text-input" type="text" value=""><select class="selectpicker show-tick q-option-child-input" title="Choose a child question..." data-style="btn-outline-primary" data-width="100%" data-live-search="true"></select></li>');

       $addQuestionOption.on("click", () => {
           $("#new-option-placeholder").before(newOptionHTML);
       });


        if (window.location.href.indexOf("/Builds/ManageBuild") > -1) {

            const loadDropDowns = GetDropDowns();

            formLoad.push(loadDropDowns);

            loadDropDowns
                .then((result) => {
                    var $codevalues = result;
                    for (var i = 0; i < $codevalues.length; i++) {
                        $questionTypeDrpDwn.append("<option data-tokens='' value='" + $codevalues[i].codeValue + "' >" + $codevalues[i].description + "</option>");
                    }
                    $questionTypeDrpDwn.selectpicker('refresh');                 
                })
                .catch((error) => {
                    $questionTypeDrpDwn.append("<option data-tokens='' value='1'>Error Loading...</option>");
                    $questionTypeDrpDwn.selectpicker('refresh');
                    $questionTypeDrpDwn.selectpicker('val', 1).attr('disabled', 'true');
                    console.log(error);
                }
                );

            switch (getUrlParameter('type')) {

                case "Edit":

                    let buildData = {};
                    buildData.bID = getUrlParameter('bID');
                    buildData.vID = 0; //Defaulting to 0 for now, which will load the current build version.

                    const loadBuild = LoadExistingBuild(buildData);

                    formLoad.push(loadBuild);

                    loadBuild
                        .then((result) => {

                            //version_id to load
                            var $buildData = result;
                            var _versionID = $buildData.SelectedVersion;
                            var vIDX = $buildData.BuildVersionList.findIndex(x => x.VersionId === _versionID);


                            //Bind Current Tree
                            $buildTree.jstree({
                                'core': {
                                    'data': $buildData.BuildVersionList[vIDX].JSTree
                                    , "check_callback": true
                                }
                                , "plugins": ["dnd", "search"]
                            });

                            //Build Name
                            $buildTitle.text($buildData.BuildVersionList[vIDX].BuildName);
                            $buildName.val($buildData.BuildVersionList[vIDX].BuildName);

                            //Solution
                            $('.manage-build-field #solution-meaning').val($buildData.BuildVersionList[vIDX].SolutionMeaning);

                            //Selected Version
                            $('.manage-build-field #version-num').val($buildData.BuildVersionList[vIDX].VersionNum);

                            //Add Versions
                            for (var i = 0; i < $buildData.BuildVersionList.length; i++) {
                                $versionDrpDwn.append("<option data-tokens='' value='" + $buildData.BuildVersionList[i].VersionId + "' title='Version " + $buildData.BuildVersionList[i].VersionNum + "' >" + $buildData.BuildVersionList[i].VersionNum + "</option>");
                            }
                            $versionDrpDwn.selectpicker('refresh');
                            $versionDrpDwn.selectpicker('val', $buildData.BuildVersionList[vIDX].VersionId);

                            //Last Updated
                            var date = $buildData.BuildVersionList[vIDX].VUpdt;
                            //var nowDate = new Date(parseInt(date.substr(6)));
                            //var tempDate = "";
                            //tempDate += nowDate.format("ddd mmm dd yyyy HH:MM:ss") + " ";
                            $('.manage-build-field #last_update_date').val(date);

                            //Last Updated By
                            $('.manage-build-field #last_updated_by').val($buildData.BuildVersionList[vIDX].VUpdtName);

                            //Bind Tree Search
                            var to = false;
                            $txtSearchTree.keyup(function () {
                                if (to) { clearTimeout(to); }
                                to = setTimeout(function () {
                                    var v = $txtSearchTree.val();
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
                                    let qIDX = $buildData.BuildVersionList[vIDX].QuestionList.findIndex(x => x.QuestionID === parseInt(availableChildren[i]));
                                    $questionChildrenDrpDwn.append("<option data-tokens='' value='" +
                                        availableChildren[i]
                                        + "' >" + $buildData.BuildVersionList[vIDX]
                                            .QuestionList[qIDX]
                                            .QuestionTitle + "</option>");
                                }
                                $questionChildrenDrpDwn.selectpicker('refresh');

                                var qIDX = $buildData.BuildVersionList[vIDX].QuestionList.findIndex(x => x.QuestionID === parseInt(selectedQuestion.id));
                                var qTitle = $buildData.BuildVersionList[vIDX].QuestionList[qIDX].QuestionTitle;
                                //alert(qTitle);
                                qTitle += " Extra text that can be type for days. But you know what, maybe. I have NO IDEA. But I sure hope this works.";



                                 $questionSlideOut.removeClass('d-none').addClass('show-slide');
                                $('#question-text-editor').removeClass('d-none').addClass('show-slide');
                                $('#question-slide-out .question-tab-inner').attr('data-original-title', qTitle);
                                $('#question-slide-out .question-tab-inner').text(qTitle.substring(0, 10) + "...");
                            });

                            //No double click event, have to manually bind.
                            //https://github.com/vakata/jstree/issues/515
                            $buildTree.on('dblclick','.jstree-anchor', function (e) {
                                var instance = $.jstree.reference(this),
                                    node = instance.get_node(this);

                                 $questionSlideOut.hasClass("q-show") ? null :  $questionSlideOut.addClass("q-show");
                                
                            });

                            $(document.body).on("click", (e) => {

                                let container = $(".question-slide-out");

                                if (!container.is(e.target) && container.has(e.target).length === 0) {
                                    if ( $questionSlideOut.hasClass('q-show')) {
                                         $questionSlideOut.removeClass('q-show');
                                        $('#question-text-editor').removeClass('q-show');
                                    }
                                }
                            });

                            $('#question-text-go-back').on('click', () => {
                                $('#question-text-editor').removeClass('q-show');
                            });

                            $('#what-this-btn').on("click", () => {
                                $('#question-text-editor').toggleClass("q-show");
                            });

                            $('#question-slide-out .question-tab').on("click", () => {

                                if ( $questionSlideOut.hasClass('q-show')) {
                                    $('#question-text-editor').removeClass('q-show');
                                }

                                 $questionSlideOut.toggleClass("q-show");
                            });

                            //Troubleshooting
                            //$('#json-troubleshoot').append(JSON.stringify(result)

                        })
                        .catch((error) => {
                            $('.manage-build-title h2').text("Error loading build..");
                            $("#build-name").val("Error: " + error);
                        });                                          

                    break;

                default:

                    $('.manage-build-loader').hide();
                    $('.manage-build-form').removeClass('d-none');
                    break;
            }


            //wait for load
            Promise.all(formLoad).then(() => {
                formLoad.forEach((e,i,arr) => console.log(arr[i]));
                //console.log(loadDropDowns);
               // console.log(loadBuild);
                $('.manage-build-loader').hide("slow");
                $('.manage-build-form').removeClass('d-none');
            });

        }

    }




});


async function LoadExistingBuild(buildData) {
    try {

        let result;

        result = $.ajax({
            type: "POST",
            url: "/Builds/GetBuildTree",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(buildData),
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
    codesets.codesetQuery = "100";

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


