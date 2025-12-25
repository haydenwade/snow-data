import { MountainLocation } from "@/types/location";

export const LOCATIONS: MountainLocation[] = [
  {
    id: "parkcity",
    stationId: "814",
    name: "Park City, Utah",
    network: "SNOTEL",
    county: "Summit",
    elevation: "9,260 ft",
    lat: 40.62,
    lon: -111.53,
    huc: "160201020101",
    timezone: "America/Denver", //TODO: update to use variable instead of magic string - find library or use constant from utils
    logoUrl: "/parkcity-logo.png",
    stationTriplet: "814:UT:SNTL",
    socialMediaLinks: [
      {
        label: "Instagram",
        url: "https://www.instagram.com/pcski/",
      },
      { label: "X", url: "https://x.com/pcski" },
    ],
    resortInfoLinks: [
      {
        label: "PC Mtn Alerts (Twitter/X)",
        url: "https://x.com/PCMtnAlert",
      },
      {
        label: "Lift and Terrain Status",
        url: "https://www.parkcitymountain.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx",
      },
      {
        label: "Hours of Operation",
        url: "https://www.parkcitymountain.com/explore-the-resort/about-the-resort/hours-of-operation.aspx",
      },
      {
        label: "Mountain Cameras",
        url: "https://www.parkcitymountain.com/the-mountain/mountain-conditions/mountain-cams.aspx",
      },
      {
        label: "Trail Map",
        url: "https://www.parkcitymountain.com/the-mountain/about-the-mountain/trail-map.aspx",
      },
      {
        label: "Parking",
        url: "https://www.parkcitymountain.com/explore-the-resort/about-the-resort/getting-here.aspx",
      },
    ],
    trafficInfoLinks: [
      {
        label: "Parley's Canyon Traffic Info | UDOT on X",
        url: "https://x.com/wasatchbackudot",
      },
    ],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/salt-lake",
      },
    ],
  },
  {
    id: "alta",
    stationId: "1308",
    name: "Alta, Utah",
    network: "SNOTEL",
    county: "Salt Lake",
    elevation: "8,750 ft",
    lat: 40.59,
    lon: -111.64,
    huc: "160202040202",
    timezone: "America/Denver",
    logoUrl: "/alta-logo.png",
    stationTriplet: "1308:UT:SNTL",
    socialMediaLinks: [
      {
        label: "Instagram",
        url: "https://www.instagram.com/altaskiarea/",
      },
      { label: "X", url: "https://x.com/altaskiarea" },
    ],
    resortInfoLinks: [
      {
        label: "Alta Alerts (Twitter/X)",
        url: "https://x.com/AltaAlerts",
      },
      {
        label: "Lift and Terrain Status",
        url: "https://www.alta.com/lift-terrain-status",
      },
      {
        label: "Hours of Operation",
        url: "https://www.alta.com/about",
      },
      {
        label: "Mountain Cameras",
        url: "https://www.alta.com/weather#mountain-cams",
      },
      {
        label: "Trail Map",
        url: "https://www.alta.com/plan-your-trip#maps",
      },
      {
        label: "Parking",
        url: "https://www.alta.com/getting-here/parking-info",
      },
    ],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/salt-lake",
      },
    ],
    trafficInfoLinks: [
      {
        label: "Cottonwood Canyons Traffic Info | UDOT on X",
        url: "https://x.com/UDOTcottonwoods",
      },
      {
        label: "Traffic Cameras | UDOT",
        url: "https://cottonwoodcanyons.udot.utah.gov/road-information/#traffic-cameras",
      },
    ],
  },
  {
    id: "snowbird",
    stationId: "766",
    name: "Snowbird, Utah",
    network: "SNOTEL",
    county: "Salt Lake",
    elevation: "9,170 ft",
    lat: 40.57,
    lon: -111.66,
    huc: "160202040202",
    timezone: "America/Denver",
    logoUrl: "/snowbird-logo.png",
    stationTriplet: "766:UT:SNTL",
    socialMediaLinks: [
      {
        label: "Instagram",
        url: "https://www.instagram.com/snowbird/",
      },
      { label: "X", url: "https://x.com/Snowbird" },
    ],
    resortInfoLinks: [
      {
        label: "Snowbird Alerts (Twitter/X)",
        url: "https://x.com/SnowbirdAlerts",
      },
      {
        label: "Lift and Terrain Status",
        url: "https://www.snowbird.com/the-mountain/mountain-report/lift-trail-report/",
      },
      {
        label: "Hours of Operation",
        url: "https://www.snowbird.com/contact/",
      },
      {
        label: "Mountain Cameras",
        url: "https://www.snowbird.com/the-mountain/webcams/view-all-webcams/",
      },
      {
        label: "Trail Map",
        url: "https://www.snowbird.com/the-mountain/maps/winter-trail-map/",
      },
      {
        label: "Parking",
        url: "https://www.snowbird.com/the-mountain/parking/parking-overview/",
      },
      {
        label: "Parking Status",
        url: "https://www.snowbird.com/the-mountain/mountain-report/parking-status/",
      },
    ],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/salt-lake",
      },
    ],
    trafficInfoLinks: [
      {
        label: "Cottonwood Canyons Traffic Info | UDOT on X",
        url: "https://x.com/UDOTcottonwoods",
      },
      {
        label: "Traffic Cameras | UDOT",
        url: "https://cottonwoodcanyons.udot.utah.gov/road-information/#traffic-cameras",
      },
    ],
  },
  {
    id: "brighton",
    stationId: "366",
    name: "Brighton, Utah",
    network: "SNOTEL",
    county: "Salt Lake",
    elevation: "8,790 ft",
    lat: 40.6,
    lon: -111.58,
    huc: "160202040201",
    timezone: "America/Denver",
    logoUrl: "/brighton-logo.png",
    stationTriplet: "366:UT:SNTL",
    socialMediaLinks: [
      {
        label: "Instagram",
        url: "https://www.instagram.com/brightonresort",
      },
      { label: "X", url: "https://x.com/brightonresort" },
    ],
    resortInfoLinks: [
      {
        label: "Lift and Terrain Status",
        url: "https://www.brightonresort.com/conditions#lift-status",
      },
      {
        label: "Hours of Operation",
        url: "https://www.brightonresort.com/hours",
      },
      {
        label: "Mountain Cameras",
        url: "https://www.brightonresort.com/conditions#cams",
      },
      {
        label: "Trail Map",
        url: "https://www.brightonresort.com/trail-maps",
      },
      {
        label: "Parking",
        url: "https://www.brightonresort.com/getting-here#parking",
      },
    ],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/salt-lake",
      },
    ],
    trafficInfoLinks: [
      {
        label: "Cottonwood Canyons Traffic Info | UDOT on X",
        url: "https://x.com/UDOTcottonwoods",
      },
      {
        label: "Traffic Cameras | UDOT",
        url: "https://cottonwoodcanyons.udot.utah.gov/road-information/#traffic-cameras",
      },
      {
        label: "Road Conditions",
        url: "https://www.brightonresort.com/conditions#road",
      },
    ],
  },
  {
    id: "powdermountain",
    stationId: "1300",
    name: "Powder Mountain, Utah",
    network: "SNOTEL",
    county: "Cache",
    elevation: "8,490 ft",
    lat: 41.37,
    lon: -111.77,
    huc: "160102030102",
    timezone: "America/Denver",
    logoUrl: "/powdermtn-logo.svg",
    stationTriplet: "1300:UT:SNTL",
    socialMediaLinks: [
      {
        label: "Instagram",
        url: "https://www.instagram.com/powdermountain/",
      },
    ],
    resortInfoLinks: [
      {
        label: "Lift and Terrain Status",
        url: "https://powdermountain.com/conditions#lift-status",
      },
      {
        label: "Hours of Operation",
        url: "https://powdermountain.com/hours",
      },
      {
        label: "Mountain Cameras",
        url: "https://powdermountain.com/conditions#webcams",
      },
      {
        label: "Trail Map",
        url: "https://powdermountain.com/trail-map",
      },
      {
        label: "Parking",
        url: "https://powdermountain.com/parking",
      },
    ],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/ogden",
      },
    ],
    trafficInfoLinks: [
      {
        label: "Traffic Info | UDOT",
        url: "https://ogdenvalley.udot.utah.gov/",
      },
    ],
  },
  {
    id: "triallake",
    stationId: "828",
    name: "Trial Lake, Utah",
    network: "SNOTEL",
    county: "Summit",
    elevation: "9,970 ft",
    lat: 40.68,
    lon: -110.95,
    huc: "160202030102",
    timezone: "America/Denver",
    stationTriplet: "828:UT:SNTL",
    socialMediaLinks: [],
    resortInfoLinks: [],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/uintas",
      },
    ],
    trafficInfoLinks: [],
  },
  {
    id: "wolfcreekpeak",
    stationId: "1164",
    name: "Wolf Creek Peak, Utah",
    network: "SNOTEL",
    county: "Wasatch",
    elevation: "9,770 ft",
    lat: 40.48,
    lon: -111.04,
    huc: "160202030104",
    timezone: "America/Denver",
    stationTriplet: "1164:UT:SNTL",
    socialMediaLinks: [],
    resortInfoLinks: [],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/uintas",
      },
    ],
    trafficInfoLinks: [],
  },
  {
    id: "strawberrydivide",
    stationId: "795",
    name: "Strawberry Divide, Utah",
    network: "SNOTEL",
    county: "Wasatch",
    elevation: "8,100 ft",
    lat: 40.16,
    lon: -111.21,
    huc: "140600040103",
    timezone: "America/Denver",
    stationTriplet: "795:UT:SNTL",
    socialMediaLinks: [],
    resortInfoLinks: [],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/uintas",
      },
    ],
    trafficInfoLinks: [],
  },
  {
    id: "cottonwoodcreekredtop",
    stationId: "419",
    name: "Cottonwood Creek - Red Top Mountain (Afton, WY)",
    network: "SNOTEL",
    county: "Lincoln",
    elevation: "7,710 ft",
    lat: 42.65,
    lon: -110.81,
    huc: "170401050102",
    timezone: "America/Denver",
    stationTriplet: "419:WY:SNTL",
    socialMediaLinks: [],
    resortInfoLinks: [],
    avalancheInfoLinks: [],
    trafficInfoLinks: [],
  },
  
];