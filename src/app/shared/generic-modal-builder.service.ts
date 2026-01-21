import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class GenericModalBuilder {
  constructor(private modalService: NgbModal, private us: UtilityService) {
    this.us.closeModalEvent.subscribe(() => {
      this.modalService.dismissAll(); 
    });
  }

  openModal(content: any, data?: any, options?: NgbModalOptions): Observable<any> {
    const modalRef: NgbModalRef = this.modalService.open(content, options);
    modalRef.componentInstance.data = data;
    const modalResultSubject: Subject<any> = new Subject<any>();

    modalRef.componentInstance.dataChanged?.subscribe((data: string) => {
      modalRef.close();
    });

    modalRef.result.then(
      (result) => {
        modalResultSubject.next(result);
        modalResultSubject.complete();
      },
      (reason) => {
        modalResultSubject.error(reason);
        modalResultSubject.complete();
      }
    );

    return modalResultSubject.asObservable();
  }
}
