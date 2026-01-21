
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
  idExpirationDate?: string = '';
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

export class YakeenNationalities {
  code: Number = 0;
  status: String = '';

  data?: YakeenNationality[];
}
export class YakeenNationality {
  Id: Number = 0;
  Name?: string;
}
export enum IYakeenType {
  SAUDI = 'SAUDI',
  IQAMA = 'IQAMA',
  GCC = 'GCC',
  PASSPORT = 'PASSPORT',
  BORDER = 'BORDER',
  UNKNOWN = 'UNKNOWN',
}
export enum IPatientType {
  OP = 1,
  IP = 2,
  TRIAGE = '3',
  BOTH = 0,
}
export const MONTHLIST = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export enum IMasterCommonDataType {
  Genders = 1,
  Religions = 10,
  Titles = 12,
  Countries = 15,
  AgeUOMs = 2,
  MaritalStatus = 5,
  Relations = 9,
  Qualifications = 8,
  Occupations = 7,
  Nationalities = 6,
  Specializations = 11,
  BloodGroups = 3,
  UOMs = 13,
  Languages = 4,
  ClaimStatus = 133,
}

export const enum IPatientIDType {
  None = 0,
  Displaced = 1,
  NationalId = 2,
  CitizenId = 3,
  HealthId = 4,
  PassportNumber = 5,
  VisaNumber = 6,
  BorderNumber = 7,
  IqamaNumber = 8,
}
