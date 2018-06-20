import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { UtilService, MapService, TransactionCategories } from '../../../common';
import { environment } from '../../../../environments/environment';
import * as CartoDB from 'cartodb';
import { Subscription } from 'rxjs/Subscription';
import { TransactionsLayer, CounterDuration, CounterStep } from '../../../common';
import { StoryMapService } from '../story-map.service';

@Component({
  selector: 'app-story-map',
  templateUrl: './story-map.component.html',
  styleUrls: ['./story-map.component.scss']
})
export class StoryMapComponent implements OnInit, OnDestroy {

  subscription: Subscription;

  bbox = [[
    -10.0634765625,
    35.817813158696616
  ], [
    3.515625,
    43.77109381775651
  ]];

  mapReady = false;
  data = [];
  minFrame: number = null;
  maxFrame: number = null;
  currentFrame: number = null;
  limits = { min: null, max: null};
  transactionsLayer: TransactionsLayer;
  interval: any;
  totalValue = 0;
  beforeTotalValue = 0;

  counterDuration = CounterDuration;
  counterStep = CounterStep;

  constructor(
    private zone: NgZone,
    private ref: ChangeDetectorRef,
    private utilService: UtilService,
    private mapService: MapService,
    private storyMapService: StoryMapService
  ) {
  }

  ngOnInit() {
    this.subscription = this.mapService.map$.subscribe((map) => {
      if (map) {
        this.mapReady = true;
        const sql = new CartoDB.SQL({user: environment.cartoUser});
        sql.execute(`
          select cost_diesel, cost_gasoline, cost_shop, cost_wash, start, time_seq from repsol_transact_summary_agg order by start`
        )
        .done((data) => {
          this.processData(data);
          this.transactionsLayer = new TransactionsLayer();
          this.mapService.addLayer(this.transactionsLayer);
          this.transactionsLayer.cartoLayer.on('loaded', () => {
            this.frameChanged(this.currentFrame);
            this.zone.runOutsideAngular(() => {
              this.interval = setInterval(() => {
                this.currentFrame ++;
                if (this.currentFrame > this.maxFrame) {
                  this.currentFrame = this.minFrame;
                }
                this.frameChanged(this.currentFrame);
              }, 2500);
            });
          });
        });
      }
    });
  }

  private processData(data) {
    this.data = data.rows;
    const dailyAgg = {};
    for (const d of this.data) {
      if (this.minFrame === null || d.time_seq < this.minFrame) {
        this.minFrame = d.time_seq;
      }
      if (this.maxFrame === null || d.time_seq > this.maxFrame) {
        this.maxFrame = d.time_seq;
      }

      // Aggregate data by day for get max and min value
      const date = d.start.split('T')[0];
      if (dailyAgg[date] === undefined) {
        dailyAgg[date] = {};
      }
      for (const t of TransactionCategories) {
        if (dailyAgg[date][t] === undefined) {
          dailyAgg[date][t] = 0;
        }
        dailyAgg[date][t] += d[t];
      }
    }
    for (const key of Object.keys(dailyAgg)) {
      if (dailyAgg[key]) {
        for (const t of TransactionCategories) {
          if (this.limits.min === null || dailyAgg[key][t] < this.limits.min) {
            this.limits.min = dailyAgg[key][t];
          }
          if (this.limits.max === null || dailyAgg[key][t] > this.limits.max) {
            this.limits.max = dailyAgg[key][t];
          }
        }
      }
    }
    this.currentFrame = this.minFrame;
  }

  private frameChanged(frame) {
    const currentData = this.data.find(d => d.time_seq === frame);
    if (frame === 1) {
      this.beforeTotalValue = 0;
      this.totalValue = 0;
    } else {
      this.beforeTotalValue = this.totalValue;
      for (const t of TransactionCategories) {
        this.totalValue += currentData[t];
      }
    }
    this.transactionsLayer.setFrame(this.currentFrame);
    this.storyMapService.setCurrentData(currentData);
    this.ref.detectChanges();
  }

  ngOnDestroy() {
    this.mapService.setMap(null);
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

}
