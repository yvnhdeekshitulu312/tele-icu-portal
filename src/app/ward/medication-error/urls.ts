export const medicationDetails = {
    FetchPatientVisits: 'FetchPatientVisits?Patientid=${Patientid}&HospitalID=${HospitalID}',
    fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientVistitInfo: 'FetchPatientVistitInfo?Patientid=${Patientid}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
    FetchPrescribedItemsError: 'FetchPrescribedItemsError?PatientType=${PatientType}&IPID=${IPID}&Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchMedicationErrorRouteofAdmin: 'FetchMedicationErrorRouteofAdmin?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchMedicationErrorM: 'FetchMedicationErrorM?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveDrugErrorModification: 'SaveDrugErrorModification',
    FetchDrugErrorViewWorkList: 'FetchDrugErrorViewWorkList?SSN=${SSN}&FromDate=${FromDate}&ToDate=${ToDate}&WardID=${WardID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchMedicationError: 'FetchMedicationError?ReportID=${ReportID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
};