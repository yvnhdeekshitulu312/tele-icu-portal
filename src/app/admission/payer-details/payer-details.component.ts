import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-payer-details',
  templateUrl: './payer-details.component.html',
})
export class PayerDetailsComponent implements OnInit {
  companyBasicDetails: any;
  companyDetails: any;
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  confirm(data: boolean) {}

  cancel() {
    this.activeModal.close();
  }
}
