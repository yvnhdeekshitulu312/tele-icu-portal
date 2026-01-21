import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { BaseComponent, MY_FORMATS } from "../base.component";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DatePipe } from "@angular/common";
import { UtilityService } from "../utility.service";
import { cloneDeep } from "lodash";
import { Guid } from "guid-typescript";
declare var $: any;

@Component({
    selector: 'app-scan-documents',
    templateUrl: './scan-documents.component.html',
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
export class ScanDocumentsComponent extends BaseComponent implements OnInit {
    @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
    public searchText: any;
    public SSN: any;
    public isSSNEnter: boolean = false;
    public isPatientSelected: boolean = false;
    public PatientID: any;
    public patientVisits: any;
    public patientdata: any;
    public SelectedViewClass: any;
    public FetchMRfileImagesDataList: any;
    public motherDetails: any;
    public childSsn: any;
    public FetchCaseSheetMRDDataList: any;
    public FilteredFetchCaseSheetMRDDataList: any;
    public filterSearchText: any;
    public selectedFile: any;
    public fileBase64: any;
    public errorMessages: any = [];
    public fileTitle: any = '';
    public trustedUrl: any;
    public facility: any;
    public UHID: any;
    constructor(private us: UtilityService) {
        super()
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.FetchCaseSheetMRD();
    }

    onEnterPress(event: any) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            this.fetchPatientDetailsBySsn(event);
        }
    }

    FetchCaseSheetMRD() {
        const url = this.us.getApiUrl(ScanDocuments.FetchCaseSheetMRD, {
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID,
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.FetchCaseSheetMRDDataList = response.FetchCaseSheetMRDDataList;
                    this.FilteredFetchCaseSheetMRDDataList = response.FetchCaseSheetMRDDataList;
                }
            },
                (err) => {

                });
    }

    fetchPatientDetailsBySsn(event: any) {
        const inputval = event.target.value;
        let ssn = "0";
        let mobileno = "0";
        let patientid = "0";
        if (inputval.charAt(0) === "0") {
            ssn = "0";
            mobileno = inputval;
            patientid = "0";
        }
        else {
            ssn = inputval;
            mobileno = "0";
            patientid = "0";
        }
        this.isSSNEnter = true;
        this.isPatientSelected = false;
        this.fetchPatientDetails(ssn, mobileno, patientid);
    }

    fetchPatientDetails(ssn: string, mobileno: string, patientId: string) {
        const url = this.us.getApiUrl(ScanDocuments.fetchPatientDataBySsn, {
            SSN: ssn,
            MobileNO: mobileno,
            PatientId: patientId,
            UserId: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID,
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    if (ssn === '0') {
                        this.PatientID = response.FetchPatientDependCLists[0].PatientID;
                        this.UHID = response.FetchPatientDependCLists[0].RegCode;
                    }
                    else if (mobileno === '0') {
                        this.PatientID = response.FetchPatientDataCCList[0].PatientID;
                        this.UHID = response.FetchPatientDataCCList[0].RegCode;
                    }
                    this.selectedView = response.FetchPatientDataCCList[0];
                    this.isPatientSelected = true;
                    this.FetchMRfileImages();
                    //this.fetchPatientVisits();
                }
            },
                (err) => {

                });
    }

    fetchPatientVisits() {
        const url = this.us.getApiUrl(ScanDocuments.FetchPatientVisitsPFN, {
            //Patientid: this.PatientID,
            UHID: this.UHID,
            //WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.patientVisits = response.PatientVisitsDataList;
                    let admid = response.PatientVisitsDataList[0].AdmissionID;
                    this.visitChange(admid);
                }
            },
                (err) => {
                })
    }

    visitChange(admissionId: any) {
        this.admissionID = admissionId;
        this.patientdata = this.patientVisits.find((visit: any) => visit.AdmissionID == admissionId);
        this.fetchPatientVistitInfo(admissionId, this.patientdata.PatientID);
        this.fetchMotherDetails(this.patientdata.PatientID);
    }

    fetchPatientVistitInfo(admissionid: any, patientid: any) {
        const url = this.us.getApiUrl(ScanDocuments.FetchPatientVistitInfo, {
            Patientid: patientid,
            Admissionid: admissionid,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.isPatientSelected = true;
                    this.selectedView = response.FetchPatientVistitInfoDataList[0];
                    if (this.selectedView.PatientType == "2") {
                        if (this.selectedView?.Bed.includes('ISO'))
                            this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
                        else
                            this.SelectedViewClass = "m-0 fw-bold alert_animate token";
                    } else {
                        this.SelectedViewClass = "m-0 fw-bold alert_animate token";
                    }
                    this.FetchMRfileImages();
                }
            },
                (err) => {
                });
    }

    fetchMotherDetails(patientid: string) {
        const url = this.us.getApiUrl(ScanDocuments.FetchAdmittedMotherDetails, {
            ChildPatientID: patientid,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID,
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.motherDetails = response.FetchAdmittedChildDetailsListD[0];
                }
            },
                (err) => {
                })
    }

    openMotherSsnDetails(motherDet: any) {
        this.SSN = motherDet.MotherSSN;
        this.childSsn = motherDet.ChildSSN;
        this.fetchPatientDetails(motherDet.MotherSSN, "0", "0");
    }

    openChildSsnDetails(ssn: string) {
        this.motherDetails = [];
        this.fetchPatientDetails(ssn, "0", "0");
    }

    onVisitsChange(event: any) {
        this.admissionID = event.target.value;
        this.visitChange(event.target.value);
    }

    FetchMRfileImages() {
        const url = this.us.getApiUrl(ScanDocuments.FetchMRfileImages, {
            PatientID: this.PatientID,
            AdmissionID: this.admissionID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.FetchMRfileImagesDataList = response.FetchMRfileImagesDataList;
                }
            },
                (err) => {
                });
    }

    clearScreen() {
        this.isPatientSelected = false;
        this.SSN = '';
        this.filterSearchText = '';
        this.FilteredFetchCaseSheetMRDDataList = cloneDeep(this.FetchCaseSheetMRDDataList);
        this.fileTitle = '';
        this.selectedFile = null;
        this.fileBase64 = null;
        if (this.fileInput && this.fileInput.nativeElement) {
            this.fileInput.nativeElement.value = '';
        }
    }

    filterLinks(event: any) {
        this.FilteredFetchCaseSheetMRDDataList = cloneDeep(this.FetchCaseSheetMRDDataList).filter((link: any) =>
            link.CaseSheetName.toLowerCase().includes(event.target.value.toLowerCase().trim())
        );
    }

    onLinkSelection(item: any) {
        this.FilteredFetchCaseSheetMRDDataList.forEach((a: any) => {
            a.selected = false;
        })
        item.selected = true;
    }

    onFileChange(event: any): void {
        this.selectedFile = null;
        this.fileBase64 = null;
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (allowedTypes.includes(file.type)) {
                this.selectedFile = file;
                this.convertFileToBase64(file);
            } else {
                this.errorMessages = [];
                this.errorMessages.push("Invalid file type. Please select a JPG, JPEG, PNG, or PDF file.");
                $('#errorMessagesModal').modal('show');
            }
        }
    }

    convertFileToBase64(file: File): void {
        const reader = new FileReader();
        reader.onloadend = () => {
            this.fileBase64 = reader.result as string;
        };
        reader.onerror = (error) => {
            console.error("File conversion error", error);
        };
        reader.readAsDataURL(file);
    }

    onUploadClick() {
        this.errorMessages = [];
        if (!this.fileBase64) {
            this.errorMessages.push("Please Upload File");
        }
        if (!this.fileTitle) {
            this.errorMessages.push("Please Enter Title");
        }
        const fileSelectionType = this.FilteredFetchCaseSheetMRDDataList.find((element: any) => element.selected);

        if (!fileSelectionType) {
            this.errorMessages.push('Please Select Type');
        }

        if (this.errorMessages.length > 0) {
            $('#errorMessagesModal').modal('show');
            return;
        }
        const fileNameArray = this.selectedFile.name.split('.');
        const FileName = fileNameArray[0];
        const FileNameType = fileNameArray[fileNameArray.length - 1];
        const payload = {
            "ImagesID": "0",
            "PatientID": this.PatientID,
            "AdmissionID": 0,
            "HospitalID": this.hospitalID,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facility.FacilityID,
            "FolderName": "",
            FileName,
            FileNameType,
            Base64: this.cleanBase64String(this.fileBase64),
            "MRFImageText": [
                {
                    "CSD": fileSelectionType.CaseSheetID,
                    "SEQ": "1",
                    "FNM": `${this.fileTitle}?${Guid.create()}.${FileNameType}`,
                    "CMT": "",
                    "DID": "0"
                }
            ]
        }
        this.us.post(ScanDocuments.SaveScannedDocs, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#savemsg').modal('show');
                this.selectedFile = null;
                this.fileBase64 = null;
                this.fileTitle = '';
                this.FetchMRfileImages();
                if (this.fileInput && this.fileInput.nativeElement) {
                    this.fileInput.nativeElement.value = '';
                }
            }
        });
    }

    openDocument(item: any) {
        this.trustedUrl = item.FTPPATH;
        $('#iframeModal').modal('show');
    }

    cleanBase64String(base64Str: string): string {
        const match = base64Str.match(/^data:.+;base64,(.*)/);
        if (match) {
            return match[1];
        }
        return base64Str;
    }

    deleteItem(item: any) {
        const payload = {
            "ImagesID": item.ImagesID,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facility.FacilityID,
            "HospitalID": this.hospitalID
        };

        this.us.post(ScanDocuments.DeleteMRfileImages, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#deleteMsg').modal('show');
                this.FetchMRfileImages();
            }
        });
    }
}

export const ScanDocuments = {
    FetchCaseSheetMRD: "FetchCaseSheetMRD?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    SaveScannedDocs: "SaveScannedDocs",
    FetchMRfileImages: "FetchMRfileImages?PatientID=${PatientID}&AdmissionID=0&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientVisits: 'FetchPatientVisits?Patientid=${Patientid}&HospitalID=${HospitalID}',
    FetchPatientVistitInfo: 'FetchPatientVistitInfo?Patientid=${Patientid}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
    FetchAdmittedMotherDetails: 'FetchAdmittedMotherDetails?ChildPatientID=${ChildPatientID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    DeleteMRfileImages: 'DeleteMRfileImages',
    FetchPatientVisitsPFN: 'FetchPatientVisitsPFN?UHID=${UHID}&HospitalID=${HospitalID}',
}