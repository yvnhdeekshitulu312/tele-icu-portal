export const otDetails = {
    fetch: 'FetchSurgerRecordsForDashboard?FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&tbl=0&FacilityId=${FacilityId}&Hospitalid=${Hospitalid}',
    FetchOTANAESTHESIA: 'FetchOTANAESTHESIA?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    UpdateAssignAnesthesian: 'UpdateAssignAnesthesian',
    FetchSurgerySchedulesSSRS:'FetchSurgerySchedulesSSRS?FromDate=${FromDate}&ToDate=${ToDate}&OTRoomID=${OTRoomID}&DoctorID=${DoctorID}&USERID=${USERID}&WORKSTATIONID=${WORKSTATIONID}&HospitalID=${HospitalID}',
    ConversionOPtoIPforsurgeryRecord: 'ConversionOPtoIPforsurgeryRecord?SurgeryRequestID=${SurgeryRequestID}&AdmissionID=${AdmissionID}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',
    UpdateSurgeryRequestCancellations: 'UpdateSurgeryRequestCancellations'
};