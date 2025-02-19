import { WEATHER_WEATHERAPI_API_KEY, WEATHER_WEATHERAPI_CITY } from '../config';

const WEATHER_API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_WEATHERAPI_API_KEY}&q=${WEATHER_WEATHERAPI_CITY}`;
const WEATHER_API_FETCH_INTERVAL = 60000 * 5;

let cachedWeatherData: WeatherAPIResponse | null = null;
let cacheTime = -1;

function shouldRefetchWeatherData() {
    return cacheTime + WEATHER_API_FETCH_INTERVAL < Date.now();
}

export type WeatherAPIResponse = {
    temperature: number,
    willRain: boolean,
    willSnow: boolean
};

async function fetchWeatherData({ cacheAllowed } : { cacheAllowed: boolean }) {
    if (!shouldRefetchWeatherData() && cacheAllowed && cachedWeatherData) {
        return cachedWeatherData;
    }

    const response = await fetch(WEATHER_API_URL);
    const json = await response.json() as any;

    cachedWeatherData = {
        temperature: json.current.temp_c,
        willRain: !!json.forecast.forecastday[0].day.daily_will_it_rain,
        willSnow: !!json.forecast.forecastday[0].day.daily_will_it_snow
    };
    cacheTime = Date.now();

    return cachedWeatherData;
}

export {
    fetchWeatherData
};