using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

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


        #endregion

    }
}