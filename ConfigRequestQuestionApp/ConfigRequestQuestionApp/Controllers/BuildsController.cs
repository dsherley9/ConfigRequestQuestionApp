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
    public class BuildsController : Controller
    {
        #region Build Controller Objects

        //Build Controller Objects//
        private List<Build> buildList;
        private Build buildSelected;
        private BuildVersion versionSelected;

        #endregion

        #region Index Action Result

        // GET: Builds
        public ActionResult Index()
        {
            Load_Builds();
            return View(buildList);
        }

        #endregion

        #region Build Action Result

        public ActionResult Build(int ID)
        {
            LoadBuildByID(ID);
            versionSelected.BuildQuestionStructure();
            return View(versionSelected);
        }

        #endregion

        #region Manage Builds

        public ActionResult ManageBuild()
        {
            return View();
        }


        [HttpPost]
        public string GetBuildTree(int versionID)
        {
            LoadBuildByID(versionID);
            versionSelected.BuildQuestionStructure();
            return versionSelected.BuildTreeJson;
        }

        #endregion

        #region Load Methods

        private void Load_Builds()
        {
            Build buildItem = new Build();
            buildList = new List<Build>();

            try
            {
                //Create Connection Properties
                SqlConnection dbCon = new SqlConnection(
                            WebConfigurationManager.ConnectionStrings["amsRulesDB"].ConnectionString
                            );

                //Create Command
                SqlCommand cmd = new SqlCommand("GetBuildList", dbCon);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 60;

                //Open Connection
                dbCon.Open();

                //Load into reader
                SqlDataReader dr = cmd.ExecuteReader();


                while (dr.Read())
                {
                    buildItem = new Build();
                    buildItem.BuildID = int.Parse(dr[0].ToString());
                    buildItem.CurrentBuildName = dr[1].ToString();
                    buildItem.CurrentSolution = dr[2].ToString();
                    buildItem.CurrentVersion = int.Parse(dr[3].ToString());
                    buildList.Add(buildItem);
                }

                dbCon.Close();

            }
            catch (Exception)
            {
                throw;
            }
        }

        private void LoadBuildByID(int buildID)
        {
            buildSelected = new Build();
            versionSelected = new BuildVersion();
            //questionList = new List<Question>();

            try
            {

                //Create Connection Properties
                SqlConnection dbCon = new SqlConnection(
                            WebConfigurationManager.ConnectionStrings["amsRulesDB"].ConnectionString
                            );

                //Create Command
                SqlCommand cmd = new SqlCommand("GetBuildInfoByID", dbCon);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 60;

                //Add Paramaters
                cmd.Parameters.Add("@buildID", SqlDbType.Int).Value = buildID;


                //Open Connection
                dbCon.Open();

                //Load into reader
                SqlDataReader dr = cmd.ExecuteReader();

                while (dr.Read())
                {
                    buildSelected.BuildID = int.Parse(dr[dr.GetOrdinal("build_id")].ToString());
                    buildSelected.CurrentBuildName = dr[dr.GetOrdinal("build_name")].ToString();
                    buildSelected.CurrentSolution = dr[dr.GetOrdinal("solution_name")].ToString();
                    buildSelected.CurrentVersion = int.Parse(dr[dr.GetOrdinal("build_version_id")].ToString());
                    versionSelected.VersionId = int.Parse(dr[dr.GetOrdinal("build_version_id")].ToString());
                    versionSelected.VersionNum = int.Parse(dr[dr.GetOrdinal("version_num")].ToString());
                    versionSelected.FirstQID = int.Parse(dr[dr.GetOrdinal("first_q_id")].ToString());
                    versionSelected.BuildName = dr[dr.GetOrdinal("build_name")].ToString();
                    versionSelected.SolutionMeaning = dr[dr.GetOrdinal("solution_meaning")].ToString();
                    versionSelected.VUpdt = dr.GetDateTime(dr.GetOrdinal("updt_dt_tm"));// DateTime.Parse(dr[dr.GetOrdinal("updt_dt_tm")].ToString());
                    versionSelected.VUpdtID = int.Parse(dr[dr.GetOrdinal("updt_id")].ToString());
                    versionSelected.VUpdtName = dr[dr.GetOrdinal("updt_name")].ToString();
                }

                dbCon.Close();
                LoadQuestionByVersionID(buildSelected.CurrentVersion);
            }
            catch (Exception)
            {
                throw;
            }

        }

        private void LoadQuestionByVersionID(int versionID)
        {
            Question qItem;

            try
            {
                //Create Connection Properties
                SqlConnection dbCon = new SqlConnection(
                            WebConfigurationManager.ConnectionStrings["amsRulesDB"].ConnectionString
                            );

                //Create Command
                SqlCommand cmd = new SqlCommand("GetBuildQuestionsByVersionID", dbCon);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 60;

                //Add Paramaters
                cmd.Parameters.Add("@versionID", SqlDbType.Int).Value = versionID;


                //Open Connection
                dbCon.Open();

                //Load into reader
                SqlDataReader dr = cmd.ExecuteReader();

                int questionID = 0;

                while (dr.Read())
                {
                    qItem = new Question();

                    questionID = int.Parse(dr[dr.GetOrdinal("question_id")].ToString());

                    //If question already exists, it must be for options
                    if (versionSelected.QuestionList.Any(x => x.QuestionID == questionID))
                    {
                            QuestionOptions qOpt = new QuestionOptions();
                            qOpt.QuestionID = questionID;
                            qOpt.QOptID = int.Parse(dr[dr.GetOrdinal("q_opt_id")].ToString());
                            qOpt.LabelText = dr[dr.GetOrdinal("q_opt_label")].ToString();
                            qOpt.ChildID = int.Parse(dr[dr.GetOrdinal("child_q_id")].ToString());
                            qOpt.Sequence = int.Parse(dr[dr.GetOrdinal("seq")].ToString());

                            versionSelected.QuestionList.Where(x => x.QuestionID == questionID).FirstOrDefault().QOptions.Add(qOpt);
                            versionSelected.QuestionList.Where(x => x.QuestionID == questionID).FirstOrDefault().ReSequenceOptions();
                    }
                    else
                    {//New question

                        qItem.QuestionID = questionID;
                        qItem.QuestionTitle = dr[dr.GetOrdinal("question_title")].ToString();
                        qItem.ParentQID = int.Parse(dr[dr.GetOrdinal("parent_q_id")].ToString());
                        qItem.ChildQID = int.Parse(dr[dr.GetOrdinal("child_q_id")].ToString());
                        qItem.IsActive = dr.GetBoolean(dr.GetOrdinal("active_ind"));
                        qItem.IsConditional = dr.GetBoolean(dr.GetOrdinal("conditional_ind"));

                        switch (qItem.IsConditional)
                        {
                            case true:
                                qItem.ConditionalQOptID = int.Parse(dr[dr.GetOrdinal("q_opt_id")].ToString()); // Good idea? -> qItem.conditionalQOptID = dr.GetInt32(dr.GetOrdinal("conditional_q_opt_id"));
                                break;
                            default:
                                qItem.ConditionalQOptID = 0;
                                break;
                        }

                        QuestionOptions qOpt = new QuestionOptions();
                        qOpt.QuestionID = questionID;
                        qOpt.QOptID = int.Parse(dr[dr.GetOrdinal("q_opt_id")].ToString());
                        qOpt.LabelText = dr[dr.GetOrdinal("q_opt_label")].ToString();
                        qOpt.ChildID = qItem.ChildQID;
                        qOpt.Sequence = int.Parse(dr[dr.GetOrdinal("seq")].ToString());
                        qItem.QOptions.Add(qOpt);
                        qItem.ReSequenceOptions();


                        qItem.IsBuildInlay = dr.GetBoolean(dr.GetOrdinal("_build_inlay_ind"));
                        qItem.BuildInlayID = int.Parse(dr[dr.GetOrdinal("inlay_q_build_version_id")].ToString());
                        qItem.QTypeMeaning = dr[dr.GetOrdinal("meaning")].ToString();


                        //Question Settings
                        qItem.IsRequired = dr.GetBoolean(dr.GetOrdinal("opt_required"));
                        qItem.HasOptNA = dr.GetBoolean(dr.GetOrdinal("opt_not_applicable"));
                        qItem.HasOptOther = dr.GetBoolean(dr.GetOrdinal("opt_other"));
                        qItem.HasWhatsThis = dr.GetBoolean(dr.GetOrdinal("opt_whats_this"));
                        qItem.WhatsThisTxt = dr[dr.GetOrdinal("txt_whats_this")].ToString();
                        qItem.HasAlert = dr.GetBoolean(dr.GetOrdinal("opt_alerts"));
                        qItem.AlertTxt = dr[dr.GetOrdinal("txt_alerts")].ToString();

                        qItem.QUpdt = dr.GetDateTime(dr.GetOrdinal("updt_dt_tm")); //DateTime.Parse(dr[11].ToString());
                        qItem.QUpdtID = int.Parse(dr[dr.GetOrdinal("updt_id")].ToString());
                        qItem.QUpdtName = dr[dr.GetOrdinal("updt_name")].ToString();

                        versionSelected.QuestionList.Add(qItem);

                    }
                }

                dbCon.Close();

            }
            catch (Exception)
            {
                throw;
            }


        }

        #endregion

    }

}