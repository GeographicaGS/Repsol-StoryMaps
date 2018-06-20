import * as carto from '@carto/carto-vl/dist/carto-vl.js';
import { environment } from '../../../environments/environment';

export class StationsLayer {

  idSource = 'stations_source';
  id = 'stations';

  cartoOptions = {
    user_name: environment.cartoUser,
    https: true,
    sublayers: [
      {
        sql: `SELECT
          cartodb_id,
          the_geom_webmercator,
          cod_establecimiento_sr,
          des_establecimiento_sr,
          dscr_provincia,
          localidad,
          direccion,
          dscr_localizacion,
          dscr_marca
          FROM repsol_stations_points where dscr_marca='REPSOL'`,
        cartocss: '{}',
      }
    ]
  };

  layerOptions = {
    id: this.id,
    type: 'symbol',
    source: this.idSource,
    'source-layer': 'layer0',
    layout: {
      'icon-image': 'repsol-icon-alt',
      // 'icon-image': [
      //   'match',
      //   ['get', 'cartodb_id'],
      //   1, 'marker-repsol-sel-alt.svg',
      //   'repsol-icon-alt'
      // ],
      'icon-allow-overlap': true,
      'icon-size': 0.25
    }
    // ,
    // 'filter': [
    //   '==',
    //   'cod_establecimiento_sr',
    //   '183122514'
    // ]
  };

  getLayoutIconImage(st_id) {
    return [
      'match',
      ['get', 'cod_establecimiento_sr'],
      st_id, 'marker-repsol-sel-alt',
      'repsol-icon-alt'
    ];
  }

  getLayoutIconSize(st_id) {
    return [
      'match',
      ['get', 'cod_establecimiento_sr'],
      st_id, 1,
      0.4
    ];
  }

}
