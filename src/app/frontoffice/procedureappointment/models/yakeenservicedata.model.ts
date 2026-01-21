export class YakeenServiceData {
  birthDateG: string = '';
  familyName?: string;
  birthDateH?: string;
  familyNameT?: string;
  fatherName?: string;
  fatherNameT?: string;
  firstNameT?: string;
  firstName?: string;
  grandFatherName?: string;
  grandFatherNameT?: string;
  sexDescAr?: string;
  subTribeName?: string;
  idExpirationDate: string = '';
  nationalityCode?: string;
  nationalityDescAr?: string;
  visaExpiryDate?: string;
  passportNationalityDescAr?: string;
  passportIssueCountryDescAr?: string;
  passportNationalityCode?: string;
  passportNumber?: string;

  addresses?: YakeenServiceAddress[];
}
export class YakeenServiceAddress {
  Street?: string;
  IsPrimaryAddress?: string;
  District?: string;
  BuildingNumber?: string;
  UnitNumber?: string;
  Latitude?: string;
  Longitude?: string;
  PostCode?: string;
  City?: string;
  AdditionalNumber?: string;
}
