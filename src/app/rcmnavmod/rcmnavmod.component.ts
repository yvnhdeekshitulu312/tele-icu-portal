import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '../services/config.service';

const secretKey = 'hippocorpsrcm';

@Component({
  selector: 'app-rcmnavmod',
  template: `<div>Please wait....</div>`,
})
export class RcmNavModComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private config: ConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const queryParams = this.route.snapshot.queryParams;
    const rc_ukey = queryParams['rc_ukey'];
    const navPath = decodeURIComponent(queryParams['navPath'] || '');
    const ssn = queryParams['ssn'];

    if (!rc_ukey) return;

    const decryptedKey = this.decryptUserKey(decodeURIComponent(rc_ukey));
    if (!decryptedKey) return;

    decryptedKey.ssn = ssn;

    const payload = this.buildLoginPayload(decryptedKey);

    this.config.ValidateUser(payload).subscribe({
      next: (response) =>
        this.handleLoginResponse(response, decryptedKey, navPath),
      error: () =>
        alert('Login failed. Please check your network or try again.'),
      complete: () => console.log('✅ ValidateUser API call completed'),
    });
  }

  private decryptUserKey(encryptedKey: string): any | null {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedKey, secretKey);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedText) throw new Error('Empty decryption result');
      return JSON.parse(decryptedText);
    } catch (error: any) {
      console.error('❌ Decryption error:', error.message);
      return null;
    }
  }

  private buildLoginPayload(decryptedKey: any) {
    return {
      username: decryptedKey.username,
      password: decryptedKey.password,
      HostName: '',
      _intTrialCount: 0,
      location: decryptedKey.hospital_id,
      Checklogin: 0,
    };
  }

  private handleLoginResponse(
    response: any,
    userData: any,
    redirect: string
  ): void {
    if (response.Code === 604) {
      alert('❗ Something went wrong, please try again later.');
      return;
    }

    if (response.Code === 200) {
      sessionStorage.setItem('hospitalId', userData.hospital_id ?? '');
      // sessionStorage.setItem('FacilityID', userData.facilityId ?? '');
      sessionStorage.setItem(
        'FacilityID',
        userData.hospital_id == 3 ? '3797' : '3596'
      );
      this.setSessionValues(response, userData);
      this.navigateToPath(redirect, userData);
    }
  }

  private setSessionValues(response: any, userData: any): void {
    const user = response?.SmartDataList?.[0];

    if (!user) {
      console.error('❌ Invalid login response: Missing user data');
      return;
    }

    const sessionItems = {
      token: user.SessionId,
      doctorDetails: JSON.stringify(response.SmartDataList),
      hospitalId: userData.hospital_id,
      locationName: userData.hospital_name,
      isLoggedIn: 'true',
    };

    for (const [key, value] of Object.entries(sessionItems)) {
      sessionStorage.setItem(key, value);
    }

    const selectedLang = { Id: 1, value: 'English', code: 'en' };
    sessionStorage.setItem('lang', `${selectedLang.code}`);

    this.config
      .getSelectedLang(selectedLang.code)
      .subscribe((response: any) => {
        sessionStorage.setItem('langData', JSON.stringify(response));
      });

    const roleFlags: Record<string, any> = {
      IsDoctorLogin: user.IsDoctor,
      IsDietitian: user.IsDietitian,
      IsRODoctor: user.IsRODoctor,
      IsEmergency: user.IsEmergencyDoc,
      IsHeadNurse: user.IsERHeadNurse,
      IsORHeadNurse: user.IsORHeadNurse,
      IsAKUNurse: user.IsAKUNurse,
      IsITSTaff: user.IsITSTaff,
      IsOPDReception: user.IsOPDReception,
      IsPharmacist: user.IsPharmacist,
      LabTechnician: user.LabTechnician,
      RadTechnician: user.RadTechnician,
      IsWardNurse: user.IsWardNurse,
      IsAnesthestiaNurse: user.IsAnesthestiaNurse,
      IsEndoscopyNurse: user.IsEndoscopyNurse,
      IsCathNurse: user.IsCathNurse,
      IsFinance: user.IsFinance,
      IsRespiratoryTherapist: user.IsRespiratoryTherapist,
      IsNurse: user.IsWardNurse,
    };

    Object.entries(roleFlags).forEach(([key, value]) =>
      sessionStorage.setItem(key, value)
    );

    if (user.FacilityId != null) {
      sessionStorage.setItem(
        'FacilityID',
        user.hospital_id == 3 ? '"3797"' : '"3596"'
      );
    } else {
      sessionStorage.setItem('FacilityID', '"3596"');
    }
  }

  private navigateToPath(path: string, userData: any): void {
    if (!path) return;

    if (path === 'pharmacy/cashissue') {
      sessionStorage.setItem('fromNotBilledOrders', 'true');
      sessionStorage.setItem('ssn', userData?.ssn ?? '');
    }

    //window.location.href = `/${path}`;
    this.router.navigate([`/${path}`]);
  }
}
