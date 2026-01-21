import { Injectable } from '@angular/core';
import { UtilityService } from 'src/app/shared/utility.service';

@Injectable({
    providedIn: 'root'
})
export class DietPlanWorklistService {
    constructor(private service: UtilityService) { }

    getData(baseUrl: any, inputparam: any): any {
        return this.service.getApiUrl(baseUrl, { ...inputparam })
    }
}
