import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-employee-search',
    templateUrl: './employee-search.component.html'
})
export class EmployeeSearchComponent extends BaseComponent implements OnInit {
    @Input()
    nameId: string = '';

    employeeList: any = [];

    constructor(private us: UtilityService) {
        super();
    }

    ngOnInit(): void {
        this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    }

    searchEmployee(event: any) {
        if (event.target.value.length > 2) {
            const url = this.us.getApiUrl(EmployeeSearch.FetchSSEmployees, { 
                name: event.target.value, 
                UserId: this.doctorDetails[0].UserId, 
                WorkStationID: 3395, 
                HospitalID: this.hospitalID 
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.employeeList = response.FetchSSEmployeesDataList;
                    }
                },
                    (_) => {
                    });
        }
    }

    onEmployeeSelected(item: any) {
        this.employeeList = [];
        $(`#${this.nameId}_designation`).val(item.Designation);
    }
}

const EmployeeSearch = {
    FetchSSEmployees: "FetchSSEmployees?name=${name}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}"
}
