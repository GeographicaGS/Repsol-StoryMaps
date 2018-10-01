import { Component, Input, HostBinding, OnChanges } from '@angular/core';
import { CounterDuration, CounterStep } from '../../../../common';

@Component({
  selector: 'app-station-popup',
  templateUrl: './station-popup.component.html',
  styleUrls: ['./station-popup.component.scss']
})
export class StationPopupComponent implements OnChanges {

  private _animate = false;

  @Input()
  get animate() {
    return this._animate;
  }
  set animate(value) {
    this._animate = value;
    setTimeout(() => {
      this.animate = false;
    }, 500);
  }

  @Input() data: any;
  @HostBinding('class.open') open = false;

  counterDuration = CounterDuration;
  counterStep = CounterStep;
  currentTab = 'summary';

  constructor() { }

  setTab(tab) {
    this.currentTab = tab;
  }

  ngOnChanges(changes) {
    console.log('changes: ', changes.data && changes.data.currentValue);
  }

}
