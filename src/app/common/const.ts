export const TransactionCategories = [
  'cost_diesel', 'cost_gasoline', 'cost_shop', 'cost_wash'
];

export const TransactionOilCategories = [
  TransactionCategories[0], TransactionCategories[1],
];

export const TransactionNonOilCategories = [
  TransactionCategories[2], TransactionCategories[3],
];

export const TransactionFrameDuration = 2000;

export const CounterDuration = 0.25;
export const CounterStep = 100;

export const TransactionStationsScenes = [
  {
    frame: 1,
    // centroid: [-3.7579165, 40.470155],
    centroid: [-3.7579165, 40.461055],
    bbox: [
      -3.844712,
      40.419535,
      -3.661721,
      40.500775
    ],
    st_id: '063237572',
    st_name: 'Hipódromo',
    st_address: 'Carretera A-6, Km 8, MADRID',
    image: 'hipodromo_station.png'
  }
];

export const MaxRoutingFrame = 1008;
