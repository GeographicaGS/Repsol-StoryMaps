import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-geo-logo',
  templateUrl: './geo-logo.component.html',
  styleUrls: ['./geo-logo.component.scss']
})
export class GeoLogoComponent implements OnInit {

  @Input() geoHeight: String;

  constructor() { }

  ngOnInit() {
  }

}
