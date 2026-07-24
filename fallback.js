// Curated fallback: well-known farm/CSA operations near major US metros.
// Used when Overpass is unavailable so the site never shows an empty list.
// Coords are approximate farm locations; tags mirror the OSM tag style used elsewhere.

const FALLBACK_FARMS = [
  // ---- New York / Tri-state ----
  { name: 'Norwich Meadows Farm', lat: 42.5545, lon: -75.5350, tags: { organic: 'yes', 'service:delivery': 'yes', csa: 'yes', website: 'https://norwichmeadowsfarm.com', 'addr:city': 'Norwich, NY' } },
  { name: 'Migliorelli Farm', lat: 42.0233, lon: -73.9226, tags: { produce: 'vegetables', vending: 'farm_stand', pickup: 'yes', 'addr:city': 'Tivoli, NY', website: 'https://migliorelli.com' } },
  { name: 'Fishkill Farms', lat: 41.5289, lon: -73.8340, tags: { organic: 'yes', tourism: 'farm', pickup: 'yes', csa: 'yes', 'addr:city': 'Hopewell Junction, NY', website: 'https://fishkillfarms.com' } },
  { name: 'Stone Barns Center', lat: 41.1054, lon: -73.8410, tags: { organic: 'yes', tourism: 'farm', 'addr:city': 'Pocantico Hills, NY', website: 'https://stonebarnscenter.org' } },
  { name: 'Ronnybrook Farm', lat: 42.1367, lon: -73.6540, tags: { produce: 'dairy', 'service:delivery': 'yes', 'addr:city': 'Ancramdale, NY', website: 'https://ronnybrook.com' } },
  { name: 'Katchkie Farm', lat: 42.3078, lon: -73.6690, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Kinderhook, NY', website: 'https://katchkiefarm.com' } },
  { name: 'Hepworth Farms', lat: 41.6710, lon: -73.9930, tags: { organic: 'yes', 'service:delivery': 'yes', csa: 'yes', 'addr:city': 'Milton, NY', website: 'https://hepworthfarms.com' } },
  { name: 'Sang Lee Farms', lat: 41.0470, lon: -72.4570, tags: { organic: 'yes', 'service:delivery': 'yes', csa: 'yes', 'addr:city': 'Peconic, NY', website: 'https://sangleefarms.com' } },
  { name: 'Amber Waves Farm', lat: 40.9640, lon: -72.1930, tags: { organic: 'yes', csa: 'yes', vending: 'farm_stand', 'addr:city': 'Amagansett, NY', website: 'https://amberwavesfarm.org' } },
  { name: 'Quail Hill Farm', lat: 40.9740, lon: -72.1610, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Amagansett, NY', website: 'https://peconiclandtrust.org' } },
  { name: 'Muddy River Farm', lat: 41.4820, lon: -74.4790, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Pine Bush, NY' } },
  { name: 'Honey Brook Organic Farm', lat: 40.3620, lon: -74.7250, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Pennington, NJ', website: 'https://honeybrookorganicfarm.com' } },
  { name: 'Chickadee Creek Farm', lat: 40.3980, lon: -74.8010, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Pennington, NJ', website: 'https://chickadeecreekfarm.com' } },

  // ---- Miami / South Florida ----
  { name: 'Paradise Farms', lat: 25.5450, lon: -80.4970, tags: { organic: 'yes', tourism: 'farm', 'addr:city': 'Homestead, FL', website: 'https://paradisefarms.net' } },
  { name: 'Bee Heaven Farm', lat: 25.5090, lon: -80.4780, tags: { organic: 'yes', csa: 'yes', 'service:delivery': 'yes', 'addr:city': 'Homestead, FL', website: 'https://redlandorganics.com' } },
  { name: 'Verde Community Farm', lat: 25.4870, lon: -80.4530, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Homestead, FL' } },
  { name: 'Little River Cooperative', lat: 25.8560, lon: -80.1980, tags: { organic: 'yes', 'service:delivery': 'yes', 'addr:city': 'Miami, FL', website: 'https://littlerivercooperative.com' } },
  { name: 'Grove Ladder Farm', lat: 25.5410, lon: -80.4890, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Homestead, FL' } },
  { name: 'Health in the Hammock', lat: 25.5320, lon: -80.4780, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Homestead, FL' } },
  { name: 'Robert Is Here', lat: 25.4260, lon: -80.5340, tags: { vending: 'farm_stand', tourism: 'farm', 'addr:city': 'Homestead, FL', website: 'https://robertishere.com' } },
  { name: 'Knaus Berry Farm', lat: 25.5240, lon: -80.4380, tags: { vending: 'farm_stand', 'addr:city': 'Homestead, FL', website: 'https://knausberryfarm.com' } },

  // ---- Los Angeles ----
  { name: 'Weiser Family Farms', lat: 35.3480, lon: -118.3970, tags: { produce: 'vegetables', 'addr:city': 'Tehachapi, CA', website: 'https://weiserfamilyfarms.com' } },
  { name: 'Coleman Family Farm', lat: 34.2110, lon: -119.0900, tags: { organic: 'yes', 'addr:city': 'Carpinteria, CA' } },
  { name: 'Underwood Family Farms', lat: 34.2650, lon: -118.8790, tags: { tourism: 'farm', pickup: 'yes', vending: 'farm_stand', 'addr:city': 'Moorpark, CA', website: 'https://underwoodfamilyfarms.com' } },
  { name: 'Tap In Farms', lat: 34.1670, lon: -118.6810, tags: { organic: 'yes', 'service:delivery': 'yes', 'addr:city': 'Los Angeles, CA' } },
  { name: 'South Central Farmers', lat: 33.9760, lon: -118.2150, tags: { organic: 'yes', csa: 'yes', 'service:delivery': 'yes', 'addr:city': 'Los Angeles, CA', website: 'https://southcentralfarmers.com' } },
  { name: 'McGrath Family Farm', lat: 34.1620, lon: -119.1900, tags: { organic: 'yes', pickup: 'yes', 'addr:city': 'Camarillo, CA', website: 'https://mcgrathfamilyfarm.com' } },
  { name: 'Tutti Frutti Farms', lat: 34.4970, lon: -120.2350, tags: { organic: 'yes', 'addr:city': 'Lompoc, CA' } },

  // ---- San Francisco / Bay Area ----
  { name: 'Full Belly Farm', lat: 38.9450, lon: -122.2820, tags: { organic: 'yes', csa: 'yes', 'service:delivery': 'yes', 'addr:city': 'Guinda, CA', website: 'https://fullbellyfarm.com' } },
  { name: 'Riverdog Farm', lat: 38.7830, lon: -122.1490, tags: { organic: 'yes', csa: 'yes', 'service:delivery': 'yes', 'addr:city': 'Guinda, CA', website: 'https://riverdogfarm.com' } },
  { name: 'Frog Hollow Farm', lat: 37.9700, lon: -121.6620, tags: { organic: 'yes', csa: 'yes', 'service:delivery': 'yes', 'addr:city': 'Brentwood, CA', website: 'https://froghollow.com' } },
  { name: 'Eatwell Farm', lat: 38.4160, lon: -121.9260, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Dixon, CA', website: 'https://eatwellfarm.com' } },
  { name: 'Green Gulch Farm', lat: 37.8890, lon: -122.5750, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Muir Beach, CA', website: 'https://sfzc.org/green-gulch' } },
  { name: 'Star Route Farms', lat: 38.0250, lon: -122.7770, tags: { organic: 'yes', 'addr:city': 'Bolinas, CA' } },

  // ---- Seattle / PNW ----
  { name: 'Nash\u2019s Organic Produce', lat: 48.0640, lon: -123.1200, tags: { organic: 'yes', csa: 'yes', vending: 'farm_stand', 'addr:city': 'Sequim, WA', website: 'https://nashsorganicproduce.com' } },
  { name: 'Local Roots Farm', lat: 47.4700, lon: -121.8080, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Duvall, WA', website: 'https://localrootsfarm.com' } },
  { name: 'Oxbow Farm', lat: 47.6810, lon: -121.9420, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Carnation, WA', website: 'https://oxbow.org' } },

  // ---- Chicago ----
  { name: 'Nichols Farm & Orchard', lat: 42.1240, lon: -88.2820, tags: { produce: 'vegetables', vending: 'farm_stand', 'addr:city': 'Marengo, IL', website: 'https://nicholsfarm.com' } },
  { name: 'Angelic Organics', lat: 42.4270, lon: -88.9670, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Caledonia, IL', website: 'https://angelicorganics.com' } },
  { name: 'Iron Creek Farm', lat: 41.4670, lon: -86.7010, tags: { organic: 'yes', 'addr:city': 'La Porte, IN' } },

  // ---- Boston ----
  { name: 'Allandale Farm', lat: 42.3230, lon: -71.1350, tags: { pickup: 'yes', vending: 'farm_stand', 'addr:city': 'Brookline, MA', website: 'https://allandalefarm.com' } },
  { name: 'Verrill Farm', lat: 42.4520, lon: -71.3810, tags: { vending: 'farm_stand', pickup: 'yes', 'addr:city': 'Concord, MA', website: 'https://verrillfarm.com' } },
  { name: 'Drumlin Farm', lat: 42.3970, lon: -71.3730, tags: { organic: 'yes', tourism: 'farm', 'addr:city': 'Lincoln, MA', website: 'https://massaudubon.org/drumlinfarm' } },

  // ---- Austin ----
  { name: 'Johnson\u2019s Backyard Garden', lat: 30.2510, lon: -97.6520, tags: { organic: 'yes', csa: 'yes', 'service:delivery': 'yes', 'addr:city': 'Austin, TX', website: 'https://jbgorganic.com' } },
  { name: 'Springdale Farm', lat: 30.2680, lon: -97.7020, tags: { organic: 'yes', vending: 'farm_stand', 'addr:city': 'Austin, TX', website: 'https://springdalefarmaustin.com' } },
  { name: 'Boggy Creek Farm', lat: 30.2760, lon: -97.6950, tags: { organic: 'yes', vending: 'farm_stand', 'addr:city': 'Austin, TX', website: 'https://boggycreekfarm.com' } },

  // ---- Denver ----
  { name: 'Ela Family Farms', lat: 38.9930, lon: -107.7290, tags: { organic: 'yes', 'service:delivery': 'yes', 'addr:city': 'Hotchkiss, CO', website: 'https://elafamilyfarms.com' } },
  { name: 'Isabelle Farm', lat: 40.0250, lon: -105.1240, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Lafayette, CO', website: 'https://isabellefarm.com' } },

  // ---- Atlanta ----
  { name: 'Woodland Gardens', lat: 33.9440, lon: -83.4790, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Winterville, GA', website: 'https://woodlandgardensorganic.com' } },
  { name: 'Riverview Farms', lat: 34.2830, lon: -84.9450, tags: { organic: 'yes', 'service:delivery': 'yes', 'addr:city': 'Ranger, GA', website: 'https://grassfedcow.com' } },

  // ---- DC / Baltimore ----
  { name: 'Whitmore Farm', lat: 39.5910, lon: -77.3720, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Emmitsburg, MD', website: 'https://whitmorefarm.com' } },
  { name: 'Waterpenny Farm', lat: 38.7900, lon: -78.1930, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Sperryville, VA', website: 'https://waterpennyfarm.com' } },

  // ---- Portland OR ----
  { name: 'Ayers Creek Farm', lat: 45.4970, lon: -123.0790, tags: { organic: 'yes', 'addr:city': 'Gaston, OR' } },
  { name: '47th Avenue Farm', lat: 45.2650, lon: -122.6410, tags: { organic: 'yes', csa: 'yes', 'addr:city': 'Canby, OR', website: 'https://47thavefarm.com' } }
];
