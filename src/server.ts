import App from './app';
import WeatherController from './weather/weather.controller';
 
const app = new App(
  [
    new WeatherController(),
  ],
  5000,
);
 
app.listen();