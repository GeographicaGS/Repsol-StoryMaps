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
  featuredWaylet = [
    {
      id: '1234',
      date: new Date(),
      amount: 87.20
    },
    {
      id: '1234',
      date: new Date(),
      amount: 87.20
    },
    {
      id: '1234',
      date: new Date(),
      amount: 87.20
    },
    {
      id: '1234',
      date: new Date(),
      amount: 87.20
    },
    {
      id: '1234',
      date: new Date(),
      amount: 87.20
    }
  ];

  constructor() { }

  setTab(tab) {
    this.currentTab = tab;
  }

  trackItem(index, item) {
    return item.id;
  }

}
