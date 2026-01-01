import { MountainLocation } from "@/types/location";

export const LOCATIONS: MountainLocation[] = [
  {
    id: "parkcity",
    stationId: "814",
    name: "Park City Mountain Resort",
    city: "Park City",
    state: "Utah",
    network: "SNOTEL",
    county: "Summit",
    elevation: "9,260 ft",
    lat: 40.62,
    lon: -111.53,
    huc: "160201020101",
    timezone: "America/Denver", //TODO: update to use variable instead of magic string - find library or use constant from utils
    logoUrl: "/parkcity-logo.png",
    stationTriplet: "814:UT:SNTL",
    radarLink: "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS41MDgsNDAuNjUxXSwibG9jYXRpb24iOlstMTExLjUwOCw0MC42NTFdLCJ6b29tIjo3LCJsYXllciI6ImJyZWZfcWNkIn0sImFuaW1hdGluZyI6ZmFsc2UsImJhc2UiOiJzdGFuZGFyZCIsImFydGNjIjpmYWxzZSwiY291bnR5IjpmYWxzZSwiY3dhIjpmYWxzZSwicmZjIjpmYWxzZSwic3RhdGUiOmZhbHNlLCJtZW51Ijp0cnVlLCJzaG9ydEZ1c2VkT25seSI6ZmFsc2UsIm9wYWNpdHkiOnsiYWxlcnRzIjowLjgsImxvY2FsIjowLjYsImxvY2FsU3RhdGlvbnMiOjAuOCwibmF0aW9uYWwiOjAuNn19",
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
    name: "Alta",
    city: "Alta",
    state: "Utah",
    network: "SNOTEL",
    county: "Salt Lake",
    elevation: "8,750 ft",
    lat: 40.59,
    lon: -111.64,
    huc: "160202040202",
    timezone: "America/Denver",
    logoUrl: "/alta-logo.png",
    stationTriplet: "1308:UT:SNTL",
    radarLink:
      "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS42NDUsNDAuNTg5XSwibG9jYXRpb24iOlstMTExLjY0NSw0MC41ODldLCJ6b29tIjo3LCJsYXllciI6ImJyZWZfcWNkIn0sImFuaW1hdGluZyI6ZmFsc2UsImJhc2UiOiJzdGFuZGFyZCIsImFydGNjIjpmYWxzZSwiY291bnR5IjpmYWxzZSwiY3dhIjpmYWxzZSwicmZjIjpmYWxzZSwic3RhdGUiOmZhbHNlLCJtZW51Ijp0cnVlLCJzaG9ydEZ1c2VkT25seSI6ZmFsc2UsIm9wYWNpdHkiOnsiYWxlcnRzIjowLjgsImxvY2FsIjowLjYsImxvY2FsU3RhdGlvbnMiOjAuOCwibmF0aW9uYWwiOjAuNn19",
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
    name: "Snowbird",
    city: "Snowbird",
    state: "Utah",
    network: "SNOTEL",
    county: "Salt Lake",
    elevation: "9,170 ft",
    lat: 40.57,
    lon: -111.66,
    huc: "160202040202",
    timezone: "America/Denver",
    logoUrl: "/snowbird-logo.png",
    stationTriplet: "766:UT:SNTL",
    radarLink:
      "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS42NTYsNDAuNTgyXSwibG9jYXRpb24iOlstMTExLjY1Niw0MC41ODJdLCJ6b29tIjo3LCJsYXllciI6ImJyZWZfcWNkIn0sImFuaW1hdGluZyI6ZmFsc2UsImJhc2UiOiJzdGFuZGFyZCIsImFydGNjIjpmYWxzZSwiY291bnR5IjpmYWxzZSwiY3dhIjpmYWxzZSwicmZjIjpmYWxzZSwic3RhdGUiOmZhbHNlLCJtZW51Ijp0cnVlLCJzaG9ydEZ1c2VkT25seSI6ZmFsc2UsIm9wYWNpdHkiOnsiYWxlcnRzIjowLjgsImxvY2FsIjowLjYsImxvY2FsU3RhdGlvbnMiOjAuOCwibmF0aW9uYWwiOjAuNn19",
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
    name: "Brighton Resort",
    city: "Brighton",
    state: "Utah",
    network: "SNOTEL",
    county: "Salt Lake",
    elevation: "8,790 ft",
    lat: 40.6,
    lon: -111.58,
    huc: "160202040201",
    timezone: "America/Denver",
    logoUrl: "/brighton-logo.png",
    stationTriplet: "366:UT:SNTL",
    radarLink:
      "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS41OTMsNDAuNjEyXSwibG9jYXRpb24iOlstMTExLjU5Myw0MC42MTJdLCJ6b29tIjo3LCJsYXllciI6ImJyZWZfcWNkIn0sImFuaW1hdGluZyI6ZmFsc2UsImJhc2UiOiJzdGFuZGFyZCIsImFydGNjIjpmYWxzZSwiY291bnR5IjpmYWxzZSwiY3dhIjpmYWxzZSwicmZjIjpmYWxzZSwic3RhdGUiOmZhbHNlLCJtZW51Ijp0cnVlLCJzaG9ydEZ1c2VkT25seSI6ZmFsc2UsIm9wYWNpdHkiOnsiYWxlcnRzIjowLjgsImxvY2FsIjowLjYsImxvY2FsU3RhdGlvbnMiOjAuOCwibmF0aW9uYWwiOjAuNn19",
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
    name: "Powder Mountain",
    city: "Eden",
    state: "Utah",
    network: "SNOTEL",
    county: "Cache",
    elevation: "8,490 ft",
    lat: 41.37,
    lon: -111.77,
    huc: "160102030102",
    timezone: "America/Denver",
    logoUrl: "/powdermtn-logo.svg",
    stationTriplet: "1300:UT:SNTL",
    radarLink:
      "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS44MTMsNDEuMjk5XSwibG9jYXRpb24iOlstMTExLjgxMyw0MS4yOTldLCJ6b29tIjo3LCJsYXllciI6ImJyZWZfcWNkIn0sImFuaW1hdGluZyI6ZmFsc2UsImJhc2UiOiJzdGFuZGFyZCIsImFydGNjIjpmYWxzZSwiY291bnR5IjpmYWxzZSwiY3dhIjpmYWxzZSwicmZjIjpmYWxzZSwic3RhdGUiOmZhbHNlLCJtZW51Ijp0cnVlLCJzaG9ydEZ1c2VkT25seSI6ZmFsc2UsIm9wYWNpdHkiOnsiYWxlcnRzIjowLjgsImxvY2FsIjowLjYsImxvY2FsU3RhdGlvbnMiOjAuOCwibmF0aW9uYWwiOjAuNn19",
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
    name: "Trial Lake",
    city: "Kamas",
    state: "Utah",
    network: "SNOTEL",
    county: "Summit",
    elevation: "9,970 ft",
    lat: 40.68,
    lon: -110.95,
    huc: "160202030102",
    timezone: "America/Denver",
    stationTriplet: "828:UT:SNTL",
    radarLink:
      "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS4yODEsNDAuNjQzXSwibG9jYXRpb24iOlstMTExLjI4MSw0MC42NDNdLCJ6b29tIjo3LCJsYXllciI6ImJyZWZfcWNkIn0sImFuaW1hdGluZyI6ZmFsc2UsImJhc2UiOiJzdGFuZGFyZCIsImFydGNjIjpmYWxzZSwiY291bnR5IjpmYWxzZSwiY3dhIjpmYWxzZSwicmZjIjpmYWxzZSwic3RhdGUiOmZhbHNlLCJtZW51Ijp0cnVlLCJzaG9ydEZ1c2VkT25seSI6ZmFsc2UsIm9wYWNpdHkiOnsiYWxlcnRzIjowLjgsImxvY2FsIjowLjYsImxvY2FsU3RhdGlvbnMiOjAuOCwibmF0aW9uYWwiOjAuNn19",

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
    name: "Wolf Creek Peak",
    city: "Heber City",
    state: "Utah",
    network: "SNOTEL",
    county: "Wasatch",
    elevation: "9,770 ft",
    lat: 40.48,
    lon: -111.04,
    huc: "160202030104",
    timezone: "America/Denver",
    stationTriplet: "1164:UT:SNTL",
    radarLink:
      "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS40MTIsNDAuNTA4XSwibG9jYXRpb24iOlstMTExLjQxMiw0MC41MDhdLCJ6b29tIjo3LCJsYXllciI6ImJyZWZfcWNkIn0sImFuaW1hdGluZyI6ZmFsc2UsImJhc2UiOiJzdGFuZGFyZCIsImFydGNjIjpmYWxzZSwiY291bnR5IjpmYWxzZSwiY3dhIjpmYWxzZSwicmZjIjpmYWxzZSwic3RhdGUiOmZhbHNlLCJtZW51Ijp0cnVlLCJzaG9ydEZ1c2VkT25seSI6ZmFsc2UsIm9wYWNpdHkiOnsiYWxlcnRzIjowLjgsImxvY2FsIjowLjYsImxvY2FsU3RhdGlvbnMiOjAuOCwibmF0aW9uYWwiOjAuNn19",
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
    name: "Strawberry Divide",
    city: "Heber City",
    state: "Utah",
    network: "SNOTEL",
    county: "Wasatch",
    elevation: "8,100 ft",
    lat: 40.16,
    lon: -111.21,
    huc: "140600040103",
    timezone: "America/Denver",
    stationTriplet: "795:UT:SNTL",
    radarLink:
      "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS40MTIsNDAuNTA4XSwibG9jYXRpb24iOlstMTExLjQxMiw0MC41MDhdLCJ6b29tIjo3LCJsYXllciI6ImJyZWZfcWNkIn0sImFuaW1hdGluZyI6ZmFsc2UsImJhc2UiOiJzdGFuZGFyZCIsImFydGNjIjpmYWxzZSwiY291bnR5IjpmYWxzZSwiY3dhIjpmYWxzZSwicmZjIjpmYWxzZSwic3RhdGUiOmZhbHNlLCJtZW51Ijp0cnVlLCJzaG9ydEZ1c2VkT25seSI6ZmFsc2UsIm9wYWNpdHkiOnsiYWxlcnRzIjowLjgsImxvY2FsIjowLjYsImxvY2FsU3RhdGlvbnMiOjAuOCwibmF0aW9uYWwiOjAuNn19",
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
    name: "Cottonwood Creek - Red Top Mountain",
    city: "Afton",
    state: "Wyoming",
    network: "SNOTEL",
    county: "Lincoln",
    elevation: "7,710 ft",
    lat: 42.65,
    lon: -110.81,
    huc: "170401050102",
    timezone: "America/Denver",
    stationTriplet: "419:WY:SNTL",
    radarLink:
      "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMC45MzQsNDIuNzI1XSwibG9jYXRpb24iOlstMTEwLjkzNCw0Mi43MjVdLCJ6b29tIjo3LCJsYXllciI6ImJyZWZfcWNkIn0sImFuaW1hdGluZyI6ZmFsc2UsImJhc2UiOiJzdGFuZGFyZCIsImFydGNjIjpmYWxzZSwiY291bnR5IjpmYWxzZSwiY3dhIjpmYWxzZSwicmZjIjpmYWxzZSwic3RhdGUiOmZhbHNlLCJtZW51Ijp0cnVlLCJzaG9ydEZ1c2VkT25seSI6ZmFsc2UsIm9wYWNpdHkiOnsiYWxlcnRzIjowLjgsImxvY2FsIjowLjYsImxvY2FsU3RhdGlvbnMiOjAuOCwibmF0aW9uYWwiOjAuNn19",
    socialMediaLinks: [],
    resortInfoLinks: [],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://bridgertetonavalanchecenter.org/forecasts/#/salt-river-and-wyoming-ranges/",
      },
    ],
    trafficInfoLinks: [],
  },
  {
    id: "heavenly",
    stationId: "518",
    name: "Heavenly",
    city: "South Lake Tahoe",
    state: "California",
    network: "SNOTEL",
    county: "El Dorado",
    elevation: "8,540 ft",
    lat: 38.92,
    lon: -119.92,
    huc: "160501010302",
    timezone: "America/Los_Angeles",
    stationTriplet: "518:CA:SNTL",
    logoUrl: "/heavenly-logo.png",
    radarLink:
      "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTEyMC4wMzUsMzkuMzI2XSwibG9jYXRpb24iOlstMTIwLjAzMSwzOS4xMDFdLCJ6b29tIjo3LjkzOTk5OTk5OTk5OTk4OSwibGF5ZXIiOiJicmVmX3FjZCJ9LCJhbmltYXRpbmciOmZhbHNlLCJiYXNlIjoic3RhbmRhcmQiLCJhcnRjYyI6ZmFsc2UsImNvdW50eSI6ZmFsc2UsImN3YSI6ZmFsc2UsInJmYyI6ZmFsc2UsInN0YXRlIjpmYWxzZSwibWVudSI6dHJ1ZSwic2hvcnRGdXNlZE9ubHkiOmZhbHNlLCJvcGFjaXR5Ijp7ImFsZXJ0cyI6MC44LCJsb2NhbCI6MC42LCJsb2NhbFN0YXRpb25zIjowLjgsIm5hdGlvbmFsIjowLjZ9fQ%3D%3D",
    socialMediaLinks: [
      { label: "Instagram", url: "https://www.instagram.com/skiheavenly/" },
    ],
    resortInfoLinks: [
      {
        label: "Heavenly Conditions (Twitter/X)",
        url: "https://x.com/HVConditions",
      },
      {
        label: "Lift and Terrain Status",
        url: "https://www.skiheavenly.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx",
      },
      {
        label: "Hours of Operation",
        url: "https://www.skiheavenly.com/explore-the-resort/about-the-resort/hours-of-operation.aspx",
      },
      {
        label: "Mountain Cameras",
        url: "https://www.skiheavenly.com/the-mountain/mountain-conditions/mountain-cams.aspx",
      },
      {
        label: "Trail Map",
        url: "https://www.skiheavenly.com/the-mountain/about-the-mountain/trail-map.aspx",
      },
      {
        label: "Parking",
        url: "https://www.skiheavenly.com/explore-the-resort/about-the-resort/getting-here-and-parking.aspx",
      },
    ],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://www.sierraavalanchecenter.org/forecasts/avalanche/central-sierra-nevada#/central-sierra-nevada/",
      },
    ],
    trafficInfoLinks: [],
  },
  {
    id: "palisades",
    stationId: "784",
    name: "Palisades",
    city: "Olympic Valley",
    state: "California",
    network: "SNOTEL",
    county: "Placer",
    elevation: "8,010 ft",
    lat: 39.19,
    lon: -120.27,
    huc: "160501020202",
    timezone: "America/Los_Angeles",
    stationTriplet: "784:CA:SNTL",
    logoUrl: "/palisades-logo.jpg",
    radarLink:
      "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTEyMC4wMzUsMzkuMzI2XSwibG9jYXRpb24iOlstMTIwLjAzMSwzOS4xMDFdLCJ6b29tIjo3LjkzOTk5OTk5OTk5OTk4OSwibGF5ZXIiOiJicmVmX3FjZCJ9LCJhbmltYXRpbmciOmZhbHNlLCJiYXNlIjoic3RhbmRhcmQiLCJhcnRjYyI6ZmFsc2UsImNvdW50eSI6ZmFsc2UsImN3YSI6ZmFsc2UsInJmYyI6ZmFsc2UsInN0YXRlIjpmYWxzZSwibWVudSI6dHJ1ZSwic2hvcnRGdXNlZE9ubHkiOmZhbHNlLCJvcGFjaXR5Ijp7ImFsZXJ0cyI6MC44LCJsb2NhbCI6MC42LCJsb2NhbFN0YXRpb25zIjowLjgsIm5hdGlvbmFsIjowLjZ9fQ%3D%3D",
    socialMediaLinks: [
      { label: "Instagram", url: "https://www.instagram.com/palisadestahoe/" },
    ],
    resortInfoLinks: [
      {
        label: "Palisades Mtn Ops (Twitter/X)",
        url: "https://x.com/palisadesops",
      },
      {
        label: "Lift and Terrain Status",
        url: "https://www.palisadestahoe.com/mountain-information/mountain-report",
      },
      {
        label: "Hours of Operation",
        url: "https://www.palisadestahoe.com/mountain-information/hours-of-operation",
      },
      {
        label: "Mountain Cameras",
        url: "https://www.palisadestahoe.com/mountain-information/webcams",
      },
      {
        label: "Trail Map",
        url: "https://www.palisadestahoe.com/mountain-information/trail-maps",
      },
      {
        label: "Parking",
        url: "https://www.palisadestahoe.com/mountain-information/parking-and-road-conditions",
      },
    ],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://www.sierraavalanchecenter.org/forecasts/avalanche/central-sierra-nevada#/central-sierra-nevada/",
      },
    ],
    trafficInfoLinks: [],
  },
  {
    id: "carsonpass",
    stationId: "1067",
    name: "Carson Pass",
    city: "Kirkwood",
    state: "California",
    network: "SNOTEL",
    county: "Alpine",
    elevation: "8,360 ft",
    lat: 38.69,
    lon: -120.0,
    huc: "180201290101",
    timezone: "America/Los_Angeles",
    stationTriplet: "1067:CA:SNTL",
    radarLink:
      "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTEyMC4wMzUsMzkuMzI2XSwibG9jYXRpb24iOlstMTIwLjAzMSwzOS4xMDFdLCJ6b29tIjo3LjkzOTk5OTk5OTk5OTk4OSwibGF5ZXIiOiJicmVmX3FjZCJ9LCJhbmltYXRpbmciOmZhbHNlLCJiYXNlIjoic3RhbmRhcmQiLCJhcnRjYyI6ZmFsc2UsImNvdW50eSI6ZmFsc2UsImN3YSI6ZmFsc2UsInJmYyI6ZmFsc2UsInN0YXRlIjpmYWxzZSwibWVudSI6dHJ1ZSwic2hvcnRGdXNlZE9ubHkiOmZhbHNlLCJvcGFjaXR5Ijp7ImFsZXJ0cyI6MC44LCJsb2NhbCI6MC42LCJsb2NhbFN0YXRpb25zIjowLjgsIm5hdGlvbmFsIjowLjZ9fQ%3D%3D",
    socialMediaLinks: [],
    resortInfoLinks: [],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://www.sierraavalanchecenter.org/forecasts/avalanche/central-sierra-nevada#/central-sierra-nevada/",
      },
    ],
    trafficInfoLinks: [],
  },
  {
    id: "mtrose",
    stationId: "652",
    name: "Mt Rose",
    city: "Incline Village",
    state: "Nevada",
    network: "SNOTEL",
    county: "Washoe",
    elevation: "8,810 ft",
    lat: 39.32,
    lon: -119.89,
    huc: "160501020304",
    timezone: "America/Los_Angeles",
    stationTriplet: "652:NV:SNTL",
    logoUrl: "/mtrose-logo.jpg",
    radarLink:
      "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTEyMC4wMzUsMzkuMzI2XSwibG9jYXRpb24iOlstMTIwLjAzMSwzOS4xMDFdLCJ6b29tIjo3LjkzOTk5OTk5OTk5OTk4OSwibGF5ZXIiOiJicmVmX3FjZCJ9LCJhbmltYXRpbmciOmZhbHNlLCJiYXNlIjoic3RhbmRhcmQiLCJhcnRjYyI6ZmFsc2UsImNvdW50eSI6ZmFsc2UsImN3YSI6ZmFsc2UsInJmYyI6ZmFsc2UsInN0YXRlIjpmYWxzZSwibWVudSI6dHJ1ZSwic2hvcnRGdXNlZE9ubHkiOmZhbHNlLCJvcGFjaXR5Ijp7ImFsZXJ0cyI6MC44LCJsb2NhbCI6MC42LCJsb2NhbFN0YXRpb25zIjowLjgsIm5hdGlvbmFsIjowLjZ9fQ%3D%3D",
    socialMediaLinks: [
      { label: "Instagram", url: "https://www.instagram.com/mtroseskitahoe/" },
      { label: "X", url: "https://x.com/MtRoseSkiTahoe" },
    ],
    resortInfoLinks: [
      {
        label: "Lift and Terrain Status",
        url: "https://skirose.com/snow-report/",
      },
      {
        label: "Hours of Operation",
        url: "https://skirose.com/mountain-information/",
      },
      {
        label: "Trail Map",
        url: "https://skirose.com/trail-maps/",
      },
    ],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://www.sierraavalanchecenter.org/forecasts/avalanche/central-sierra-nevada#/central-sierra-nevada/",
      },
    ],
    trafficInfoLinks: [
      {
        label: "Traffic Cameras | NDOT",
        url: "https://www.nvroads.com/",
      },
    ],
  },
  {
    id: "emigrantsummit",
    stationId: "471",
    name: "Emigrant Summit",
    city: "Montpelier",
    state: "Idaho",
    network: "SNOTEL",
    county: "Bear Lake",
    elevation: "7,390 ft",
    lat: 42.36,
    lon: -111.56,
    huc: "160102020206",
    timezone: "America/Boise",
    stationTriplet: "471:ID:SNTL",
    radarLink:
      "https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTExMS41Niw0Mi4zNTZdLCJsb2NhdGlvbiI6Wy0xMTEuNTYsNDIuMzU2XSwiem9vbSI6MTIuMjkzMzMzMzMzMzMzMzMxLCJsYXllciI6ImJyZWZfcWNkIn0sImFuaW1hdGluZyI6ZmFsc2UsImJhc2UiOiJzdGFuZGFyZCIsImFydGNjIjpmYWxzZSwiY291bnR5IjpmYWxzZSwiY3dhIjpmYWxzZSwicmZjIjpmYWxzZSwic3RhdGUiOmZhbHNlLCJtZW51Ijp0cnVlLCJzaG9ydEZ1c2VkT25seSI6ZmFsc2UsIm9wYWNpdHkiOnsiYWxlcnRzIjowLjgsImxvY2FsIjowLjYsImxvY2FsU3RhdGlvbnMiOjAuOCwibmF0aW9uYWwiOjAuNn19",
    socialMediaLinks: [],
    resortInfoLinks: [],
    avalancheInfoLinks: [
      {
        label: "Avalanche Forecast",
        url: "https://utahavalanchecenter.org/forecast/logan",
      },
    ],
    trafficInfoLinks: [],
  },
];
