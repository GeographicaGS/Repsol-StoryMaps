import * as carto from '../../../assets/lib/carto-vl.js';
import { environment } from '../../../environments/environment';
import { Layer } from './layer';

export class TransactionsRoutesLayer extends Layer {

  source = new carto.source.SQL(`
    select * from repsol_transact_st_routes where the_geom is not null and true
  `);

  constructor (options) {
    super();
    if (options.keepRoute) {
      this.id = 'transactions_keep_routes';
      this.viz = new carto.Viz(`
        @torque: torque($time_seq, 210, fade(0, 10000))
        width: 3
        strokeWidth: 0
        color: opacity(#F5A712, 0.3)
        filter: @torque
      `);

    } else {
      this.id = 'transactions_routes';
      this.viz = new carto.Viz(`
        @torque: torque($time_seq, 210, fade(0,0.15))
        width: 6
        strokeWidth: 0
        color: #DF1733
        filter: @torque
      `);
    }
  }

}
