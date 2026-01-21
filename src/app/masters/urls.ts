export const MasterApiUrls = {
    FetchDepartmentsOfHospital: "FetchDepartmentsOfHospital?Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchSSSpecializations: "FetchSSSpecializations?Filter=${Filter}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchSpecializations: "FetchSpecializations?SpecialiseID=${SpecialiseID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    SaveDeptSpecialities: "SaveDeptSpecialities",

    FetchMasterBeds: "FetchMasterBeds?Type=${Type}&Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchMasterRooms: "FetchMasterRooms?Type=${Type}&Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchMasterBedTypes: "FetchMasterBedTypes?Type=${Type}&Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchMasterBedTypesAdvSearch: "FetchMasterBedTypesAdvSearch?Type=${Type}&Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchWardsEPP: "FetchWardsEPP?Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    SaveBeds: "SaveBeds"
};