using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ConfigRequestQuestionApp.Models;
using System.Web.Configuration;
using System.Data.SqlClient;
using System.Data;
using System.Web.Script.Serialization;

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


        [HttpPost]
        public string GetCodeSet(string codesetQuery)
        {
            //var _codeset = string.Join("|", codeset);
            var _codeValues = new[] { new {
                        codeSet = 0,
                        codeValue = 0,
                        meaning = "",
                        description = "",
                        active = false } }.ToList();
            _codeValues.Clear();

            try
            {
                //Create Connection Properties
                SqlConnection dbCon = new SqlConnection(
                            WebConfigurationManager.ConnectionStrings["amsRulesDB"].ConnectionString
                            );

                //Create Command
                SqlCommand cmd = new SqlCommand("GetCodeSet", dbCon);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 60;


                //Add Paramaters
                cmd.Parameters.Add("@codeset", SqlDbType.VarChar).Value = codesetQuery;

                //Open Connection
                dbCon.Open();

                //Load into reader
                SqlDataReader dr = cmd.ExecuteReader();


                while (dr.Read())
                {
                    _codeValues.Add(new
                    {
                        codeSet = int.Parse(dr[dr.GetOrdinal("code_set")].ToString()),
                        codeValue = int.Parse(dr[dr.GetOrdinal("code_value")].ToString()),
                        meaning = dr[dr.GetOrdinal("meaning")].ToString(),
                        description = dr[dr.GetOrdinal("description")].ToString(),
                        active = dr.GetBoolean(dr.GetOrdinal("active_ind"))
                });
                }

                dbCon.Close();

            }
            catch (Exception)
            {
                throw;
            }


            JavaScriptSerializer codeValueJson = new JavaScriptSerializer();
            return codeValueJson.Serialize(_codeValues);
        }
    }


}