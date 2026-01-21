import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  HostListener
} from '@angular/core';

import * as pdfjsLib from 'pdfjs-dist';
import * as pdfjsViewer from 'pdfjs-dist/web/pdf_viewer';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() src: string = '';

  @ViewChild('viewerContainer', { static: false }) viewerContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('viewer', { static: false }) viewer!: ElementRef<HTMLDivElement>;

  private pdfViewer: any;
  private eventBus: any;
  private isViewInitialized = false;

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent): boolean {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  @HostListener('selectstart', ['$event'])
  onSelectStart(event: Event): boolean {
    event.preventDefault();
    return false;
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): boolean {
    event.preventDefault();
    return false;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): boolean {
    if (event.ctrlKey && ['s', 'a', 'c', 'v', 'p', 'u'].includes(event.key.toLowerCase())) {
      event.preventDefault();
      return false;
    }
    if (event.key === 'F12' || 
        (event.ctrlKey && event.shiftKey && event.key === 'I')) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.isViewInitialized = true;
      if (this.src) {
        this.loadPdf();
      }
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isViewInitialized && changes['src'] && this.src) {
      this.loadPdf();
    }
  }

  ngOnDestroy(): void {
    if (this.pdfViewer) {
      try {
        this.pdfViewer.cleanup();
      } catch (error) {
        console.warn('Error during PDF viewer cleanup:', error);
      }
    }
    if (this.eventBus) {
      this.eventBus.destroy();
    }
  }

  async loadPdf() {
    console.log('Loading PDF:', this.src);

    if (!this.viewerContainer || !this.viewer) {
      console.error('ViewChild elements not available yet');
      return;
    }

    const container = this.viewerContainer.nativeElement;
    const viewer = this.viewer.nativeElement;

    if (!container || !viewer) {
      console.error('Container or viewer element not found');
      return;
    }

    viewer.innerHTML = '';

    try {
      this.eventBus = new pdfjsViewer.EventBus();
      const linkService = new pdfjsViewer.PDFLinkService({ 
        eventBus: this.eventBus 
      });
      
      const l10n = pdfjsViewer.NullL10n;

      this.pdfViewer = new pdfjsViewer.PDFViewer({
        container: container,
        viewer: viewer,
        eventBus: this.eventBus,
        linkService: linkService,
        l10n: l10n,
        useOnlyCssZoom: true,
        textLayerMode: 0,
        annotationMode: 0,
        removePageBorders: true,
        maxCanvasPixels: 16777216,
      });

      linkService.setViewer(this.pdfViewer);

      const loadingTask = pdfjsLib.getDocument({
        url: this.src,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
        enableXfa: false,
        disableAutoFetch: false,
        disableStream: false,
        disableRange: false,
        isEvalSupported: false,
        fontExtraProperties: false
      });

      const pdfDocument = await loadingTask.promise;
      
      this.pdfViewer.setDocument(pdfDocument);
      linkService.setDocument(pdfDocument);

      this.addPdfProtection();

      console.log('PDF loaded successfully');

    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }

  private addPdfProtection(): void {
    setTimeout(() => {
      const viewerElement = this.viewer.nativeElement;
      
      const pages = viewerElement.querySelectorAll('.page');
      pages.forEach(page => {
        const pageElement = page as HTMLElement;
        pageElement.style.userSelect = 'none';
        pageElement.style.webkitUserSelect = 'none';
        
        pageElement.addEventListener('contextmenu', this.preventDefaultEvent);
        pageElement.addEventListener('selectstart', this.preventDefaultEvent);
        pageElement.addEventListener('dragstart', this.preventDefaultEvent);
      });

      const textLayers = viewerElement.querySelectorAll('.textLayer');
      textLayers.forEach(layer => {
        const layerElement = layer as HTMLElement;
        layerElement.style.pointerEvents = 'none';
        layerElement.style.userSelect = 'none';
      });

      const annotationLayers = viewerElement.querySelectorAll('.annotationLayer');
      annotationLayers.forEach(layer => {
        const layerElement = layer as HTMLElement;
        layerElement.style.pointerEvents = 'none';
      });

    }, 1000);
  }

  private preventDefaultEvent = (event: Event): boolean => {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}