var IsIE = navigator.appName.indexOf("Microsoft") != -1;
var IsNetscape = !IsIE;
var IsMac = navigator.platform.indexOf("MacPPC") != -1;
var IsMacIE = IsIE && IsMac;
var IsWin = !IsMac;
var IsNS6 = navigator.appVersion.substr(0, 1) > "4";
var agt = navigator.userAgent.toLowerCase();
var IsNS7_1 = agt.indexOf("netscape/7.1") != -1;
var IsSafari = ((agt.indexOf('safari')!=-1)&& IsMac)?true:false;
//var IsSafari = 1;

var g_bSCORM = 0; // automatic detection
var g_iScormType = -1;

var g_strTableWidth = "100%";
var g_strTableHeight = "100%";


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

function ProblemHeightBrowser()
{
	// needing to add more and more browser/version combinations to run within CS LRM format, so just apply
	// workaround for all browsers within CS LRM format:
	
	return 1;
	//return (g_bCSRTE == 1);
	//return (IsNS7_1 || IsMacIE || IsSafari);
	//return true;
}
function getCSHeight()
{

	var iRetVal = 0;
	// this is really naff but it is what Microsoft do, no guarantee it will work with CS 4!!!!
	// also means activity won't resize properly since height will be constant (may be better to make width constant also?
	var ecs_windowOverhead = 13+44+28+13;  // nav bars, etc.
	
	if(typeof g_bCSRTE != "undefined")
	{
		// CS (Page.htm)
		//alert("CS");
		if (g_bCSRTE == 1)
		{
			//alert("CS LRM");
			// LRM rather than SCORM
			if (ProblemHeightBrowser())
			{
			

				if (window.innerHeight)
				{
					 iRetVal = (window.innerHeight-ecs_windowOverhead-30);  //NSCP (needs more room)
				}
				else if (document.body && document.body.offsetHeight)
				{ 
					iRetVal = (document.body.offsetHeight-ecs_windowOverhead);  //IE
				}

			}


		}

	}
	return (iRetVal == 0 ? "100%" : new String(iRetVal));

}

function InitPage()
{
	if(g_bSCORM)
	{
		CMMain_DoFSCommand("LMSInitialize", "");
		bHideExit = 1;
	}
}
function Cleanup()
{
	if(g_bSCORM)
	{

		CMMain_DoFSCommand("LMSFinish", "");
	}
}
// NEW SCORM STUFF:

