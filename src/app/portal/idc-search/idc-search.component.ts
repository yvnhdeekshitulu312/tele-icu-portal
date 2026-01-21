import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TreeviewComponent, TreeviewConfig, TreeviewI18n, TreeviewItem } from 'ngx-treeview';
import { concat } from 'rxjs';
import { ConfigService } from 'src/app/services/config.service';
declare var $: any;

@Component({
  selector: 'app-idc-search',
  templateUrl: './idc-search.component.html',
  styleUrls: ['./idc-search.component.scss'],
  providers: [
    {
       provide: TreeviewI18n , useValue: Object.assign({
          getFilterNoItemsFoundText(): string  {
            return "";
          }
      })
    }
]
})

export class IdcSearchComponent implements OnInit, AfterViewInit {
  @ViewChild(TreeviewComponent, { static: true }) trvComponent!: TreeviewComponent;
  @ViewChild('idcName') idcName!: ElementRef<HTMLElement>;
  items!: TreeviewItem[];
  @Output() idcSearch = new EventEmitter<any>();
  doctorDetails: any;
  searchResult: any;
  confirmData:any;
  selectedResult: any = [];
  showChildComponent = false;
  diseaseForm!: FormGroup;
  values!: number[];
  config = TreeviewConfig.create({
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 600
  });
  langData: any;
  constructor(private _config: ConfigService, private fb: FormBuilder) {
    this.langData = this._config.getLangData();

   }

  ngOnInit(): void {
    //this.items = this.getBooks();
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.initiateDiseaseForm();
    this.items = [];
    this.values = [];
    this.diseaseForm.get('searchTerm')?.setValue("");
    
  }

  ngAfterViewInit(): void {
    let el: HTMLElement = this.idcName.nativeElement;
    el.focus();
  }

  initiateDiseaseForm() {
    this.diseaseForm = this.fb.group({
      searchTerm: ['']
    });
  }

   onFilterChange(value: string): void {
    var data = this.searchResult.filter((i: any) => i.itemid.includes(value));
  }

  onSelectedChange(value: any): void {
      this.values = value;
  }

  onConfirmIDC() {
    if(this.values && this.values.length === 0) {
      return;
    }

    var data = this.searchResult.filter((i: any) => this.values.includes(i.itemid));
  
    // value.forEach((element: any, index: any) => {
    //   var data = this.searchResult.filter((i: any) => i.itemid === element);
    //   this.selectedResult.push(data);
    // });
    $("#alert_confirmation").modal('hide');
    this.idcSearch.emit(data);
  }

  onselectedIDC(e: any) {
    if(this.values && this.values.length === 0) {
      return;
    }
    this.confirmData = this.searchResult.filter((i: any) => this.values.includes(i.itemid));
    $("#alert_confirmation").modal('show');
  }

  clear() {
  //   this.trvComponent.items.forEach(element => {
  //     element.checked = false;
  //     element.children.forEach(elem => {
  //         elem.checked = false;
  //         elem.children.forEach(ele => {
  //           ele.checked = false;
  //           ele.children.forEach(el => {
  //             el.checked = false;
  //             el.children.forEach(e => {
  //               e.checked = false;
  //           });
  //         });
  //       });
  //     });
  //  });

  this.items = [];
  this.diseaseForm.get('searchTerm')?.setValue("");
   this.values = [];
  }

  FetchMasterDiseases(type: any){
    this._config.FetchMasterDiseases(this.diseaseForm.get('searchTerm')?.value, type, this.doctorDetails[0].EmpId).subscribe((response:any)=>{
    if (response.Code == 200) {
        var diseaseResponse = response.FetchMasterDiseasesDataList;
        this.searchResult = diseaseResponse;
        if(diseaseResponse.length === 0) {
          childrenResult = [];
          return;
        }

        var childrenResult: TreeItem[] = [];

  diseaseResponse.forEach((element: any, index: any) => {
    childrenResult.push({ text: element.itemCode + ":" + element.ItemName, value :  element.itemid, checked: false });
  });

  const childrenCategory = new TreeviewItem({
    text: 'ICDCode', value: 1, collapsed: false, checked: false, children: [
      { text: diseaseResponse[0].ChapteCode + ":" + diseaseResponse[0].ChapterName
      , value: diseaseResponse[0].Chapteid, checked: false, children: [
        { text: diseaseResponse[0].SectionCode + ":" + diseaseResponse[0].SectionName
      , value: diseaseResponse[0].Sectionid, checked: false, children: [
        { text: diseaseResponse[0].SubsectionCode + ":" + diseaseResponse[0].SubsectionName
      , value: diseaseResponse[0].subsectionid, checked: false, children: childrenResult }] }] }
    ]
  });


  this.items  = [childrenCategory];
    }
    }, error => {
     console.error('Get Data API error:', error);
    });

  
    // this._config.FetchMasterDiseases(this.diseaseForm.get('searchTerm')?.value).subscribe((response:any)=>{
    //   if (response.Code == 200) {
    //    console.log(response);
    //   }
    //   }, error => {
    //     console.error('Get Data API error:', error);
    //   });
      
  }

  getBooks(): TreeviewItem[] {
    const childrenCategory = new TreeviewItem({
      text: 'ICDCode', value: 1, collapsed: false, children: [
        { text: 'Baby 3-5', value: 11 },
        { text: 'Baby 6-8', value: 12 },
        { text: 'Baby 9-12', value: 13 }
      ]
    });
    // const itCategory = new TreeviewItem({
    //   text: 'IT', value: 9, children: [
    //     {
    //       text: 'Programming', value: 91, children: [{
    //         text: 'Frontend', value: 911, children: [
    //           { text: 'Angular 1', value: 9111 },
    //           { text: 'Angular 2', value: 9112 },
    //           { text: 'ReactJS', value: 9113, disabled: true }
    //         ]
    //       }, {
    //         text: 'Backend', value: 912, children: [
    //           { text: 'C#', value: 9121 },
    //           { text: 'Java', value: 9122 },
    //           { text: 'Python', value: 9123, checked: false, disabled: true }
    //         ]
    //       }]
    //     },
    //     {
    //       text: 'Networking', value: 92, children: [
    //         { text: 'Internet', value: 921 },
    //         { text: 'Security', value: 922 }
    //       ]
    //     }
    //   ]
    // });
    // const teenCategory = new TreeviewItem({
    //   text: 'Teen', value: 2, collapsed: true, disabled: true, children: [
    //     { text: 'Adventure', value: 21 },
    //     { text: 'Science', value: 22 }
    //   ]
    // });
    // const othersCategory = new TreeviewItem({ text: 'Others', value: 3, checked: false, disabled: true });
    return [childrenCategory];
  }

  selectChildren(i: TreeviewItem) {
    i.collapsed = false;
    if (i.children) {
        this.selectInsideChildren(i);
        i.checked = !i.checked;
    }
    this.trvComponent.raiseSelectedChange();
  }
  selectInsideChildren(item: any) {
    item.children.forEach((i: any) => {
        i.checked = !i.checked;
        if (i.children) {
            this.selectInsideChildren(i);
        }
    });
  }

}

interface TreeItem {
  text: string;
  value: any;
  disabled?: boolean;
  checked?: boolean;
  collapsed?: boolean;
  children?: TreeItem[];
}