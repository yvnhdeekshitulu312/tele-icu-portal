import { Component, Inject } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { BnNgIdleService } from 'bn-ng-idle';
import { sessionTime } from '../assets/config-constants';
import { ConfigService } from './services/config.service';
declare var $: any;
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { LoaderService } from './services/loader.service';
import { BroadcastService } from './services/broadcast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'self-service';
  showSideBar: boolean = false;
  selectedLang: any;
  langData: any;
  timer: any;
  timeout = 20;
  doctorDetails: any;

  idleStartTime: number = 0;

  constructor(private router: Router, private bnIdle: BnNgIdleService, private config: ConfigService,
    @Inject(DOCUMENT) private document: Document, private loader: LoaderService, private broadcastService: BroadcastService) {
    this.langData = this.config.getLangData();
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
  }


  ngOnInit() {
    this.loader.getDefaultLangCode().subscribe((res) => {
      this.loadStyle(res);
    })

    this.timeout = parseInt(this.doctorDetails[0]?.UIUserTimeOut ? this.doctorDetails[0]?.UIUserTimeOut : 20);

    this.bnIdle.startWatching(this.timeout * 60).subscribe((isTimedOut: boolean) => {
      if (isTimedOut) {
        this.langData = this.config.getLangData();
        let isLoggedIn = "isLoggedIn";
        if (isLoggedIn in sessionStorage) {
          let isUserLoggedIn = JSON.parse(sessionStorage.getItem('isLoggedIn') || '');
          if (isUserLoggedIn === true) {
            this.showConfirmModal();
          }
        }
      }
    });


    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loader.show();
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loader.hide();
      }
    });

    this.broadcastService.listenForMessages((message) => {
      if (message === 'appOpened') {
        this.router.navigate(['/login']);
      }
    });

    this.checkIfAppIsOpenInAnotherTab();
  }

  private checkIfAppIsOpenInAnotherTab(): void {
    this.broadcastService.sendMessage('appOpened');
  }

  ngOnDestroy(): void {
    this.broadcastService.closeChannel();
  }

  ngAfterContentInit() {
    // this.checkPath();
  }
  checkPath() {
    if (this.router.url == '/login') {
      this.showSideBar = false;
    } else {
      this.showSideBar = true;
    }
  }
  confirmCancelApp(Status: string) {
    if (Status === "Yes") {
      this.hideConfirmModal();
      this.config.Userlogout('').subscribe(() => {
        this.router.navigate(['/login']);
      });
    } else {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.hideConfirmModal();
    }
  }
  // showConfirmModal() {
  //   $("#confirmIdle").modal('show');

  //   //var doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
  //   //var timer = doctorDetails[0].UIUserTimeOut ? parseInt(doctorDetails[0].UIUserTimeOut) * 1000 : 20000;
  //   this.timer = setTimeout(()=> {
  //       this.confirmCancelApp('Yes');
  //   }, 3 * 60 * 1000);
  // }

  showConfirmModal() {
    $("#confirmIdle").modal('show');

    this.idleStartTime = Date.now();

    this.timer = setInterval(() => {
      const elapsed = Date.now() - this.idleStartTime;
      if (elapsed >= 2 * 60 * 1000) {
        clearInterval(this.timer);
        this.confirmCancelApp('Yes');
      }
    }, 1000);
  }

  hideConfirmModal() {
    $("#confirmIdle").modal('hide');
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
  // selectedLanguage(lang: any) {
  //   this.selectedLang = lang;
  //   console.log(this.selectedLang.value);
  //   if (this.selectedLang.value === "English") {
  //     this.loadStyle('style-EN.css');
  //   } else if (this.selectedLang.value === "Arabic") {
  //     this.loadStyle('style-EN.scss');
  //   }
  // }
  loadStyle(code: string) {
    let enStyle = './assets/styles/style-EN.css';
    let arStyle = './assets/styles/style-AR.css';
    let enBootstrap = './assets/styles/bootstrap.min.css';
    let arBootstrap = './assets/styles/bootstrap.rtl.min.css';
    let loadStyle = ""
    let loadBootstrap = ""
    if (code === 'en') {
      loadStyle = enStyle;
      loadBootstrap = enBootstrap
    } else if (code === 'ar') {
      loadStyle = arStyle;
      loadBootstrap = arBootstrap
    }
    const head = this.document.getElementsByTagName('head')[0];
    let linkElement = document.getElementById("client-theme");
    let bootstrapLinkElement = document.getElementById("bt-file");
    if (bootstrapLinkElement === null) {
      const style = this.document.createElement('link');
      style.id = 'bt-file';
      style.rel = 'stylesheet';
      style.href = `${loadBootstrap}`;
      head.appendChild(style);
    } else {
      bootstrapLinkElement.setAttribute('href', `${loadBootstrap}`)
    }
    if (linkElement === null) {
      const style = this.document.createElement('link');
      style.id = 'client-theme';
      style.rel = 'stylesheet';
      style.href = `${loadStyle}`;
      head.appendChild(style);
    } else {
      linkElement.setAttribute('href', `${loadStyle}`)
    }

  }
}
