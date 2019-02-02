using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ConfigRequestQuestionApp.Models;
using System.Web.Configuration;
using System.Data.SqlClient;
using System.Data;

namespace ConfigRequestQuestionApp.Controllers
{

    public class HomeController : Controller
    {
        //Return Views//

        #region Index

        public ActionResult Index()
        {
            return View();
        }

        #endregion

    }
}