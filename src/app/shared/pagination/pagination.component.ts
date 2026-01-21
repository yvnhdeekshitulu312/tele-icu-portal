import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalCount: number = 1;
  @Output() pageChange: EventEmitter<{min: number, max: number, currentPage: number}> = new EventEmitter<{min: number, max: number, currentPage: number}>();

  constructor() {
  }
  
  ngOnChanges() {
    if (this.totalCount > environment.paginationsize) {
      this.totalPages = Math.ceil(this.totalCount / environment.paginationsize); 
    } else {
      this.totalPages = 1; 
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.emitPageChange();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.emitPageChange();
    }
  }

  navigateToFirstPage() {
    if (this.currentPage > 1) {
      this.currentPage = 1;
      this.emitPageChange();
    }
  }

  navigateToLastPage() {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.emitPageChange();
    }
  }

  emitPageChange() {
    const max: number = this.currentPage * environment.paginationsize;
    const min: number = max - (environment.paginationsize - 1);
    this.pageChange.emit({
      max: max,
      min: min,
      currentPage: this.currentPage
    });
  }
}
