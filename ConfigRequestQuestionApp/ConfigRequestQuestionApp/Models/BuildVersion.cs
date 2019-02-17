using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

namespace ConfigRequestQuestionApp.Models
{
    public class BuildVersion 
    {

        #region Private Variables

        //Properties
        private int versionId;
        private int versionNum;
        private int firstQID;
        private string buildName;
        private string solutionMeaning;
        private DateTime vUpdt;
        private int vUpdtID;
        private string vUpdtName;
        private List<Question> questionList;

        //For JSON Tree
        private List<BuildJTree> _jsTree;
        private string _buildTreeJson;

        #endregion

        #region Properties

        //Properties

        public int VersionId
        {
            get { return versionId; }
            set { versionId = value; }
        }

        public int VersionNum
        {
            get { return versionNum; }
            set { versionNum = value; }
        }

        public int FirstQID
        {
            get { return firstQID; }
            set { firstQID = value; }
        }

        public string BuildName
        {
            get { return buildName; }
            set { buildName = value; }
        }

        public string SolutionMeaning
        {
            get { return solutionMeaning; }
            set { solutionMeaning = value; }
        }

        public DateTime VUpdt
        {
            get { return vUpdt; }
            set { vUpdt = value; }
        }

        public int VUpdtID
        {
            get { return vUpdtID; }
            set { vUpdtID = value; }
        }

        public string VUpdtName
        {
            get { return vUpdtName; }
            set { vUpdtName = value; }
        }

        public List<Question> QuestionList
        {
            get { return questionList; }
            set { questionList = value; }
        }


        //For jsTree Formatted

        public List<BuildJTree> JSTree
        {
            get { return _jsTree; }
            set { _jsTree = value; }
        }

        public string BuildTreeJson
        {
            get { return _buildTreeJson; }
            set { _buildTreeJson = value; }
        }

        #endregion

        #region Constructor

        public BuildVersion()
        {
            questionList = new List<Question>();
            _jsTree = new List<BuildJTree>();
        }

        #endregion

        #region Nested QuestionQueue Class

        public class QuestionQueue
        {
            //Private Variables
            private int level;
            private Question qQueue;

            //Properties
            public int Level
            {
                get { return level; }
                set { level = value; }
            }

            public Question QQueue
            {
                get { return qQueue; }
                set { qQueue = value; }
            }

            //Constructor

            public QuestionQueue()
            {
                qQueue = new Question();
            }
        }

        #endregion

        #region Nested Build JTree Class

        public class BuildJTree
        {
            private string _id;

            public string id
            {
                get { return _id; }
                set { _id = value; }
            }

            private string _parent;

            public string parent
            {
                get { return _parent; }
                set { _parent = value; }
            }

            private string _text;

            public string text
            {
                get { return _text; }
                set { _text = value; }
            }

        }

        #endregion

        #region Class Methods

        #region Load Data Method - Future Integration



        #endregion

        #region Build Structure Methods [Object List Format & JSON String Format]

