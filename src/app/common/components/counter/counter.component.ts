import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { UtilService } from '../..';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  providers: [DecimalPipe]
})
export class CounterComponent implements OnInit {

  private _countTo: number;
  @Input() set countTo(to) {
    this.countFrom = this._countTo;
    this._countTo = (to !== null && to !== undefined) ? to : 0;
  }
  get countTo() {
    return this._countTo;
  }
  // @Input()countFrom: number;
  @Input() duration: number;
  @Input() step: number;
  @Input() showSimbol = false;
  @Input() format = '1.0-0';
  @Input() unit: string;

  countFrom = 0;

  @ViewChild('counter') counter;

  constructor(
    private decimalPipe: DecimalPipe,
    private utilService: UtilService
  ) { }

  ngOnInit() {
    this.setCounterText(this.countTo);
  }

  countoChange(e) {
    this.setCounterText(e);
  }

  private setCounterText(e) {
    this.counter.nativeElement.innerText =
      (this.showSimbol && e > 0 ? '+' : '') +
      this.decimalPipe.transform(e, this.format, this.utilService.getLocale())
    ;
    if (this.unit) {
      this.counter.nativeElement.innerHTML += ` <span>${this.unit}</span>`;
    }
  }

}
