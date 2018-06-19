import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as mapboxgl from '@carto/mapbox-gl';
import { MapService } from '../';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit,  AfterViewInit {

  @ViewChild('map') map;
  @ViewChild('mapLens') mapLens;
  @Input('navigationControl') navigationControl = false;
  @Input() bbox;
  @Input() lens = false;
  @Input('class') class: string;

  lensAnimate = false;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeMapLens();
  }

  constructor(
    private elRef: ElementRef,
    private mapService: MapService
  ) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.resizeMapLens();
    const map = new mapboxgl.Map({
      container: this.map.nativeElement,
      // style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      style: '/assets/mapstyle/style.json',
      attributionControl: false
    });
    if (this.navigationControl) {
      const nav = new mapboxgl.NavigationControl({showCompass: false});
      map.addControl(nav, 'bottom-left');
    }
    map.on('load', () => {
      if (this.bbox) {
        map.fitBounds(this.bbox,
          {
            padding: {top: 20, bottom: 0, left: 250, right: (this.lens ? this.mapLens.elRef.nativeElement.offsetWidth - 70 : 0)},
            duration: 1500
        });
        if (!this.isLens()) {
          setTimeout(() => {
            this.lensAnimate = true;
          }, 500);

          setTimeout(() => {
            // Carto bug
            map.isStyleLoaded = () => true ;
            this.mapService.setMap(map);
          }, 1500);
        }

      } else {
        if (!this.isLens()) {
          this.mapService.setMap(map);
        }
      }
    });
  }

  private resizeMapLens() {
    if (this.isLens()) {
      this.elRef.nativeElement.style.height = `${this.elRef.nativeElement.offsetWidth}px`;
    }
  }

  private isLens() {
    return this.class && this.class.indexOf('lens') >= 0;
  }

}
