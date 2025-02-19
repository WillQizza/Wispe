import { Router } from 'express';
import { fetchWeatherData } from '../services/weather';
import { apiMessage } from '../util/apiMessage';

export const router = Router();

router.get('/weather', async (_, res) => {
    const weatherData = await fetchWeatherData({ cacheAllowed: true });

    res.json(apiMessage(weatherData));
});