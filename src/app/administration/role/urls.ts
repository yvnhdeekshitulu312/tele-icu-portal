export const roleDetails = {
    FetchModuleRoles: "FetchModuleRoles?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchModuleFeatureFunctions: 'FetchModuleFeatureFunctions?ModuleID=${ModuleID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchSavedRole: 'FetchSavedRole?RoleName=${RoleName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchSelectedRoleData: 'FetchSelectedRoleData?RoleID=${RoleID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveRoleModuleFeatureFunctions: 'SaveRoleModuleFeatureFunctions'
};