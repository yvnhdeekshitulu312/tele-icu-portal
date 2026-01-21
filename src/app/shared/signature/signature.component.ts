import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { ValidateEmployeeComponent } from '../validate-employee/validate-employee.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from 'src/app/services/config.service';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss']
})
export class SignatureComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing: boolean = false;
  hasMoved = false;
  @Output() base64Signature = new EventEmitter<any>();
  @Input() public imageToDisplay?: any;
  doctorDetails: any;
  HospitalID: any;
  imgBase64: any;
  @Input() IsPrint = false;
  private prevX: number = 0;
  private prevY: number = 0;

  constructor(private renderer: Renderer2, public elementRef: ElementRef<HTMLElement>, private modalService: NgbModal, private config: ConfigService) {
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.setupCanvas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('imageToDisplay' in changes) {
      this.setupCanvas();
    }
  }

  private setupCanvas(): void {
    const canvas = this.signatureCanvas?.nativeElement;
    if (canvas) {
      this.ctx = canvas.getContext('2d');
      if (this.ctx) {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      this.setupEventListeners();

      if (this.imageToDisplay) {
        const image = new Image();
        image.onload = () => {
          if (this.ctx) {
            this.ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          }
        };
        image.src = this.imageToDisplay;
      }
    }
  }

  setupEventListeners() {
    this.renderer.listen(this.signatureCanvas.nativeElement, 'mousedown', (event) => this.startDrawing(event));
    this.renderer.listen(this.signatureCanvas.nativeElement, 'mousemove', (event) => this.draw(event));
    this.renderer.listen(this.signatureCanvas.nativeElement, 'mouseup', () => this.endDrawing());

    // Touch events
    this.renderer.listen(this.signatureCanvas.nativeElement, 'touchstart', (event) => this.startDrawing(event));
    this.renderer.listen(this.signatureCanvas.nativeElement, 'touchmove', (event) => this.draw(event));
    this.renderer.listen(this.signatureCanvas.nativeElement, 'touchend', () => this.endDrawing());
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.isDrawing = true;
    this.hasMoved = false;
    const pos = this.getCursorPosition(event);
    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
    }
    this.prevX = pos.x;
    this.prevY = pos.y;
  }

  // draw(event: MouseEvent | TouchEvent) {
  //   event.preventDefault();
  //   if (this.isDrawing) {
  //     const pos = this.getCursorPosition(event);
  //     if (this.ctx) {
  //       this.ctx.lineTo(pos.x, pos.y);
  //       this.ctx.stroke();
  //     }
  //   }
  // }

  draw(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    if (this.isDrawing) {
      this.hasMoved = true;
      const pos = this.getCursorPosition(event);
      if (this.ctx) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.prevX, this.prevY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        this.ctx.closePath();

        this.prevX = pos.x;
        this.prevY = pos.y;
      }
    }
  }

  endDrawing() {
    this.isDrawing = false;
    if (this.hasMoved) {
      this.convertCanvasToBase64().then((imageData) => {
        this.imgBase64 = imageData;
        this.base64Signature.emit(imageData);
      });
    }
    this.hasMoved = false;
  }

  private convertCanvasToBase64(): Promise<any> {
    return new Promise((resolve, reject) => {
      const canvas = this.signatureCanvas.nativeElement;
      const imageData = canvas.toDataURL('image/png');
      resolve(imageData);
    });
  }

  getCursorPosition(event: MouseEvent | TouchEvent) {
    let clientX, clientY;

    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if (event instanceof TouchEvent) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    const canvasRect = this.signatureCanvas.nativeElement.getBoundingClientRect();
    return {
      x: (clientX !== undefined ? clientX : 0) - canvasRect.left,
      y: (clientY !== undefined ? clientY : 0) - canvasRect.top
    };
  }

  clearSignature() {
    if (this.ctx) {
      const canvas = this.signatureCanvas.nativeElement;
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  fetchDoctorSignature() {
    const modalRef = this.modalService.open(ValidateEmployeeComponent);
    modalRef.componentInstance.IsSignature = true;

    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.config.FetchEmployeeSignaturesBase64(data.message, data.message, 3392, this.HospitalID)
          .subscribe((response: any) => {
            const base64StringSig = response.FetchEmployeeSignaturesBase64DList[0].Base64Signature;
            if (base64StringSig) {
              this.imageToDisplay = base64StringSig;
              this.setupCanvas();
              this.base64Signature.emit(base64StringSig);
            }
          },
            (err) => {
            })
      }
      modalRef.close();
    });
  }

  openSignaturePad() {
    const modalRef = this.modalService.open(SignaturePadComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.onClose.subscribe(() => {
      modalRef.close();
    });

    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.base64String) {
        this.imageToDisplay = data.base64String;
        this.setupCanvas();
        this.base64Signature.emit(data.base64String);
      }
      modalRef.close();
    });
  }
}
