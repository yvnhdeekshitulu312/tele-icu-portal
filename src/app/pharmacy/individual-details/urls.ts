export const individualDetails = {
    fetchData: 'FetchIndividualProcessingDetails?PrescriptionID=${PrescriptionID}&isDisPrescription=${IsDisPrescription}&WardID=${WardID}&radSystemIssue=${RadSystemIssue}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    save: 'SaveIndividualProcessing',
    substitute: 'FetchSubstituteItemsIP?ItemID=${ItemID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    holdpresitem: 'holdPrescriptionItems',
    UpdateItemIssuesVerifications:'UpdateItemIssuesVerifications',
    saveN: 'SaveIndividualProcessingN',
  };