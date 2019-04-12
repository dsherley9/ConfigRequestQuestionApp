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
        private List<Question> questionList;

        #endregion

        #region Index Action Result

        // GET: Builds
        public ActionResult Index()
        {
            LoadBuilds();
            return View(buildList);
        }

        #endregion

        #region Build Action Result

        public ActionResult Build(int ID)
        {
            buildSelected = new Build();
            LoadBuildByID(ID,0);
            return View(buildSelected);
        }

        #endregion

        #region Manage Builds

        public ActionResult ManageBuild(string type, int bID = 0, int vID = 0)
        {
            if (type == "Edit")
            {
                return View();
            }
            else 
            {
                return View();
            }
        }


        [HttpPost]
        public string BuildDataInitialize(string type, int bID = 0, int vID = 0)
        {
            buildSelected = new Build();
            JavaScriptSerializer buildJson = new JavaScriptSerializer();


            switch (type)
            {
                case "Edit":
                    LoadBuildByID(bID, vID);
                    break;
                default: //New
                    buildSelected.BuildVersionList.Add(new BuildVersion());
                    buildSelected.CurrentBuildName = "New Build..";
                    buildSelected.BuildVersionList[0].VersionNum = 1;
                    buildSelected.BuildVersionList[0].VUpdt = DateTime.Now;
                    buildSelected.BuildVersionList[0].QuestionList.Add(new Question());
                    buildSelected.BuildVersionList[0].QuestionList[0].QOptions.Add(new QuestionOptions());
                    break;
            }            
            
            return buildJson.Serialize(buildSelected);
            //return buildSelected.BuildVersionList.Where(x => x.VersionId == buildSelected.SelectedVersion).FirstOrDefault().BuildTreeJson;
        }

        [HttpPost]
        public string GetAllQuestions()
        {
            LoadQuestions();
            return new JavaScriptSerializer().Serialize(questionList);
        }


        [HttpPost]
        public void PostBuildData(Build buildData)
        {

            Console.WriteLine(buildData);
            return;
        }

        [HttpPost]
        public string SaveQuestion(Question SaveQ, int BuildVersionID)
        {
            SaveQ.Save(BuildVersionID);
            return new JavaScriptSerializer().Serialize(SaveQ);
        }

        #endregion

        #region Load Methods

        private void LoadBuilds()
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
                    buildItem.BuildID = int.Parse(dr[dr.GetOrdinal("build_id")].ToString());
                    buildItem.CurrentBuildName = dr[dr.GetOrdinal("build_name")].ToString();
                    buildItem.CurrentSolution = dr[dr.GetOrdinal("solution_name")].ToString();
                    buildItem.CurrentSolutionCD = int.Parse(dr[dr.GetOrdinal("solution_cd")].ToString());
                    buildItem.CurrentVersion = int.Parse(dr[dr.GetOrdinal("current_version")].ToString());
                    buildList.Add(buildItem);
                }

                dbCon.Close();

            }
            catch (Exception)
            {
                throw;
            }
        }

        private void LoadBuildByID(int buildID, int versionID)
        {

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
                BuildVersion version;


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
                    buildSelected.CurrentSolution = "See Version Info";
                    buildSelected.CurrentSolutionCD = 0; //See Version Info
                    buildSelected.CurrentVersion = int.Parse(dr[dr.GetOrdinal("build_version_id")].ToString());

                    //Load Version Info

                    version = new BuildVersion();

                    version.VersionId = int.Parse(dr[dr.GetOrdinal("build_version_id")].ToString());
                    version.VersionNum = int.Parse(dr[dr.GetOrdinal("version_num")].ToString());
                    version.FirstQID = int.Parse(dr[dr.GetOrdinal("first_q_id")].ToString());
                    version.BuildName = dr[dr.GetOrdinal("build_name")].ToString();
                    version.SolutionCD = int.Parse(dr[dr.GetOrdinal("solution_cd")].ToString());
                    version.Solution = dr[dr.GetOrdinal("solution_name")].ToString();
                    version.VUpdt = dr.GetDateTime(dr.GetOrdinal("updt_dt_tm"));// DateTime.Parse(dr[dr.GetOrdinal("updt_dt_tm")].ToString());
                    version.VUpdtID = int.Parse(dr[dr.GetOrdinal("updt_id")].ToString());
                    version.VUpdtName = dr[dr.GetOrdinal("updt_name")].ToString();

                    buildSelected.BuildVersionList.Add(version);
                }

                dbCon.Close();

                switch (versionID)
                {
                    case 0:
                        //if not specific, just load the current
                        LoadQuestionByVersionID(buildSelected.CurrentVersion);
                        break;
                    default:
                        LoadQuestionByVersionID(versionID);
                        break;
                }
                
            }
            catch (Exception)
            {
                throw;
            }

        }

        private void LoadQuestionByVersionID(int versionID)
        {
            Question qItem;
            buildSelected.SelectedVersion = versionID;

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

                //Other Variables
                int questionID = 0;
                //Build Version Object
                BuildVersion loadVersion = buildSelected.BuildVersionList.Where(x => x.VersionId == versionID).FirstOrDefault();

                while (dr.Read())
                {
                    qItem = new Question();

                    questionID = int.Parse(dr[dr.GetOrdinal("question_id")].ToString());

                    //If question already exists, it must be for options
                    if (loadVersion.QuestionList.Any(x => x.QuestionID == questionID))
                    {
                            QuestionOptions qOpt = new QuestionOptions();
                            qOpt.QuestionID = questionID;
                            qOpt.QOptID = int.Parse(dr[dr.GetOrdinal("q_opt_id")].ToString());
                            qOpt.LabelText = dr[dr.GetOrdinal("q_opt_label")].ToString();
                            qOpt.ChildID = int.Parse(dr[dr.GetOrdinal("child_q_id")].ToString());
                            qOpt.Sequence = int.Parse(dr[dr.GetOrdinal("seq")].ToString());

                            loadVersion.QuestionList.Where(x => x.QuestionID == questionID).FirstOrDefault().QOptions.Add(qOpt);
                            loadVersion.QuestionList.Where(x => x.QuestionID == questionID).FirstOrDefault().ReSequenceOptions();
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
                        qItem.QTypeCD = int.Parse(dr[dr.GetOrdinal("q_type_cd")].ToString());
                        qItem.QType = dr[dr.GetOrdinal("q_type")].ToString();
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

                        loadVersion.QuestionList.Add(qItem);

                    }
                }

                dbCon.Close();
                loadVersion.BuildQuestionStructure();
            }
            catch (Exception)
            {
                throw;
            }


        }


        private void LoadQuestions()
        {

            Question questionItem = new Question();
            questionList = new List<Question>();

            try
            {
                //Create Connection Properties
                SqlConnection dbCon = new SqlConnection(
                            WebConfigurationManager.ConnectionStrings["amsRulesDB"].ConnectionString
                            );

                //Create Command
                SqlCommand cmd = new SqlCommand("GetQuestions", dbCon);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 60;

                //Open Connection
                dbCon.Open();

                //Load into reader
                SqlDataReader dr = cmd.ExecuteReader();


                while (dr.Read())
                {
                    questionItem = new Question();
                    questionItem.QuestionID = int.Parse(dr[dr.GetOrdinal("question_id")].ToString());
                    questionItem.QuestionTitle = dr[dr.GetOrdinal("question_title")].ToString();
                    questionItem.QTypeCD = int.Parse(dr[dr.GetOrdinal("q_type_cd")].ToString());
                    questionItem.QType = dr[dr.GetOrdinal("question_type")].ToString();
                    questionItem.QTypeMeaning = dr[dr.GetOrdinal("question_type_meaning")].ToString();
                    questionItem.IsBuildInlay = dr.GetBoolean(dr.GetOrdinal("_build_inlay_ind"));
                    questionItem.BuildInlayID = int.Parse(dr[dr.GetOrdinal("inlay_q_build_version_id")].ToString());
                    questionList.Add(questionItem);
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