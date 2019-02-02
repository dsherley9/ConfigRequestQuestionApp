using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ConfigRequestQuestionApp.Models
{
    public class QuestionOptions
    {
        private int qOptID;
        private int questionID;
        private string labelText;
        private int childID;
        private int sequence;

        public int QuestionID
        {
            get { return questionID; }
            set { questionID = value; }
        }

        public int QOptID
        {
            get { return qOptID; }
            set { qOptID = value; }
        }        

        public string LabelText
        {
            get { return labelText; }
            set { labelText = value; }
        }

        public int ChildID
        {
            get { return childID; }
            set { childID = value; }
        }

        public int Sequence
        {
            get { return sequence; }
            set { sequence = value; }
        }

    }
}