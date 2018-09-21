import { Component, Input, HostBinding } from '@angular/core';
import { CounterDuration, CounterStep } from '../../../../common';
import { trigger, transition, style, animate } from '@angular/animations';

// NOTE: animation from https://medium.com/google-developer-experts/angular-applying-motion-principles-to-a-list-d5cdd35c899e

@Component({
  selector: 'app-station-popup',
  templateUrl: './station-popup.component.html',
  styleUrls: ['./station-popup.component.scss'],
  animations: [
    trigger('animateListItem', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),
        animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)'),
        style({ transform: 'scale(1)', opacity: 1 })
      ])
    ])
  ]
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
