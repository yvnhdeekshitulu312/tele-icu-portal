import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';

@Component({
  selector: 'app-update-bedstatus',
  templateUrl: './update-bedstatus.component.html',
  styleUrls: ['./update-bedstatus.component.scss']
})
export class UpdateBedstatusComponent extends BaseComponent implements OnInit {

  constructor() {
    super();
   }

  ngOnInit(): void {
  }

}
