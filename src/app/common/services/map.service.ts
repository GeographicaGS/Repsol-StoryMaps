import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as carto from '@carto/carto-vl/dist/carto-vl.js';
import { environment } from '../../../environments/environment';

@Injectable()
export class MapService {

  private map = new BehaviorSubject<any>(null);
  map$ = this.map.asObservable();

  constructor() {
    carto.setDefaultAuth({
      user: environment.cartoUser,
      apiKey: 'default_public'
    });
  }

  setMap(map) {
    this.map.next(map);
  }

  addLayer(config) {
    config.cartoLayer = new carto.Layer('layer', config.source, config.viz);
    config.cartoLayer.addTo(this.map.getValue(), 'watername_ocean');
  }

}
