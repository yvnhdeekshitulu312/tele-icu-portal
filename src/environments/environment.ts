// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  secugenLicense: '66m+NfkKoRQiGOIv5EOOEOPbrHb5snFoFZKFv6F7AAs=',
  production: false,
  paginationsize: 10,
  loaderExclude: [
    'FetchItemDetails',
    'FetchInstructionsToNurse',
    'FetchSavedRole',
    'FetchSSUSERSData',
    'translate',
    'webhook'
  ]
};

// export const config = { 
//   apiurl: 'http://172.18.17.219/DoctorPortalAPIUATTest/API/',
//   rcmapiurl: 'http://172.18.17.219/rcmapidev/',
//   nphiesapiurl: 'http://172.18.17.219/HIE/nphies/tempEligibilityCheck',
//   hijapiurl: 'http://172.18.17.219/DEVAPI/API/',
//   rcmuiurl: 'http://172.18.17.219/RCMAPPUIDEV/',
//   nphiesApprovalapiurl: 'https://his.alhammadi.med.sa/SW-Approvals/hie/nphies/' ,
//   reportsapi: 'https://his.alhammadi.med.sa/ClinicalsAPIKPI/API',
//   chatgptapiurl: 'http://172.18.17.219/DoctorPortalAPIUATTest/API/translate',
//   n8nurl: 'http://10.134.134.10:5678/webhook/voice-agent',
//   reportAgentUrl: 'http://10.134.134.10:5678/webhook/report-redis-DB',
//   miniAgent: 'http://10.134.134.10:5678/webhook/mini-agent'
// };

// export const config = { 
//   apiurl: 'http://172.18.17.219/DoctorPortalAPILIVE/API/',
//   rcmapiurl: 'http://172.18.17.219/rcmapidev/',
//   nphiesapiurl: 'http://172.18.17.219/HIE/nphies/tempEligibilityCheck',
//   hijapiurl: 'http://172.18.17.219/DEVAPI/API/',
//   rcmuiurl: 'http://172.18.17.219/RCMAPPUIDEV/',
//   nphiesApprovalapiurl: 'https://his.alhammadi.med.sa/SW-Approvals/hie/nphies/' ,
//   reportsapi: 'https://his.alhammadi.med.sa/ClinicalsAPIKPI/API',
//   chatgptapiurl: 'http://172.18.17.219:8000/translate'
// };

//cloud

//For Cloud Build
// export const config = {
//   apiurl: 'https://his.alhammadi.med.sa/ClinicalsAPI/API/',
//   rcmapiurl: 'https://his.alhammadi.med.sa/RCMAPI/',
//   nphiesapiurl: 'http://his.alhammadi.med.sa/SW-Approvals/hie/nphies/EligibilityCheck',
//   hijapiurl: 'http://172.18.17.219/DEVAPI/API/',
//   rcmuiurl: 'https://his.alhammadi.med.sa/rcm/',
//   nphiesApprovalapiurl: 'https://his.alhammadi.med.sa/SW-Approvals/hie/nphies/' ,
//   reportsapi: 'https://his.alhammadi.med.sa/ClinicalsAPIKPI/API/',
//   chatgptapiurl: 'https://his.alhammadi.med.sa/ClinicalsAPI/API/translate',
//    n8nurl: 'https://his.alhammadi.med.sa/n8n/webhook/voice-agent',
//   reportAgentUrl: 'http://his.alhammadi.med.sa/webhook/report-redis-DB',
//    miniAgent: 'http://his.alhammadi.med.sa/webhook/mini-agent'
// };
  

// //For Cloud Build TESTING
// export const config = {
//   apiurl: 'https://his.alhammadi.med.sa/ClinicalsAPiT/API/',
//   rcmapiurl: 'https://his.alhammadi.med.sa/rcmapit/',
//   nphiesapiurl: 'http://10.132.23.200/hie/nphies/EligibilityCheck',
//   hijapiurl: 'http://172.18.17.219/DEVAPI/API/',
//   rcmuiurl: 'http://his.alhammadi.med.sa/Rcm/',
//   nphiesApprovalapiurl: 'https://his.alhammadi.med.sa/SW-Approvals/hie/nphies/' ,
//   reportsapi: 'https://his.alhammadi.med.sa/ClinicalsAPIKPIT/API/', 
//    chatgptapiurl: 'https://his.alhammadi.med.sa/ClinicalsAPiT/API/translate',
//     n8nurl: 'https://his.alhammadi.med.sa/n8n/webhook/voice-agent',
//   reportAgentUrl: 'https://his.alhammadi.med.sa/n8n/webhook/report-redis-DB',
//    miniAgent: 'https://his.alhammadi.med.sa/n8n/webhook/mini-agent'
// };



//For Cloud Build Dev
export const config = {
  apiurl: 'https://his.alhammadi.med.sa/ClinicalsAPIDev/API/',
  rcmapiurl: 'https://his.alhammadi.med.sa/rcmapit/',
  nphiesapiurl: 'http://10.132.23.200/hie/nphies/EligibilityCheck',
  hijapiurl: 'http://172.18.17.219/DEVAPI/API/',
  rcmuiurl: 'http://his.alhammadi.med.sa/Rcm/',
  nphiesApprovalapiurl: 'https://his.alhammadi.med.sa/SW-Approvals/hie/nphies/',
  reportsapi: 'https://his.alhammadi.med.sa/ClinicalsAPIKPIT/API/',
  chatgptapiurl: 'https://his.alhammadi.med.sa/ClinicalsAPIDev/API/translate',
   n8nurl: 'https://his.alhammadi.med.sa/n8n/webhook/voice-agent',
  //reportAgentUrl: 'https://his.alhammadi.med.sa/n8n/webhook/report-agent',
  reportAgentUrl: 'https://his.alhammadi.med.sa/n8n/webhook/report-redis-DB',
   miniAgent: 'https://his.alhammadi.med.sa/n8n/webhook/mini-agent'
  //n8nurl: 'http://10.134.134.10:5678/webhook/voice-agent'
};



// //For Cloud Build Dev build
// export const config = {
//   apiurl: 'http://his.alhammadi.med.sa:54380/ClinicalsAPIDev/API/',
//   rcmapiurl: 'http://his.alhammadi.med.sa:54380/RCMAPIDev/',
//   nphiesapiurl: 'http://10.132.23.200/hie/nphies/EligibilityCheck',
//   hijapiurl: 'http://172.18.17.219/DEVAPI/API/',
//   rcmuiurl: 'http://his.alhammadi.med.sa/Rcm/',
//   nphiesApprovalapiurl: 'https://his.alhammadi.med.sa/SW-Approvals/hie/nphies/' 
// };



// export const config = { 
//   apiurl: 'http://172.18.17.219/DoctorPortalAPIUAT/API/',
//   rcmapiurl: 'http://172.18.17.219/rcmapi/',
//   nphiesapiurl: 'http://172.18.17.219/HIE/nphies/tempEligibilityCheck',
//   hijapiurl: 'http://172.18.17.219/DEVAPI/API/',
//   rcmuiurl: 'http://172.18.17.219/RCMAPPUIDEV/',
//   nphiesApprovalapiurl: 'https://his.alhammadi.med.sa/SW-Approvals/hie/nphies/' 
// };

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
