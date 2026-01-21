import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthguardService } from './authguard.service';
import { ConfigService } from './services/config.service';
import { LoaderService } from './services/loader.service';

@Injectable({
  providedIn: 'root'
})
export class AuthguardGuard implements CanActivate {
  constructor(private authService: AuthguardService, private router: Router, private config: ConfigService, private loader: LoaderService) {

  }

  setLanguage(langCode: any) {
    this.loader.setDefaultLangCode(langCode);
    this.getSelectedLangData(langCode);
  }

  getSelectedLangData(lang: any) {
    this.config.getSelectedLang(lang).subscribe((response: any) => {
      sessionStorage.setItem("langData", JSON.stringify(response))
    });
  }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (this.authService.getAuthStatus()) {
      return true;
    } else {
      if (next.queryParams['doctordetails']) {
        console.log('canActive:Started')
        try {
          this.setLanguage(next.queryParams['language']);
          const data = await this.config.getipdetails().toPromise();
          if (data.ipAddress) {
            sessionStorage.setItem("ipaddress", data.ipAddress);
            const doctorDetails = JSON.parse(decodeURIComponent(next.queryParams['doctordetails']));
            sessionStorage.setItem("doctorDetails", JSON.stringify(doctorDetails));
            sessionStorage.setItem("token", doctorDetails[0]?.SessionId);
            sessionStorage.setItem("hospitalId", next.queryParams['location']);
            sessionStorage.setItem("isLoggedIn", 'true');
            sessionStorage.setItem("lang", next.queryParams['language']);
            sessionStorage.setItem("locationName", next.queryParams['locationname']);
            sessionStorage.setItem("IsDoctorLogin", doctorDetails[0].IsDoctor || false);
            sessionStorage.setItem("IsRODoctor", doctorDetails[0].IsRODoctor || false);
            sessionStorage.setItem("IsEmergency", doctorDetails[0].IsEmergencyDoc || false);
            sessionStorage.setItem("IsHeadNurse", doctorDetails[0].IsERHeadNurse || false);
            sessionStorage.setItem("IsORHeadNurse", doctorDetails[0].IsORHeadNurse || false);
            sessionStorage.setItem("IsAKUNurse", doctorDetails[0].IsAKUNurse || false);
            sessionStorage.setItem("IsITSTaff", doctorDetails[0].IsITSTaff || false);
            sessionStorage.setItem("IsOPDReception", doctorDetails[0].IsOPDReception || false);
            sessionStorage.setItem("IsPharmacist", doctorDetails[0].IsPharmacist || false);
            sessionStorage.setItem("LabTechnician", doctorDetails[0].LabTechnician || false);
            sessionStorage.setItem("RadTechnician", doctorDetails[0].RadTechnician || false);
            sessionStorage.setItem("IsWardNurse", doctorDetails[0].IsWardNurse || false);
            sessionStorage.setItem("IsAnesthestiaNurse", doctorDetails[0].IsAnesthestiaNurse || false);
            sessionStorage.setItem("IsEndoscopyNurse", doctorDetails[0].IsEndoscopyNurse || false);
            sessionStorage.setItem("IsCathNurse", doctorDetails[0].IsCathNurse || false);
            sessionStorage.setItem("IsFinance", doctorDetails[0].IsFinance || false);
            sessionStorage.setItem("IsNurse", doctorDetails[0].IsWardNurse || false);
            sessionStorage.setItem("FacilityID", next.queryParams['facilityid']);
            const cleanUrl = state.url.split('?')[0];
            if (state.url !== cleanUrl) {
              this.router.navigateByUrl(cleanUrl);
            }
          }
        }
        catch (error) {
          console.log('canActive:Error : ' +error)
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      }
      else if(next.queryParams['ssnfromothersource']) {
      const cleanUrl = state.url.split('?')[0];
        if (state.url !== cleanUrl) {
          sessionStorage.setItem("FacilityID", "0");
          sessionStorage.setItem("ssnfromothersource", next.queryParams['ssnfromothersource']);
          sessionStorage.setItem("doctorDetails", JSON.stringify([{ FacilityId: 0, UserID: 1 }]))
          sessionStorage.setItem("hospitalId", "1");
          sessionStorage.setItem("isLoggedIn", 'true');
          this.router.navigateByUrl(cleanUrl);
        }
        return true;
      }
      else {
        this.router.navigate(['/login']);
        return false;
      }
    }
  }

}