// define global var as handle to API object
var mm_adl_API = null;
// mm_getAPI, which calls findAPI as needed
window.status = 'script 1';
function getAPI(in_win)
{
	var myAPI = null;
	var iScormType = -1; // version of SCORM (-1 = no scorm)
	var tries = 0, triesMax = 500;
  	while (tries < triesMax && myAPI == null)
  	{
		myAPI = findAPI_2(window);
		if(myAPI == null)
		{
			myAPI = findAPI_1(window);
		} 
		else
		{
			iScormType = 2;
		}
   	 	if (myAPI == null && typeof(window.parent) != 'undefined')
		{ 
			myAPI = findAPI_2(window.parent);
			if(myAPI == null)
			{
				myAPI = findAPI_1(window.parent);
			}
			else
			{
				iScormType = 2;
			}
		}
   	 	if (myAPI == null && typeof(window.top) != 'undefined')
		{ 
			myAPI = findAPI_2(window.top);
			if(myAPI == null)
			{
				myAPI = findAPI_1(window.top);
			}
			else
			{
				iScormType = 2;
			}			
		}
   	 	if (myAPI == null && typeof(window.opener) != 'undefined')
		{ 
			if (window.opener != null && !window.opener.closed)
			{ 
				myAPI = findAPI_2(window.opener);
				if(myAPI == null)
				{
					myAPI = findAPI_1(window.opener);
				}
				else
				{
					iScormType = 2;
				}				
			}
		}
    		tries++;
  	}
	g_iScormType = (myAPI && iScormType == -1) ? 1 : iScormType;
	return myAPI;
}
function mm_getAPI()
{
  	var myAPI = null;
  	//var tries = 0, triesMax = 500;
	window.status = 'mm_getAPI()...';
	myAPI = getAPI(window);
	
	var iRetVal = (typeof g_bSCO == "undefined") ? 0 : g_bSCO;

  	if (myAPI == null)
  	{
    		window.status = 'API not found';
    		//alert('JavaScript Warning: API object not found in window or opener.');
  	}
  	else
  	{
    		mm_adl_API = myAPI;
    		window.status = 'API found, type: ' + g_iScormType;
		iRetVal = 1;
  	}
	return iRetVal;
}
// returns LMS API object (or null if not found)
function findAPI_OLD(win)
{
  // look in this window
  if (typeof(win) != 'undefined' ? typeof(win.API) != 'undefined' : false)
  {
    if (win.API != null )  return win.API;
  }
  // look in this window's frameset kin (except opener)
  if (win.frames.length > 0)  for (var i = 0 ; i < win.frames.length ; i++);
  {
    if (typeof(win.frames[i]) != 'undefined' ? typeof(win.frames[i].API) != 'undefined' : false)
    {
	     if (win.frames[i].API != null)  return win.frames[i].API;
    }
  }
  return null;
}
/*******************************************************************************
**
** Function findAPI(win)
** Inputs:  win - a Window Object
** Return:  If an API object is found, it's returned, otherwise null is returned
**
** Description:
** This function looks for an object named API in parent and opener windows
**
*******************************************************************************/
function findAPI_2(win)
{

   	return win.API_1484_11;
}
function findAPI_1(win)
{

   	return win.API;
}
g_bSCORM = mm_getAPI();
// Handle all the the FSCommand messages in a Flash movie
var showLmsWarn = true ;
function CMMain_DoFSCommand(command, args) {
  var myArgs = new String( args );
  var CMMainObj = IsIE ? CMMain : document.CMMain;

 // all 'LMS' calls handled here
  if (mm_adl_API != null && command.substring(0,3) == "LMS")
  {
    	var err = 1;
    	var sep, arg1, arg2, value;

	if( command == "LMSInitialize" )
	{
		err = g_iScormType == 1 ? mm_adl_API.LMSInitialize("") : mm_adl_API.Initialize( myArgs );
	}
	else if ( command == "LMSSetValue" )
	{
          		sep = myArgs.indexOf(",");
          		arg1 = myArgs.substr(0, sep);
          		arg2 = myArgs.substr(sep+1);
		err = g_iScormType == 1 ? mm_adl_API.LMSSetValue(arg1,arg2) : mm_adl_API.SetValue(arg1,arg2);
		//err = eval('mm_adl_API.SetValue(\"' + arg1 + '\",\"'+arg2+'\")');

        	}
	else if ( command == "LMSFinish" )
	{
		err = g_iScormType == 1 ? mm_adl_API.LMSFinish("") : mm_adl_API.Terminate(args);
		//err = g_iScormType == 1 ? LMSFinish(1): LMSFinish(2,args);
	}
	else if ( command == "LMSCommit" )
	{
		err = g_iScormType == 1 ? mm_adl_API.LMSCommit(args) : mm_adl_API.Commit(args);
	}
	else if ( command == "LMSFlush" )
	{
		err = g_iScormType == 1 ? mm_adl_API.LMSFlush(args) : mm_adl_API.Flush(args);
	}
	else if ( command == "LMSGetValue" )
	{
         		 // for LMSGetValue,LMSGetLastError,LMSGetErrorString,LMSGetDiagnostic, or ??
         		sep = myArgs.indexOf(",");
         		arg1 = myArgs.substr(0, sep);
         		arg2 = myArgs.substr(sep+1);
		value = g_iScormType == 1 ? mm_adl_API.LMSGetValue(arg1) : mm_adl_API.GetValue(arg1);
         		//value = eval('mm_adl_API.GetValue(\"' + arg1 + '\")');
		var errCode = g_iScormType == 1 ? mm_adl_API.LMSGetLastError().toString() : mm_adl_API.GetLastError().toString();
      		//var errCode = mm_adl_API.GetLastError().toString();


         		if (sep != 0 && arg2 != "")  CMMainObj.SetVariable(arg2,value);
         		else err = "-2: No Flash variable specified";
	}
	else
	{
          		// for LMSGetValue,LMSGetLastError,LMSGetErrorString,LMSGetDiagnostic, or ??
         		sep = myArgs.indexOf(",");
         		arg1 = myArgs.substr(0, sep);
         		arg2 = myArgs.substr(sep+1);
         		value = eval('mm_adl_API.' + command + '(\"' + arg1 + '\")');
         		if (sep != 0 && arg2 != "")  CMMainObj.SetVariable(arg2,value);
         		else err = "-2: No Flash variable specified";
	}

   	 // handle LMS error returns
    	if ((err == 0 || err == "false") && showLmsWarn)  {
      		if (! confirm('LMS API adapter returns error code: ' + err + '\rWhen calling API.' + command + 'with ' + args + '\r\rSelect cancel to disable future warnings'))  showLmsWarn = false;
    	}
  } // end of 'LMS' handling if
  else
   {
/*
	if(command == "doStuff")
	{
		
		
	}
*/
   }

}
function getArgs(query, separator){
	var args = new Object();
	if (query != null)
	{
		var pairs = query.split(separator);
		for(var i = 0; i < pairs.length; i++){
			var pos = pairs[i].indexOf('=');
			if (pos == -1) continue;
			var argname = pairs[i].substring (0, pos);
			var value = pairs[i].substring (pos+1);
			args[argname] = unescape (value);
			// document.writeln ("args " + argname + " " + args[argname]);
		}
	}
	return args;	
}
function initVars()
{
	var theString = unescape (location.search.substring(1));
	var args = getArgs (theString,"&");

	if(args.bHideExit)
	{
		bHideExit = args.bHideExit;
	}
	g_strTableHeight = getCSHeight();

}


