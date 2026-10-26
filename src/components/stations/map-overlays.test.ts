import {
  SNOW_DEPTH_OVERLAY,
  dailyImageryDate,
  hlsFillRange,
  overlayTilesFor,
  radarOverlaySource,
  satelliteOverlaySources,
  snowCoverOverlaySource,
} from './map-overlays';
import { pickLatestClearDay } from './useClearScenes';

describe('overlayTilesFor', () => {
  const snowCover = snowCoverOverlaySource('2026-10-17');

  it('uses map tiles as-is at or below the source max level', () => {
    const tiles = overlayTilesFor(snowCover, [{ x: 24, y: 11, left: 10, top: 20 }], 6);
    expect(tiles).toHaveLength(1);
    expect(tiles[0]).toMatchObject({ left: 10, top: 20, size: 256 });
    expect(tiles[0].url).toContain('/GoogleMapsCompatible_Level8/6/11/24.png');
    expect(tiles[0].url).toContain('/2026-10-17/');
  });

  it('scales one parent tile over the map tiles it covers past the max level', () => {
    // Zoom 10 is two levels past snow cover's level 8: one parent covers 4x4 map tiles.
    const mapTiles = [
      { x: 400, y: 200, left: 0, top: 0 },
      { x: 401, y: 200, left: 256, top: 0 },
      { x: 401, y: 201, left: 256, top: 256 },
    ];
    const tiles = overlayTilesFor(snowCover, mapTiles, 10);
    expect(tiles).toHaveLength(1);
    expect(tiles[0]).toMatchObject({ left: 0, top: 0, size: 1024 });
    expect(tiles[0].url).toContain('/8/50/100.png');
  });

  it('keeps wrapped copies of the same parent tile apart', () => {
    const tiles = overlayTilesFor(
      snowCover,
      [
        { x: 0, y: 0, left: 0, top: 0 },
        { x: 0, y: 0, left: 1024, top: 0 },
      ],
      2,
    );
    expect(tiles).toHaveLength(2);
  });

  it('builds a Web Mercator bbox for SNODAS export tiles', () => {
    const url = SNOW_DEPTH_OVERLAY.tileUrl(0, 0, 0);
    expect(url).toContain('bbox=-20037508.342789244,-20037508.342789244,20037508.342789244,20037508.342789244');
    expect(url).toContain('layers=show:3');
  });
});

describe('satelliteOverlaySources', () => {
  it('stacks both HLS missions for the prior days under the selected date, newest last', () => {
    const ids = satelliteOverlaySources('hls', '2026-10-08').map((source) => source.id);
    expect(ids).toEqual([
      'hls-l30-2026-10-04',
      'hls-s30-2026-10-04',
      'hls-l30-2026-10-05',
      'hls-s30-2026-10-05',
      'hls-l30-2026-10-06',
      'hls-s30-2026-10-06',
      'hls-l30-2026-10-07',
      'hls-s30-2026-10-07',
      'hls-l30-2026-10-08',
      'hls-s30-2026-10-08',
    ]);
  });

  it('reports the fill range across a month boundary', () => {
    expect(hlsFillRange('2026-10-02')).toEqual({ from: '2026-09-28', to: '2026-10-01' });
  });

  it('returns nothing when off', () => {
    expect(satelliteOverlaySources('off', '2026-10-08')).toEqual([]);
  });
});

describe('dailyImageryDate', () => {
  it('shows yesterday for today, since the daily mosaic is still filling in', () => {
    expect(dailyImageryDate(null, '2026-10-18')).toBe('2026-10-17');
  });

  it('keeps an explicitly chosen past date', () => {
    expect(dailyImageryDate('2026-10-02', '2026-10-18')).toBe('2026-10-02');
  });
});

describe('pickLatestClearDay', () => {
  it('returns the newest day at or under the cloud threshold', () => {
    const day = pickLatestClearDay([
      { date: '2026-10-11', product: 'S30', cloudPct: 74, sceneCount: 2 },
      { date: '2026-10-08', product: 'S30', cloudPct: 16, sceneCount: 2 },
      { date: '2026-10-05', product: 'L30', cloudPct: 2, sceneCount: 1 },
    ]);
    expect(day?.date).toBe('2026-10-08');
  });

  it('returns null when every day is cloudy or unknown', () => {
    expect(
      pickLatestClearDay([
        { date: '2026-10-11', product: 'S30', cloudPct: 74, sceneCount: 1 },
        { date: '2026-10-10', product: 'L30', cloudPct: null, sceneCount: 1 },
      ]),
    ).toBeNull();
  });
});

describe('radarOverlaySource', () => {
  it('requests one EPSG:3857 WMS tile at the scan time', () => {
    const url = radarOverlaySource('2026-10-18T21:09:00.000Z').tileUrl(0, 0, 0);
    expect(url).toContain('LAYERS=conus_bref_qcd');
    expect(url).toContain('CRS=EPSG:3857');
    expect(url).toContain('BBOX=-20037508.342789244,-20037508.342789244,20037508.342789244,20037508.342789244');
    expect(url).toContain('TIME=2026-10-18T21%3A09%3A00.000Z');
  });

  it('smooths zoomed-out tiles but keeps native cells up close', () => {
    const source = radarOverlaySource('2026-10-18T21:09:00.000Z');
    expect(source.tileUrl(4, 3, 6)).toContain('&INTERPOLATIONS=bilinear');
    expect(source.tileUrl(6, 13, 25)).toContain('&INTERPOLATIONS=bilinear');
    expect(source.tileUrl(7, 26, 50)).not.toContain('INTERPOLATIONS');
  });
});
