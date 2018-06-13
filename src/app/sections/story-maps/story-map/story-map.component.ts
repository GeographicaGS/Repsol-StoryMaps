import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-story-map',
  templateUrl: './story-map.component.html',
  styleUrls: ['./story-map.component.scss']
})
export class StoryMapComponent implements OnInit {

  bbox = [[
    -10.0634765625,
    35.817813158696616
  ], [
    3.515625,
    43.77109381775651
  ]];

  constructor() { }

  ngOnInit() {
  }

}
