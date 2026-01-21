import { Component, ElementRef, ViewChild } from "@angular/core";
import { BaseComponent, MY_FORMATS } from "../base.component";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DatePipe } from "@angular/common";
import { UtilityService } from "../utility.service";
import moment from "moment";
import { MessageService } from "./message.service";
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientfoldermlComponent } from "../patientfolderml/patientfolderml.component";
import { GenericModalBuilder } from "../generic-modal-builder.service";

declare var $: any;

@Component({
    selector: 'app-3m-coding-worklist',
    templateUrl: './3m-coding-worklist.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE],
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
        DatePipe,
    ]
})
export class Coding3mWorklistComponent extends BaseComponent {
    worklistForm!: FormGroup;
    Fetch3MAdmissionDetailsAdDataList: any;
    Fetch3MAdmissionDetailsAdDataList1: any;
    Fetch3MPatientDiagnosisDataList: any;
    Fetch3MPatientDiagnosisResonseDataList: any;
    selectedPatient: any;

    pageStatus: string = '';

    is3mInitialized: boolean = false;

    @ViewChild('wciframe', { static: true })
    wciframe!: ElementRef;
    response3m: any;
    errorMsg: any;
    patientType: string = "2";

    constructor(private fb: FormBuilder, private us: UtilityService, private messageService: MessageService, private ms: GenericModalBuilder) {
        super();
    }

    ngOnInit() {
        this.initializeIFrame()
        this.initializeForm();
        this.fetchWorklistData();
    }

    initializeIFrame() {
        this.is3mInitialized = true;
      //  this.wciframe.nativeElement.src = 'http://172.16.17.177:8888/interface/wcintf.html#' + encodeURIComponent(document.location.href);
        this.wciframe.nativeElement.src = 'https://crs.alhammadi.med.sa/interface/wcintf.html#' + encodeURIComponent(document.location.href);
        this.messageService.message$.subscribe((msgobj) => {
            this.handleMessage(msgobj);
        });
    }

    initializeForm() {
        this.worklistForm = this.fb.group({
            FromDate: [''],
            ToDate: [''],
            SSN: ['']
        });
        this.worklistForm.patchValue({
            FromDate: new Date(),
            ToDate: new Date()
        });
    }

