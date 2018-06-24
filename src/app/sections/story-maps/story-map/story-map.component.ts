import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { UtilService, MapService, TransactionCategories } from '../../../common';
import { environment } from '../../../../environments/environment';
import * as CartoDB from 'cartodb';
import { Subscription } from 'rxjs/Subscription';
import {
  TransactionsLayer,
  StationsLayer,
  CounterDuration,
  CounterStep,
  TransactionFrameDuration,
  TransactionStationsScenes,
  TransactionsRoutesLayer,
  MaxRoutingFrame
} from '../../../common';
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
  currentRoutingFrame = 0;
  limits = { min: null, max: null};
  transactionsLayer = new TransactionsLayer();
  // stationsMapboxLayer = new StationsMapboxLayer();
  stationsLayer = new StationsLayer();
  transactionsRoutesLayer = new TransactionsRoutesLayer({keepRoute: true});
  transactionsActiveRoutesLayer = new TransactionsRoutesLayer({keepRoute: false});
  totalLayersLoaded = 0;
  requestAnimationFrameId: number;
  totalValue = 0;

  transactStDetails: any = [];
  stationTitle: string;
  aggStDetail = 0;

  focusMarker: any;

  counterDuration = CounterDuration;
  counterStep = CounterStep;

  globalTimestampAnimation: number;
  routingTimestampAnimation: number;
  transactionRoutinDuration: number;

  constructor(
    private zone: NgZone,
    private ref: ChangeDetectorRef,
    private utilService: UtilService,
    private mapService: MapService,
    private storyMapService: StoryMapService
  ) {}

  ngOnInit() {
    this.subscription = this.mapService.map$.subscribe((map) => {
      if (map) {
        this.subscription.add(
          this.mapService.lensMap$.subscribe((lensMap) => {
            if (lensMap) {
              this.mapsLoaded();
            }
          })
        );
      }
    });
  }

  private createFocusMarker() {
    const el = document.createElement('div');
    el.className = 'focusMarker';
    this.focusMarker = this.mapService.addCustomMarker(el);
  }

  private mapsLoaded() {
    this.mapReady = true;
    this.createFocusMarker();
    new CartoDB.SQL({user: environment.cartoUser}).execute(`
      select cost_diesel, cost_gasoline, cost_shop, cost_wash, start, time_seq from repsol_transact_summary_agg order by start`
    )
    .done((data) => {
      this.processData(data);
      this.mapService.addLayer(this.transactionsLayer);
      // this.mapService.addMapboxLayer(this.stationsMapboxLayer, true);
      this.mapService.addLayer(this.stationsLayer, true);
      this.mapService.addLayer(this.transactionsRoutesLayer, true);
      this.mapService.addLayer(this.transactionsActiveRoutesLayer, true);

      this.transactionsLayer.cartoLayer.on('loaded', () => {
        this.transactionsLayer.viz.variables.torque.stop();
        this.totalLayersLoaded ++;
        this.checkAllLayersIsLoaded();
      });

      this.transactionsRoutesLayer.cartoLayer.on('loaded', () => {
        this.transactionsRoutesLayer.viz.variables.torque.stop();
        this.totalLayersLoaded ++;
        this.checkAllLayersIsLoaded();
      });

      this.transactionsActiveRoutesLayer.cartoLayer.on('loaded', () => {
        this.transactionsActiveRoutesLayer.viz.variables.torque.stop();
        this.totalLayersLoaded ++;
        this.checkAllLayersIsLoaded();
      });

      this.stationsLayer.cartoLayer.on('loaded', () => {
        this.totalLayersLoaded ++;
        this.checkAllLayersIsLoaded();
      });

    });
  }

  private checkAllLayersIsLoaded() {
    const totalLayersForWait = 4;
    if (this.totalLayersLoaded === totalLayersForWait) {

      this.frameChanged(this.currentFrame);

      this.zone.runOutsideAngular(() => {

        this.transactionRoutinDuration = ((this.data.length - 1) * TransactionFrameDuration) / MaxRoutingFrame;
        this.globalTimestampAnimation = new Date().getTime();
        this.routingTimestampAnimation = this.globalTimestampAnimation;
        this.requestAnimationFrameId = requestAnimationFrame(this.animate.bind(this));

      });
    }
  }

  private animate() {
    this.requestAnimationFrameId = requestAnimationFrame(this.animate.bind(this));

    const now = new Date().getTime(),
      globalDuration = now - this.globalTimestampAnimation,
      routingDuration = now - this.routingTimestampAnimation
    ;

    if (globalDuration >= 500) {
      this.transactionsLayer.viz.variables.torque.pause();
      // Correction factor
      this.transactionsLayer.viz.variables.torque.setSimProgress((1 / (this.maxFrame - 1)) * (this.currentFrame - 1));
    }
    if (globalDuration >= TransactionFrameDuration) {
      this.transactionsLayer.viz.variables.torque.play();
      this.globalTimestampAnimation = now - (globalDuration % TransactionFrameDuration);

      this.currentFrame ++;
      if (this.currentFrame > this.maxFrame) {
        this.currentFrame = this.minFrame;
      }
      this.frameChanged(this.currentFrame);

    }

    if (routingDuration >= this.transactionRoutinDuration) {
      const simProgress = (1 / MaxRoutingFrame) * this.currentRoutingFrame;

      this.routingTimestampAnimation = now - (routingDuration % this.transactionRoutinDuration);
      this.transactionsActiveRoutesLayer.viz.variables.torque.setSimProgress(simProgress);
      this.transactionsRoutesLayer.viz.variables.torque.setSimProgress(simProgress);
      this.currentRoutingFrame ++;
      if ((this.currentRoutingFrame > MaxRoutingFrame) || (this.currentFrame > this.maxFrame) || this.currentFrame === this.minFrame) {
        this.currentRoutingFrame = 0;
      }
    }

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
      this.totalValue = 0;
    }
    for (const t of TransactionCategories) {
      this.totalValue += currentData[t];
    }
    // this.transactionsLayer.setFrame(this.currentFrame);
    this.storyMapService.setCurrentData(currentData);

    const currentStationsScene = TransactionStationsScenes.find(t => t.frame === frame);
    if (currentStationsScene) {
      this.activeStationScene(currentStationsScene);
    }
    this.aggStDetail = this.getAggStDetail();
    this.ref.detectChanges();
  }

  private activeStationScene(scene) {
    this.stationTitle = scene.st_name;
    this.transactStDetails = [];
    new CartoDB.SQL({user: environment.cartoUser}).execute(`
      select time_seq, tot_cost from repsol_transact_st_detail
      where cod_establecimiento_sr = '${scene.st_id}' order by time_seq;
    `).done((data) => {
      this.transactStDetails = data.rows;
      this.aggStDetail = this.getAggStDetail();
    });
    this.focusMarker.setLngLat(scene.centroid);
    this.mapService.setBbox(scene.bbox, true);
    this.stationsLayer.setMainStation(scene.st_id);
    // this.mapService.setMapboxLayoutProperty(
    //   this.stationsMapboxLayer.id, 'icon-image', this.stationsMapboxLayer.getLayoutIconImage(scene.st_id), true
    // );
    // this.mapService.setMapboxLayoutProperty(
    //   this.stationsMapboxLayer.id, 'icon-size', this.stationsMapboxLayer.getLayoutIconSize(scene.st_id), true
    // );
  }

  private getAggStDetail() {
    // this.beforeAggStDetail = this.aggStDetail;
    let result = 0;
    for (const t of this.transactStDetails) {
      if (t.time_seq > this.currentFrame) {
        return result;
      }
      result += t.tot_cost;
    }
    return result;
  }

  ngOnDestroy() {
    this.mapService.setMap(null);
    if (this.requestAnimationFrameId) {
      cancelAnimationFrame(this.requestAnimationFrameId);
    }
    // if (this.mainInterval) {
    //   clearInterval(this.mainInterval);
    // }
    // if (this.routingInterval) {
    //   clearInterval(this.routingInterval);
    // }
  }

}
