import SunCalc from 'suncalc';

export type Planet = {
  en: string;
  ar: string;
  symbol: string;
  color: string;
  icon: { ios: string; android: string };
};

export const PLANETS: Planet[] = [
  { en: 'Saturn', ar: 'زُحَل', symbol: '♄', color: '#6B5B95', icon: { ios: 'circlebadge.2.fill', android: 'toll' } },
  { en: 'Jupiter', ar: 'الْمُشْتَرِي', symbol: '♃', color: '#D4AF37', icon: { ios: 'crown.fill', android: 'workspace_premium' } },
  { en: 'Mars', ar: 'الْمِرِّيخ', symbol: '♂', color: '#E84855', icon: { ios: 'flame.fill', android: 'local_fire_department' } },
  { en: 'Sun', ar: 'الشَّمْس', symbol: '☉', color: '#FFB347', icon: { ios: 'sun.max.fill', android: 'sunny' } },
  { en: 'Venus', ar: 'الزُّهَرَة', symbol: '♀', color: '#FF6B8A', icon: { ios: 'heart.fill', android: 'favorite' } },
  { en: 'Mercury', ar: 'عُطَارِد', symbol: '☿', color: '#4BB8FA', icon: { ios: 'bolt.fill', android: 'bolt' } },
  { en: 'Moon', ar: 'الْقَمَر', symbol: '☽', color: '#9B9BCE', icon: { ios: 'moon.stars.fill', android: 'dark_mode' } },
];

const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const DAY_RULERS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export type PlanetaryHour = {
  index: number;
  start: Date;
  end: Date;
  planet: Planet;
  isDay: boolean;
};

export type LocationInfo = {
  latitude: number;
  longitude: number;
  label: string;
  timezone: string;
};

function getPlanetIndex(planetName: string): number {
  return CHALDEAN_ORDER.indexOf(planetName);
}

export function getDayRuler(dayOfWeek: number): string {
  return DAY_RULERS[dayOfWeek % 7];
}

function parseTime(timeStr: string): { h: number; m: number } {
  const [h, m] = timeStr.split(':').map(Number);
  return { h, m };
}

export function computeSunriseSunset(
  lat: number,
  lng: number,
  date: Date = new Date(),
): { sunrise: Date; sunset: Date } | null {
  try {
    const times = SunCalc.getTimes(date, lat, lng);
    if (times.sunrise && times.sunset) {
      return { sunrise: times.sunrise, sunset: times.sunset };
    }
    return null;
  } catch {
    return null;
  }
}

export function computePlanetaryHours(
  sunriseTime: string | Date,
  sunsetTime: string | Date,
  date: Date = new Date(),
): PlanetaryHour[] {
  let sunriseDate: Date;
  let sunsetDate: Date;

  if (typeof sunriseTime === 'string') {
    const t = parseTime(sunriseTime);
    sunriseDate = new Date(date);
    sunriseDate.setHours(t.h, t.m, 0, 0);
  } else {
    sunriseDate = new Date(sunriseTime);
  }

  if (typeof sunsetTime === 'string') {
    const t = parseTime(sunsetTime);
    sunsetDate = new Date(date);
    sunsetDate.setHours(t.h, t.m, 0, 0);
  } else {
    sunsetDate = new Date(sunsetTime);
  }

  const nextSunrise = new Date(sunriseDate);
  nextSunrise.setDate(nextSunrise.getDate() + 1);

  const dayLength = sunsetDate.getTime() - sunriseDate.getTime();
  const nightLength = nextSunrise.getTime() - sunsetDate.getTime();

  const dayHourMs = dayLength / 12;
  const nightHourMs = nightLength / 12;

  const dayOfWeek = date.getDay();
  const startPlanetName = getDayRuler(dayOfWeek);
  const startIdx = getPlanetIndex(startPlanetName);

  const hours: PlanetaryHour[] = [];

  for (let i = 0; i < 24; i++) {
    const isDay = i < 12;
    const base = isDay ? sunriseDate.getTime() : sunsetDate.getTime();
    const dur = isDay ? dayHourMs : nightHourMs;
    const j = isDay ? i : i - 12;
    const start = new Date(base + j * dur);
    const end = new Date(base + (j + 1) * dur);
    const planetIdx = (startIdx + i) % 7;

    hours.push({
      index: i + 1,
      start,
      end,
      planet: PLANETS[planetIdx],
      isDay,
    });
  }

  return hours;
}

export function getCurrentPlanetaryHour(hours: PlanetaryHour[]): PlanetaryHour | null {
  const now = Date.now();
  for (const h of hours) {
    if (now >= h.start.getTime() && now < h.end.getTime()) {
      return h;
    }
  }
  return null;
}

export function getPlanetaryHourForDate(hours: PlanetaryHour[], date: Date): PlanetaryHour | null {
  const time = date.getTime();
  for (const h of hours) {
    if (time >= h.start.getTime() && time < h.end.getTime()) {
      return h;
    }
  }
  return null;
}

export function estimateLocationFromTimezone(): LocationInfo {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const now = new Date();
  const offset = -now.getTimezoneOffset() / 60;
  const longitude = offset * 15;

  const tzLower = timezone.toLowerCase();
  let latitude = 35;

  if (tzLower.includes('riyadh') || tzLower.includes('arab') || tzLower.includes('kuwait') || tzLower.includes('qatar') || tzLower.includes('bahrain')) {
    latitude = 25;
  } else if (tzLower.includes('makkah') || tzLower.includes('jeddah') || tzLower.includes('mecca')) {
    latitude = 21.4;
  } else if (tzLower.includes('cairo') || tzLower.includes('egypt') || tzLower.includes('beirut') || tzLower.includes('damascus')) {
    latitude = 30;
  } else if (tzLower.includes('london') || tzLower.includes('paris') || tzLower.includes('berlin') || tzLower.includes('madrid') || tzLower.includes('rome')) {
    latitude = 48;
  } else if (tzLower.includes('new_york') || tzLower.includes('toronto') || tzLower.includes('montreal')) {
    latitude = 40.7;
  } else if (tzLower.includes('chicago') || tzLower.includes('mexico')) {
    latitude = 41.8;
  } else if (tzLower.includes('denver')) {
    latitude = 39.7;
  } else if (tzLower.includes('los_angeles') || tzLower.includes('san_francisco') || tzLower.includes('vancouver')) {
    latitude = 34;
  } else if (tzLower.includes('tokyo') || tzLower.includes('seoul') || tzLower.includes('osaka')) {
    latitude = 35.6;
  } else if (tzLower.includes('shanghai') || tzLower.includes('beijing') || tzLower.includes('hong_kong')) {
    latitude = 39.9;
  } else if (tzLower.includes('moscow')) {
    latitude = 55.7;
  } else if (tzLower.includes('dubai') || tzLower.includes('muscat') || tzLower.includes('abu_dhabi')) {
    latitude = 25.2;
  } else if (tzLower.includes('kolkata') || tzLower.includes('calcutta') || tzLower.includes('mumbai') || tzLower.includes('delhi')) {
    latitude = 22.5;
  } else if (tzLower.includes('jakarta')) {
    latitude = -6.2;
  } else if (tzLower.includes('sydney') || tzLower.includes('melbourne')) {
    latitude = -33.8;
  } else if (tzLower.includes('auckland')) {
    latitude = -36.8;
  }

  const label = timezone.replace(/_/g, ' ').split('/').pop() || timezone;

  return { latitude, longitude, label, timezone };
}
