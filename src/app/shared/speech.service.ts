import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { config } from 'src/environments/environment';
import { BYPASS_LOG } from '../services/headers.interceptor';
import { LoaderService } from '../services/loader.service';

export interface SpeechState {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  error: string;
}

export interface ClaraResponse {
  success: boolean;
  text: string;
  patientId?: string;
  AdmissionID?: string;
  HospitalID?: string;
  SSN?: string;
  hasAudio: boolean;
  audioBlob?: Blob;
  audioBase64?: string;
  audioMimeType?: string;
}

@Injectable({ providedIn: 'root' })
export class SpeechService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  private stateSubject = new BehaviorSubject<SpeechState>({
    isRecording: false,
    isProcessing: false,
    transcript: '',
    error: ''
  });

  public state$: Observable<SpeechState> = this.stateSubject.asObservable();

  constructor(private http: HttpClient, private loader: LoaderService) {}

  get currentState(): SpeechState {
    return this.stateSubject.value;
  }

  async startRecording(): Promise<void> {
    try {
      this.updateState({ error: '', transcript: '' });
      await this.cleanup();

      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();

      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.updateState({ isRecording: true });
    } catch (err) {
      this.updateState({
        error: 'Failed to start recording. Please check microphone permissions.',
        isRecording: false
      });
      console.error('Recording error:', err);
      this.loader.hide();
      throw err;
    }
  }

  async stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanup();
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        if (this.audioChunks.length > 0) {
          const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.cleanup();
          resolve(blob);
        } else {
          this.cleanup();
          resolve(null);
        }
      };

      this.mediaRecorder.stop();
      this.updateState({ isRecording: false });
    });
  }

  async recordAndTranscribe(): Promise<string> {
    try {
      this.updateState({ isProcessing: true, error: '' });

      const blob = await this.stopRecording();

      if (!blob) {
        const error = 'No audio recorded. Please try again.';
        this.updateState({ error, isProcessing: false });
        throw new Error(error);
      }

      const transcript = await this.sendAudio(blob);

      if (!transcript || transcript.trim() === '') {
        const error = 'No speech detected in the recording.';
        this.updateState({ error, isProcessing: false });
        throw new Error(error);
      }

      this.updateState({ transcript, isProcessing: false });
      return transcript;
    } catch (err) {
      this.updateState({
        error: 'An error occurred during processing. Please try again.',
        isProcessing: false
      });
      console.error('Processing error:', err);
      this.loader.hide();
      throw err;
    }
  }

  async recordAndTranscribeAdvanced(patientId?: string, AdmissionID?: string, HospitalID?: string, SSN?: string, type?: string, mode: 'voice' | 'report' = 'voice', dashboardType?: any, dateRange?: any): Promise<ClaraResponse> {
    try {
      this.updateState({ isProcessing: true, error: '' });

      const blob = await this.stopRecording();
      if (!blob) throw new Error('No audio recorded');

      const response = await this.sendAudioAdvanced(blob, patientId, AdmissionID, HospitalID, SSN, type, mode, dashboardType, dateRange);

      if (response.audioBlob && response.audioBlob.size > 0) {
        this.playAudio(response.audioBlob);
      }

      if (!response.text?.trim()) throw new Error('No response received');

      this.updateState({ transcript: response.text, isProcessing: false });
      return response;

    } catch (err) {
      this.updateState({
        error: err instanceof Error ? err.message : 'Processing failed',
        isProcessing: false
      });
      this.loader.hide();
      throw err;
    }
  }

  async sendTextMessage(text: string, patientId?: string, AdmissionID?: string, HospitalID?: string, SSN?: string, type?: string, mode: 'voice' | 'report' = 'voice', dashboardType?: any, dateRange?: any): Promise<ClaraResponse> {
    try {
      this.updateState({ isProcessing: true, error: '' });

      if (!text?.trim()) {
        throw new Error('Please enter a message');
      }

      const response = await this.sendTextAdvanced(text, patientId, AdmissionID, HospitalID, SSN, type, mode, dashboardType, dateRange);

      if (response.audioBlob && response.audioBlob.size > 0) {
        this.playAudio(response.audioBlob);
      }

      this.updateState({ transcript: response.text, isProcessing: false });
      return response;

    } catch (err) {
      this.updateState({
        error: err instanceof Error ? err.message : 'Failed to send message',
        isProcessing: false
      });
      this.loader.hide();
      throw err;
    }
  }

  async sendAudioAdvanced(blob: Blob, patientId?: string, AdmissionID?: string, HospitalID?: string, SSN?: string, type?: string, mode: 'voice' | 'report' = 'voice', dashboardType?: any, dateRange?: any): Promise<ClaraResponse> {
    const formData = new FormData();
    formData.append('audio', blob, 'input.webm');
    if (patientId) formData.append('patientId', patientId);
    if (AdmissionID) formData.append('AdmissionID', AdmissionID);
    if (HospitalID) formData.append('HospitalID', HospitalID);
    if (SSN) formData.append('SSN', SSN);
    if (type) formData.append('aiType', type);
    if (dashboardType) formData.append('dashboardType', dashboardType);
    if (dateRange) formData.append('dateRange', JSON.stringify(dateRange));

    const endpoint = mode === 'report' ? config.reportAgentUrl : config.n8nurl;

    try {
      const response = await firstValueFrom(
        this.http.post(`${endpoint}`, formData, {
          observe: 'response',
          responseType: 'blob',
          context: new HttpContext().set(BYPASS_LOG, true)
        })
      );

      return await this.parseN8nResponse(response.body!);
    } catch (error) {
      console.error('Audio processing error:', error);
      this.loader.hide();
      throw new Error('Failed to process audio');
    }
  }

  async sendTextAdvanced(text: string, patientId?: string, AdmissionID?: string, HospitalID?: string, SSN?: string, type?: string, mode: 'voice' | 'report' = 'voice', dashboardType?: any, dateRange?: any): Promise<ClaraResponse> {
    const payload = {
      text: text,
      patientId: patientId || '',
      AdmissionID: AdmissionID || '',
      HospitalID: HospitalID || '',
      SSN: SSN || '',
      aiType: type || 'fast',
      dashboardType: dashboardType || null,
      dateRange: dateRange || null,
    };

    const endpoint = mode === 'report' ? config.reportAgentUrl : config.n8nurl;

    try {
      const response = await firstValueFrom(
        this.http.post(`${endpoint}`, payload, {
          observe: 'response',
          responseType: 'blob',
          context: new HttpContext().set(BYPASS_LOG, true)
        })
      );

      return await this.parseN8nResponse(response.body!);
    } catch (error) {
      console.error('Text processing error:', error);
      this.loader.hide();
      return {
        success: false,
        text: '',
        patientId: patientId || '',
        hasAudio: false,
        audioBase64: '',
        audioMimeType: ''
      };
    }
  }

  private async parseN8nResponse(blob: Blob): Promise<ClaraResponse> {
    try {
      this.loader.hide();
      const text = await blob.text();
      
      try {
        const json = JSON.parse(text);
        
        return {
          success: json.success || true,
          text: json.text || json.aiResponse || json.response || 'Response received',
          patientId: json.patientId,
          AdmissionID: json.AdmissionID,
          HospitalID: json.HospitalID,
          SSN: json.SSN,
          hasAudio: json.hasAudio || false,
          audioBlob: json.binary?.data ? this.base64ToBlob(json.binary.data) : undefined,
          audioBase64: json.audioBase64,
          audioMimeType: json.audioMimeType
        };
      } catch {
        this.loader.hide();
        return {
          success: true,
          text: 'Audio response received',
          hasAudio: true,
          audioBlob: blob
        };
      }
    } catch (error) {
      this.loader.hide();
      console.error('Error parsing response:', error);
      throw new Error('Invalid response from server');
    }
  }

  private base64ToBlob(base64: string, contentType: string = 'audio/mpeg'): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  private playAudio(audioBlob: Blob): void {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.play().catch(err => {
      this.loader.hide();
      console.error('Audio playback error:', err);
    });
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
  }

  async sendAudio(blob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', blob, 'input.webm');

    try {
      const apiUrl = `${config.apiurl}speech/speechToText`;
      const response = await firstValueFrom(
        this.http.post<{ transcript: string }>(apiUrl, formData)
      );
      return response.transcript;
    } catch (error) {
      this.loader.hide();
      console.error('Speech to text error:', error);
      throw error;
    }
  }

  resetState(): void {
    this.updateState({
      isRecording: false,
      isProcessing: false,
      transcript: '',
      error: ''
    });
  }

  private updateState(partial: Partial<SpeechState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partial
    });
  }

  private cleanup(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  private activeTextarea: HTMLTextAreaElement | null = null;

  setActiveTextarea(textarea: HTMLTextAreaElement | null): void {
    this.activeTextarea = textarea;
  }

  getActiveTextarea(): HTMLTextAreaElement | null {
    return this.activeTextarea;
  }

  appendToActiveTextarea(text: string): void {
    if (this.activeTextarea) {
      const currentValue = this.activeTextarea.value || '';
      const newValue = currentValue + (currentValue ? ' ' : '') + text;
      this.activeTextarea.value = newValue;

      const event = new Event('input', { bubbles: true });
      this.activeTextarea.dispatchEvent(event);
    }
  }
}