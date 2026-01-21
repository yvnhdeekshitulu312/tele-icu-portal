import { Injectable } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor(private printerService: LoaderService) { }

  print(printContent: any, name: string) {
    const headerImage = 'assets/images/header.jpeg';
    const footerImage = 'assets/images/footer.jpeg';
    // Remove any existing headers and footers
    const existingHeader = document.getElementById('dynamic-header');
    const existingFooter = document.getElementById('dynamic-footer');
    
    if (existingHeader) {
      existingHeader.remove();
    }
    if (existingFooter) {
      existingFooter.remove();


























    }
  
    // Set a timeout to wait for the elements to be added before triggering print
    setTimeout(() => {
      document.title = `${name ?? 'template'}_${new Date().toISOString()}`;
      window.print();  // Trigger print dialog

    }, 500);
  }
}
