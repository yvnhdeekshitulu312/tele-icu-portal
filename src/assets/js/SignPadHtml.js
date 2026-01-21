var showMessage = false;

var wgssSignatureSDK = null;

var sigObj = null;
var sigCtl = null;
var dynCapt = null;

var l_name = null;
var l_reason = null;
var l_imageContainer = null;

var l_licence_string = "AgAkAMlv5nGdAQVXYWNvbQ1TaWduYXR1cmUgU0RLAgOBAgJkAACIAwEDZQA";

function OnLoad(callback)
{
  Print("CLEAR");
  restartSession(callback);
}

function restartSession(callback) 
{
  wgssSignatureSDK = null;
  
  sigObj = null;
  sigCtl = null;
  dynCapt = null; 
    
  var timeout = setTimeout(timedDetect, 1500);
  
  wgssSignatureSDK = new WacomGSS_SignatureSDK(onDetectRunning, 8000);
  
  function timedDetect() 
  {
    if (wgssSignatureSDK.running) 
    {
      Print("Wacom Signature Capturing Service Detected");
      start();
    } 
    else 
    {
      Print("Wacom Signature Capturing Service Not Detected");
    }
  }  
  
  function onDetectRunning()
  {
    if (wgssSignatureSDK.running) 
    {
      Print("Wacom Signature Capturing Service Detected");
      clearTimeout(timeout);
      start();
    }
    else 
    {
      Print("Wacom Signature Capturing Service Not Detected");
    }
  }
  
  function start()
  {
    if (wgssSignatureSDK.running) 
    {
      sigCtl = new wgssSignatureSDK.SigCtl(onSigCtlConstructor);
    }
  }
  
  function onSigCtlConstructor(sigCtlV, status)
  {
    if(wgssSignatureSDK.ResponseStatus.OK == status)
    {
      sigCtl.PutLicence(l_licence_string, onSigCtlPutLicence);
    }
    else
    {
      Print("Signature Control Construction Error : " + status);
    }
  }

  function onSigCtlPutLicence(sigCtlV, status) {
    if (wgssSignatureSDK.ResponseStatus.OK == status) {
      dynCapt = new wgssSignatureSDK.DynamicCapture(onDynCaptConstructor);
    }
    else {
      Print("Signature Control Licence Error : " + status);
    }
  }
  
  function onDynCaptConstructor(dynCaptV, status)
  {
    if(wgssSignatureSDK.ResponseStatus.OK == status)
    {
      sigCtl.GetSignature(onGetSignature);
    }
    else
    {
      Print("Dynamic Capture Construction Error : " + status);
    }
  }
  
  function onGetSignature(sigCtlV, sigObjV, status)
  {
    if(wgssSignatureSDK.ResponseStatus.OK == status)
    {
      sigObj = sigObjV;
      sigCtl.GetProperty("Component_FileVersion", onSigCtlGetProperty);
    }
    else
    {
      Print("Signature Capture Get Signature Error : " + status);
    }
  }
  
  function onSigCtlGetProperty(sigCtlV, property, status)
  {
    if(wgssSignatureSDK.ResponseStatus.OK == status)
    {
      Print("flSigCOM.dll Version : " + property.text);
      dynCapt.GetProperty("Component_FileVersion", onDynCaptGetProperty);
    }
    else
    {
      Print("Signature Control Get Property Error : " + status);
    }
  }
  
  function onDynCaptGetProperty(dynCaptV, property, status)
  {
    if(wgssSignatureSDK.ResponseStatus.OK == status)
    {
      Print("flSigCapt.dll Version : " + property.text);
      Print("Application Ready");
      
      if('function' === typeof callback)
      {
        callback();
      }
    }
    else
    {
      Print("Dynamic Capture Get Property Error : " + status);
    }
  }
}

function captureSignature(name, reason, imageContainer) {
    l_name = name;
    l_reason = reason;
    l_imageContainer = imageContainer;
    Capture();
}

