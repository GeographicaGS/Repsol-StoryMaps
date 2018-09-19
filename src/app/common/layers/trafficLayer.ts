import * as carto from '../../../assets/lib/carto-vl.js';
import { environment } from '../../../environments/environment';
import { Layer } from './layer';

export class TrafficLayer extends Layer {

  id = 'traffic';
  detailMode: boolean;

  get source() {
    return new carto.source.SQL(`
      select cartodb_id, the_geom, the_geom_webmercator, time_seq, value
      from ${this.detailMode ? 'repsol_traffic_1h_detailed' : 'repsol_traffic_1h' }
    `);
  }

  constructor(detailMode = false) {
    super();
    this.detailMode = detailMode;
    this.viz = new carto.Viz(`
      @torque: torque($time_seq, 84, fade(0.5, 0.75))
      width: ramp(
        buckets($value, [0.25, 0.5, 0.75, 1]),
        ${this.detailMode ? '[3, 3, 3, 5]' : '[1.5, 1.5, 1.5, 3]'}
      ),
      color: ramp(
        buckets($value, [0.25, 0.5, 0.75, 1]),
        [opacity(#6A972C, 0.8), opacity(#FFB81C,0.8), opacity(#e67600, 1), opacity(#E40028, 1)]
      )
      filter: @torque
    `);
  }

}
