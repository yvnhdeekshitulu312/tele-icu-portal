export const proceduresDetails = {
    FetchProcedureMasters: 'FetchProcedureMasters?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchSpecialisationProcedures: 'FetchSpecialisationProcedures?DisplayName=${DisplayName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchServiceProcedures: 'FetchServiceProcedures?DisplayName=${DisplayName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveProcedure: 'SaveProcedure',
    FetchEmployeeLocation: "FetchEmployeeLocation?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    SSProcedureItems: "SSProcedureItems?Search=${Search}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchProcedureR: "FetchProcedureR?ProcedureID=${ProcedureID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}"
};