import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-video-consultation',
  templateUrl: './video-consultation.component.html',
  styleUrls: ['./video-consultation.component.scss']
})
export class VideoConsultationComponent implements OnInit , AfterViewInit {

  domain: string = "meet.jit.si";
  room: any;
  options: any;
  api: any;
  user: any;

  // For Custom Controls
  isAudioMuted = false;
  isVideoMuted = false;

  constructor(
      private router: Router
  ) { }

  ngOnInit(): void {
      
      this.room = 'clinic_' + sessionStorage.getItem("SCHEDULEID"); // set your room name
      this.user = {
          name: sessionStorage.getItem("PATIENTNAME") // set your username
      }
  }

  ngAfterViewInit(): void {
      this.options = {
          roomName: this.room,
          width: 900,
          height: 500,
          configOverwrite: { prejoinPageEnabled: false },
          interfaceConfigOverwrite: {
              // overwrite interface properties
          },
          parentNode: document.querySelector('#jitsi-iframe'),
          userInfo: {
              displayName: this.user.name
          }
      }

      this.api = new JitsiMeetExternalAPI(this.domain, this.options);

      this.api.addEventListeners({
          readyToClose: this.handleClose,
          participantLeft: this.handleParticipantLeft,
          participantJoined: this.handleParticipantJoined,
          videoConferenceJoined: this.handleVideoConferenceJoined,
          videoConferenceLeft: this.handleVideoConferenceLeft,
          audioMuteStatusChanged: this.handleMuteStatus,
          videoMuteStatusChanged: this.handleVideoStatus
      });
  }


  handleClose = () => {
      console.log("handleClose");
  }

  handleParticipantLeft = async (participant: any) => {
      const data = await this.getParticipants();
  }

  handleParticipantJoined = async (participant: any) => {
      const data = await this.getParticipants();
  }

  handleVideoConferenceJoined = async (participant: any) => {
      const data = await this.getParticipants();
  }

  handleVideoConferenceLeft = () => {
      this.router.navigate(['/home']);
  }

  handleMuteStatus = (audio: any) => {
  }

  handleVideoStatus = (video: any) => {
  }

  getParticipants() {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              resolve(this.api.getParticipantsInfo()); // get all participants
          }, 500)
      });
  }

  // custom events
  executeCommand(command: string) {
      this.api.executeCommand(command);;
      if(command == 'hangup') {
          this.router.navigate(['/home']);
          return;
      }

      if(command == 'toggleAudio') {
          this.isAudioMuted = !this.isAudioMuted;
      }

      if(command == 'toggleVideo') {
          this.isVideoMuted = !this.isVideoMuted;
      }
  }
}

