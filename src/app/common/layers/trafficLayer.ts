import * as carto from '../../../assets/lib/carto-vl.js';
import { environment } from '../../../environments/environment';
import { Layer } from './layer';

export class TrafficLayer extends Layer {

  id = 'traffic';

  source = new carto.source.SQL(`
    select cartodb_id, the_geom, the_geom_webmercator, time_seq, value from repsol_traffic_1h
  `);

  viz = new carto.Viz(`
    @torque: torque($time_seq, 84, fade(0.5, 0.75))
    width: 2,
    color: ramp(linear($value, 0, 1), TEMPS)
    filter: @torque
  `);


}
