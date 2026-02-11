// OpenWeatherMap Current Weather API 응답 타입
export interface WeatherResponse {
  coord: Coordinates;
  weather: WeatherCondition[];
  main: WeatherMain;
  visibility: number;
  wind: Wind;
  clouds: Clouds;
  dt: number;
  sys: WeatherSys;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

// OpenWeatherMap 5 Day / 3 Hour Forecast API 응답 타입
export interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: ForecastCity;
}

export interface ForecastItem {
  dt: number;
  main: WeatherMain;
  weather: WeatherCondition[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  dt_txt: string;
}

export interface ForecastCity {
  id: number;
  name: string;
  coord: Coordinates;
  country: string;
  timezone: number;
  sunrise: number;
  sunset: number;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

export interface Wind {
  speed: number;
  deg: number;
  gust?: number;
}

export interface Clouds {
  all: number;
}

export interface WeatherSys {
  country: string;
  sunrise: number;
  sunset: number;
}

// 앱 내부에서 사용할 가공된 날씨 데이터
export interface WeatherData {
  locationName: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  coord: Coordinates;
  dt: number;
}

// 앱 내부에서 사용할 시간별 날씨 데이터
export interface HourlyWeather {
  dt: number;
  temp: number;
  icon: string;
  description: string;
  pop: number;
}
