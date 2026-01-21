import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ok-cancel-modal',
  template: `
    <div class="modal-body okcancel_modal p-5 pb-4">
      <div class="exit_icon text-center" style="margin-top: -4.5rem;margin-bottom: 1rem;text-align: center;width: 4rem;height: 4rem;margin: -4.7rem auto 1rem auto;border-radius: 50%;border: 4px solid #fff;box-shadow: 0px 3px 5px #0000002e;">
        <img style="width: 100%;margin-top: -1px;" src="assets/images/icons/icon-log-out.svg" alt="">
      </div>
    <h5 class="modal-title text-center clr-primary-600 mb-2">{{ title }}</h5>
      <p class="text-center fs-7">{{ message }}</p>
    </div>

    <div class="modal-footer border-0">
      <button type="button" class="btn btn-main-outline" (click)="activeModal.close(true)">Ok</button>
    </div>
  `
})
export class OkCancelModalComponent {

  @Input() title!: string;
  @Input() message!: string;

  constructor(public activeModal: NgbActiveModal) {}

}