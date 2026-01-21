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
  street?: string;
  isPrimaryAddress?: string;
  district?: string;
  buildingNumber?: string;
  unitNumber?: string;
  latitude?: string;
  longitude?: string;
  postCode?: string;
  city?: string;
  additionalNumber?: string;
}

