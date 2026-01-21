import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-yes-no-modal',
  template: `
    <div class="modal-body yesno_modal p-5 pb-4">
      <div class="exit_icon text-center" style="margin-top: -4.5rem;margin-bottom: 1rem;text-align: center;width: 4rem;height: 4rem;margin: -4.7rem auto 1rem auto;border-radius: 50%;border: 4px solid #fff;box-shadow: 0px 3px 5px #0000002e;">
        <img style="width: 100%;margin-top: -1px;" src="assets/images/icons/icon-log-out.svg" alt="">
      </div>
    <h5 class="modal-title text-center clr-primary-600 mb-2">{{ title }}</h5>
      <p class="text-center fs-7">{{ message }}</p>
    </div>

    <div class="px-3 mb-4 position-relative"  *ngIf="showReasons">
      <p class="fs-7">Reasons</p>
        <select name="" class="form-select pe-5" id="" (change)="onReasonChange($event)">   
            <option value="0">--Select--</option>       
            <option value="1">Break</option>
            <option value="2">Prayer</option>
            <option value="3">Called By Manager</option>
            <option value="4">Meeting</option>
            <option value="5">End of Shift</option>
        </select>
        <span class="position-absolute" *ngIf="showRemarksVal">
            <div class="text-danger">
                Select Reasons to Logout</div>
        </span>
        <!-- <span class="textarea_box textarea_box_single p-2 rounded-2 border bg-transparent w-100 d-block mt-2" contenteditable="true" id=""></span> -->
    </div>

    <div class="modal-footer border-0">
      <button type="button" class="btn btn-danger-outline" (click)="activeModal.close(false + '-' + selectedReason + '-' + showRemarks)">No</button>
      <button type="button" class="btn btn-main-outline" (click)="activeModal.close(true + '-' + selectedReason + '-' + showRemarks)">Yes</button>
    </div>
  `
})
export class YesNoModalComponent {
  @Input() title!: string;
  @Input() message!: string;
  selectedReason : string = "";
  showRemarks = false;
  showRemarksVal = true;
  doctorDetails: any;
  showReasons = true;

  constructor(public activeModal: NgbActiveModal) {
    const doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    if(!doctorDetails[0].IsOPDReception) {
      this.showReasons = false;
      this.showRemarksVal = false;
      this.showRemarks=true;
    }
  }

  onReasonChange(event: any) {
    this.selectedReason = event.target.options[event.target.options.selectedIndex].text;
    if(event.target.value!='0') {
      this.showRemarks=true;
      this.showRemarksVal = false;
    }
  }
}
