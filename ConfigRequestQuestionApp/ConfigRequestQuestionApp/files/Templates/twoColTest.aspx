<%@ Page Title="" Language="C#" MasterPageFile="~/files/Templates/TwoCol.master" AutoEventWireup="true" CodeFile="twoColTest.aspx.cs" Inherits="files_Templates_Default" %>

<asp:Content ID="styles" ContentPlaceHolderID="leftNavStyles" runat="server">
    <style>
        .about-nav{
            display:block;
        }
    </style>
</asp:Content>



<asp:Content ID="leftCol" ContentPlaceHolderID="TwoColLeft" Runat="Server">
    left

</asp:Content>




<asp:Content ID="rightCol" ContentPlaceHolderID="TwoColRight" Runat="Server">

    right
</asp:Content>

