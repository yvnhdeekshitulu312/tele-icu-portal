import { Subject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-translate-loader',
  templateUrl: './translate-loader.component.html',
  styleUrls: ['./translate-loader.component.scss']
})
export class TranslateLoaderComponent implements OnInit {
  constructor() { }
  ngOnInit(): void {
  }
}