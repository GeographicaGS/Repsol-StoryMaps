import * as carto from '../../../assets/lib/carto-vl.js';
import { environment } from '../../../environments/environment';
import { Layer } from './layer';

export class TransactionsRoutesLayer extends Layer {

  id = 'transactions_routes';

  source = new carto.source.SQL(`
    select * from repsol_transact_st_routes where the_geom is not null and true
  `);

  viz = new carto.Viz(`
    width: 0
    strokeWidth: 0
  `);

  setFrame(frame: number) {
    this.viz = new carto.Viz(`
      width: ($time_seq < ${frame}) * 3 + ($time_seq == ${frame}) * 6
      strokeWidth: 0
      color: ($time_seq == ${frame}) * #DF1733 + ($time_seq < ${frame}) * opacity(#F5A712, 0.3)
    `);
    this.cartoLayer.blendToViz(this.viz, 0);
  }

}
