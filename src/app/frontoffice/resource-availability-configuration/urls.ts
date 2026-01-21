export const resourceDetails = {
    fetchGSpecialisation: 'FetchGSpecialisation?Type=${Type}&DisplayName=${DisplayName}',
    fetchGSpecialisationN: 'DepartmentListNN?HospitalID=${HospitalID}',
    fetchHospitalLocations: 'FetchHospitalLocations?type=0&filter=blocked=0&UserId=0&WorkstationId=0',
    fetchSpecializationDoctor: 'FetchSpecializationDoctor?SpecializationID=${SpecializationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    saveResourceAvailbility: 'SaveResourceAvailbility',
    FetchAppointmentStatus: 'FetchAppointmentStatus?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    fetchResourceAvailableConfiguration: 'FetchResourceAvailableConfiguration?DoctorID=${DoctorID}&SpecialisationID=${SpecialisationID}&Specialisation=${Specialisation}&Status=${Status}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    modifyResourceAvailbility: 'ModifyResourceAvailbility',
    deleteResourceAvailbility: 'DeleteResourceAvailbility',
    FetchReferalDoctors: 'FetchReferalDoctors?Tbl=${Tbl}&Name=${Name}',
    FetchCountryWiseHolidays: 'FetchCountryWiseHolidays?WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    UpdateTotalWaitingSlots: 'UpdateTotalWaitingSlots',
    DeleteResourceAvailbilityAll: 'DeleteResourceAvailbilityAll',
    fetchResourceAvailableConfigurationN: 'FetchResourceAvailableConfigurationN?DoctorID=${DoctorID}&SpecialisationID=${SpecialisationID}&Specialisation=${Specialisation}&Status=${Status}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveResourceAvailbilityPFN: 'SaveResourceAvailbilityPFN',
    SaveResourceAvailbilityPFNSPEC: 'SaveResourceAvailbilityPFNSPEC',

    modifyResourceAvailbilityPFN: 'ModifyResourceAvailbilityPFN',
    FetchDoctorSpecializationNN: 'FetchDoctorSpecializationNN?DoctorID=${DoctorID}&UserID=${UserID}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}'
};