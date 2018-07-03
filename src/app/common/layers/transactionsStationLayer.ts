import * as carto from '../../../assets/lib/carto-vl.js';
import { environment } from '../../../environments/environment';
import { Layer } from './layer';

export class DieselTransactionsStationLayer extends Layer {

  id = 'transactions_by_station_diesel';
  variable = 'cost_diesel';
  color = 'opacity(#FFB81C, 0.3)';

  source = new carto.source.SQL(`
    select *
    from repsol_transact_st_detail_1h
    where the_geom is not null order by time_seq
  `);

  // Repeat Viz for Carto bug
  viz = new carto.Viz(`
    @torque: torque(linear($time_seq, 1, 168), 84, fade(0.25, 0.25))
    @id: "-1"
    width: @torque * 200*sqrt($${this.variable})/sqrt(viewportMax($tot_cost))
    color: ${this.color}
    strokeWidth: 0
    filter: eq($cod_establecimiento_sr, var('id'))
  `);

  setStation(st_id: string) {
    const s = carto.expressions;
    this.viz.filter.blendTo(carto.expressions.eq(s.prop('cod_establecimiento_sr'), st_id));
  }

}

export class GasolineTransactionsStationLayer extends DieselTransactionsStationLayer {
  id = 'transactions_by_station_gasoil';
  variable = 'cost_gasoline';
  color = 'opacity(#E40028, 0.3)';

  // Repeat Viz for Carto bug
  viz = new carto.Viz(`
    @torque: torque(linear($time_seq, 1, 168), 84, fade(0.25, 0.25))
    @id: "-1"
    width:  @torque * 200*sqrt($${this.variable})/sqrt(viewportMax($tot_cost)) + 0
    color: ${this.color}
    strokeWidth: 0
    filter: eq($cod_establecimiento_sr, var('id'))
  `);
}

export class ShopTransactionsStationLayer extends DieselTransactionsStationLayer {
  id = 'transactions_by_station_shop';
  variable = 'cost_shop';
  color = 'opacity(#9C9081, 0.8)';

  // Repeat Viz for Carto bug
  viz = new carto.Viz(`
    @torque: torque(linear($time_seq, 1, 168), 84, fade(0.25, 0.25))
    @id: "-1"
    width:  @torque * 200*sqrt($${this.variable})/sqrt(viewportMax($tot_cost)) + 0 + 0
    color: ${this.color}
    strokeWidth: 0
    filter: eq($cod_establecimiento_sr, var('id'))
  `);
}

export class WashTransactionsStationLayer extends DieselTransactionsStationLayer {
  id = 'transactions_by_station_wash';
  variable = 'cost_wash';
  color = 'opacity(#4A90E2, 0.8)';

  // Repeat Viz for Carto bug
  viz = new carto.Viz(`
    @torque: torque(linear($time_seq, 1, 168), 84, fade(0.25, 0.25))
    @id: "-1"
    width:  @torque * 200*sqrt($${this.variable})/sqrt(viewportMax($tot_cost)) + 0 + 0 + 0
    color: ${this.color}
    strokeWidth: 0
    filter: eq($cod_establecimiento_sr, var('id'))
  `);
}
