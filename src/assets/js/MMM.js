var crsurl = 'https://crs.alhammadi.med.sa';

function fLoad() {
    var wciframe = document.getElementById('wciframe');
    document.getElementById('wciframe').src = crsurl + '/interface/wcintf.html';
    document.getElementById('wciframe').src = crsurl + '/interface/wcintf.html#' + encodeURIComponent(document.location.href);
    console.log("fLoad is called");
}

function onMessage(e) {
    if (e.origin == crsurl) {
        var msgobj = JSON.parse(e.data);
        switch (msgobj.MSG) {
            case 'READ':
                var outPut = msgobj.PACKET;
                btnReleaseInstance();   
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(outPut);

                var details = xmlDoc.getElementsByTagName("I10DXP");
                var ICDCode = '';
                if (xmlDoc.getElementsByTagName("I10DXP").length != 0) {
                    for (var i = 0; i < details.length; i++) {
                        if (details[i].childNodes) {
                            for (var j = 0; j < details[i].childNodes.length; j++) {
                                var detail = details[i].childNodes[j];
                                if (detail.nodeType === 1 & detail.firstChild != null)
                                    ICDCode = ICDCode + detail.firstChild.nodeValue + ',';
                                break;
                            }
                        }
                    }
                }

                details = xmlDoc.getElementsByTagName("I10DX");
                if (xmlDoc.getElementsByTagName("I10DX").length != 0) {
                    for (var i = 0; i < details.length; i++) {
                        if (details[i].childNodes) {
                            for (var j = 0; j < details[i].childNodes.length; j++) {
                                var detail = details[i].childNodes[j];
                                if (detail.nodeType === 1 & detail.firstChild != null)
                                    ICDCode = ICDCode + detail.firstChild.nodeValue + ',';
                                break;
                            }
                        }
                    }
                }

                var icdcodes = ICDCode.split(",");
                for (var row = 0; row < icdcodes.length; row++) {
                    if (icdcodes[row].length > 3) {
                        var icdcode1 = icdcodes[row].substr(0, 3);
                        var icdcode2 = icdcodes[row].substr(3, icdcodes[row].length);
                        icdcode2 = ".".concat(icdcode2);
                        icdcodes[row] = icdcode1.concat(icdcode2);
                    }
                }
                ICDCode = icdcodes.toString();

                var drugCode = '';
                details = xmlDoc.getElementsByTagName("DRG");
                if (xmlDoc.getElementsByTagName("DRG").length != 0) {
                    for (var i = 0; i < details.length; i++) {
                        if (details[i].childNodes) {
                            for (var j = 0; j < details[i].childNodes.length; j++) {
                                var detail = details[i].childNodes[j];
                                if (detail.nodeType === 1 & detail.firstChild != null)
                                    drugCode = drugCode + detail.firstChild.nodeValue + ' - ';
                            }
                        }
                    }

                }
                if (document.getElementById("ctl00_cphmain_hdnMResponse") != null) {
                    document.getElementById("ctl00_cphmain_hdnMResponse").value = ICDCode;
                    document.getElementById('ctl00_cphmain_hdnDRGCode').value = drugCode;
                    if (xmlDoc.getElementsByTagName("DRGWT").length != 0) { document.getElementById('ctl00_cphmain_hdnARCostWt').value = xmlDoc.getElementsByTagName("DRGWT")[0].text; }
                    else { document.getElementById('ctl00_cphmain_hdnARCostWt').value = ""; }
                    if (xmlDoc.getElementsByTagName("ALOS").length != 0) { document.getElementById('ctl00_cphmain_hdnALOS').value = xmlDoc.getElementsByTagName("ALOS")[0].text; }
                    else { document.getElementById('ctl00_cphmain_hdnALOS').value = ""; }
                }
                else if (document.getElementById("ctl00_cphpopup_hdnMResponse") != null) {
                    document.getElementById("ctl00_cphpopup_hdnMResponse").value = ICDCode;
                    if (xmlDoc.getElementsByTagName("DRGWT").length != 0) { document.getElementById('ctl00_cphpopup_hdnARCostWt').value = xmlDoc.getElementsByTagName("DRGWT")[0].text; }
                    else { document.getElementById('ctl00_cphpopup_hdnARCostWt').value = ""; }
                    if (xmlDoc.getElementsByTagName("ALOS").length != 0) { document.getElementById('ctl00_cphpopup_hdnALOS').value = xmlDoc.getElementsByTagName("ALOS")[0].text; }
                    else { document.getElementById('ctl00_cphpopup_hdnALOS').value = ""; }
                    document.getElementById('ctl00_cphpopup_hdnDRGCode').value = drugCode;
                }
               
                __doPostBack('3MData', '3MInteraction');

                break;
            case 'CLOSE':
                // handle close notification here.
                //document.getElementById('PageStatus')?.textContent = 'Instance closed';
                break;
            case 'ERROR':
                // handle close notification here.
                //document.getElementById('PageStatus')?.textContent = 'Error: ' + msgobj.TEXT;
                break;
            case 'INITIALIZED':
                // handle initialize is complete
                //document.getElementById('PageStatus')?.textContent = 'Initialized';
                btnWritePacket();
                break;
        }
    }
    else
        console.log('Message received unknown domain');
}


if (window['postMessage']) {
    if (window['addEventListener']) {
        window['addEventListener']('message', onMessage, !1);
    } else {
        window['attachEvent']('onmessage', onMessage);
    }
}

function btnCall3M() {
    var username = 'NTUserName';
   // var sessionname = 'UserSessionID';
    var sessionname = "CRS_Sessoion_" + generateCodeVerifier(8);
    frames['wciframe'].postMessage('{"CALL":"WcInitInstance", "USER":"' + username + '", "SESSION":"' + sessionname + '", "URL":"' + crsurl + '"}', crsurl);
}
function dec2hex(dec) { return ("0" + dec.toString(16)).substr(-2);}
		function generateCodeVerifier(size) {
			var array = new Uint32Array(size / 2);
			window.crypto.getRandomValues(array);
			return Array.from(array, dec2hex).join("");
		}

function btnWritePacket() {
    var Content = localStorage.getItem('WcWritePacket')
    var CodefinderXMLinput = Content;
    frames['wciframe'].postMessage('{"CALL":"WcWritePacket", "PACKET":"' + CodefinderXMLinput + '"}', crsurl);
    console.log("btnWritePacket is called");
}


function btnReleaseInstance() {
    frames['wciframe'].postMessage('{"CALL":"WcReleaseInstance"}', crsurl);
    console.log("Instance has been released ...");
    //document.getElementById('PageStatus')?.textContent = 'Instance has been released ...';
}