import { ConfigService } from 'src/app/services/config.service';
import { AppInjector } from '../services/app-injector.service';
import { FeatureIdService } from './feature-id.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'dd-MMM-yyyy HH:mm:ss',
  },
  display: {
    dateInput: 'DD-MMM-yyyy',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'dd-MMM-yyyy',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export abstract class BaseComponent {
  selectedView: any;
  selectedCard:any;
  hospitalID: any;
  today: any = new Date();
  ward: any;
  wardID: any;
  admissionID: any;
  doctorDetails: any;
  minDate: any;
  langData: any;
  con: ConfigService;
  individualProcess: any;
  facilitySessionId: any;
  patientTypeClick!: string;
  featureIdService: FeatureIdService
  userID: any;
  constructor() {
    const injector = AppInjector.getInjector();
    this.con = injector.get<ConfigService>(ConfigService);
    this.featureIdService = injector.get<FeatureIdService>(FeatureIdService);
    this.minDate = new Date(); 
    this.langData = this.con.getLangData();
    this.hospitalID = sessionStorage.getItem("hospitalId");
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.selectedCard=JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.individualProcess = JSON.parse(sessionStorage.getItem("individualprocess") || '{}');
    this.wardID = this.ward.FacilityID;
    this.admissionID = this.selectedView.AdmissionID;
    this.facilitySessionId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
    this.patientTypeClick = sessionStorage.getItem("PatientTypeClick") ?? 'OP';
    if(this.selectedView.PatientType == "2") {
      this.admissionID = this.selectedView.IPID;
    }

    if(!this.wardID && this.doctorDetails[0]) {
      this.wardID = this.doctorDetails[0].FacilityId;
    }
    this.userID=this.doctorDetails[0].UserId;

    if(!this.admissionID) {
      this.admissionID = sessionStorage.getItem("selectedPatientAdmissionId");
    }

  }
}
