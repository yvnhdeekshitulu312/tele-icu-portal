import { Component, OnInit, ElementRef, EventEmitter, QueryList, Output, ViewChildren, ViewChild, Renderer2, ChangeDetectorRef, Input } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { ConfigService as BedConfig } from '../services/config.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { forkJoin, Observable, Subscriber } from 'rxjs';
import { Guid } from 'guid-typescript';
import { MY_FORMATS } from 'src/app/shared/base.component';
declare var $: any;

@Component({
  selector: 'app-wound-assessment',
  templateUrl: './wound-assessment.component.html',
  styleUrls: ['./wound-assessment.component.scss'],
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
export class WoundAssessmentComponent extends DynamicHtmlComponent implements OnInit {
  langData: any;
  patientDetails: any;
  selectedView: any;
  doctorDetails: any;
  hospitalId: any;
  IsSelect = false;
  FetchNewWoundMasterLists: any;
  WoundTypeList: any;
  LocationList: any;
  CategoryList: any;
  woundForm: any;
  AssessmentOrderId = 0;
  FetchSavedWoundDataLists: any = [];
  selectedWound: any;
  WoundNo = 1;
  IsHome = true;
  PatientTemplatedetailID = 0;
  // FetchPatienClinicalTemplateDetailsNList: any = [];
  IsView = false;
  showContent = true;
  url = "";
  IsViewActual = false;
  selectedWoundId: any;
  @ViewChild('divwasm') divwasm!: ElementRef;
  myPhoto!: string;
  selectedFile = "";
  fileError: string = "";
  uploadedFiles: { FileName: string; Base64: string }[] = [];
  @Input() fromshared = false;
  isMarkersAvailable = true;

  bodyDiagramImages: BodyImage[] = [
    { src: 'assets/images/BodyDiagram/Front.png', alt: 'Front Body', markers: [] },
    { src: 'assets/images/BodyDiagram/Back.png', alt: 'Back Body', markers: [] },
    { src: 'assets/images/BodyDiagram/Left_FeetTop.png', alt: 'Left Foot Top', markers: [] },
    { src: 'assets/images/BodyDiagram/Left_FeetBottom.png', alt: 'Left Foot Bottom', markers: [] },
    { src: 'assets/images/BodyDiagram/Right_FeetTop.png', alt: 'Right Foot Top', markers: [] },
    { src: 'assets/images/BodyDiagram/Right_FeetBottom.png', alt: 'Right Foot Bottom', markers: [] },
    { src: 'assets/images/BodyDiagram/Feet_RightOuter.png', alt: 'Right Foot Side', markers: [] },
    { src: 'assets/images/BodyDiagram/Feet_LeftOuter.png', alt: 'Right Foot Back', markers: [] },
    { src: 'assets/images/BodyDiagram/Feet_LeftInner.png', alt: 'Left Inner', markers: [] },
    { src: 'assets/images/BodyDiagram/Feet_RightInner.png', alt: 'Right Inner', markers: [] }
  ];

  bodyDiagramAllImages: BodyImage[] = [
    { src: 'assets/images/BodyDiagram/Front.png', alt: 'Front Body', markers: [] },
    { src: 'assets/images/BodyDiagram/Back.png', alt: 'Back Body', markers: [] },
    { src: 'assets/images/BodyDiagram/Left_FeetTop.png', alt: 'Left Foot Top', markers: [] },
    { src: 'assets/images/BodyDiagram/Left_FeetBottom.png', alt: 'Left Foot Bottom', markers: [] },
    { src: 'assets/images/BodyDiagram/Right_FeetTop.png', alt: 'Right Foot Top', markers: [] },
    { src: 'assets/images/BodyDiagram/Right_FeetBottom.png', alt: 'Right Foot Bottom', markers: [] },
    { src: 'assets/images/BodyDiagram/Feet_RightOuter.png', alt: 'Right Foot Side', markers: [] },
    { src: 'assets/images/BodyDiagram/Feet_LeftOuter.png', alt: 'Right Foot Back', markers: [] },
    { src: 'assets/images/BodyDiagram/Feet_LeftInner.png', alt: 'Left Inner', markers: [] },
    { src: 'assets/images/BodyDiagram/Feet_RightInner.png', alt: 'Right Inner', markers: [] }
  ];
  

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private bedconfig: BedConfig, private fb: FormBuilder,
    private config: ConfigService, private router: Router, public datepipe: DatePipe, private service: MedicalAssessmentService, private us: UtilityService) {
    super(renderer, el, cdr);
    this.langData = this.config.getLangData();
    this.patientDetails = this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || sessionStorage.getItem("PatientDetails") || sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.initializeWoundForm();
  }

  initializeWoundForm() {
    this.woundForm = this.fb.group({
      Type: ['0', Validators.required],
      Location: ['0', Validators.required],
      Category: ['0', Validators.required],
      Date: [new Date()],
    });
  }

  value1: number = 0;
  value2: number = 0;
  value3: number = 0;

  woundAreaToScore = [
    { max: 0, score: 0 },
    { max: 0.3, score: 1 },
    { max: 0.6, score: 2 },
    { max: 1.0, score: 3 },
    { max: 2.0, score: 4 },
    { max: 3.0, score: 5 },
    { max: 4.0, score: 6 },
    { max: 8.0, score: 7 },
    { max: 12.0, score: 8 },
    { max: 24.0, score: 9 },
    { max: Infinity, score: 10 }
  ];

  get product1(): number {
    return parseFloat((this.value1 * this.value2).toFixed(2));
  }
  
  get product2(): number {
    return parseFloat((this.value1 * this.value2 * this.value3).toFixed(2));
  }
  
  get product3(): number {
    return parseFloat((this.woundAreaToScore.find(range => (this.value1 * this.value2) <= range.max)?.score || 0).toFixed(2));
  }

  ngOnInit(): void {
    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
    this.fetchNewWoundMaster();
    this.FetchSavedWoundData();
    // this.getreoperative("123");
  }

  addMarker(event: MouseEvent, image: BodyImage) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    image.markers.push({ x, y, label: '', isdelete: false });
  }

  removeMarker(image: BodyImage, index: number, event: Event) {
    event.stopPropagation();
    image.markers[index].isdelete = true;
  }

  navigatetoBedBoard() {
    this.router.navigate(['/ward']);
  }

  calculateSumTissue(): number {
    const tissueDiv = document.getElementById('tissue-buttons');
    if (!tissueDiv) return 0;

    const activeButtons = tissueDiv.querySelectorAll('.active');
    let sum = 0;

    activeButtons.forEach((button: Element) => {
      const text = button.textContent || '';
      const match = text.match(/\((\d+)\)/);
      if (match) {
        sum += parseInt(match[1], 10);
      }
    });

    return sum;
  }

  calculateSumExudate(): number {
    const tissueDiv = document.getElementById('btn_ExudateAmount');
    if (!tissueDiv) return 0;

    const activeButtons = tissueDiv.querySelectorAll('.active');
    let sum = 0;

    activeButtons.forEach((button: Element) => {
      const text = button.textContent || '';
      const match = text.match(/\((\d+)\)/);
      if (match) {
        sum += parseInt(match[1], 10);
      }
    });

    return sum;
  }

  fetchNewWoundMaster() {
    this.bedconfig.fetchNewWoundMaster(this.hospitalId).subscribe(
      (results) => {
        if (results.Code === 200) {
          this.FetchNewWoundMasterLists = results.FetchNewWoundMasterLists;

          const valuesToInclude = [2, 3, 4];

          this.WoundTypeList = this.FetchNewWoundMasterLists.filter((w: any) => Number(w.WoundAssessmentTypeID) == 1);
          this.LocationList = this.FetchNewWoundMasterLists.filter((w: any) => valuesToInclude.includes(Number(w.WoundAssessmentTypeID)));
          this.CategoryList = this.FetchNewWoundMasterLists.filter((w: any) => Number(w.WoundAssessmentTypeID) == 5);

        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  FetchSavedWoundData() {
    this.bedconfig.FetchSavedWoundData(this.selectedView.IPID, 0, this.hospitalId).subscribe(
      (results) => {
        if (results.Code === 200) {
          this.FetchSavedWoundDataLists = results.FetchSavedWoundDataLists;
          this.FetchSavedWoundDataLists.forEach((item: any) => {
            const createdDate = new Date(item.Createdate);

            const currentDate = new Date();

            if (isNaN(createdDate.getTime())) {
              console.error(`Invalid date format: ${item.createdDate}`);
              item.diffHours = null;
              return;
            }

            const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

            item.diffHours = diffHours;

            if (item.diffHours > this.doctorDetails[0]?.EformRestriction) {
              item.isDelete = false;
            }
            else {
              item.isDelete = true;
            }
          });
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  addWound() {
    let payload = {
      "AssessmentOrderId": this.AssessmentOrderId,
      "Patientid": this.selectedView.PatientID,
      "AdmissionId": this.selectedView.IPID,
      "WoundtypeID": this.woundForm.get('Type').value,
      "LocationID": this.woundForm.get('Location').value,
      "CategoryID": this.woundForm.get('Category').value,
      "HospitalAcquiredDate": moment(this.woundForm.get('Date').value).format('DD-MMM-YYYY'),
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID,
      "Hospitalid": this.hospitalId
    };

    this.bedconfig.saveWoundForm(payload).subscribe(response => {
      if (response.Code == 200) {
        $("#saveMsg").modal('show');
        $("#addWoundModal").modal('hide');
        this.FetchSavedWoundData();
      }
    })
  }

  clearWound() {
    this.selectedWound = null;
    this.showContent = false;
    this.IsSelect = false;

    setTimeout(() => {
      this.showContent = true;
    }, 0);
    this.initializeWoundForm();
  }

  selectWound(wound: any, WoundNo: any) {
    this.IsSelect = true;
    this.selectedWound = wound;
    this.selectedWoundId = this.selectedWound.AssessmentOrderId;
    this.WoundNo = WoundNo;
    this.isMarkersAvailable = false;

    this.showContent = false;
    this.uploadedFiles = [];

    setTimeout(() => {
      this.showContent = true;
      this.isMarkersAvailable = true;
      if (this.selectedWound.PatientTemplatedetailID) {
        this.selectedTemplate(this.selectedWound.PatientTemplatedetailID);
      }
      else {
        this.bodyDiagramImages = [
          { src: 'assets/images/BodyDiagram/Front.png', alt: 'Front Body', markers: [] },
          { src: 'assets/images/BodyDiagram/Back.png', alt: 'Back Body', markers: [] },
          { src: 'assets/images/BodyDiagram/Left_FeetTop.png', alt: 'Left Foot Top', markers: [] },
          { src: 'assets/images/BodyDiagram/Left_FeetBottom.png', alt: 'Left Foot Bottom', markers: [] },
          { src: 'assets/images/BodyDiagram/Right_FeetTop.png', alt: 'Right Foot Top', markers: [] },
          { src: 'assets/images/BodyDiagram/Right_FeetBottom.png', alt: 'Right Foot Bottom', markers: [] },
          { src: 'assets/images/BodyDiagram/Feet_RightOuter.png', alt: 'Right Foot Side', markers: [] },
          { src: 'assets/images/BodyDiagram/Feet_LeftOuter.png', alt: 'Right Foot Back', markers: [] },
          { src: 'assets/images/BodyDiagram/Feet_LeftInner.png', alt: 'Left Inner', markers: [] },
          { src: 'assets/images/BodyDiagram/Feet_RightInner.png', alt: 'Right Inner', markers: [] }
        ];
      }
    }, 0);
  }

  deleteWound(item: any) {
    if (!item.isDelete) {
      return;
    }
    this.us.post('DeletePatientWoundAssessmentOrders', {
      "AssessmentOrderId": item.AssessmentOrderId,
      "Blocked": "1",
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.facility.FacilityID,
      "HospitalID": this.hospitalID
    }).subscribe((reponse: any) => {
      if (reponse.Code === 200) {
        $('#deleteMsg').modal('show');
        this.FetchSavedWoundData();
      }
    });
  }


  // getreoperative(templateid: any) {
  //   this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: 0, TBL: 1 });

  //   this.us.get(this.url)
  //     .subscribe((response: any) => {
  //       if (response.Code == 200) {
  //         if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
  //           this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
  //           this.IsView = true;
  //           this.IsViewActual = true;
  //         }
  //       }
  //     },
  //       (err) => {
  //       })
  // }

  save() {
    var markers = {
      'id': 'table_WoundMarkers', 
      'value': JSON.stringify(this.bodyDiagramImages)
    }
   
    const tags = this.findHtmlTagIds(this.divwasm);
    const tagsMarker = tags.concat(markers); 

    const annotations = this.bodyDiagramImages.flatMap((image, index) =>
      image.markers.map((marker, seq) => ({
        ATID: "",
        PRID: "123",
        XX: marker.x.toFixed(0),
        YX: marker.y.toFixed(0),
        PDIS: marker.label || "",
        TYPE: marker.isdelete ? "Delete" : "Add",
        SEQ: (seq + 1).toString(),
      }))
    );

    if (tagsMarker) {
      const mergedArray = tagsMarker.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.selectedWound.PatientTemplatedetailID ? this.selectedWound.PatientTemplatedetailID : 0,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 123,
        "ClinicalTemplateValues": JSON.stringify(mergedArray),
        "USERID": this.doctorDetails[0]?.UserId,
        "WORKSTATIONID": 3395,
        "HospitalID": this.hospitalID,
        "Signature1": this.signatureForm.get('Signature1').value,
        "Signature2": this.signatureForm.get('Signature2').value,
        "Signature3": this.signatureForm.get('Signature3').value,
        "Signature4": this.signatureForm.get('Signature4').value,
        "Signature5": this.signatureForm.get('Signature5').value,
        "Signature6": this.signatureForm.get('Signature6').value,
        "Signature7": this.signatureForm.get('Signature7').value,
        "Signature8": this.signatureForm.get('Signature8').value,
        "Signature9": this.signatureForm.get('Signature9').value,
        "Signature10": this.signatureForm.get('Signature10').value,
        "AssessmentOrderId": this.selectedWoundId,
        "AnnotationXML": annotations
      }

      this.us.post("SavePatienClinicalTemplateDetailsWM", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.FetchSavedWoundData();

            this.selectedWound.PatientTemplatedetailID = response.PatientVitalEndoscopyDataaList[0].PreProcedureAssessment;

            this.uploadedFiles.forEach((file) => {
              this.saveImage(file);
            });
          }
        },
          (err) => {

          })
    }
  }

  selectedTemplate(temID: any) {
    const urlTBL2 = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, {
      ClinicalTemplateID: 0,
      AdmissionID: this.selectedView.AdmissionID,
      PatientTemplatedetailID: temID,
      TBL: 2
    });

    const urlTBL3 = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, {
      ClinicalTemplateID: 0,
      AdmissionID: this.selectedView.AdmissionID,
      PatientTemplatedetailID: temID,
      TBL: 3
    });

    const urlTBL4 = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, {
      ClinicalTemplateID: 0,
      AdmissionID: this.selectedView.AdmissionID,
      PatientTemplatedetailID: temID,
      TBL: 4
    });

    forkJoin({
      responseTBL2: this.us.get(urlTBL2),
      responseTBL3: this.us.get(urlTBL3),
      responseTBL4: this.us.get(urlTBL4)
    }).subscribe(
      ({ responseTBL2, responseTBL3, responseTBL4 }: any) => {
        if (responseTBL2.Code == 200 && responseTBL2.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
          const tem = responseTBL2.FetchPatienClinicalTemplateDetailsNNList[0];
          let sameUser = true;
          if (tem.CreatedBy != this.doctorDetails[0]?.UserName) {
            sameUser = false;
          }
          this.dataChangesMap = {};
          this.showElementsData(this.divwasm.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
          $("#savedModal").modal('hide');
        }

        if (responseTBL3.Code == 200 && responseTBL3.FetchPatienClinicalTemplateWoundDetailsNNList.length > 0) {
          const tem = responseTBL3.FetchPatienClinicalTemplateWoundDetailsNNList;
          let i = 1;

          tem.forEach((res: any) => {
            this.uploadedFiles.push({
              FileName: res.TempFilename,//`File ${i}`,
              Base64: res.WoundImages
            });
            i++;
          });
        }

        if (responseTBL4.Code == 200 && responseTBL4.FetchPatienClinicalTemplateWoundAnnotationDetailsNNList.length > 0) {
          const template = responseTBL2.FetchPatienClinicalTemplateDetailsNNList?.[0];
          if (template?.ClinicalTemplateValues) {
            try {
              const parsedValues = JSON.parse(template.ClinicalTemplateValues);
              const bodyDiagramData = parsedValues.find((item: any) => item.id === 'table_WoundMarkers');
          
              if (bodyDiagramData?.value) {
                this.bodyDiagramImages = JSON.parse(bodyDiagramData.value);
              }
            } catch (error) {
              console.error('Error parsing ClinicalTemplateValues:', error);
            }
          }
        }
        else {
          this.bodyDiagramImages = [
            { src: 'assets/images/BodyDiagram/Front.png', alt: 'Front Body', markers: [] },
            { src: 'assets/images/BodyDiagram/Back.png', alt: 'Back Body', markers: [] },
            { src: 'assets/images/BodyDiagram/Left_FeetTop.png', alt: 'Left Foot Top', markers: [] },
            { src: 'assets/images/BodyDiagram/Left_FeetBottom.png', alt: 'Left Foot Bottom', markers: [] },
            { src: 'assets/images/BodyDiagram/Right_FeetTop.png', alt: 'Right Foot Top', markers: [] },
            { src: 'assets/images/BodyDiagram/Right_FeetBottom.png', alt: 'Right Foot Bottom', markers: [] },
            { src: 'assets/images/BodyDiagram/Feet_RightOuter.png', alt: 'Right Foot Side', markers: [] },
            { src: 'assets/images/BodyDiagram/Feet_LeftOuter.png', alt: 'Right Foot Back', markers: [] },
            { src: 'assets/images/BodyDiagram/Feet_LeftInner.png', alt: 'Left Inner', markers: [] },
            { src: 'assets/images/BodyDiagram/Feet_RightInner.png', alt: 'Right Inner', markers: [] }
          ];
        }
      },
      (err) => {
        console.error('Error fetching data:', err);
      }
    );
  }

  showAllWounds() {
    this.FetchSavedWoundDataLists.map((wound: any) => 
      this.selectedTemplateView(wound.PatientTemplatedetailID)
    );

    $('#allbodyDiagram_modal').modal('show');
  }

  selectedTemplateView(temID: any) {

    const urlTBL2 = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, {
      ClinicalTemplateID: 0,
      AdmissionID: this.selectedView.AdmissionID,
      PatientTemplatedetailID: temID,
      TBL: 2
    });

    const urlTBL4 = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, {
      ClinicalTemplateID: 0,
      AdmissionID: this.selectedView.AdmissionID,
      PatientTemplatedetailID: temID,
      TBL: 4
    });

    forkJoin({
      responseTBL2: this.us.get(urlTBL2),
      responseTBL4: this.us.get(urlTBL4)
    }).subscribe(
      ({ responseTBL2, responseTBL4 }: any) => {
        if (responseTBL4.Code == 200 && responseTBL4.FetchPatienClinicalTemplateWoundAnnotationDetailsNNList.length > 0) {
          const template = responseTBL2.FetchPatienClinicalTemplateDetailsNNList?.[0];

          if (template?.ClinicalTemplateValues) {
            try {
              const parsedValues = JSON.parse(template.ClinicalTemplateValues);
              const bodyDiagramData = parsedValues.find((item: any) => item.id === 'table_WoundMarkers');
          
              if (bodyDiagramData?.value) {
                const fetchedMarkers = JSON.parse(bodyDiagramData.value);

                this.bodyDiagramAllImages = this.bodyDiagramAllImages.map((image: any) => {
                  const existingMarkers = image.markers || [];
                  const newMarkers = fetchedMarkers.find((marker: any) => marker.src === image.src)?.markers || [];
                  
                  return {
                    ...image,
                    markers: [...existingMarkers, ...newMarkers]
                  };
                });
              }
            } catch (error) {
              console.error('Error parsing ClinicalTemplateValues:', error);
            }
          }
        }
        else {

          this.bodyDiagramImages = [
            { src: 'assets/images/BodyDiagram/Front.png', alt: 'Front Body', markers: [] },
            { src: 'assets/images/BodyDiagram/Back.png', alt: 'Back Body', markers: [] },
            { src: 'assets/images/BodyDiagram/Left_FeetTop.png', alt: 'Left Foot Top', markers: [] },
            { src: 'assets/images/BodyDiagram/Left_FeetBottom.png', alt: 'Left Foot Bottom', markers: [] },
            { src: 'assets/images/BodyDiagram/Right_FeetTop.png', alt: 'Right Foot Top', markers: [] },
            { src: 'assets/images/BodyDiagram/Right_FeetBottom.png', alt: 'Right Foot Bottom', markers: [] },
            { src: 'assets/images/BodyDiagram/Feet_RightOuter.png', alt: 'Right Foot Side', markers: [] },
            { src: 'assets/images/BodyDiagram/Feet_LeftOuter.png', alt: 'Right Foot Back', markers: [] },
            { src: 'assets/images/BodyDiagram/Feet_LeftInner.png', alt: 'Left Inner', markers: [] },
            { src: 'assets/images/BodyDiagram/Feet_RightInner.png', alt: 'Right Inner', markers: [] }
          ];
        }
      },
      (err) => {
        console.error('Error fetching data:', err);
      }
    );
  }


  // selectedTemplate(temID: any) {
  //   this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: 0, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: temID, TBL: 2 });

  //   this.us.get(this.url)
  //     .subscribe((response: any) => {
  //       if (response.Code == 200) {
  //         if (response.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
  //           var tem = response.FetchPatienClinicalTemplateDetailsNNList[0];
  //           // this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNNList;
  //           // this.IsView = true;
  //           // this.IsViewActual = true;
  //           let sameUser = true;
  //           if (tem.CreatedBy != this.doctorDetails[0]?.UserName) {
  //             sameUser = false;
  //           }
  //           this.dataChangesMap = {};

  //           this.showElementsData(this.divwasm.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
  //           $("#savedModal").modal('hide');
  //         }
  //       }
  //     },
  //       (err) => {
  //       })


  // }

  viewWorklist() {
    $("#savedModal").modal('show');
  }

  openUploadPopUp() {
    $("#divUpload").modal('show');
    this.selectedFile = "";
  }

  onSelectFile(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0].name;
      var type = event.target.files[0].name.split(".").pop();
      if (event.target.files[0].size > 5242880) {
        this.fileError = 'File size limit should not exceed 5MB';
        alert(this.fileError);
      }
      else if (type.toLowerCase() !== 'jpeg' && type.toLowerCase() !== 'jpg' && type.toLowerCase() !== 'bmp' && type.toLowerCase() !== 'pdf'
        && type.toLowerCase() !== 'gif' && type.toLowerCase() !== 'png' && type.toLowerCase() !== 'tiff' && type.toLowerCase() !== 'tif') {
        this.fileError = 'File type should be  jpeg, jpg, bmp, gif, png, tiff';
        alert(this.fileError);
      }
      else {
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        this.convertToBase64(file, event.target.id);
      }
    }
  }
  cleanBase64String(base64Str: string): string {
    const match = base64Str.match(/^data:.+;base64,(.*)/);
    if (match) {
      return match[1];
    }
    return base64Str;
  }
  convertToBase64(file: File, inputType: any) {
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file, subscriber);
    })
    observable.subscribe((d) => {
      this.myPhoto = d;
    })
  }
  readFile(file: File, subscriber: Subscriber<any>) {
    const filereader = new FileReader();
    filereader.readAsDataURL(file);
    filereader.onload = () => {
      subscriber.next(filereader.result);
      subscriber.complete();
    }
    filereader.onerror = () => {
      subscriber.error();
      subscriber.complete();
    }
  }
  upload() {
    const guid = Guid.create();
    const filename = this.patientDetails.SSN + "_" + guid + "." + this.selectedFile;
    var payload =
    {
      "FileName": filename,
      "Base64": this.cleanBase64String(this.myPhoto),
    }

    this.uploadedFiles.push(payload);
    $("#divUpload").modal('hide');
  }

  downloadFile(base64: string, filename: string) {


    const link = document.createElement('a');
    link.href = `data:application/octet-stream;base64,${base64}`;
    link.download = filename;
    link.click();
  }

  saveImage(file: { FileName: string; Base64: string }) {
    var payload = {
      "PatientTemplatedetailID": this.selectedWound.PatientTemplatedetailID ? this.selectedWound.PatientTemplatedetailID : 0,
      "ClinicalTemplateImageID": 0,
      "AdmissionID": this.selectedView.AdmissionID,
      "FileName": file.FileName,
      "TemplateImages": file.Base64,
      "USERID": this.doctorDetails[0]?.UserId,
      "WORKSTATIONID": 3395,
      "HospitalID": this.hospitalID
    }

    this.us.post("SavePatienClinicalTemplateWoundDetails", payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
        }
      },
        (err) => {

        })
  }

}

interface Marker {
  x: number;
  y: number;
  label: string;
  isdelete: boolean
}


interface BodyImage {
  src: string;
  alt: string;
  markers: Marker[];
}