function GenerateHTML (flashPath) {// Create Main HTML


	initVars();
	g_bCSRTE = typeof g_bCSRTE == "undefined" ? 0 : g_bCSRTE;
	document.write('<OBJECT CLASSID="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'); 	document.write(' codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0"');
	document.write(' ID=CMMain WIDTH="100%" HEIGHT="100%">\n');
	document.write('<PARAM NAME="movie" VALUE="CMMain.swf">');
	document.write('<PARAM NAME="FlashVars" VALUE="FromBrowser=1');
	document.write('&ACTIVITYURL=');
	document.write(strActivityURL);
	document.write('&bHideExit=');
	document.write(bHideExit);
	document.write('&g_bSCORM=');
	document.write(g_bSCORM);
	document.write('&g_bCSRTE=');
	document.write(g_bCSRTE);
	document.write('&CDataURL=../Certificate/CDataEmpty.swf">');
	document.write('<PARAM NAME="loop" VALUE="false">');
	document.write('<PARAM NAME="quality" VALUE="high">');
	document.write('<PARAM NAME="menu" VALUE="false">');

	document.write('<EMBED SRC="CMMain.swf" FlashVars="FromBrowser=1');
	document.write('&ACTIVITYURL=');
	document.write(strActivityURL);
	document.write('&bHideExit=');
	document.write(bHideExit);	
	document.write('&g_bSCORM=');
	document.write(g_bSCORM);
	document.write('&g_bCSRTE=');
	document.write(g_bCSRTE);
	document.write('&CDataURL=../Certificate/CDataEmpty.swf"');
	document.write(' WIDTH="');
	document.write(g_strTableWidth);
	document.write('"  HEIGHT="');
	document.write(g_strTableHeight);
	document.write('" loop="false"');	
	document.write(' swLiveConnect=true ID="CMMain" NAME="CMMain"');	
	document.write(' quality="high" menu="false"');
	document.write(' TYPE="application/x-shockwave-flash"');	document.write(' PLUGINSPAGE="http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash">');
	document.write('</EMBED>');

	document.write('</OBJECT>');
}
