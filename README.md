# SNOWD

A snow conditions and forecasting app. Built with Next.js and powered by public data from the National Weather Service and USDA SNOTEL stations.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **Icons:** Lucide React, React Icons

## Getting Started

```bash
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

## Data Sources

### Current Conditions

- **Source:** [NWS API](https://api.weather.gov) (observation stations), current temperature is pulled from [SNOTEL](https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data), Canada locations use [Open-Meteo](https://api.open-meteo.com/v1/forecast)
- **Fallback:** NWS hourly forecast when observations are stale (>60 min)

### 7-Day Forecast

- **Source:** [NWS Forecast Grid Data](https://api.weather.gov), Canada locations use [Open-Meteo](https://api.open-meteo.com/v1/forecast)
- **Data:** snowfall, precipitation, temperature, wind speed/direction, sky cover
- **Processing:** hourly grid points aggregated into daily summaries

### Historical Snowfall
- **Source:** [USDA AWDB REST API](https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data) (SNOTEL)
- **Data:** snow depth (SNWD), snow water equivalent (WTEQ)
- **Logic:** daily snowfall derived from consecutive snow depth differences

### Avalanche Danger Map
- **Source:** [Avalanche.org Public API](https://api.avalanche.org/v2/public/products/map-layer)
- **Data:** GeoJSON forecast zone polygons, current avalanche danger, and avalanche warning status
- **Coverage:** All U.S. avalanche centers (powers the national danger map at avalanche.org)


## Helpful Links:
1. [UI - MAP](https://nwcc-apps.sc.egov.usda.gov/imap/#version=2&elements=&networks=!&states=!&counties=!&hucs=&minElevation=&maxElevation=&elementSelectType=any&activeOnly=true&activeForecastPointsOnly=false&hucLabels=false&hucIdLabels=false&hucParameterLabels=true&stationLabels=&overlays=&hucOverlays=2&basinOpacity=75&basinNoDataOpacity=25&basemapOpacity=100&maskOpacity=0&mode=data&openSections=dataElement,parameter,date,basin,options,elements,location,networks&controlsOpen=true&popup=1308:UT:SNTL&popupMulti=&popupBasin=&base=esriNgwm&displayType=station&basinType=6&dataElement=SNWD&depth=-2&parameter=OBS&frequency=DAILY&duration=I&customDuration=&dayPart=E&monthPart=E&forecastPubDay=1&forecastExceedance=50&useMixedPast=true&seqColor=1&divColor=7&scaleType=D&scaleMin=&scaleMax=&referencePeriodType=POR&referenceBegin=1991&referenceEnd=2020&minimumYears=20&hucAssociations=true&relativeDate=-2&lat=40.5965&lon=-111.5548&zoom=12.0)
2. [UI - Table](https://wcc.sc.egov.usda.gov/reportGenerator/view/customSingleStationReport/daily/1308:UT:SNTL%7Cid=%22%22%7Cname/-29,0/WTEQ::value,WTEQ::median_1991,WTEQ::pctOfMedian_1991,SNWD::value,PREC::value,PREC::median_1991,PREC::pctOfMedian_1991,TMAX::value,TMIN::value,TAVG::value?fitToScreen=false&sortBy=0:1)
3. [EXAMPLE SNOTEL API](https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?stationTriplets=1308:UT:SNTL&elements=WTEQ,SNWD,PREC&duration=DAILY&beginDate=2025-11-21&endDate=2025-12-20&unitSystem=ENGLISH)

## References:
[SNOTEL API Swagger Docs](https://wcc.sc.egov.usda.gov/awdbRestApi/swagger-ui/index.html#/)
[Avalanche.org Public API Docs](https://github.com/NationalAvalancheCenter/Avalanche.org-Public-API-Docs)
[SNOTEL MCP Server](https://mcpservers.org/servers/jymmyt/snotel-mcp-server)
