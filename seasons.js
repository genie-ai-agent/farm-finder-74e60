// Seasonal produce guide, Northern Hemisphere (temperate).
// Month index: 0 = January … 11 = December.
// Focuses on what's typically at farm stands / CSAs that month.

const SEASONS_NORTH = {
  0:  ['apples','pears','citrus','winter squash','kale','collards','cabbage','carrots','beets','turnips','potatoes','onions','leeks','shallots','stored garlic'],
  1:  ['citrus','apples','pears','winter squash','kale','collards','cabbage','carrots','beets','parsnips','potatoes','onions','leeks','sprouts'],
  2:  ['citrus','stored apples','leeks','chard','spinach','kale','carrots','parsnips','radishes','microgreens','maple syrup','early greens'],
  3:  ['asparagus','rhubarb','ramps','morels','spinach','arugula','radishes','peas','spring onions','chives','lettuce','microgreens'],
  4:  ['asparagus','rhubarb','strawberries','peas','fava beans','lettuce','spinach','arugula','radishes','spring onions','herbs','baby carrots'],
  5:  ['strawberries','cherries','blueberries','peas','fava beans','zucchini','summer squash','lettuce','arugula','herbs','beets','carrots','garlic scapes'],
  6:  ['blueberries','raspberries','cherries','peaches','tomatoes','cucumbers','zucchini','summer squash','green beans','sweet corn','basil','peppers'],
  7:  ['tomatoes','peaches','plums','nectarines','melons','sweet corn','cucumbers','zucchini','peppers','eggplant','green beans','basil','okra','figs'],
  8:  ['tomatoes','peppers','eggplant','sweet corn','melons','peaches','plums','apples','pears','grapes','okra','winter squash','onions','shallots'],
  9:  ['apples','pears','grapes','pumpkins','winter squash','sweet potatoes','potatoes','cauliflower','broccoli','brussels sprouts','kale','chard','leeks','cranberries'],
  10: ['apples','pears','pumpkins','winter squash','sweet potatoes','potatoes','cabbage','brussels sprouts','kale','collards','carrots','beets','parsnips','leeks','cranberries'],
  11: ['citrus','apples','pears','winter squash','sweet potatoes','potatoes','cabbage','kale','collards','brussels sprouts','carrots','beets','parsnips','leeks']
};

// Southern Hemisphere = shift by 6 months.
const SEASONS_SOUTH = {};
for (let m = 0; m < 12; m++) {
  SEASONS_SOUTH[m] = SEASONS_NORTH[(m + 6) % 12];
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function getSeasonList(lat, monthIndex) {
  const table = lat < 0 ? SEASONS_SOUTH : SEASONS_NORTH;
  return table[monthIndex] || [];
}
