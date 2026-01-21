import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import * as moment from 'moment';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-dynamic',
  templateUrl: './dynamic.component.html',
  styleUrls: ['./dynamic.component.scss']
})
export class DynamicComponent implements OnInit {
  @Input() inputValue: any; 
  @Input() inputDynamicValue: any;
  @Input() itemsList: any;
  @Input() errorMessage: any;
  @Output() receivedData=  new EventEmitter<{ spanid: any, content: any }>();
  @ViewChild('mySelect') mySelect!: ElementRef;
  listOfItems: any = [];
  private searchInput$ = new Subject<string>();
  timeout = 2000;
  type = '';
  hospId: any;
  langData: any;
  OriginalValue: any;
  private subscription!: Subscription;
  constructor(private config: ConfigService) { 
    this.langData = this.config.getLangData();
  }

  ngOnInit(): void {
    this.type = this.inputValue.split('_')[0];
    this.hospId = sessionStorage.getItem("hospitalId");
    this.OriginalValue = this.inputDynamicValue;
    if(this.type === "dropdown" || this.type === "search") {
      if (this.itemsList) {
        this.listOfItems = cloneDeep(this.itemsList);
      } else {
        this.dynamicdata(this.inputValue.split('_')[1]);
      }
    }
    else if(this.type === "date") {
      this.inputDynamicValue = moment(this.inputDynamicValue).format('yyyy-MM-DD');
    }
    this.initializeSearchListener();

    this.subscription = this.config.triggerDynamicUpdate$.subscribe(status => {
      if(status) {
        this.Update();
      }
    });
  }

  ngAfterViewInit() {
    const selectedOptionText = this.inputDynamicValue; 

    setTimeout(() => {
      if (this.mySelect && this.mySelect.nativeElement) { 
        const selectElement = this.mySelect.nativeElement as HTMLSelectElement;
        const optionToSelect = Array.from(selectElement.options).find(
          (option) => option.text === selectedOptionText
        );
    
        if (optionToSelect) {
          optionToSelect.selected = true;
        }
      }
     }, 2000);
   
  }

  initializeSearchListener() {
    this.searchInput$
      .pipe(
        debounceTime(this.timeout)
      )
      .subscribe(filter => {
        if (filter.length >= 3) {
         
        } else {
          this.listOfItems = [];
        }
      });
  }
  
  
  fetchSearch(event: any) {
    const inputSearchValue = event.target.value;
    this.searchInput$.next(inputSearchValue);
  }

  selectedItem(item: any) {
  }

  Update() {
    if(this.type === "date") {
      this.receivedData.emit({ spanid: this.inputValue, content:  moment(this.inputDynamicValue).format('DD-MMM-yyyy') });
    }
    else if(this.type === "dropdown") {
      this.receivedData.emit({ spanid: this.inputValue, content:  this.inputDynamicValue });
    }
  }

  dynamicdata(apiname: any) {
    this.config.dynamicdata(apiname, this.hospId).subscribe(response => {
      if(response.Code == 200) {
       this.listOfItems = response.dynamicArrayList;
      }
    })
  }

  dropdownchange(event: any) {
    const selectedText = (event.target as HTMLSelectElement).options[
      (event.target as HTMLSelectElement).selectedIndex
    ].text;
    this.inputDynamicValue = selectedText;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
