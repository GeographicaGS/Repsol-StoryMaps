import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as mapboxgl from '@carto/mapbox-gl';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  @ViewChild('map') map;
  @Input() bbox;
  @Input() lens = false;
  @Input('class') class: string;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeMapLens();
  }

  constructor(
    private elRef: ElementRef
  ) {
  }

  ngOnInit() {
    this.resizeMapLens();
    const map = new mapboxgl.Map({
      container: this.map.nativeElement,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    });
    if (this.bbox) {
      map.fitBounds(this.bbox);
    }
  }

  private resizeMapLens() {
    if (this.class && this.class.indexOf('lens') >= 0) {
      this.elRef.nativeElement.style.height = `${this.elRef.nativeElement.offsetWidth}px`;
    }
  }

}
