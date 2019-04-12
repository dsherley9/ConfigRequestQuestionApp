using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Configuration;

namespace ConfigRequestQuestionApp.Models
{
    public class Question
    {

        #region Private Variables

        //Properties

        private int questionID;
        private string questionTitle;
        private bool isActive;
        private bool isConditional;
        private int conditionalQOptID;
        private List<QuestionOptions> qOptions;
        private bool isBuildInlay;
        private int buildInlayID;
        private int parentQID;
        private int childQID;
        private int qTypeCD;
        private string qType;
        private string qTypeMeaning;
        private bool isRequired;
        private bool hasOptNA;
        private bool hasOptOther;
        private bool hasWhatsThis;
        private string whatsThisTxt;
        private bool hasAlert;
        private string alertTxt;
        private int qUpdtID;
        private DateTime qUpdt;
        private string qUpdtName;
        private double percentComplete;
        private int nodeLevel;

        #endregion

        #region Properties

        //Properties

        public int QuestionID
        {
            get { return questionID; }
            set { questionID = value; }
        }

        public string QuestionTitle
        {
            get { return questionTitle; }
            set { questionTitle = value; }
        }

        public bool IsActive
        {
            get { return isActive; }
            set { isActive = value; }
        }

        public bool IsConditional
        {
            get { return isConditional; }
            set { isConditional = value; }
        }

        public int ConditionalQOptID
        {
            get { return conditionalQOptID; }
            set { conditionalQOptID = value; }
        }

        public List<QuestionOptions> QOptions
        {
            get { return qOptions; }
            set { qOptions = value; }
        }

        public bool IsBuildInlay
        {
            get { return isBuildInlay; }
            set { isBuildInlay = value; }
        }

        public int BuildInlayID
        {
            get { return buildInlayID; }
            set { buildInlayID = value; }
        }

        public int ParentQID
        {
            get { return parentQID; }
            set { parentQID = value; }
        }

        public int ChildQID
        {
            get { return childQID; }
            set { childQID = value; }
        }

        public int QTypeCD
        {
            get { return qTypeCD; }
            set { qTypeCD = value; }
        }

        public string QType
        {
            get { return qType; }
            set { qType = value; }
        }

        public string QTypeMeaning
        {
            get { return qTypeMeaning; }
            set { qTypeMeaning = value; }
        }

        public bool IsRequired
        {
            get { return isRequired; }
            set { isRequired = value; }
        }

        public bool HasOptNA
        {
            get { return hasOptNA; }
            set { hasOptNA = value; }
        }

        public bool HasOptOther
        {
            get { return hasOptOther; }
            set { hasOptOther = value; }
        }

        public bool HasWhatsThis
        {
            get { return hasWhatsThis; }
            set { hasWhatsThis = value; }
        }

        public string WhatsThisTxt
        {
            get { return whatsThisTxt; }
            set { whatsThisTxt = value; }
        }

        public bool HasAlert
        {
            get { return hasAlert; }
            set { hasAlert = value; }
        }

        public string AlertTxt
        {
            get { return alertTxt; }
            set { alertTxt = value; }
        }

        public int QUpdtID
        {
            get { return qUpdtID; }
            set { qUpdtID = value; }
        }

        public DateTime QUpdt
        {
            get { return qUpdt; }
            set { qUpdt = value; }
        }

        public string QUpdtName
        {
            get { return qUpdtName; }
            set { qUpdtName = value; }
        }

        public double PercentComplete
        {
            get { return percentComplete; }
            set { percentComplete = value; }
        }

        public int NodeLevel
        {
            get { return nodeLevel; }
            set { nodeLevel = value; }
        }


        #endregion

        #region Constructor

        public Question()
        {
            qOptions = new List<QuestionOptions>();
        }

        #endregion

        #region Methods

        public void ReSequenceOptions()
        {
            this.qOptions = this.qOptions.OrderBy(x => x.Sequence).ToList();
        }

        public void ReSequenceOptionsDesc()
        {
            this.qOptions = this.qOptions.OrderByDescending(x => x.Sequence).ToList();
        }

        public void Save(int buildVersionID)
        {
            //Create Connection Properties
            using (SqlConnection dbCon = new SqlConnection(
                        WebConfigurationManager.ConnectionStrings["amsRulesDB"].ConnectionString
                        )) 

            try
            {
                int retID = 0;

                //Create Command
                using (SqlCommand cmd = new SqlCommand("SaveQuestion", dbCon))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 60;


                    //Add Paramaters
                    cmd.Parameters.Add("@qID", SqlDbType.Int).Value = this.questionID;
                    cmd.Parameters.Add("@qTitle", SqlDbType.VarChar).Value = this.questionTitle;
                    cmd.Parameters.Add("@FK_qTypeCD", SqlDbType.Int).Value = this.qTypeCD;
                    cmd.Parameters.Add("@FK_inlayID", SqlDbType.Int).Value = this.buildInlayID;
                    cmd.Parameters.Add("@updtDTTM", SqlDbType.DateTime).Value = DateTime.Now;
                    cmd.Parameters.Add("@updtID", SqlDbType.Int).Value = this.qUpdtID;
                    cmd.Parameters.Add("@active_ind", SqlDbType.Bit).Value = this.isActive ? 1 : 0;
                    cmd.Parameters.Add("@isRequired", SqlDbType.Bit).Value = this.isRequired ? 1 : 0;
                    cmd.Parameters.Add("@hasNotApplicable", SqlDbType.Bit).Value = this.hasOptNA ? 1 : 0;
                    cmd.Parameters.Add("@hasOther", SqlDbType.Bit).Value = this.hasOptOther ? 1 : 0;
                    cmd.Parameters.Add("@hasWhatsThis", SqlDbType.Bit).Value = this.hasWhatsThis ? 1 : 0;
                    cmd.Parameters.Add("@txtWhatsThis", SqlDbType.NVarChar).Value = this.whatsThisTxt;
                    cmd.Parameters.Add("@hasAlerts", SqlDbType.Bit).Value = this.hasAlert ? 1 : 0;
                    cmd.Parameters.Add("@txtAlerts", SqlDbType.NVarChar).Value = this.alertTxt;
                    cmd.Parameters.Add("@FK_buildVersionId", SqlDbType.Int).Value = buildVersionID;


                    //Return Parameters
                    cmd.Parameters.Add("@retID", SqlDbType.Int).Direction = ParameterDirection.Output;

                    //Open Connection
                    dbCon.Open();
                    cmd.ExecuteNonQuery();
                    //Casted Int Type on Return Value 
                    retID = (int) cmd.Parameters["@retID"].Value;

                    dbCon.Close();
                }


                if (retID > 0) //New Row
                {
                    this.questionID = retID; //set the actual question_id to return to view and replace temp_id
                }


            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
               dbCon.Close();
            }

        }


        #endregion

    }
}