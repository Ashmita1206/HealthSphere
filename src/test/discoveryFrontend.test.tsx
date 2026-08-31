import { describe, it, expect } from 'vitest';

describe('Healthcare Discovery Frontend Integration', () => {
  it('formats hospital distance properly from meters', () => {
    const formatDistance = (meters?: number) => {
      if (meters == null) return 'N/A';
      if (meters < 1000) return `${Math.round(meters)}m`;
      return `${(meters / 1000).toFixed(1)}km`;
    };

    expect(formatDistance(undefined)).toBe('N/A');
    expect(formatDistance(450)).toBe('450m');
    expect(formatDistance(2500)).toBe('2.5km');
    expect(formatDistance(12345)).toBe('12.3km');
  });

  it('maps Overpass API hospital elements to location domain objects', () => {
    const rawElements = [
      {
        id: 101,
        lat: 12.9716,
        lon: 77.5946,
        tags: {
          name: 'City General Hospital',
          'addr:full': '123 Health Ave',
          phone: '+1 555 0199',
        },
      },
      {
        id: 102,
        center: { lat: 12.98, lon: 77.6 },
        tags: {
          name: 'St. Jude Emergency Center',
        },
      },
    ];

    const mapped = rawElements.map((el) => {
      const latitude = el.lat ?? el.center?.lat;
      const longitude = el.lon ?? el.center?.lon;
      return {
        id: String(el.id),
        name: el.tags?.name || 'Unnamed Hospital',
        type: 'hospital',
        address: el.tags?.['addr:full'] || '',
        phone: el.tags?.phone || '',
        latitude,
        longitude,
      };
    });

    expect(mapped).toHaveLength(2);
    expect(mapped[0].id).toBe('101');
    expect(mapped[0].name).toBe('City General Hospital');
    expect(mapped[0].phone).toBe('+1 555 0199');
    expect(mapped[1].name).toBe('St. Jude Emergency Center');
    expect(mapped[1].latitude).toBe(12.98);
  });

  it('sorts nearby hospitals by distance ascending', () => {
    const hospitals = [
      { id: '1', name: 'Far Hospital', distance: 4200 },
      { id: '2', name: 'Near Hospital', distance: 800 },
      { id: '3', name: 'Mid Hospital', distance: 2100 },
    ];

    const sorted = [...hospitals].sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

    expect(sorted[0].name).toBe('Near Hospital');
    expect(sorted[1].name).toBe('Mid Hospital');
    expect(sorted[2].name).toBe('Far Hospital');
  });
});