    onSSNEnterPress(event: any) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            this.fetchWorklistData();
        }
    }

    fetchWorklistData() {
        if (!this.worklistForm.get('FromDate')?.value || !this.worklistForm.get('ToDate')?.value) {
            return;
        }
        this.Fetch3MPatientDiagnosisDataList = null;
        this.Fetch3MPatientDiagnosisResonseDataList = null;
        this.Fetch3MAdmissionDetailsAdDataList = null;
        this.selectedPatient = null;
        this.response3m = null;
        this.Fetch3MAdmissionDetailsAdDataList1 = null;
        const url = this.us.getApiUrl(codingWorklist.Fetch3MAdmissionDetailsAdv, {
            SSN: this.worklistForm.get('SSN')?.value ? this.worklistForm.get('SSN')?.value : 0,
            FromDate: moment(this.worklistForm.get('FromDate')?.value).format('DD-MMM-YYYY'),
            ToDate: moment(this.worklistForm.get('ToDate')?.value).format('DD-MMM-YYYY'),
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.doctorDetails[0]?.FacilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.Fetch3MAdmissionDetailsAdDataList = this.Fetch3MAdmissionDetailsAdDataList1 = response.Fetch3MAdmissionDetailsAdDataList;
                this.filter3MWorklist(this.patientType);
            }
        });
    }

    onPatientSelection(item: any) {
        this.selectedPatient = item;
        this.Fetch3MPatientDiagnosisDataList = null;
        this.Fetch3MPatientDiagnosisResonseDataList = null;
        this.response3m = null;
        const url = this.us.getApiUrl(codingWorklist.Fetch3MPatientDiagnosis, {
            IPID: item.AdmissionID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.doctorDetails[0]?.FacilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.Fetch3MPatientDiagnosisDataList = response.Fetch3MPatientDiagnosisDataList;
                this.Fetch3MPatientDiagnosisResonseDataList = response.Fetch3MPatientDiagnosisResonseDataList;
                $('#MAdmissionDetailsModal').modal('show');
            }
        });
    }

    private handleMessage(msgobj: any): void {
        switch (msgobj.MSG) {
            case 'READ':
                this.btnReleaseInstance();
                this.parseXmlResponse(msgobj.PACKET);
                break;
            case 'CLOSE':
                this.pageStatus = 'Instance closed';
                break;
            case 'ERROR':
                this.pageStatus = `Error: ${msgobj.TEXT}`;
                break;
            case 'INITIALIZED':
                this.pageStatus = 'Initialized';
                this.btnWritePacket();
                break;
            default:
                console.warn('Unknown message type:', msgobj.MSG);
                break;
        }
    }

    private parseXmlResponse(xmlString: string): void {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        // Process I10DXP elements
        const ICDCodeElements = xmlDoc.getElementsByTagName('I10DXP');
        let ICDCode = this.extractCodes(ICDCodeElements);

        // Process I10DX elements
        const ICDCodeDetails = xmlDoc.getElementsByTagName('I10DX');
        ICDCode += this.extractCodes(ICDCodeDetails);

        let icdcodes = ICDCode.split(",");
        for (let row = 0; row < icdcodes.length; row++) {
            if (icdcodes[row].length > 3) {
                const icdcode1 = icdcodes[row].substr(0, 3);
                let icdcode2 = icdcodes[row].substr(3, icdcodes[row].length);
                icdcode2 = ".".concat(icdcode2);
                icdcodes[row] = icdcode1.concat(icdcode2);
            }
        }
        ICDCode = icdcodes.filter(a => a).join(',');

        // Process DRG elements
        const drugCodeElements = xmlDoc.getElementsByTagName('DRG');
        const DrugCode = this.drugExtractCodes(drugCodeElements);

        const ARCostWt = xmlDoc.getElementsByTagName("DRGWT").length > 0 ? xmlDoc.getElementsByTagName("DRGWT")[0].textContent : '';
        const ALOS = xmlDoc.getElementsByTagName("ALOS").length > 0 ? xmlDoc.getElementsByTagName("ALOS")[0].textContent : '';

        this.response3m = {
            ICDCode,
            DrugCode,
            ARCostWt,
            ALOS
        };
        this.Fetch3MPatientDiagnosisloadFrom3M();
    }

    private extractCodes(details: any): string {
        let codes = '';
        for (let i = 0; i < details.length; i++) {
            for (let j = 0; j < details[i].childNodes.length; j++) {
                const detail = details[i].childNodes[j];
                if (detail.nodeType === 1 && detail.firstChild != null) {
                    codes += `${detail.firstChild.nodeValue},`;
                    break;
                }
            }
        }
        return codes;
    }

    private drugExtractCodes(details: any): string {
        let codes = '';
        for (let i = 0; i < details.length; i++) {
            for (let j = 0; j < details[i].childNodes.length; j++) {
                const detail = details[i].childNodes[j];
                if (detail.nodeType === 1 && detail.firstChild?.nodeValue.trim()) {
                    codes += `${detail.firstChild.nodeValue}-`;
                }
            }
        }
        return codes.split('-').filter(a => a).join(' - ');
    }

    btnCall3M(): void {
        this.btnReleaseInstance();
        if (!this.selectedPatient) {
            this.errorMsg = 'Please select Patient';
            $('#errorMsg').modal('show');
            return;
        }
        var sessionname = "CRS_Sessoion_" + this.generateCodeVerifier(8);
        const message = {
            CALL: 'WcInitInstance',
            USER: 'NTUserName',
            SESSION: sessionname,
           // URL: 'http://172.16.17.177:8888',
          URL:'https://crs.alhammadi.med.sa',
        };
        this.messageService.sendMessage(message);
    }

    dec2hex(dec: any) {
        return ("0" + dec.toString(16)).substr(-2);
    }

    generateCodeVerifier(size: any) {
        var array = new Uint32Array(size / 2);
        window.crypto.getRandomValues(array);
        return Array.from(array, this.dec2hex).join("");
    }

    btnWritePacket(): void {
        const content = this.readData();
        const message = {
            CALL: 'WcWritePacket',
            PACKET: content,
        };
        this.messageService.sendMessage(message);
    }

    btnReleaseInstance(): void {
        const message = { CALL: 'WcReleaseInstance' };
        this.messageService.sendMessage(message);
        this.pageStatus = 'Instance has been released ...';
    }

    readData(): string {
        let gender = 0;
        if (this.selectedPatient.Gender.toLowerCase() === "male") {
            gender = 1;
        } else if (this.selectedPatient.Gender.toLowerCase() === "female") {
            gender = 2;
        }

        let mInput;
        if(this.selectedPatient.PatientType=='1')
            mInput= '<CRS><CNTRL><CMD>0</CMD><PRD>03</PRD><GRPR1>390</GRPR1><AUTH>gdWykqn38pduojjv</AUTH></CNTRL>';
        else 
            mInput= '<CRS><CNTRL><CMD>0</CMD><PRD>04</PRD><GRPR1>390</GRPR1><AUTH>gdWykqn38pduojjv</AUTH></CNTRL>';

        const dob = this.selectedPatient.DOB.split(' ')[0];
        const admitDate = this.selectedPatient.AdmitDate.split(' ')[0];
        const dischargeDate = this.selectedPatient.DischargeDate.split(' ')[0];
        const patientName = this.selectedPatient.PatientName;
        const uhid = this.selectedPatient.UHID;

        mInput += '<PERSON>';
        mInput += `<GNDR>${gender}</GNDR>`;
        mInput += `<BDT>${moment(dob, 'DD-MMM-YYYY').format('DD/MM/YYYY')}</BDT>`;
        mInput += `<CDT>${moment(admitDate, 'DD-MMM-YYYY').format('DD/MM/YYYY')}</CDT>`;
        mInput += `<PID>${patientName},${uhid}</PID></PERSON>`;
        mInput += '<ENCOUNTER><ADT>' + moment(admitDate, 'DD-MMM-YYYY').format('DD/MM/YYYY') + '</ADT><DDT>' + moment(dischargeDate, 'DD-MMM-YYYY').format('DD/MM/YYYY') + '</DDT><DSP>1</DSP>';

        let str = '';
        const strStartElement = '<I10DXP><VALUE>';
        const strEndElement = '</VALUE></I10DXP>';

        this.Fetch3MPatientDiagnosisDataList.forEach((item: any) => {
            str += strStartElement + item.Code + strEndElement;
        });

        if (str !== '') {
            str = mInput + '<CLAIM>' + str + '</CLAIM></ENCOUNTER></CRS>';
        } else {
            str = mInput + '<CLAIM></CLAIM></ENCOUNTER></CRS>';
        }

        return str;
    }

    clearForm() {
        this.worklistForm.patchValue({
            SSN: ''
        });
        this.selectedPatient = null;
        this.Fetch3MPatientDiagnosisDataList = null;
        this.Fetch3MPatientDiagnosisResonseDataList = null;
        this.Fetch3MAdmissionDetailsAdDataList = null;
        this.Fetch3MAdmissionDetailsAdDataList1 = null;
        this.response3m = null;
    }

    Fetch3MPatientDiagnosisloadFrom3M() {
        const url = this.us.getApiUrl(codingWorklist.Fetch3MPatientDiagnosisloadFrom3M, {
            Code: this.response3m.ICDCode,
            PrimaryCode: this.response3m.ICDCode.split(',')[0],
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.doctorDetails[0]?.FacilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.Fetch3MPatientDiagnosisDataList = response.Fetch3MPatientDiagnosisloadFrom3MDataList.map((item: any) => {
                    return {
                        "DID": item.DID,
                        "DiseaseName": item.DiseaseName,
                        "Code": item.Code,
                        "DiagnosisTypeID": item.DTYPEID,
                        "DaigType": item.DaigType
                    }
                });
            }
        });
    }

    SavePatient3MDiseases() {
        const DiseasesXML = this.Fetch3MPatientDiagnosisDataList.map((item: any) => {
            return {
                "MONITORID": "",
                "DID": item.DID,
                "ISM": "1",
                "DTID": item.DiagnosisTypeID
            }
        })
        const payload = {
            "IPID": this.selectedPatient.AdmissionID,
            DiseasesXML,
            "MFResponse": this.response3m.DrugCode,
            "ARCostWt": this.response3m.ARCostWt ? this.response3m.ARCostWt : 0,
            "ALOS": this.response3m.ALOS ? this.response3m.ALOS : 0,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.doctorDetails[0]?.FacilityId,
            HospitalID: this.hospitalID
        }

        this.us.post(codingWorklist.SavePatient3MDiseases, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#savemsg').modal('show');
                this.onPatientSelection(this.selectedPatient);
            }
        })
    }

    openPatientSummary(item: any, event: any) {
        event.stopPropagation();
        sessionStorage.setItem("PatientDetails", JSON.stringify(item));   
        sessionStorage.setItem("selectedView", JSON.stringify(item));
        sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
        sessionStorage.setItem("PatientID", item.PatientID);
        sessionStorage.setItem("SummaryfromCasesheet", "true");
        sessionStorage.setItem("FromPhysioTherapyWorklist", "true");
    
        const options: NgbModalOptions = {
          windowClass: 'vte_view_modal'
        };
        
        const modalRef = this.ms.openModal(PatientfoldermlComponent, {
          data: item,
          readonly: true,
          selectedView: item
        }, options);
      }

      filter3MWorklist(type: any) {
        this.patientType = type;
        this.Fetch3MAdmissionDetailsAdDataList = this.Fetch3MAdmissionDetailsAdDataList1.filter((x: any) => x.PatientType == type);
      }
}

export const codingWorklist = {
    Fetch3MAdmissionDetailsAdv: "Fetch3MAdmissionDetailsAdv?SSN=${SSN}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    Fetch3MPatientDiagnosis: "Fetch3MPatientDiagnosis?IPID=${IPID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    Fetch3MPatientDiagnosisloadFrom3M: "Fetch3MPatientDiagnosisloadFrom3M?Code=${Code}&PrimaryCode=${PrimaryCode}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    SavePatient3MDiseases: 'SavePatient3MDiseases'
};