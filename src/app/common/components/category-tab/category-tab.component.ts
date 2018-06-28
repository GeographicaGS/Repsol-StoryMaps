import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { UtilService, CounterDuration, CounterStep } from '../..';
import { TransactionCategories, TransactionOilCategories } from '../..';

@Component({
  selector: 'app-category-tab',
  templateUrl: './category-tab.component.html',
  styleUrls: ['./category-tab.component.scss']
})
export class CategoryTabComponent implements OnInit, OnDestroy {

  // @Input() maxOil: number = null;
  @Input() maxOil: number = null;
  @Input() maxNonOil: number = null;
  @Input()
  set observableData(observable) {
    this.subscription = observable.subscribe((data) => {
      const date = data.start.split('T')[0];
      if (this.currentDate !== date) {
        this.dataAgg = JSON.parse(JSON.stringify(data));
        this.currentDate = date;
        this.restartAgg = true;
      } else {
        this.restartAgg = false;
        for (const key of Object.keys(data)) {
          if (data[key]) {
            this.dataAgg[key] += data[key];
          }
        }
      }
      this.sumCategories(this.dataAgg);
      if (this.maxOil) {
        this.valuePerOilBall = this.maxOil / this.totalCircles.length;
        this.valuePerNonOilBall = this.maxNonOil / this.totalCircles.length;
        this.ref.detectChanges();
      }
    });
  }

  totalCircles = Array(16);
  subscription: Subscription;
  valuePerOilBall: number;
  valuePerNonOilBall: number;
  dataAgg: any = null;
  currentDate: string = null;
  aggValueOil = 0;
  aggValueNonOil = 0;
  restartAgg = false;

  counterDuration = CounterDuration;
  counterStep = CounterStep;

  constructor(
    private ref: ChangeDetectorRef,
    private utilService: UtilService
  ) { }

  ngOnInit() {
  }

  getLevel(index, category) {
    const opacity = 1,
    intervals = 4,
    valuePerBall = (TransactionOilCategories.indexOf(category) >= 0) ? this.valuePerOilBall : this.valuePerNonOilBall;

    if (this.dataAgg !== null && this.maxOil !== null && this.maxNonOil !== null) {
      const level = index * valuePerBall;
      if (level < this.dataAgg[category]) {
        return opacity;
      } else {
        let valueToSearch;
        if (index === 1) {
          valueToSearch = this.dataAgg[category];
        } else {
          const levelBefore = (index - 1) * valuePerBall;
          if (levelBefore < this.dataAgg[category]) {
            valueToSearch = this.dataAgg[category] - levelBefore;
          } else {
            return 0;
          }
        }
        for (let i = intervals; i >= 1; i--) {
          if ((valuePerBall / i) >= valueToSearch) {
            return opacity / i;
          }
        }
      }
    }
    return 0;
  }

  private sumCategories(data) {
    this.aggValueOil = 0;
    this.aggValueNonOil = 0;
    for (const t of TransactionCategories) {
      if (TransactionOilCategories.indexOf(t) >= 0) {
        this.aggValueOil += data[t];
      } else {
        this.aggValueNonOil += data[t];
      }
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
