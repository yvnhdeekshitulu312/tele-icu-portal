import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { TemplateService } from 'src/app/shared/template.service';
import { noRestrictionTemplates } from '../template.utils';
import { ReloadtemplateService } from 'src/app/shared/reloadtemplate.service';
declare var $: any;
@Component({
  selector: 'app-sharedtemplateview',
  templateUrl: './sharedtemplateview.component.html'
})
export class SharedtemplateviewComponent implements OnInit {
  @Input() FetchPatienClinicalTemplateDetailsNList: any;
  @Input() FetchPatienClinicalTemplateDetailsNList$!: Observable<any[]>;
  @Input() selectedTemplateFn!: (tem: any) => void;
  eformRestriction = 0;
  doctorDetails: any;
  @Output() receivedData = new EventEmitter<{ tem: any }>();
  
  constructor(private templateService: TemplateService, private reloadService: ReloadtemplateService) { 
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.eformRestriction = this.doctorDetails[0]?.EformRestriction;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['FetchPatienClinicalTemplateDetailsNList']) {
      this.refreshData();
    }
  }

  refreshData() {
    this.FetchPatienClinicalTemplateDetailsNList.forEach((item: any) => {
      const modDate = new Date(item.Moddate);
    
      const currentDate = new Date();
    
      if (isNaN(modDate.getTime())) {
        console.error(`Invalid date format: ${item.Moddate}`);
        item.diffHours = null;
        return;
      }
    
      const diffTime = Math.abs(currentDate.getTime() - modDate.getTime());
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
      item.diffHours = diffHours;

      if(item.diffHours > this.eformRestriction && noRestrictionTemplates.indexOf(Number(item.ClinicalTemplateID)) === -1) {
        item.edit = false;
      }
      else {
        item.edit = true;
      }
    });
  }

  ngOnInit(): void {
    this.refreshData();
  }

  selectedTemplate(tem: any) {
    this.receivedData.emit(tem);
    this.templateService.setCanEditStatus(tem.edit);
    if (this.selectedTemplateFn) {
      this.selectedTemplateFn(tem); 
    }
  }

  onOkClick() {
    $('#saveMsg').modal('hide');
    this.reloadService.triggerReload();
  }
  
}
