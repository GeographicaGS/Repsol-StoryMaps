import * as carto from '../../../assets/lib/carto-vl.js';
import { environment } from '../../../environments/environment';
import { Layer } from './layer';

export class TransactionsStationLayer extends Layer {

  id = 'transactions_by_station';
  stationId: string;

  get source() {
    return new carto.source.SQL(`
      select cartodb_id, cod_establecimiento_sr, the_geom, the_geom_webmercator, time_seq, cost_diesel from repsol_transact_st_detail_1h
      where the_geom is not null order by time_seq
    `);
  }

  viz = new carto.Viz(`
    @torque: torque($time_seq, 84, fade(0.25, 0.25))
    width:  20
    color: red
    strokeWidth: 0
  `);

  setStation(st_id: string) {
    const s = carto.expressions;
    // this.viz = new carto.Viz(`
    //   @torque: torque($time_seq, 84, fade(0.25, 0.25))
    //   @cod_establecimiento_sr: "${st_id}"
    //   width: @torque * 50*sqrt($cost_diesel)/sqrt(viewportMax($cost_diesel))
    //   color: opacity(#FFB81C, 0.3)
    //   strokeWidth: 0
    //   filter: eq($cod_establecimiento_sr, var('cod_establecimiento_sr'))
    // `);
    // this.viz.filter.blendTo(`eq($cod_establecimiento_sr, 'aaaaa')`);
    // this.viz.color.blendTo(s.width(40), 50);
    // this.cartoLayer.blendToViz(this.viz, 0);
  }

}
