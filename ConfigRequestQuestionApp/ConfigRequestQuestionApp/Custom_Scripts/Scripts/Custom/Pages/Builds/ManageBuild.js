$(document).ready(function () {

    InitializeForm();

    /*-----------------
     TREE FUNCTIONS
     -----------------*/

   function InitializeForm() {

       var formLoad = new Array;

        if (window.location.href.indexOf("/Builds/ManageBuild") > -1) {

            const loadDropDowns = GetDropDowns();

            formLoad.push(loadDropDowns);

            loadDropDowns
                .then((result) => {
                    var $codevalues = result;
                    for (var i = 0; i < $codevalues.length; i++) {
                        $('.question-type-drp-dwn .selectpicker').append("<option data-tokens='' value='" + $codevalues[i].codeValue + "' >" + $codevalues[i].description + "</option>");
                    }
                    $('.question-type-drp-dwn .selectpicker').selectpicker('refresh');                 
                })
                .catch((error) => {
                    $('.question-type-drp-dwn .selectpicker').append("<option data-tokens='' value='1'>Error Loading...</option>");
                    $('.question-type-drp-dwn .selectpicker').selectpicker('refresh');
                    $('.question-type-drp-dwn .selectpicker').selectpicker('val', 1).attr('disabled', 'true');
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
                            var $build = result;
                            var _versionID = $build.SelectedVersion;
                            var vIDX = $build.BuildVersionList.findIndex(x => x.VersionId === _versionID);


                            //Bind Current Tree
                            $('#build-js-tree').jstree({
                                'core': {
                                    'data': $build.BuildVersionList[vIDX].JSTree
                                    , "check_callback": true
                                }
                                , "plugins": ["dnd", "search"]
                            });

                            //Build Name
                            $('.manage-build-title h2').text($build.BuildVersionList[vIDX].BuildName);
                            $('.manage-build-field #build-name').val($build.BuildVersionList[vIDX].BuildName);

                            //Solution
                            $('.manage-build-field #solution-meaning').val($build.BuildVersionList[vIDX].SolutionMeaning);

                            //Selected Version
                            $('.manage-build-field #version-num').val($build.BuildVersionList[vIDX].VersionNum);

                            //Add Versions
                            for (var i = 0; i < $build.BuildVersionList.length; i++) {
                                $('.versions-drp-dwn .selectpicker').append("<option data-tokens='' value='" + $build.BuildVersionList[i].VersionId + "' title='Version " + $build.BuildVersionList[i].VersionNum + "' >" + $build.BuildVersionList[i].VersionNum + "</option>");
                            }
                            $('.selectpicker').selectpicker('refresh');
                            $('.selectpicker').selectpicker('val', $build.BuildVersionList[vIDX].VersionId);

                            //Last Updated
                            var date = $build.BuildVersionList[vIDX].VUpdt;
                            //var nowDate = new Date(parseInt(date.substr(6)));
                            //var tempDate = "";
                            //tempDate += nowDate.format("ddd mmm dd yyyy HH:MM:ss") + " ";
                            $('.manage-build-field #last_update_date').val(date);

                            //Last Updated By
                            $('.manage-build-field #last_updated_by').val($build.BuildVersionList[vIDX].VUpdtName);

                            //Bind Tree Search
                            var to = false;
                            $('#txt-tree-search').keyup(function () {
                                if (to) { clearTimeout(to); }
                                to = setTimeout(function () {
                                    var v = $('#txt-tree-search').val();
                                    $('#build-js-tree').jstree(true).search(v);
                                }, 250);
                            });


                            $('#build-js-tree').on("select_node.jstree", (e, data) => {
                                //alert("node_id: " + data.node.id);
                                var qIDX = $build.BuildVersionList[vIDX].QuestionList.findIndex(x => x.QuestionID === parseInt(data.node.id));
                                var qTitle = $build.BuildVersionList[vIDX].QuestionList[qIDX].QuestionTitle;
                                //alert(qTitle);
                                qTitle += " Extra text that can be type for days. But you know what, maybe. I have NO IDEA. But I sure hope this works.";



                                $('#question-slide-out').removeClass('d-none').addClass('show-slide');
                                $('#question-text-editor').removeClass('d-none').addClass('show-slide');
                                $('#question-slide-out .question-tab-inner').attr('data-original-title', qTitle);
                                $('#question-slide-out .question-tab-inner').text(qTitle.substring(0, 10) + "...");
                            });

                            $(document.body).on("click", (e) => {

                                let container = $(".question-slide-out");

                                if (!container.is(e.target) && container.has(e.target).length === 0) {
                                    if ($('#question-slide-out').hasClass('q-show')) {
                                        $('#question-slide-out').removeClass('q-show');
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

                                if ($('#question-slide-out').hasClass('q-show')) {
                                    $('#question-text-editor').removeClass('q-show');
                                }

                                $('#question-slide-out').toggleClass("q-show");
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


