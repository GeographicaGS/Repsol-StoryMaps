import * as carto from '@carto/carto-vl/dist/carto-vl.js';
import { environment } from '../../../environments/environment';

export class TransactionsLayer {

  cartoLayer: carto.Layer;

  source = new carto.source.SQL(`
    select cartodb_id, the_geom, the_geom_webmercator, max_category,
      start, cod_st, tot_cost, time_seq from repsol_transact_st_agg_4h
  `);

  viz = new carto.Viz(`
    width: 0
    color: ramp(
      buckets($max_category, ['cost_diesel', 'cost_gasoline', 'cost_shop', 'cost_wash']),
      [opacity(#50E3C2, 0.5), opacity(#F5A712, 0.5), opacity(#4A90E2, 0.5), opacity(#FA00FF, 0.5)]
    )
    strokeWidth: 0
  `);

  setFrame(frame: number) {
    this.viz = new carto.Viz(`
      width: eq($time_seq,${frame}) * 50*sqrt($tot_cost)/sqrt(viewportMax($tot_cost))
      color: ramp(
        buckets($max_category, ['cost_diesel', 'cost_gasoline', 'cost_shop', 'cost_wash']),
        [opacity(#50E3C2, 0.5), opacity(#F5A712, 0.5), opacity(#4A90E2, 0.5), opacity(#FA00FF, 0.5)]
      )
      strokeWidth: 0,
    `);
    this.cartoLayer.blendToViz(this.viz, 500);
  }
}


// filter: eq($time_seq,${frame})
