This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Forecast Data

1. https://api.weather.gov/points/40.59,-111.64
2. forecastGridData -> https://api.weather.gov/gridpoints/SLC/108,167
3. snowfallAmount, quantitativePrecipitation (backup if snowfallAmount not available), probabilityOfPrecipitation,maxTemperature, minTemperature

## Historic data:

1. [UI - MAP](https://nwcc-apps.sc.egov.usda.gov/imap/#version=2&elements=&networks=!&states=!&counties=!&hucs=&minElevation=&maxElevation=&elementSelectType=any&activeOnly=true&activeForecastPointsOnly=false&hucLabels=false&hucIdLabels=false&hucParameterLabels=true&stationLabels=&overlays=&hucOverlays=2&basinOpacity=75&basinNoDataOpacity=25&basemapOpacity=100&maskOpacity=0&mode=data&openSections=dataElement,parameter,date,basin,options,elements,location,networks&controlsOpen=true&popup=1308:UT:SNTL&popupMulti=&popupBasin=&base=esriNgwm&displayType=station&basinType=6&dataElement=SNWD&depth=-2&parameter=OBS&frequency=DAILY&duration=I&customDuration=&dayPart=E&monthPart=E&forecastPubDay=1&forecastExceedance=50&useMixedPast=true&seqColor=1&divColor=7&scaleType=D&scaleMin=&scaleMax=&referencePeriodType=POR&referenceBegin=1991&referenceEnd=2020&minimumYears=20&hucAssociations=true&relativeDate=-2&lat=40.5965&lon=-111.5548&zoom=12.0)
2. [UI - Table](https://wcc.sc.egov.usda.gov/reportGenerator/view/customSingleStationReport/daily/1308:UT:SNTL%7Cid=%22%22%7Cname/-29,0/WTEQ::value,WTEQ::median_1991,WTEQ::pctOfMedian_1991,SNWD::value,PREC::value,PREC::median_1991,PREC::pctOfMedian_1991,TMAX::value,TMIN::value,TAVG::value?fitToScreen=false&sortBy=0:1)
3. [API](https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?stationTriplets=1308:UT:SNTL&elements=WTEQ,SNWD,PREC&duration=DAILY&beginDate=2025-11-21&endDate=2025-12-20&unitSystem=ENGLISH)
