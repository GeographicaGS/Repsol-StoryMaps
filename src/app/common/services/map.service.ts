import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as carto from '../../../assets/lib/carto-vl.js';
import * as mapboxgl from '@carto/mapbox-gl';
import { environment } from '../../../environments/environment';

declare var cartodb: any;

@Injectable()
export class MapService {

  private map = new BehaviorSubject<any>(null);
  map$ = this.map.asObservable();

  lensMap = new BehaviorSubject<any>(null);
  lensMap$ = this.map.asObservable();

  constructor() {
    carto.setDefaultAuth({
      user: environment.cartoUser,
      apiKey: 'default_public'
    });
  }

  setMap(map) {
    this.map.next(map);
  }

  setLensMap(map) {
    this.lensMap.next(map);
  }

  setBbox(bbox, lensMap = false) {
    const map = lensMap ? this.lensMap.getValue() : this.map.getValue();
    map.fitBounds(bbox, {duration: 0});
  }

  addLayer(config, lensMap = false) {
    const map = lensMap ? this.lensMap.getValue() : this.map.getValue();
    config.cartoLayer = new carto.Layer(config.id, config.source, config.viz);
    config.cartoLayer.addTo(map, 'watername_ocean');
  }

  addMapboxLayer(config, lensMap = false) {
    const map = lensMap ? this.lensMap.getValue() : this.map.getValue();
    cartodb.Tiles.getTiles(config.cartoOptions, (result, err) => {
      const tiles = result.tiles.map((tileUrl) => {
        return tileUrl.replace('{s}', 'a').replace(/\.png/, '.mvt');
      });
      map.addSource(config.idSource, { type: 'vector', tiles: tiles });
      map.addLayer(config.layerOptions);
    });
  }

  setMapboxLayoutProperty(layer, name, value, lensMap = false) {
    const map = lensMap ? this.lensMap.getValue() : this.map.getValue();
    map.setLayoutProperty(layer, name, value);
  }

  addCustomMarker(marker, lensMap = false) {
    const map = lensMap ? this.lensMap.getValue() : this.map.getValue();
    return new mapboxgl.Marker(marker).setLngLat([0, 0]).addTo(map);
  }

}
