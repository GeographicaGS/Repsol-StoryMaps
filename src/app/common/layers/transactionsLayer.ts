import * as carto from '../../../assets/lib/carto-vl.js';
import { environment } from '../../../environments/environment';
import { Layer } from './layer';

export class TransactionsLayer extends Layer {

  id = 'transactions';

  source = new carto.source.SQL(`
    select cartodb_id, the_geom, the_geom_webmercator, max_category,
      start, cod_st, tot_cost, time_seq from repsol_transact_st_agg_1h
  `);

  viz = new carto.Viz(`
    @torque: torque($time_seq, 84, fade(0.25, 0.25))
    width:  @torque * 50*sqrt($tot_cost)/sqrt(viewportMax($tot_cost))
    color: ramp(
      buckets($max_category, ['cost_diesel', 'cost_gasoline', 'cost_shop', 'cost_wash']),
      [opacity(#FFB81C, 0.3), opacity(#E40028, 0.6), opacity(#9C9081, 0.8), opacity(#4A90E2, 0.8)]
    )
    strokeWidth: 0
  `);

}
