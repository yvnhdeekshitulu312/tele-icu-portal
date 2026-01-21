import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-view-pending-order',
  templateUrl: './view-pending-order.component.html',
})
export class pendingOrderListComponent implements OnInit {
  lang: string = '';
  pendingOrderData: any = [];

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.lang = sessionStorage.getItem('language')!;
  }

  close() {
    this.activeModal.close([]);
  }
}
