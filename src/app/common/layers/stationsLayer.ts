import * as carto from '../../../assets/lib/carto-vl.js';
import { environment } from '../../../environments/environment';
import { Layer } from './layer';

export class StationsLayer extends Layer {

  id = 'stations';

  source = new carto.source.SQL(`SELECT
    cartodb_id,
    the_geom,
    the_geom_webmercator,
    cod_establecimiento_sr,
    des_establecimiento_sr,
    dscr_provincia,
    localidad,
    direccion,
    dscr_localizacion,
    dscr_marca
    FROM repsol_stations_points where dscr_marca='REPSOL'`);

  // viz = new carto.Viz(`
  //   filter: false
  // `);
  viz = new carto.Viz(`
    @id: "-1"
    width: 13
    symbol: sprite('/assets/cartografia/repsol-icon-alt.svg')
    filter: neq($cod_establecimiento_sr, var('id'))
  `);

  setMainStation(st_id: string) {
    const s = carto.expressions;
    this.viz.filter.blendTo(s.neq(s.prop('cod_establecimiento_sr'), st_id));
    // this.viz = new carto.Viz(`
    //   width: eq($cod_establecimiento_sr,'${st_id}') * 32 + neq($cod_establecimiento_sr,'${st_id}') * 13
    //   symbol: ramp(
    //     buckets($cod_establecimiento_sr, ['${st_id}']),
    //     sprites([sprite('/assets/cartografia/marker-repsol-sel-alt.svg'), sprite('/assets/cartografia/repsol-icon-alt.svg')])
    //   )
    // `);
    // this.cartoLayer.blendToViz(this.viz, 500);
  }
}
