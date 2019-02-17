using System.Web;
using System.Web.Optimization;

namespace ConfigRequestQuestionApp
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at https://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));


            bundles.Add(new StyleBundle("~/Content/bootstrap").Include(
                     "~/Content/bootstrap.css"
                     ));

            bundles.Add(new ScriptBundle("~/bundles/popper").Include(
                      "~/Custom_Scripts/Scripts/Popper/popper.min.js"
                      ));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.js",
                      "~/Scripts/respond.js"
                      ));


            bundles.Add(new StyleBundle("~/Content/css").Include(
                      //"~/Content/site.css",
                      "~/Custom_Scripts/Styles/main.css"
                      //,"~/Custom_Scripts/Scripts/DataTables/jquery.dataTables.min.css"
                      , "~/Custom_Scripts/Scripts/DataTables/dataTables.bootstrap4.min.css"
                      //,"~/Custom_Scripts/Scripts/DataTables/datatables.css"
                      //,"~/Custom_Scripts/Scripts/DataTables/dataTables.material.min.css"
                      //, "~/Custom_Scripts/Scripts/DataTables/material.min.css"
                      , "~/Custom_Scripts/Scripts/Dropzone/dropzone.css"
                      , "~/Custom_Scripts/Scripts/vakata-jstree-bc5187e/dist/themes/default/style.min.css"
                      ));

            bundles.Add(new StyleBundle("~/bundles/custscripts").Include(
                    "~/Custom_Scripts/Scripts/main.js"
                    , "~/Custom_Scripts/Scripts/DataTables/jquery.dataTables.min.js"
                    , "~/Custom_Scripts/Scripts/DataTables/dataTables.bootstrap4.min.js"
                    //, "~/Custom_Scripts/Scripts/DataTables/datatables.js"
                    //, "~/Custom_Scripts/Scripts/DataTables/dataTables.material.min.js"
                    , "~/Custom_Scripts/Scripts/Dropzone/dropzone.js"
                    , "~/Custom_Scripts/Scripts/jquery.scrollTo/jquery.scrollTo.min.js"
                    , "~/Custom_Scripts/Scripts/vakata-jstree-bc5187e/dist/jstree.min.js"
                ));


        }
    }
}
