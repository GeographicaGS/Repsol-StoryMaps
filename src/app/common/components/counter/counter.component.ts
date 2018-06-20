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
    this._countTo = to;
  }
  get countTo() {
    return this._countTo;
  }
  // @Input()countFrom: number;
  @Input() duration: number;
  @Input() step: number;

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
    this.counter.nativeElement.innerText = this.decimalPipe.transform(e, '1.0-0', this.utilService.getLocale());
  }

}
