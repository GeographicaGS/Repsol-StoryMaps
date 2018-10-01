import { Component, Input, HostBinding } from '@angular/core';
import { CounterDuration, CounterStep } from '../../../../common';

@Component({
  selector: 'app-station-popup',
  templateUrl: './station-popup.component.html',
  styleUrls: ['./station-popup.component.scss']
})
export class StationPopupComponent {

  @Input() data: any;
  @HostBinding('class.open') open = false;

  counterDuration = CounterDuration;
  counterStep = CounterStep;
  currentTab = 'summary';

  constructor() { }

  setTab(tab) {
    this.currentTab = tab;
  }

}
