<%option Explicit%>
<%Sub Main()

Dim RedirectURL

RedirectURL = Request.QueryString("RURL")



%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<HTML>
<HEAD><TITLE>Destination Reading</TITLE>

<!-- prevent caching in netscape. very important cause netscape tends to mangle cached code -->
<META HTTP-EQUIV="expires" CONTENT="0">
<META HTTP-EQUIV="Pragma" CONTENT="no-cache">

</HEAD>

<script language="JavaScript1.1" type="text/javascript">

//<!--

var IsIE = navigator.appName.indexOf("Microsoft") != -1;
var IsNetscape = !IsIE;
var IsMac = navigator.platform.indexOf("MacPPC") != -1;
var IsWin = !IsMac;
var IsNS6 = navigator.appVersion.substr(0, 1) > "4";

var flashWindow;

//sniffer stuff
var downLoadPromptPage = "download.html";	// send user to Macromedia
var majorVersionRequired = 6;		// minimum version required
var minorVersionRequired = 47;		// minimum version required

//version booleans
var flash6Installed = false;
var flash7Installed = false;
var flash8Installed = false;
var flash9Installed = false;
//****

//IE/Win - find Flash by creating objects
var isIE = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
var isWin = (navigator.appVersion.indexOf("Windows") != -1) ? true : false;

// write vbscript detection
if(isIE && isWin)
{
	document.write('<SCR' + 'IPT LANGUAGE=VBScript\> \n');
	document.write('on error resume next \n');
	document.write('flash6Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.6"))) \n');	
	document.write('flash7Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.7"))) \n');	
	document.write('flash8Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.8"))) \n');	
	document.write('flash9Installed = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.9"))) \n');	
	document.write('</SCR' + 'IPT\> \n'); // break up end tag so it doesn't end our script
}

// NS and IE/Mac - use javascript detection using navigator.plugins array
function detectFlash()
{	
	if(navigator.plugins && navigator.plugins["Shockwave Flash"])
	{
		var flashDescription = navigator.plugins["Shockwave Flash"].description;

		// plugin-description looks like 'Shockwave Flash 5.0 r5'
		// get the major version & minor versions
		var majorVersion = parseInt(flashDescription.charAt(flashDescription.indexOf(".") - 1));
		var subVersion = parseInt(flashDescription.charAt(flashDescription.indexOf(".") + 1));
		var minorStr = flashDescription.substring(flashDescription.indexOf("r") + 1);
		var minorVersion = parseInt(minorStr);

		//set the booleans
		flash6Installed = majorVersion == 6 ? true : false;
		flash7Installed = majorVersion == 7 ? true : false;
		flash8Installed = majorVersion == 8 ? true : false;
		flash9Installed = majorVersion == 9 ? true : false;
		
		if(flash6Installed && subVersion == 0)
		{
			if(minorVersion < minorVersionRequired)
			{
				flash6Installed = false;
				downLoadPromptPage = "downloadIEMac.html";
			}
		}
	}


	// set actualVersion to highest detected version
	var actualVersion = 0;
	if(flash6Installed) actualVersion = 6;
	if(flash7Installed) actualVersion = 7;
	if(flash8Installed) actualVersion = 8;
	if(flash9Installed) actualVersion = 9;
	//alert("version = " + actualVersion);
	
	//go to download prompt page if required version not present
	if (actualVersion < majorVersionRequired)
		window.location = downLoadPromptPage;
}


//run the detection function
detectFlash();
	
//	CMMenu.asp
//		For launching DR via LMS in assignment and preview modes
//		Opening page responsible for full screen window
//
//		URL parameters
//		==============
//			FromBrowser		0/1			1 - from browser
//			RedirectURL		string		passed in, CM redirects to this when closing
//			MenuURL			string		passed in, relative url to course menu
//			ShowDebug		0/1			1 to show debug text on nav bar
//			ShowCache		0/1			1 to show cache loading detail on nav bar
//
//	$$$ IMPORTANT &&&
//		Edit MenuURL for course 1 and course 2
// -->
</SCRIPT>

<BODY BGCOLOR="#FFFFFF" scroll="no">
	<OBJECT CLASSID="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0"
	WIDTH=100% HEIGHT=100%>
	<PARAM NAME="movie" VALUE="CMMain.swf">
	<PARAM NAME="FlashVars" VALUE="FromBrowser=1&RedirectURL=<%Response.Write RedirectURL%>&MenuURL=Menus/course1.swf">
	<PARAM NAME="loop" VALUE="false">
	<PARAM NAME="quality" VALUE="high">
	<PARAM NAME="menu" VALUE="false">
	<EMBED SRC="CMMain.swf" FlashVars="FromBrowser=1&RedirectURL=<%Response.Write RedirectURL%>&MenuURL=Menus/course1.swf" WIDTH="100%" HEIGHT="100%" loop="false"	quality="high" menu="false"
	TYPE="application/x-shockwave-flash" PLUGINSPAGE="http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash">
	</EMBED>
	</OBJECT>
</BODY>

</HTML>
<%End Sub
Call Main()%>

