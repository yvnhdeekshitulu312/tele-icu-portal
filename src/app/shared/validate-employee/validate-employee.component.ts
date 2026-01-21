import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BaseComponent } from '../base.component';
import { FormBuilder, Validators } from '@angular/forms';
import { ValidateEmployeeService } from './validate-employee.service';
import { details } from './urls';
import { UtilityService } from '../utility.service';
declare var $: any;

@Component({
  selector: 'app-validate-employee',
  templateUrl: './validate-employee.component.html',
  styleUrls: ['./validate-employee.component.scss']
})
export class ValidateEmployeeComponent extends BaseComponent {
  userForm: any;
  errorMessage: any;
  IsSignatureComponent = false;
  data: any;
  @Input() initialData: any;
  @Input() IsSignature: boolean = false;
  @Output() dataChanged = new EventEmitter<DataChangedEvent>();
  @Output() signature = new EventEmitter<any>();
  @ViewChild('Password') Password!: ElementRef;
  list: any = [];
  url = '';
  constructor(private fb: FormBuilder, private service: ValidateEmployeeService, private us: UtilityService) {
    super()
  }

  close() {
    this.dataChanged.emit({ success: false, message: "" });
  }

  ngOnInit(): void {
    if (!this.IsSignature) {
      let UserName;
      let bypassValidation: boolean = false;
      if (this.data) {
        UserName = this.data.UserName;
      } else if (this.initialData) {
        UserName = this.initialData.UserName;
      } else {
        UserName = this.doctorDetails[0].UserName;
        if (this.doctorDetails[0].MFAAuthentication === 'YES') {
          bypassValidation = true;
        }
      }
      this.userForm = this.fb.group({
        UserName,
        Password: ['', Validators.required],
        Signature: '',
        UserId: ''
      });

      if (bypassValidation) {
        this.dataChanged.emit({
            success: true,
            message: this.userForm.get('UserId')?.value
          });
      }
    }
    else {
      this.IsSignatureComponent = this.IsSignature;
      this.userForm = this.fb.group({
        UserName: '',
        Password: '',
        Signature: '',
        UserId: ''
      });
    }
  }

  validateuser() {
    var payload = {
      username: this.userForm.get('UserName').value,
      password: this.userForm.get('Password').value,
      location: this.hospitalID
    }
    this.con.validateUserLogin(payload).subscribe((response) => {
      this.errorMessage = '';
      if (response.length === 0) {
        this.errorMessage = "Invalid UserName / Password"
      } else if (response[0].CredentialsMessage) {
        this.errorMessage = response[0].CredentialsMessage;
      }
      else {
        this.dataChanged.emit({
          success: true,
          message: this.userForm.get('UserId')?.value
        });
        this.signature.emit(this.userForm.get('Signature').value);
      }
    },
      (err) => {

      })
  }

  clearuser() {
    if (this.IsSignatureComponent) {
      this.IsSignature = true;
      return;
    }
    let UserName;
    if (this.data) {
      UserName = this.data.UserName;
    } else if (this.initialData) {
      UserName = this.initialData.UserName;
    } else {
      UserName = this.doctorDetails[0].UserName;
    }
    this.userForm = this.fb.group({
      UserName,
      Password: ['', Validators.required]
    });

    this.errorMessage = '';
  }

  search(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(details.FetchEmpSignatures, { Filter: event.target.value, WorkStationID: 3413, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.list = response.FetchEmpSignaturesDataList;
          }
        },
          (err) => {
          })
    }
  }

  onSelected(item: any) {
    this.list = [];

    this.userForm = this.fb.group({
      UserName: item.EmpNo,
      Password: ['', Validators.required],
      Signature: item.Signature,
      UserId: item.EmpID
    });

    this.IsSignature = false;
    setTimeout(() => {
      this.Password.nativeElement.focus();
    }, 1000);
  }

  ngAfterViewInit() {
    if (this.Password) {
      setTimeout(() => {
        this.Password.nativeElement.focus();
      }, 1000);
    }
  }

  onEnter(event: any) {
    if (this.userForm.get('Password').value) {
      this.validateuser();
    }
  }
}


interface DataChangedEvent {
  success: boolean;
  message: string;
}