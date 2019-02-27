using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace ConfigRequestQuestionApp
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "FailWhale",
                url: "FailWhale/{action}/{id}",
                defaults: new
                {
                    controller = "Error",
                    action = "FailWhale",
                    id = UrlParameter.Optional
                }
            );

            //routes.MapRoute(
            //    name: "Builds",
            //    url: "{controller}/{action}/{type}/{bid}/{vid}",
            //    defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            //);


            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );


            routes.MapRoute(
                name: "Catchall",
                url: "{*any}",
                defaults: new
                {
                    controller = "Error",
                    action = "FailWhale",
                    id = UrlParameter.Optional
                }
            );
        }
    }
}
