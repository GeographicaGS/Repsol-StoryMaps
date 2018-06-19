import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { UtilService, CounterDuration } from '../..';
import { TransactionCategories } from '../..';

@Component({
  selector: 'app-category-tab',
  templateUrl: './category-tab.component.html',
  styleUrls: ['./category-tab.component.scss']
})
export class CategoryTabComponent implements OnInit, OnDestroy {

  @Input() maxValue: number = null;
  @Input()
  set observableData(observable) {
    this.subscription = observable.subscribe((data) => {
      const date = data.start.split('T')[0];
      if (this.currentDate !== date) {
        this.dataAgg = JSON.parse(JSON.stringify(data));
        this.currentDate = date;
        this.beforeAggValue = 0;
        this.restartAgg = true;
      } else {
        this.restartAgg = false;
        for (const key of Object.keys(data)) {
          if (data[key]) {
            this.dataAgg[key] += data[key];
          }
        }
        this.beforeAggValue = this.aggValue;
      }
      this.aggValue = this.sumCategories(this.dataAgg);
      if (this.maxValue) {
        this.valuePerBall = this.maxValue / this.totalCircles.length;
        this.ref.detectChanges();
      }
    });
  }

  totalCircles = Array(20);
  subscription: Subscription;
  valuePerBall: number;
  dataAgg: any = null;
  currentDate: string = null;
  aggValue = 0;
  beforeAggValue = 0;
  restartAgg = false;
  counterDuration = CounterDuration;

  constructor(
    private ref: ChangeDetectorRef,
    private utilService: UtilService
  ) { }

  ngOnInit() {
  }

  getLevel(index, category) {
    const opacity = 1,
    intervals = 4;
    if (this.dataAgg !== null && this.maxValue !== null) {
      const level = index * this.valuePerBall;
      if (level < this.dataAgg[category]) {
        return opacity;
      } else {
        let valueToSearch;
        if (index === 1) {
          valueToSearch = this.dataAgg[category];
        } else {
          const levelBefore = (index - 1) * this.valuePerBall;
          if (levelBefore < this.dataAgg[category]) {
            valueToSearch = this.dataAgg[category] - levelBefore;
          } else {
            return 0;
          }
        }
        for (let i = intervals; i >= 1; i--) {
          if ((this.valuePerBall / i) >= valueToSearch) {
            return opacity / i;
          }
        }
      }
      // } else if (index === 1) {
      //   return (this.dataAgg[category] * opacity) / this.valuePerBall;
      // } else {
      //   const levelBefore = (index - 1) * this.valuePerBall;
      //   if (levelBefore < this.dataAgg[category]) {
      //      return ((this.dataAgg[category] - levelBefore) * opacity) / this.valuePerBall;
      //   }
      // }
    }
    return 0;
  }

  private sumCategories(data) {
    let result = 0;
    for (const t of TransactionCategories) {
      result += data[t];
    }
    return result;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
