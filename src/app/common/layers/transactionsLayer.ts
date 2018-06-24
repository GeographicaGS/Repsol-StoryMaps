import * as carto from '../../../assets/lib/carto-vl.js';
import { environment } from '../../../environments/environment';
import { Layer } from './layer';

export class TransactionsLayer extends Layer {

  id = 'transactions';

  source = new carto.source.SQL(`
    select cartodb_id, the_geom, the_geom_webmercator, max_category,
      start, cod_st, tot_cost, time_seq from repsol_transact_st_agg
  `);

  viz = new carto.Viz(`
    @torque: torque($time_seq, 42, fade(0.25, 0.25))
    width:  @torque * 50*sqrt($tot_cost)/sqrt(viewportMax($tot_cost))
    color: ramp(
      buckets($max_category, ['cost_diesel', 'cost_gasoline', 'cost_shop', 'cost_wash']),
      [opacity(#50E3C2, 0.3), opacity(#F5A712, 0.3), opacity(#4A90E2, 0.3), opacity(#FA00FF, 0.3)]
    )
    strokeWidth: 0
  `);

}
