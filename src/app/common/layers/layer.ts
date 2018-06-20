import * as carto from '@carto/carto-vl/dist/carto-vl.js';

export class Layer {
  id: string;
  cartoLayer: carto.Layer;
  source: carto.source;
  viz: carto.Viz;
}
