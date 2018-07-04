import { Component, OnInit, Input } from '@angular/core';
import { CounterDuration, CounterStep } from '../../../../common';

@Component({
  selector: 'app-station-popup',
  templateUrl: './station-popup.component.html',
  styleUrls: ['./station-popup.component.scss']
})
export class StationPopupComponent implements OnInit {

  @Input() data: any;

  counterDuration = CounterDuration;
  counterStep = CounterStep;

  constructor() { }

  ngOnInit() {
  }

}