        public void BuildQuestionStructure()
        {
            try
            {
                //Max Loop Net - For unforeseen circumstances temporarily 
                int loopCnt = 0;
                int maxLoop = 10000;

                //START
                List<Question> questionStructure = new List<Question>();
                Stack<QuestionQueue> queuedQuestions = new Stack<QuestionQueue>();
                QuestionQueue queueItem = new QuestionQueue();
                
                //Parent Object
                Question xQ = new Question();

                //Total Questions Cnt
                int totalQuestionCnt = this.questionList.Count();

                //Current Percent
                double curPercent = 0.0;

                //Other Variables
                bool isComplete = false;

                //Count of Parent Objects
                int xParentID = 0;
                int xChildID = 0;
                int xQuestionID = 0;
                int buildLevel = 1; //start on first level

                //get the first root/parent in list
                xQ = this.questionList.Where(x => x.QuestionID == this.firstQID).FirstOrDefault();

                //If no root/parent found, exit
                if (xQ == null) { return; }

                //Initialize Percent Complete
                xQ.PercentComplete = curPercent;

                //Add root/parent to temp structure
                xQ.NodeLevel = buildLevel;
                questionStructure.Add(xQ);

                //Remove single parent that was added to structure from question list
                this.questionList.Remove(xQ);

                //increase build level to go to all children
                ++buildLevel;

                if (xQ.IsConditional)
                    {   //queue up conditional children
                        for (int i = (xQ.QOptions.Count()-1); i >= 0 ; i--)
                        {
                            if (!(xQ.QOptions[i].ChildID == 0))
                            {
                                queueItem = new QuestionQueue();
                                queueItem.Level = buildLevel;
                                queueItem.QQueue = this.questionList.Where(x => x.QuestionID == xQ.QOptions[i].ChildID).FirstOrDefault();
                                queuedQuestions.Push(queueItem);
                                this.questionList.Remove(queueItem.QQueue);
                            }
                        }

                        queueItem = queuedQuestions.Pop();
                        xQ = queueItem.QQueue;
                        buildLevel = queueItem.Level;
                    }
                else
                {   //direct child
                    xQ = this.questionList.Where(x => x.QuestionID == xQ.ChildQID).FirstOrDefault();
                }


                //This on determines the rest of the structure
                while (!(isComplete))
                {

                    //If parent is not null
                    if (!(xQ == null))
                    {
                        //Set this questions information
                        xParentID = xQ.ParentQID;
                        xQuestionID = xQ.QuestionID;
                        xChildID = xQ.ChildQID;

                        //CalculatePercent
                        curPercent = (questionStructure.Count() + 1);
                        curPercent = Math.Round(((curPercent / totalQuestionCnt) * 100),2);
                        xQ.PercentComplete = curPercent;

                        //add it to temp
                        xQ.NodeLevel = buildLevel;
                        questionStructure.Add(xQ);

                        //remove from questionlist
                        this.questionList.Remove(xQ);

                        ++buildLevel;

                        if (xQ.IsConditional)
                        {   //queue up conditional children
                            for (int i = (xQ.QOptions.Count()-1); i >= 0; i--)
                            {
                                if (!(xQ.QOptions[i].ChildID == 0))
                                {
                                    queueItem = new QuestionQueue();
                                    queueItem.Level = buildLevel;
                                    queueItem.QQueue = this.questionList.Where(x => x.QuestionID == xQ.QOptions[i].ChildID).FirstOrDefault();
                                    queuedQuestions.Push(queueItem);
                                    this.questionList.Remove(queueItem.QQueue);
                                }
                            }

                            queueItem = queuedQuestions.Pop();
                            xQ = queueItem.QQueue;
                            buildLevel = queueItem.Level;
                        }
                        else
                        {   //direct child
                            xQ = this.questionList.Where(x => x.QuestionID == xQ.ChildQID).FirstOrDefault();
                            //++buildLevel;
                        }
                }
                else
                {
                    //check if done
                    if (queuedQuestions.Any())
                    {
                        queueItem = queuedQuestions.Pop();
                        xQ = queueItem.QQueue;
                        buildLevel = queueItem.Level;
                    }
                    else
                    {
                        isComplete = true;
                    }
                }



                    //Max Loop
                    ++loopCnt;

                    if (loopCnt > maxLoop)
                    {
                        throw new Exception("Tree Max Loop Error: " + loopCnt.ToString() + " Loops");
                    }
                }

                this.questionList = new List<Question>();
                this.questionList = questionStructure.ToList();
                this.FormatJsonTree();

            }
            catch (Exception)
            {
                throw;
            }


}

        private void FormatJsonTree()
        {
            BuildJTree x;

            foreach (Question item in this.questionList)
            {
                x = new BuildJTree
                {
                    id = item.QuestionID.ToString(),
                    parent = item.ParentQID == 0 ? "#" : item.ParentQID.ToString(),
                    text = item.QuestionTitle
                };

                this._jsTree.Add(x);
            }
            JavaScriptSerializer jss = new JavaScriptSerializer();

            this._buildTreeJson = jss.Serialize(this._jsTree);
        }

        #endregion

        #endregion

    }
}