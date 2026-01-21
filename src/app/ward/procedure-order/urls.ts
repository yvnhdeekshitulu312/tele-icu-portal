export const ProcedureOrderDetails = {
    FetchPatientVisits: 'FetchPatientVisits?Patientid=${Patientid}&HospitalID=${HospitalID}',
    fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientVistitInfo: 'FetchPatientVistitInfo?Patientid=${Patientid}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
    FetchClinicalProcedures: 'FetchClinicalProcedures?Filter=${Filter}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPPriority: 'FetchPPriority?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchClinicalProceduresView: 'FetchClinicalProceduresView?SSN=${SSN}&FromDate=${FromDate}&ToDate=${ToDate}&WardID=${WardID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveWardProcedureOrder: 'SaveWardProcedureOrder',
    SaveWardProcedureOrderN: 'SaveWardProcedureOrderN',
    FetchClinicalProceduresViewSelected: 'FetchClinicalProceduresViewSelected?TestOrderID=${TestOrderID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientInfonBed: 'FetchPatientInfonBed?BedNo=${BedNo}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchAllBeds: 'FetchAllBeds?Name=${Name}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'

};