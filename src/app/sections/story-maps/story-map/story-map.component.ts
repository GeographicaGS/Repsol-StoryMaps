import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { UtilService, MapService, TransactionCategories, TransactionOilCategories, TransactionNonOilCategories } from '../../../common';
import { HistogramComponent } from '../../../common/components/histogram/histogram.component';
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
  DieselTransactionsStationLayer,
  GasolineTransactionsStationLayer,
  ShopTransactionsStationLayer,
  WashTransactionsStationLayer,
  TrafficLayer,
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

  @ViewChild('stationPopupEl', { read: ElementRef }) stationPopupEl: ElementRef;
  @ViewChild('histogram') histogram: HistogramComponent;
  stationData = {
    sun: false,
    temp: 0,
    listWaylet: [],
    percWaylet: 0,
    costWaylet: 0,
    sales: 0,
    liters: 0,
    transactions: 0,
    incidences: 0,
    quality: 0,
    name: null,
    image: '',
    address: null
  };
  stationPopup: any;

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
  limits = {oil: { min: null, max: null }, nonOil: {min: null, max: null}};
  transactionsLayer = new TransactionsLayer();
  // stationsMapboxLayer = new StationsMapboxLayer();
  stationsLayer = new StationsLayer();
  dieselTransactionsStationLayer = new DieselTransactionsStationLayer();
  gasolineTransactionsStationLayer = new GasolineTransactionsStationLayer();
  shopTransactionsStationLayer = new ShopTransactionsStationLayer();
  washTransactionsStationLayer = new WashTransactionsStationLayer();
  transactionsStationLayers = [
    this.gasolineTransactionsStationLayer,
    this.dieselTransactionsStationLayer,
    this.shopTransactionsStationLayer,
    this.washTransactionsStationLayer
  ];
  trafficLayer = new TrafficLayer();
  trafficLayerDetail = new TrafficLayer(true);
  totalLayersLoaded = 0;
  requestAnimationFrameId: number;

  accumulatedDaily = {
    l_waylet: 0,
    l_waylet_perc: 0,
    transact_waylet: 0,
    transact_waylet_perc: 0,
    perc_waylet: 0,
    cost_waylet: 0,
    totalSales: 0,
    liters: 0,
    transactionsNumber: 0,
    quality: 0,
    tot_incid: 0,
    cost_diesel: 0,
    cost_gasoline: 0,
    cost_shop: 0,
    cost_wash: 0
  };

  salesComparedPreviousDay: number = null;
  litersComparedPreviousDay: number = null;
  transactionsComparedPreviousDay: number = null;
  qualityComparedPreviousDay: number = null;
  incidencesComparedPreviousDay: number = null;

  transactStDetails: any = [];

  focusMarker: any;

  counterDuration = CounterDuration;
  counterStep = CounterStep;

  globalTimestampAnimation: number;
  routingTimestampAnimation: number;
  transactionRoutinDuration: number;

  sqlClient = new CartoDB.SQL({user: environment.cartoUser});

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
    this.sqlClient.execute(`
      select
        cost_waylet, transact_waylet, l_waylet,
        cost_diesel, cost_gasoline, cost_shop, cost_wash, start, tot_transact, tot_l, avg_e3, tot_incid, time_seq
      from repsol_transact_summary_agg_1h order by start`
    )
    .done((data) => {
      this.processData(data);
      this.mapService.addLayer(this.trafficLayer);
      this.mapService.addLayer(this.transactionsLayer);
      // this.mapService.addMapboxLayer(this.stationsMapboxLayer, true);
      // this.mapService.addLayer(this.transactionsRoutesLayer, true);
      // this.mapService.addLayer(this.transactionsActiveRoutesLayer, true);

      this.mapService.addLayer(this.trafficLayerDetail, true);
      for (const t of this.transactionsStationLayers) {
        this.mapService.addLayer(t, true);
      }
      this.mapService.addLayer(this.stationsLayer, true);

      this.transactionsLayer.cartoLayer.on('loaded', () => {
        this.transactionsLayer.viz.variables.torque.stop();
        this.totalLayersLoaded ++;
        this.checkAllLayersIsLoaded();
      });

      // this.transactionsRoutesLayer.cartoLayer.on('loaded', () => {
      //   this.transactionsRoutesLayer.viz.variables.torque.stop();
      //   this.totalLayersLoaded ++;
      //   this.checkAllLayersIsLoaded();
      // });

      // this.transactionsActiveRoutesLayer.cartoLayer.on('loaded', () => {
      //   this.transactionsActiveRoutesLayer.viz.variables.torque.stop();
      //   this.totalLayersLoaded ++;
      //   this.checkAllLayersIsLoaded();
      // });

      this.stationsLayer.cartoLayer.on('loaded', () => {
        this.totalLayersLoaded ++;
        this.checkAllLayersIsLoaded();
      });
      this.dieselTransactionsStationLayer.cartoLayer.on('loaded', () => {
        this.dieselTransactionsStationLayer.viz.variables.torque.stop();
        this.totalLayersLoaded ++;
        this.checkAllLayersIsLoaded();
      });

      this.gasolineTransactionsStationLayer.cartoLayer.on('loaded', () => {
        this.gasolineTransactionsStationLayer.viz.variables.torque.stop();
        this.totalLayersLoaded ++;
        this.checkAllLayersIsLoaded();
      });
      this.shopTransactionsStationLayer.cartoLayer.on('loaded', () => {
        this.shopTransactionsStationLayer.viz.variables.torque.stop();
        this.totalLayersLoaded ++;
        this.checkAllLayersIsLoaded();
      });
      this.washTransactionsStationLayer.cartoLayer.on('loaded', () => {
        this.washTransactionsStationLayer.viz.variables.torque.stop();
        this.totalLayersLoaded ++;
        this.checkAllLayersIsLoaded();
      });
      this.trafficLayer.cartoLayer.on('loaded', () => {
        this.trafficLayer.viz.variables.torque.stop();
        this.totalLayersLoaded ++;
        this.checkAllLayersIsLoaded();
      });
      this.trafficLayerDetail.cartoLayer.on('loaded', () => {
        this.trafficLayerDetail.viz.variables.torque.stop();
        this.totalLayersLoaded ++;
        this.checkAllLayersIsLoaded();
      });

    });
  }

  private checkAllLayersIsLoaded() {
    const totalLayersForWait = 8;
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
      this.pauseAllLayers();
      this.layersCorrectionFactor();
    }

    if (globalDuration >= TransactionFrameDuration) {
      this.playAllLayers();

      this.globalTimestampAnimation = now - (globalDuration % TransactionFrameDuration);

      this.currentFrame ++;
      if (this.currentFrame > this.maxFrame) {
        this.currentFrame = this.minFrame;
      }
      this.frameChanged(this.currentFrame);
    }
    // if (routingDuration >= this.transactionRoutinDuration) {
    //   const simProgress = (1 / MaxRoutingFrame) * this.currentRoutingFrame;
    //
    //   this.routingTimestampAnimation = now - (routingDuration % this.transactionRoutinDuration);
    //   this.transactionsActiveRoutesLayer.viz.variables.torque.setSimProgress(simProgress);
    //   this.transactionsRoutesLayer.viz.variables.torque.setSimProgress(simProgress);
    //   this.currentRoutingFrame ++;
    //   if ((this.currentRoutingFrame > MaxRoutingFrame) || (this.currentFrame > this.maxFrame) || this.currentFrame === this.minFrame) {
    //     this.currentRoutingFrame = 0;
    //   }
    // }
  }

  private pauseAllLayers() {
    this.transactionsLayer.viz.variables.torque.pause();
    this.trafficLayer.viz.variables.torque.pause();
    this.trafficLayerDetail.viz.variables.torque.pause();
    for (const t of this.transactionsStationLayers) {
      t.viz.variables.torque.pause();
    }
  }

  private playAllLayers() {
    this.transactionsLayer.viz.variables.torque.play();
    this.trafficLayer.viz.variables.torque.play();
    this.trafficLayerDetail.viz.variables.torque.play();
    for (const t of this.transactionsStationLayers) {
      t.viz.variables.torque.play();
    }
  }

  private layersCorrectionFactor() {
    this.transactionsLayer.viz.variables.torque.setSimProgress((1 / (this.maxFrame - 1)) * (this.currentFrame - 1));
    this.trafficLayer.viz.variables.torque.setSimProgress((1 / (this.maxFrame - 1)) * (this.currentFrame - 1));
    this.trafficLayerDetail.viz.variables.torque.setSimProgress((1 / (this.maxFrame - 1)) * (this.currentFrame - 1));
    for (const t of this.transactionsStationLayers) {
      t.viz.variables.torque.setSimProgress((1 / (this.maxFrame - 1)) * (this.currentFrame - 1));
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

      // Save date as Object
      d.start = new Date(d.start);
    }
    for (const key of Object.keys(dailyAgg)) {
      for (const t of TransactionCategories) {
        if (TransactionOilCategories.indexOf(t) >= 0) {
          if (
            this.limits.oil.min === null || dailyAgg[key][t] < this.limits.oil.min) {
            this.limits.oil.min = dailyAgg[key][t];
          }
          if (
            this.limits.oil.max === null || dailyAgg[key][t] > this.limits.oil.max) {
            this.limits.oil.max = dailyAgg[key][t];
          }
        } else {
          if (this.limits.nonOil.min === null || dailyAgg[key][t] < this.limits.nonOil.min) {
            this.limits.nonOil.min = dailyAgg[key][t];
          }
          if (
            this.limits.nonOil.max === null || dailyAgg[key][t] > this.limits.nonOil.max) {
            this.limits.nonOil.max = dailyAgg[key][t];
          }
        }
      }
    }
    this.currentFrame = this.minFrame;
  }

  private frameChanged(frame) {
    const currentData = this.data.find(d => d.time_seq === frame),
      previousData = this.getDataPreviousDay(currentData.start)
    ;

    let totalSalesCurrentData = 0;

    for (const t of TransactionCategories) {
      totalSalesCurrentData += currentData[t];
    }

    this.salesComparedPreviousDay = this.getDataComparedPreviousDay(previousData, totalSalesCurrentData, 'oil');
    this.litersComparedPreviousDay = this.getDataComparedPreviousDay(previousData, currentData.tot_l, 'tot_l');
    this.transactionsComparedPreviousDay = this.getDataComparedPreviousDay(previousData, currentData.tot_transact, 'tot_transact');
    this.qualityComparedPreviousDay = this.getDataComparedPreviousDay(previousData, currentData.avg_e3, 'avg_e3');
    this.incidencesComparedPreviousDay = this.getDataComparedPreviousDay(previousData, currentData.avg_e3, 'tot_incid');

    this.getAccumulatedDaily(this.utilService.getBeginningOfDay(currentData.start), currentData.start);
    this.accumulatedDaily.quality = currentData.avg_e3;

    this.storyMapService.setCurrentData(currentData);

    const currentStationsScene = TransactionStationsScenes.find(t => t.frame === frame);
    if (currentStationsScene) {
      this.activeStationScene(currentStationsScene);
    }
    this.processStationDetails();
    this.ref.detectChanges();
  }

  private getAccumulatedDaily(start, finish) {
    for (const key of Object.keys(this.accumulatedDaily)) {
      this.accumulatedDaily[key] = 0;
    }
    for (const d of this.data) {
      if (d.start > finish) {
        break;
      } else if (d.start >= start && d.start <= finish) {
        for (const t of TransactionCategories) {
          this.accumulatedDaily.totalSales += d[t];
          this.accumulatedDaily[t] += d[t];
        }
        this.accumulatedDaily.cost_waylet += d.cost_waylet || 0;
        this.accumulatedDaily.perc_waylet = 100 * (
          this.accumulatedDaily.cost_waylet / this.accumulatedDaily.totalSales
        );

        this.accumulatedDaily.l_waylet += d.l_waylet || 0;
        this.accumulatedDaily.l_waylet_perc = 100 * (
          this.accumulatedDaily.l_waylet / this.accumulatedDaily.liters
        );

        this.accumulatedDaily.transact_waylet += d.transact_waylet || 0;
        this.accumulatedDaily.transact_waylet_perc = 100 * (
          this.accumulatedDaily.transact_waylet / this.accumulatedDaily.transactionsNumber
        );

        this.accumulatedDaily.liters += d.tot_l;
        this.accumulatedDaily.transactionsNumber = d.tot_transact;
        this.accumulatedDaily.tot_incid += d.tot_incid;
      }
    }
  }

  private getDataPreviousDay(date) {
    const dateToSearch = new Date(date);
    dateToSearch.setDate(dateToSearch.getDate() - 1);
    // dateToSearch = <any>(dateToSearch.toISOString().split('.')[0] + 'Z');
    return this.data.find(d => d.start.getTime() === dateToSearch.getTime());
  }

  private getDataComparedPreviousDay(dataToSearch, currentValue, dataType) {
    if (dataToSearch) {
      let accumulated = 0;
      if (dataType === 'oil') {
        for (const t of TransactionCategories) {
          accumulated += dataToSearch[t];
        }
      } else {
        accumulated = dataToSearch[dataType];
      }
      return currentValue - accumulated;
    }
    return null;
  }

  private activeStationScene(scene) {
    this.stationData.name = scene.st_name;
    this.stationData.address = scene.st_address;
    this.stationData.image = scene.image;
    this.transactStDetails = [];
    this.sqlClient.execute(`
      select cost_waylet, id_waylet, nivel_waylet,
        sun, temp,
        time_seq, tot_cost, tot_l, tot_transact, avg_e3, tot_incid, start
      from repsol_transact_st_detail_1h
      where cod_establecimiento_sr = '${scene.st_id}' order by time_seq;
    `).done((data) => {
      this.transactStDetails = data.rows;
      for (const t of this.transactStDetails) {
        t.start = new Date(t.start);
      }
      this.processStationDetails();
    });
    this.focusMarker.setLngLat(scene.centroid);
    if (this.stationPopup) {
      this.stationPopup.remove();
    }
    this.stationPopup = this.mapService.addPopup(scene.centroid, this.stationPopupEl.nativeElement, true);
    this.mapService.setBbox(scene.bbox, true);
    this.stationsLayer.setMainStation(scene.st_id);
    for (const t of this.transactionsStationLayers) {
      t.setStation(scene.st_id);
    }
  }

  private processStationDetails() {
    const currentData = this.data.find(t => t.time_seq === this.currentFrame);
    this.stationData.costWaylet = 0;
    this.stationData.percWaylet = 0;
    this.stationData.sales = 0;
    this.stationData.liters = 0;
    this.stationData.transactions = 0;
    this.stationData.incidences = 0;
    this.stationData.quality = 0;
    this.stationData.temp = 0;

    if (currentData) {
      const currentDate = this.utilService.getBeginningOfDay(currentData.start);
      for (const t of this.transactStDetails) {
        if (t.time_seq > this.currentFrame) {
          break;
        } else if (t.start >= currentDate) {
          this.stationData.sales += t.tot_cost;
          this.stationData.liters += t.tot_l;
          this.stationData.transactions += t.tot_transact;
          this.stationData.incidences += t.tot_incid;
          this.stationData.quality = t.avg_e3;
          if (t.id_waylet) {
            this.stationData.listWaylet.unshift({
              level: t.nivel_waylet,
              amount: t.cost_waylet,
              id: t.id_waylet.replace('WY', ''),
              date: t.start
            });
            this.stationData.listWaylet.splice(5);
          }
          this.stationData.costWaylet += t.cost_waylet || 0;
          this.stationData.percWaylet = 100 * (this.stationData.costWaylet / this.stationData.sales);
          this.stationData.temp = t.temp;
          this.stationData.sun = t.sun;
        }
      }
    }
  }

  getCarouselPosition(minFrame, maxFrame) {
    const frame = this.currentFrame % 24;
    if (frame >= minFrame && frame <= maxFrame) {
      return '';
    } else if (frame === maxFrame + 1) {
      return 'after';
    }
    return 'before';
  }

  goToFrame(frame) {
    this.togglePause(true);
    this.currentFrame = frame;
    this.frameChanged(this.currentFrame);
    this.layersCorrectionFactor();
    if (!this.histogram.pause) {
      setTimeout(() => {
        this.togglePause(false);
      }, 1000);
    }
  }

  togglePause(p) {
    cancelAnimationFrame(this.requestAnimationFrameId);
    this.pauseAllLayers();
    this.layersCorrectionFactor();
    if (!p) {
      this.requestAnimationFrameId = requestAnimationFrame(this.animate.bind(this));
    }
  }

  ngOnDestroy() {
    this.mapService.setMap(null);
    if (this.requestAnimationFrameId) {
      cancelAnimationFrame(this.requestAnimationFrameId);
    }
  }

}
