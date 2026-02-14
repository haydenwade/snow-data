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

- **Source:** [NWS API](https://api.weather.gov) (observation stations)
- **Fallback:** NWS hourly forecast when observations are stale (>60 min)

### 7-Day Forecast

- **Source:** [NWS Forecast Grid Data](https://api.weather.gov)
- **Data:** snowfall, precipitation, temperature, wind speed/direction, sky cover
- **Processing:** hourly grid points aggregated into daily summaries

### Historical Snowfall

- **Source:** [USDA AWDB REST API](https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data) (SNOTEL)
- **Data:** snow depth (SNWD), snow water equivalent (WTEQ)
- **Logic:** daily snowfall derived from consecutive snow depth differences