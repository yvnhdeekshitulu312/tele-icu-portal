import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-marker',
  templateUrl: './marker.component.html',
  styleUrls: ['./marker.component.scss']
})
export class MarkerComponent implements OnInit {
  imageUrl: any; // Replace 'your-image-file.jpg' with your image file name
  markers: { x: number, y: number }[] = [];
  @Input() inputDataImageUrl: any;
  @Input() surgeryID: any;
  @Input() markedinputData: any;
  @Output() markedData = new EventEmitter<any>();
  markerTableForm: any;
  errorMessages: any;
  sid: any;
  sname: any;
  get items(): FormArray {
    return this.markerTableForm.get('items') as FormArray;
  }

  addMarker(event: MouseEvent): void {
    // const offsetX = event.offsetX;
    // const offsetY = event.offsetY;
    // this.markers.push({ x: offsetX, y: offsetY });

    const itemFormGroup = this.fb.group({
      ATID: '',
      PRID: this.sid,
      XX: event.offsetX,
      YX: event.offsetY,
      PDIS: '',
      TYPE: 'Add',
      SEQ: '',
      RowNumber: ''
    })
    this.items.push(itemFormGroup);

    this.setRowNumber();
  }
  constructor(private fb: FormBuilder) {
    this.markerTableForm = this.fb.group({
      ATID: ['', Validators.required],
      PRID: ['', Validators.required],
      XX: ['', Validators.required],
      YX: ['', Validators.required],
      PDIS: ['', Validators.required],
      TYPE: ['', Validators.required],
      SEQ: ['', Validators.required],
      RowNumber: ['']
    });
   }

  ngOnInit(): void {
    this.imageUrl = this.inputDataImageUrl;
    this.sid= this.surgeryID.SurgeryID;
    this.sname= this.surgeryID.SurgeryName;
    this.markerTableForm = this.fb.group({
      items: this.fb.array([]) // FormArray for storing the dropdown items
    });

    if (this.markedinputData) {
      this.markedinputData?.forEach((element: any, index: any) => {
        const itemFormGroup = this.fb.group({
          ATID: element.ATID,
          PRID: element.PRID,
          XX: element.XX,
          YX: element.YX,
          PDIS: element.PDIS,
          TYPE: element.TYPE,
          SEQ: element.SEQ,
          RowNumber: element.SEQ
        })
        this.items.push(itemFormGroup);
      });
      this.setRowNumber();
   }

  }
  clearMarker() {
    for (let index = this.markerTableForm.value.items.length - 1; index >= 0; index--) {
      const element = this.markerTableForm.value.items[index];
      if (!element.ATID && element.PRID === this.sid) {
        this.items.removeAt(index);
      }
    }
  }

  setRowNumber() {
    const pdidCountMap: { [key: string]: number } = {};
    this.markerTableForm.value.items.forEach((element: any, index: any) => {
      if (element.PRID) {
        pdidCountMap[element.PRID] = pdidCountMap[element.PRID] ? pdidCountMap[element.PRID] + 1 : 1;
      } 

      const marker = this.items.at(index);
      marker.get('RowNumber')?.setValue(pdidCountMap[element.PRID])
    });
  }

  onselectedMarker() {
    var isPDIS = true;var RowSeq = 0;
    if (this.markerTableForm.value.items.length > 0) {
      this.markerTableForm.value.items.forEach((element: any, index: any) => {
        if (!element.PDIS) {
          isPDIS = false;
          RowSeq=element.RowNumber;
        }
        element.SEQ = element.SEQ ? element.SEQ : index + 1;
      });
    }
    this.setRowNumber();
    if(!isPDIS) {
      this.errorMessages = "Please Enter Description for Sequence "+RowSeq+"";
      $("#errorMsg").modal('show');
      return;
    }

    this.markedData.emit(this.markerTableForm.value.items);
  }

  deleteMarker(index: any) {
    const marker = this.items.at(index);
    
    // if (marker.get('ATID')?.value) {
    //   marker.get('TYPE')?.setValue('Delete');
    // }
    // else {
      this.items.removeAt(index);
    // }
  }
}
