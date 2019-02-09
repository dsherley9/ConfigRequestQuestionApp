using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

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

        //For Build Question Structure
        private List<Question> tempStructList;

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

        #endregion

        #region Constructor

        public BuildVersion()
        {
            questionList = new List<Question>();
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

        #region Class Methods

        #region Load Data Method - Future Integration



        #endregion

        #region Build Structure Methods

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

                //Add root/parent to temp structure
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

                        //add it to temp
                        questionStructure.Add(xQ);

                        //remove from questionlist
                        this.questionList.Remove(xQ);

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
                            ++buildLevel;
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

            }
            catch (Exception)
            {
                throw;
            }


}

        #endregion

        #endregion

    }
}