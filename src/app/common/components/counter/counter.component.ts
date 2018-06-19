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

  @Input() countTo: number;
  @Input() countFrom: number;
  @Input() duration: number;
  @Input() step: number;

  @ViewChild('counter') counter;

  constructor(
    private decimalPipe: DecimalPipe,
    private utilService: UtilService
  ) { }

  ngOnInit() {
  }

  countoChange(e) {
    this.counter.nativeElement.innerText = this.decimalPipe.transform(e, '1.0-0', this.utilService.getLocale());
  }

}
