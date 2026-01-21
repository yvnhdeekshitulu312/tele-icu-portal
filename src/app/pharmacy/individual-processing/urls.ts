export const individualProcessing = {
    fetchData: 'FetchIndividualProcessing?FromDate=${FromDate}&ToDate=${ToDate}&Min=${Min}&Max=${Max}&WardID=${WardID}&BedID=${BedID}&SSN=${SSN}&STAT=${STAT}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    wardSearch: 'FetchSSWards?Name=${Name}&HospitalID=${HospitalID}',
    BedSearch: 'FetchAllBeds?Name=${Name}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
  };