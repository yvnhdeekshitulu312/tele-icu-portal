import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { MatDatepicker } from '@angular/material/datepicker';
@Component({
    selector: 'app-antibiotic',
    templateUrl: './antibiotic.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE],
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
        DatePipe,
    ]
})
export class AntibioticComponent extends DynamicHtmlComponent implements OnInit{
    @ViewChild('divantibiotic') divantibiotic!: ElementRef;
    @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;
    @ViewChild('Signature1') Signature1!: SignatureComponent;
    @ViewChild('Signature2') Signature2!: SignatureComponent;
    @ViewChild('Signature3') Signature3!: SignatureComponent;
    @ViewChild('socialdate', {static: false}) socialdate!: ElementRef;
    @ViewChild('socialdate1', {static: false}) socialdate1!: ElementRef;
    
    @Output() dataChanged = new EventEmitter<any>();

    data: any;  

    constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef,private datepipe: DatePipe) {
        super(renderer, el, cdr);
    }

    ngOnInit(): void {
        if (this.data) {
            setTimeout(() => {
                this.showElementsData(this.divantibiotic.nativeElement, JSON.parse(this.data));
            });            
        }
    }

    ngAfterViewInit() {
        
          if (this.socialdate) {
            this.socialdate.nativeElement.id = 'textbox_socialdate';
          }
          if (this.socialdate1) {
            this.socialdate1.nativeElement.id = 'textbox_socialdate1';
          }
          const now = new Date();        
          this.timerData.push({id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes()});
          this.timerData.push({id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes()});
          this.addListeners(this.datepickers);
          setTimeout(()=>{
            this.showdefault(this.divantibiotic.nativeElement);
            this.bindTextboxValue('text_ApprovedBy', `${this.doctorData[0].EmpNo}-${this.doctorData[0].EmployeeName}`);            
          }, 4000); 
          if (this.divantibiotic) {
            this.bindTextboxValue("textbox_socialdate", this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString());
            this.bindTextboxValue("textbox_socialdate1", this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString());
          }
    }

    save() {
        const tags = this.findHtmlTagIds(this.divantibiotic);
        this.dataChanged.emit(JSON.stringify(tags));
    }

    clearbase64Signature(signature: SignatureComponent): void {
        signature.clearSignature();
    }
}
