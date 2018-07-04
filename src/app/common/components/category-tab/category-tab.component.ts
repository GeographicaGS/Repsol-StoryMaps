import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { UtilService, CounterDuration, CounterStep, TransactionCategories, TransactionOilCategories } from '../..';

@Component({
  selector: 'app-category-tab',
  templateUrl: './category-tab.component.html',
  styleUrls: ['./category-tab.component.scss']
})
export class CategoryTabComponent implements OnInit, OnDestroy {

  // @Input() maxOil: number = null;
  @Input() maxOil: number = null;
  @Input() maxNonOil: number = null;
  @Input() dataAgg: any = null;
  @Input()
  set observableData(observable) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = observable.subscribe((data) => {
      // TODO El restartAgg no se debe mirar por el current frame porque da problemas si pegamos saltos en el histograma
      this.restartAgg = this.currentFrame !== null || this.currentFrame > data.time_seq;
      this.currentFrame = data.time_seq;
      if (this.dataAgg !== null) {
        this.sumCategories(this.dataAgg);
        if (this.maxOil) {
          this.valuePerOilBall = this.maxOil / this.totalCircles.length;
          this.valuePerNonOilBall = this.maxNonOil / this.totalCircles.length;
          this.ref.detectChanges();
        }
      }
    });
  }

  totalCircles = Array(16);
  subscription: Subscription;
  currentFrame: number = null;
  valuePerOilBall: number;
  valuePerNonOilBall: number;
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