function Capture()
{
  if(wgssSignatureSDK == null || !wgssSignatureSDK.running || null == dynCapt)
  {
    Print("Session Error. Restarting...");
    restartSession(window.Capture);
    return;
  }
  
  dynCapt.Capture(sigCtl, l_name, l_reason, null, null, onDynCaptCapture);

  function onDynCaptCapture(dynCaptV, SigObjV, status)
  {
    if(wgssSignatureSDK.ResponseStatus.INVALID_SESSION == status)
    {
      Print("Invalid Session. Restarting...");
      restartSession(window.Capture);
    }
    else
    {
      if(wgssSignatureSDK.DynamicCaptureResult.DynCaptOK != status)
      {
        Print("Signature Capture Returned " + status);
      }
	  
      switch(status) {
          case wgssSignatureSDK.DynamicCaptureResult.DynCaptOK:
          sigObj = SigObjV;
          Print("Signature Captured Successfully");
          var flags = wgssSignatureSDK.RBFlags.RenderOutputBase64 | wgssSignatureSDK.RBFlags.RenderColor32BPP | wgssSignatureSDK.RBFlags.RenderBackgroundTransparent;
          var imgSignature = document.getElementById(l_imageContainer);
              /*sigObj.RenderBitmap("png", imgSignature.clientWidth, imgSignature.clientHeight, 0.7, 0x00000000, 0x00FFFFFF, flags, 0, 0, onRenderBitmapBase64);*/
              sigObj.RenderBitmap("png", imgSignature.clientWidth, imgSignature.clientHeight, 0.7, 0xF44336, 0x00FFFFFF, flags, 0, 0, onRenderBitmapBase64);
          break;
        case wgssSignatureSDK.DynamicCaptureResult.DynCaptCancel:
          Print("Signature Capture Cancelled");
          break;
        case wgssSignatureSDK.DynamicCaptureResult.DynCaptPadError:
          Print("No Signature Capture Service Available");
          break;
        case wgssSignatureSDK.DynamicCaptureResult.DynCaptError:
          Print("Electronic Signature Tablet Error");
          break;
        case wgssSignatureSDK.DynamicCaptureResult.DynCaptIntegrityKeyInvalid:
          Print("Integrity Key Parameter Is Invalid (Obsolete)");
          break;
        case wgssSignatureSDK.DynamicCaptureResult.DynCaptNotLicensed:
          Print("No Valid Signature Capture Licence Found");
          break;
        case wgssSignatureSDK.DynamicCaptureResult.DynCaptAbort:
          Print("Error - Unable To Parse Document Contents");
          break;
        default: 
          Print("Signature Capture Error : " + status);
          break;
      }
    }
  }
  
  function onRenderBitmapBase64(sigObjV, bmpObj, status) 
  {
    if(wgssSignatureSDK.ResponseStatus.OK == status) 
    {
      Print(bmpObj);
	  
      img = new Image();
      img.src = "data:image/png;base64," + bmpObj;	  
	  
	  document.getElementById("imgFinal").src = img.src;
	  document.getElementById("taBase64").value = "data:image/png;base64," + bmpObj;
	  var imgSignature = document.getElementById(l_imageContainer);
      
	  if(null == imgSignature.firstChild)
      {
        imgSignature.appendChild(img);
      }
      else
      {
        imgSignature.replaceChild(img, imgSignature.firstChild);
      }
      
//      if(null == imgSignatureArb.firstChild)
//      {
//        imgSignatureArb.appendChild(img);
//      }
//      else
//      {
//        imgSignatureArb.replaceChild(img, imgSignatureArb.firstChild);
//      }
    } 
    else 
    {
      Print("Signature Render Bitmap Error : " + status);
    }
  }  
}

function DisplaySignatureDetails()
{
  if(!wgssSignatureSDK.running || null == sigObj)
  {
    Print("Session Error. Restarting...");
    restartSession(window.DisplaySignatureDetails);
    return;
  }
  
  sigObj.GetIsCaptured(onGetIsCaptured);
  
  function onGetIsCaptured(sigObj, isCaptured, status)
  {
    if(wgssSignatureSDK.ResponseStatus.OK == status) 
    {
      if(!isCaptured)
      {
        Print("No Signature Has Been Captured Yet");
        return;
      }
      sigObj.GetWho(onGetWho);
    }
    else 
    {
      Print("Signature GetWho Error : " + status);
      if(wgssSignatureSDK.ResponseStatus.INVALID_SESSION == status)
      {
        Print("Session Error. Restarting...");
        restartSession(window.DisplaySignatureDetails);
      }
    }
  }
  
  function onGetWho(sigObjV, who, status) 
  {
    if(wgssSignatureSDK.ResponseStatus.OK == status) 
    {
      Print("Name : " + who);
      var tz = wgssSignatureSDK.TimeZone.TimeLocal;
      sigObj.GetWhen(tz, onGetWhen);
    } 
    else 
    {
      Print("Signature GetWho Error : " + status);
    }
  }
  
  function onGetWhen(sigObjV, when, status) 
  {
    if(wgssSignatureSDK.ResponseStatus.OK == status) 
    {
      Print("Date : " + when.toString());
      sigObj.GetWhy(onGetWhy);
    } 
    else 
    {
      Print("Signature GetWhen Error : " + status);
    }
  }
  
  function onGetWhy(sigObjV, why, status) 
  {
    if(wgssSignatureSDK.ResponseStatus.OK == status) 
    {
      Print("Reason : " + why);
    } 
    else 
    {
      Print("Signature GetWhy Error : " + status);
    }
  }  
}

function AboutBox()
{
  if(!wgssSignatureSDK.running || null == sigCtl)
  {
    Print("Session Error. Restarting...");
    restartSession(window.AboutBox);
    return;
  }
  
  sigCtl.AboutBox(onAboutBox);
  
  function onAboutBox(sigCtlV, status) 
  {
    if(wgssSignatureSDK.ResponseStatus.OK != status) 
    {
      Print("AboutBox Error : " + status);
      if(wgssSignatureSDK.ResponseStatus.INVALID_SESSION == status)
      {
        Print("Session Error. Restarting...");
        restartSession(window.AboutBox);
      }
    }
  }
}

function Exception(ex) {
  Print("Exception : " + ex);
}

function Print(info) {
    if (showMessage) { alert(info); }
}