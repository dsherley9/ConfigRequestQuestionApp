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
                tempStructList = new List<Question>();
                List<QuestionQueue> queueStructList = new List<QuestionQueue>();

                //Parent Object
                Question xQ = new Question();

                //Child Object
                Question yQ = new Question();

                //Question Queue Item
                QuestionQueue queueItem = new QuestionQueue();

                //Other Variables
                bool isComplete = false;

                //Count of Parent Objects
                int parentCnt;
                int xChildCnt;
                int xParentID;
                int xChildID;
                int xQuestionID;
                int buildLevel = 1; //start on first level

                //get the first root/parent in list
                xQ = questionList.Where(x => x.QuestionID == firstQID).FirstOrDefault();

                //If no root/parent found, exit
                if (xQ == null) { return; }  

                //Total root/parent found, there can more than 1 because there is a question for each parents conditional child
                parentCnt = questionList.Where(x => x.QuestionID == firstQID).Count();

                //Add root/parent to temp structure
                tempStructList.Add(xQ);

                //Remove single parent that was added to structure from question list
                questionList.Remove(xQ);
                --parentCnt;

                //If there is remaining parents and it's a conditional question, then queue the remaining parent questions for the other path(s). 
                //Otherwise it's a question with options that's not conditional and the first object should have everything
                if ((parentCnt > 0) && xQ.IsConditional == true)
                {
                    //Add rest of parent objects to queue
                    for (int i = 0; i < parentCnt; i++)
                    {
                        queueItem = new QuestionQueue();
                        queueItem.Level = buildLevel;
                        queueItem.QQueue = questionList.Where(x => x.QuestionID == firstQID).FirstOrDefault();

                        //Add to queued list
                        queueStructList.Add(queueItem);

                        //Remove from question list since it's queued
                        questionList.Remove(queueItem.QQueue);
                    }
                }

                //increase build level to go to all children
                ++buildLevel; 


                //This on determines the rest of the structure

                while (!(isComplete))
                {
                    //Set this questions information
                    xParentID = xQ.ParentQID;
                    xQuestionID = xQ.QuestionID; 
                    xChildID = xQ.ChildQID;

                    //How many children are there of current question
                    xChildCnt = questionList.Where(x => x.QuestionID == xChildID).Count();

                    //Get the first child
                    yQ = new Question();
                    yQ = questionList.Where(x => x.QuestionID == xChildID).FirstOrDefault();


                    //If the child is not null, add to temp structure
                    if (!(yQ == null))
                    {
                        //add it to temp
                        tempStructList.Add(yQ);

                        //remove from questionlist
                        questionList.Remove(yQ);
                        --xChildCnt;
                    }


                    //If there is remaining children and it's a conditional question, then queue the remaining question for the other path(s). 
                    //Otherwise it's a question with options that's not conditional and the first object should have everything
                    if (xChildCnt > 0 && yQ.IsConditional == true)
                    {
                        //Add rest of objects to queue
                        for (int i = 0; i < xChildCnt; i++)
                        {
                            queueItem = new QuestionQueue();
                            queueItem.Level = buildLevel;
                            queueItem.QQueue = questionList.Where(x => x.QuestionID == xChildID).FirstOrDefault();
                            queueStructList.Add(queueItem);
                            questionList.Remove(queueItem.QQueue);
                        }
                    }


                    //Move to next question, or complete
                    xQ = new Question();

                    if (!(xChildID == 0))
                    {
                        //Not done with path, keep looping
                        xQ.ChildQID = yQ.ChildQID;
                        ++buildLevel;
                    }
                    else
                    {
                        //check if done
                        if (queueStructList.Any())
                        {
                            queueItem = new QuestionQueue();
                            queueItem = queueStructList.LastOrDefault();
                            xQ = queueItem.QQueue;
                            buildLevel = queueItem.Level;
                            queueStructList.Remove(queueItem);
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
                        throw new Exception("Tree Max Loop Error:" + loopCnt.ToString() + " Loops");
                    }
                }

                questionList = new List<Question>();
                questionList = tempStructList.ToList();

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