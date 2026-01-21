import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-discharge-cases',
    templateUrl: './discharge-cases.component.html'
})
export class DischargeCasesComponent extends BaseComponent implements OnInit {
    groupedByRoom!: { [key: string]: any };
    errorMessages: any = [];
    facilities: any;
    FetchBedsFromWardDataList: any;

    constructor(private us: UtilityService, private datepipe: DatePipe) {
        super();
    }

    ngOnInit(): void {
        this.fetchUserFacility();
        if (this.wardID === undefined) {
            this.wardID = this.doctorDetails[0].FacilityId;
        }
        this.FetchBedsFromWard();
    }

    onWardChange() {
        this.FetchBedsFromWard();
    }

    fetchUserFacility() {
        const url = this.us.getApiUrl(DischargeCases.FetchTransferWards, {
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.facilities = response.FetchWardsBedtypesBedsDataList;
            }
        });
    }

    FetchBedsFromWard() {
        this.groupedByRoom = {};
        const url = this.us.getApiUrl(DischargeCases.FetchBedsFromWardNP, {
            WardID: this.wardID,
            ConsultantID: 0,
            Status: 3,
            UserId: this.doctorDetails[0].UserId,
            HospitalID: this.hospitalID
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.FetchBedsFromWardDataList = response.FetchBedsFromWardDataList.filter((element: any) => element.IsFitForDischarge);
                this.groupedByRoom = this.FetchBedsFromWardDataList.reduce((acc: any, curr: any) => {
                    const room = curr.Room;
                    if (!acc[room]) {
                        acc[room] = [];
                    }
                    acc[room].push(curr);
                    return acc;
                }, {});
            }
        });
    }

    getKeys(object: object): string[] {
        return object ? Object.keys(object) : [];
    }

    setSelectedRoom(item: any) {
        item.selected = !item.selected;
    }

    clear() {
        this.FetchBedsFromWard();
    }

    onStartCleaning(item: any) {
        item.startTime = this.datepipe.transform(new Date(), "dd-MMM-yyyy HH:mm")?.toString();
    }

    onEndCleaning(item: any) {
        item.endTime = this.datepipe.transform(new Date(), "dd-MMM-yyyy HH:mm")?.toString();
    }
}

const DischargeCases = {
    FetchTransferWards: 'FetchTransferWards?HospitalID=${HospitalID}',
    FetchBedsFromWardNP: 'FetchBedsFromWardNP?WardID=${WardID}&ConsultantID=${ConsultantID}&Status=${Status}&UserId=${UserId}&HospitalID=${HospitalID}'
}
