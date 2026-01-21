import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-time-selector',
  templateUrl: './time-selector.component.html',
  styleUrls: ['./time-selector.component.scss']
})
export class TimeSelectorComponent implements OnInit {
  @Output() timeSelected = new EventEmitter<{ hour: number, minute: number }>();
  @Input() disabled: boolean = false;
  hoursArray: number[] = [];
  minutesArray: number[] = [];

  @Input() hours!: number;
  @Input() minutes!: number;

  selectedHour!: number;
  selectedMinute!: number;
  @Input() id!: string;

  ngOnInit(): void {
    this.hoursArray = Array.from({ length: 24 }, (v, k) => k);
    this.minutesArray = Array.from({ length: 60 }, (v, k) => k);

    setTimeout(() => {
      const now = new Date();
      this.selectedHour = this.hours !== undefined ? this.hours : now.getHours();
      this.selectedMinute = this.minutes !== undefined ? this.minutes : now.getMinutes();
    }, 0);

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['hours']) {
      const now = new Date();
      this.selectedHour = this.hours !== undefined ? Number(this.hours) : now.getHours();
    }
    if (changes['minutes']) {
      const now = new Date();
      this.selectedMinute = this.minutes !== undefined ? Number(this.minutes) : now.getMinutes();
    }
  }

  formatWithLeadingZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  onTimeChange(): void {
    this.timeSelected.emit({ hour: this.selectedHour, minute: this.selectedMinute });
  }
}