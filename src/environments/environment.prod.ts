export const environment = {
  production: true,
  secugenLicense: '66m+NfkKoRQiGOIv5EOOEOPbrHb5snFoFZKFv6F7AAs=',
  paginationsize: 10,
  loaderExclude: [
    'FetchItemDetails',
    'FetchInstructionsToNurse',
    'FetchSavedRole',
    'FetchSSUSERSData',
    'translate'
  ]
};

// For Cloud Build
// export const config = {
//   apiurl: 'http://his.alhammadi.med.sa/ClinicalsAPI/API/',
//   rcmapiurl: 'http://his.alhammadi.med.sa/RCMAPI/',
//   nphiesapiurl: 'https://his.alhammadi.med.sa/SW-Approvals/hie/nphies/EligibilityCheck',
//   hijapiurl: 'http://172.18.17.219/DEVAPI/API/',
//   rcmuiurl: 'http://his.alhammadi.med.sa/rcm/',
//   nphiesApprovalapiurl: 'https://his.alhammadi.med.sa/SW-Approvals/hie/nphies/' ,
//   reportsapi: 'http://his.alhammadi.med.sa/ClinicalsAPIKPI/API/',
//   chatgptapiurl: 'http://his.alhammadi.med.sa/ClinicalsAPI/API/translate',
//   n8nurl: 'https://his.alhammadi.med.sa/n8n/webhook/voice-agent',
//   reportAgentUrl: 'https://his.alhammadi.med.sa/n8n/webhook/report-agent',
//    miniAgent: 'https://his.alhammadi.med.sa/n8n/webhook/mini-agent'
// };


// For Cloud Build TESTING
// export const config = {
//   apiurl: 'http://his.alhammadi.med.sa/ClinicalsAPiT/API/',
//   rcmapiurl: 'http://his.alhammadi.med.sa/rcmapit/',
//   nphiesapiurl: 'http://10.132.23.200/hie/nphies/EligibilityCheck',
//   hijapiurl: 'http://172.18.17.219/DEVAPI/API/',
//   rcmuiurl: 'http://his.alhammadi.med.sa/Rcm/',
//   nphiesApprovalapiurl: 'https://his.alhammadi.med.sa/SW-Approvals/hie/nphies/' ,
//   reportsapi: 'http://his.alhammadi.med.sa/ClinicalsAPIKPIT/API/',
//   chatgptapiurl: 'http://his.alhammadi.med.sa/ClinicalsAPiT/API/translate',
//     n8nurl: 'https://his.alhammadi.med.sa/n8n/webhook/voice-agent',
//   //reportAgentUrl: 'https://his.alhammadi.med.sa/n8n/webhook/report-agent',
//   reportAgentUrl: 'https://his.alhammadi.med.sa/n8n/webhook/report-agent-cache',
//    miniAgent: 'https://his.alhammadi.med.sa/n8n/webhook/mini-agent'
// };


//For Cloud Build Dev build
export const config = {
  apiurl: 'http://his.alhammadi.med.sa/ClinicalsAPIDev/API/',
  rcmapiurl: 'http://172.18.17.219/rcmapidev/',
  nphiesapiurl: 'http://10.132.23.200/hie/nphies/EligibilityCheck',
  hijapiurl: 'http://172.18.17.219/DEVAPI/API/',
  rcmuiurl: 'http://his.alhammadi.med.sa/Rcm/',
  nphiesApprovalapiurl: 'https://his.alhammadi.med.sa/SW-Approvals/hie/nphies/' ,
  reportsapi: 'http://his.alhammadi.med.sa/ClinicalsAPIKPIT/API/',
  chatgptapiurl: 'https://his.alhammadi.med.sa/ClinicalsAPIDev/API/translate', 
  n8nurl: 'https://his.alhammadi.med.sa/n8n/webhook/voice-agent',
   //reportAgentUrl: 'https://his.alhammadi.med.sa/n8n/webhook/report-agent',
   reportAgentUrl: 'https://his.alhammadi.med.sa/n8n/webhook/report-agent-cache',
   miniAgent: 'https://his.alhammadi.med.sa/n8n/webhook/mini-agent'
};



