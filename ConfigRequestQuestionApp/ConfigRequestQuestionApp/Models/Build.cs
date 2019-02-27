using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ConfigRequestQuestionApp.Models
{
    public class Build
    {

        #region Private Variables

        //Properties

        private int buildID;
        private string currentBuildName;
        private string currentSolution;
        private int currentVersion;
        private int selectedVersion;
        private int origBuildPersonID;
        private string origBuildPersonName;
        private DateTime bUpdt;
        private int bUpdtID;
        private string bUpdtName;
        private List<BuildVersion> buildVersionList;

        #endregion

        #region Properties

        //Properties

        public int BuildID
        {
            get { return buildID; }
            set { buildID = value; }
        }        

        public string CurrentBuildName
        {
            get { return currentBuildName; }
            set { currentBuildName = value; }
        }

        public string CurrentSolution
        {
            get { return currentSolution; }
            set { currentSolution = value; }
        }

        public int CurrentVersion
        {
            get { return currentVersion; }
            set { currentVersion = value; }
        }

        public int SelectedVersion
        {
            get { return selectedVersion; }
            set { selectedVersion = value; }
        }

        public int OrigBuildPersonID
        {
            get { return origBuildPersonID; }
            set { origBuildPersonID = value; }
        }

        public string OrigBuildPersonName
        {
            get { return origBuildPersonName; }
            set { origBuildPersonName = value; }
        }

        public DateTime BUpdt
        {
            get { return bUpdt; }
            set { bUpdt = value; }
        }

        public int BUpdtID
        {
            get { return bUpdtID; }
            set { bUpdtID = value; }
        }

        public string BUpdtName
        {
            get { return bUpdtName; }
            set { bUpdtName = value; }
        }

        public List<BuildVersion> BuildVersionList
        {
            get { return buildVersionList; }
            set { buildVersionList = value; }
        }

        #endregion

        #region Constructor

        public Build()
        {
            buildVersionList = new List<BuildVersion>();
        }

        #endregion

    }
}