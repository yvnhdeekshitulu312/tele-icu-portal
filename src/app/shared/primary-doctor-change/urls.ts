export const primaryDoctorDetails = {
    FetchPatientVisits: 'FetchPatientVisits?Patientid=${Patientid}&HospitalID=${HospitalID}',
    fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientVistitInfo: 'FetchPatientVistitInfo?Patientid=${Patientid}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
    FetchPrimaryHospitalEmployees: 'FetchPrimaryHospitalEmployees?Filter=${Filter}&WorkStationID=${WorkStationID}&HospitalId=${HospitalID}',
    FetchEmployeeSpecializationsForPA: 'FetchEmployeeSpecializationsForPA?Type=1&Filter=${Filter}&UserID=${UserId}&WorkStationID=${WorkStationID}&HospitalId=${HospitalID}',
    FetchPatientPrimaryDoctorsA: 'FetchPatientPrimaryDoctorsA?AdmissionID=${AdmissionID}&UserID=${UserId}&WorkStationID=${WorkStationID}&HospitalId=${HospitalID}',
    SavePatientPrimaryDoctors: 'SavePatientPrimaryDoctors'
};