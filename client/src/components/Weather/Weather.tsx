import React from 'react';
import ForecastRow from './ForecastRow';

const weatherCodes = {
  //these are what each of the weather codes mean; no codes should be missing even though there are gaps between numbers
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  56: 'Light Freezing Drizzle',
  57: 'Dense Freezing Drizzle',
  61: 'Light Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Light Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Light Showers',
  81: 'Moderate Showers',
  82: 'Violent Showers',
  85: 'Light Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm With Light Hail',
  99: 'Thunderstorm with Heavy Hail',
};

const Weather = () => {
  return (
    <div>
      <ForecastRow></ForecastRow>
    </div>
  );
};

export default Weather;
