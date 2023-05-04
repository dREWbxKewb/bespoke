import React, { useState, useContext, useEffect, createContext } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  weatherIcons,
  badgeInfo,
  standardTiers,
  weeklyTiers,
  badgesWithSpecialTiers,
} from '../assets';
import App from './components/App';
import Home from './components/Home';
import BulletinBoard from './components/BulletinBoard/BulletinBoard';
import Weather from './components/Weather/Weather';
import Profile from './components/Profile/Profile';
import CreateReport from './components/Reports/CreateReport';
import Stopwatch from './components/Profile/Stopwatch';
import RouteM from './components/BikeRoutes/RouteM';
import ReportsMap from './components/Reports/ReportsMap';
import DirectMessages from './components/DirectMessages/DirectMessages';
import { GlobalStyleLight, GlobalStyleDark } from './ThemeStyles';
import { ThemeProvider, useTheme } from './components/Profile/ThemeContext';
import LeaderBoard from './components/LeaderBoard/LeaderBoard';
import { Prisma } from '@prisma/client';
import ReportsList from './components/Reports/ReportsList';

export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weatherdescription: string;
  is_day: number | undefined;
  time: Date;
}

export interface MeasurementUnits {
  temperature: string;
  speed: string;
  precipitation: string;
  visibility: string;
  depth: string;
}

export interface Hourly {
  displayIcon: boolean;
  time: Date;
  temperature: number;
  humidity: number;
  apparentTemperature: number;
  cloudcover: number;
  windspeed: number;
  precipitation: number;
  snowfall: number;
  precipitationProbability: number;
  rain: number;
  showers: number;
  weatherDescription: string;
  snowDepth: number;
  visibility: number;
  isDay: boolean;
}

export interface RootPropsToWeather {
  windSpeedMeasurementUnit: string;
  temperatureMeasurementUnit: string;
  precipitationMeasurementUnit: string;
  sunriseHour: number;
  sunsetHour: number;
  hourlyForecasts: Hourly[];
  prepareWeatherIcon: (
    weather: string,
    isDay: boolean,
    hour: number,
    chanceOfRain: number,
    rainfall: number,
    snowfall: number
  ) => string;
  setHourlyForecasts?: (unit: Hourly[]) => void;
  setWindSpeedMeasurementUnit?: (unit: string) => void;
  setTemperatureMeasurementUnit?: (unit: string) => void;
  setPrecipitationMeasurementUnit?: (unit: string) => void;
  getForecasts?: () => void;
}

export interface RootPropsToHome {
  homeForecasts: Hourly[];
  windSpeedMeasurementUnit: string;
  temperatureMeasurementUnit: string;
  precipitationMeasurementUnit: string;
  prepareWeatherIcon: (
    weather: string,
    isDay: boolean,
    hour: number,
    chanceOfRain: number,
    rainfall: number,
    snowfall: number
  ) => string;
}
export interface StopwatchTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface StopwatchStatsProps {
  stopwatchActivity: string;
  stopwatchDuration: number;
  stopwatchCalories: number;
}

export interface User {
  email?: string;
  id?: number;
  name?: string;
  thumbnail?: any;
  weight?: any;
  homeAddress?: string;
  location_lat: number;
  location_lng: number;
}

export interface geoLocation {
  lat: number;
  lng: number;
}

export interface Badge {
  id: number;
  name: string;
  badgeIcon: string;
  tier?: number;
}

export interface BadgeWithAdditions extends Badge {
  counter?: number;
  description?: string;
}

export const UserContext = createContext<any>(Object());

const Root = () => {
  /////////// LIGHT/DARK MODE///////////////
  const [isDark, setIsDark] = useState(false);

  const handleToggleStyle = () => {
    setIsDark((prevIsDark) => !prevIsDark);

    const currentTheme = isDark ? GlobalStyleDark : GlobalStyleLight;

    // const location = useLocation();
    // let savedTheme = location.state && location.state.savedTheme;
    // setIsDark(savedTheme);
  };
  //.........................................

  // Created User Info and Geolocation for context //
  const [user, setUser] = useState<any>();
  const [geoLocation, setGeoLocation] = useState<any>();
  const [error, setError] = useState<string | undefined>(undefined);
  //holds all badge objects
  const [allBadges, setAllBadges] = useState<Badge[]>([
    {
      id: 0,
      name: 'No Achievements',
      badgeIcon:
        'https://www.baptistpress.com/wp-content/uploads/images/IMG201310185483HI.jpg',
      tier: 0,
    },
  ]);
  //holds badge objects associated with user
  const [userBadges, setUserBadges] = useState<BadgeWithAdditions[]>([
    {
      id: 0,
      name: 'No Achievements',
      badgeIcon:
        'https://www.baptistpress.com/wp-content/uploads/images/IMG201310185483HI.jpg',
      tier: 0,
      counter: 0,
      description: '',
    },
  ]);
  //holds URL of badge to display by username
  const [selectedBadge, setSelectedBadge] = useState<string>(
    userBadges[0].badgeIcon
  );

  //stately variables to save the units of measurement the user wishes weather related figures to be displayed in
  const [windSpeedMeasurementUnit, setWindSpeedMeasurementUnit] =
    useState<string>('mph'); //should be either 'mph' or 'kmh',
  const [temperatureMeasurementUnit, setTemperatureMeasurementUnit] =
    useState<string>('fahrenheit'); //should be either 'fahrenheit' or 'celsius'
  const [precipitationMeasurementUnit, setPrecipitationMeasurementUnit] =
    useState<string>('inch'); //should be either 'mm' or 'inch'
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather>({
    temperature: 0,
    windspeed: 0,
    winddirection: 0,
    weatherdescription: '',
    is_day: undefined,
    time: new Date(),
  }); //note: currentWeather is only going to be used on the home screen - everything else will just use the hourly breakdown

  //stately variables for the 24 hourly forecasts in a given day as well as that day's sunrise and sunset times
  const [hourlyForecasts, setHourlyForecasts] = useState<Hourly[]>([]);
  const [sunriseHour, setSunriseHour] = useState<number>(0);
  const [sunsetHour, setSunsetHour] = useState<number>(0);

  //coordinates for Marcus: latitude = 30.0; longitude = -90.17;
  const numDaysToForecast: number = 1; //this is for if we implement a weekly weather report
  const getForecasts = () => {
    //axios request has been tested and is working; states are properly being set with objects containing the required values
    axios
      .get('/weather/forecast', {
        params: {
          precipitationUnit: precipitationMeasurementUnit,
          windSpeedUnit: windSpeedMeasurementUnit,
          temperatureUnit: temperatureMeasurementUnit,
          latitude: geoLocation.lat,
        //latitude: 29.9511,
          longitude: geoLocation.lng,
        //longitude: -90.0715,
          numDaysToForecast: numDaysToForecast,
        },
      })
      .then(({ data }) => {
        setSunriseHour(data.sunriseHour);
        setSunsetHour(data.sunsetHour);
        setCurrentWeather(data.currentWeather);
        setHourlyForecasts(data.hourly);
      })
      .catch((err) =>
        console.error(
          'an error occured with clientside GET request for forecasts: ',
          err
        )
      );
  };

  //function to set the weather icon based on the weather for the hour in question
  const prepareWeatherIcon = (
    weather: string,
    isDay: boolean,
    hour: number,
    chanceOfRain: number,
    rainfall: number,
    snowfall: number
  ) => {
    //setting time of day
    let timeOfDay = 'generic';
    if (isDay === true) {
      timeOfDay = 'day';
    } else if (isDay === false) {
      timeOfDay = 'night';
    }
    //setting weather icon
    let weatherIcon = weatherIcons.day.clear;
    if (weather === 'Clear Sky' || weather === 'Mainly Clear') {
      weatherIcon = weatherIcons[timeOfDay].clear;
    } else if (weather === 'Partly Cloudy') {
      weatherIcon = weatherIcons[timeOfDay].partlyCloudy.base;
    } else if (weather === 'Overcast') {
      weatherIcon = weatherIcons[timeOfDay].overcast;
    } else if (weather === 'Fog') {
      weatherIcon = weatherIcons[timeOfDay].fog;
    } else if (weather === 'Depositing Rime Fog') {
      weatherIcon = weatherIcons[timeOfDay].haze;
    } else if (
      weather === 'Light Drizzle' ||
      weather === 'Moderate Drizzle' ||
      weather === 'Dense Drizzle'
    ) {
      weatherIcon = weatherIcons[timeOfDay].drizzle;
    } else if (
      weather === 'Light Freezing Drizzle' ||
      weather === 'Dense Freezing Drizzle'
    ) {
      weatherIcon = weatherIcons[timeOfDay].sleet;
    } else if (
      weather === 'Light Rain' ||
      weather === 'Moderate Rain' ||
      weather === 'Heavy Rain' ||
      weather === 'Light Showers' ||
      weather === 'Moderate Showers' ||
      weather === 'Violent Showers'
    ) {
      weatherIcon = weatherIcons[timeOfDay].rain;
    } else if (
      weather === 'Moderate Snow' ||
      weather === 'Heavy Snow' ||
      weather === 'Snow Grains' ||
      weather === 'Light Snow Showers' ||
      weather === 'Heavy Snow Showers'
    ) {
      weatherIcon = weatherIcons[timeOfDay].snow;
    } else if (weather === 'Thunderstorm') {
      if (chanceOfRain >= 50) {
        if (rainfall > 0) {
          weatherIcon = weatherIcons[timeOfDay].thunderstorm.rain;
        } else if (snowfall > 0) {
          weatherIcon = weatherIcons[timeOfDay].thunderstorm.snow;
        }
      } else {
        weatherIcon = weatherIcons[timeOfDay].thunderstorm.base;
      }
    } else if (
      weather === 'Thunderstorm With Light Hail' ||
      weather === 'Thunderstorm With Heavy Hail'
    ) {
      weatherIcon = weatherIcons[timeOfDay].thunderstorm.snow;
    }
    //control for sunrise/sunset
    const moonriseHour = sunsetHour + 1;
    const moonsetHour = sunriseHour - 1;
    const pertinentWeather = !(
      weather === 'Clear Sky' ||
      weather === 'Mainly Clear' ||
      weather === 'Fog' ||
      weather === 'Partly Cloudy'
    );
    if (hour === sunriseHour && !pertinentWeather) {
      weatherIcon = weatherIcons.day.sunrise;
    } else if (hour === sunsetHour && !pertinentWeather) {
      weatherIcon = weatherIcons.day.sunset;
    } else if (hour === moonriseHour && !pertinentWeather) {
      weatherIcon = weatherIcons.night.moonrise;
    } else if (hour === moonsetHour && !pertinentWeather) {
      weatherIcon = weatherIcons.night.moonset;
    }
    return weatherIcon;
  };

  //gets all badge objects on database as well as all badges the user has earned
  const getBadges = () => {
    axios
      .get('badges/all-badges')
      .then(({ data }) => {
        setAllBadges(data.allBadges);
        //add descriptions to the Badge objects for use in Tooltips
        let earnedBadges = data.earnedBadges.map((ele) => {
          for (let i = 0; i < badgeInfo.length; i++) {
            if (badgeInfo[i].name === ele.name) {
              ele.description = badgeInfo[i].description;
            }
          }
          return ele;
        });
        //add current count for all counters on all user badges that have counters
        data.joinTableBadges.forEach((ele) => {
          for (let i = 0; i < earnedBadges.length; i++) {
            if (earnedBadges[i].counter) {
              if (earnedBadges[i].id === ele.badgeId) {
                earnedBadges[i].counter = ele.counter;
              }
            }
          }
        });
        setUserBadges(earnedBadges);
      })
      .catch((err) => {
        console.error('Failed to get badges from database: ', err);
      });
  };

  //function to ensure user's selected badge is displayed by their name
  //Note that this will not affect other users' display badges - that functionality must be programmed elsewhere
  const getSelectedBadge = () => {
    axios
      .get('/badges/selected-badge')
      .then(({ data }) => {
        setSelectedBadge(data);
      })
      .catch((err) => {
        console.error('Failed to get badges on user: ', err);
      });
  };

  //function to check if tier should increase (and increase it if so)
  const tierCheck = (badgeName, tier) => {
    let badgeId = 0;
    //look through all of the badges to find the one with this badge name and tier; get its id
    for (let i = 0; i < allBadges.length; i++) {
      if (allBadges[i].tier) {
        if (allBadges[i].tier === tier && allBadges[i].name === badgeName) {
          badgeId = allBadges[i].id;
          break;
        }
      }
    }
    if (badgeId === 0) {
      console.error('There is no tier to check!');
      return;
    }
    let tiersObj = standardTiers;
    if (badgesWithSpecialTiers[badgeName] !== undefined) {
      tiersObj = badgesWithSpecialTiers[badgeName];
    }
    let config = {
      badgeId: badgeId,
      tiers: {
        ...tiersObj,
      },
    };
    axios
      .post('/badges/tier', config)
      .then(() => {
        getBadges(); //update allBadges and badgesOnUser with new DB info
      })
      .catch((err) =>
        console.error('there was an error when checking/updating tiers')
      );
  };

  //function to add or remove (or update?) badges for users
  const addBadge = (badgeName, tier = undefined) => {
    //will not attempt to add badge if it already exists on user
    const badgeNamesOnUser = userBadges.map((ele) => {
      return ele.name;
    });
    if (!badgeNamesOnUser.includes(badgeName)) {
      let badgeId = 0;
      for (let i = 0; i < allBadges.length; i++) {
        if (allBadges[i].tier) {
          if (allBadges[i].tier === tier && allBadges[i].name === badgeName) {
            badgeId = allBadges[i].id;
            break;
          }
        } else {
          if (allBadges[i].name === badgeName) {
            badgeId = allBadges[i].id;
            break;
          }
        }
      }
      axios
        .post('/badges/add', {
          badgeId: badgeId,
        })
        .then(() => {
          getBadges(); //update allBadges and badgesOnUser with new DB info
        })
        .catch((err) =>
          console.error(
            `an error has occurred adding badge with ID ${badgeId} to user`,
            err
          )
        );
    }
  };

  //function to increment or decrement values on the User table used for achievements/badges
  //will change counter by +1 by default. Enter number to change by as final argument to increase by more than one (or decrease if negative number is passed)
  const updateBadgeCounter = (badgeName, tier = undefined, change = 1) => {
    let badgeId = 0;
    for (let i = 0; i < allBadges.length; i++) {
      if (allBadges[i].tier) {
        if (allBadges[i].tier === tier && allBadges[i].name === badgeName) {
          badgeId = allBadges[i].id;
          break;
        }
      } else {
        if (allBadges[i].name === badgeName) {
          badgeId = allBadges[i].id;
          break;
        }
      }
    }
    axios
      .patch('/badges/counter', {
        badgeId: badgeId,
        change: change,
      })
      .then(() =>
        console.log(`successfully updated badge with ID ${badgeId} on user`)
      )
      .catch((err) =>
        console.error(
          `an error occurred attempting to increment/decrement counter for user's badge with id ${badgeId}`,
          err
        )
      );
  };

  const findContext = () => {
    axios
      .get('auth/user')
      .then(({ data }) => {
        setUser({
          email: data.email,
          id: data.id,
          name: data.name,
          thumbnail: data.thumbnail,
          weight: data.weight,
          homeAddress: data.homeAddress,
          location_lat: parseFloat(data.location_lat),
          location_lng: parseFloat(data.location_lng),
        });
        setIsDark(!data.theme);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getLocation = () => {
    let interval: any | undefined;
    if (navigator.geolocation) {
      interval = setInterval(() => {
        if (!navigator.geolocation) {
          setError('Geolocation is not supported by this browser.');
          clearInterval(interval!);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setGeoLocation({ lat: latitude, lng: longitude });
            clearInterval(interval!);
            interval = null;
          },
          (error) => setError(error.message)
        );
      }, 1000);
    } else {
      setError('Geolocation is not supported by this browser.');
    }
    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  };

  const updateUserLocation = (geoObj: geoLocation) => {
    const id = user!.id;
    const updatedData = {
      location_lat: geoObj.lat,
      location_lng: geoObj.lng,
    };
    axios
      .put(`/home/user/${id}`, updatedData)
      .then(() => findContext())
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    if (geoLocation) {
      updateUserLocation(geoLocation);
      getForecasts();
    }
  }, []);

  useEffect(() => {
    getLocation();
    findContext();
    getBadges();
    getSelectedBadge();
  }, []);

  //function to watch userBadges and allBadges so that if badges update (new badge earned) it will update the displayed badges too
  useEffect(() => {}, [userBadges, allBadges]);

  //sets user's displayed icon to their selected one; should update when the state variable for the badge URL changes
  useEffect(() => {
    if (
      selectedBadge !==
      'https://www.baptistpress.com/wp-content/uploads/images/IMG201310185483HI.jpg'
    ) {
      axios
        .patch('/badges/set', {
          iconURL: selectedBadge!,
        })
        .then() //log success?
        .catch((err) =>
          console.error(
            `an error has occurred when PATCHing User with new badge URL: ${selectedBadge}`,
            err
          )
        );
    }
  }, [selectedBadge]);

  let homeForecasts: Hourly[] = new Array(4).fill(0).map(() => ({
    displayIcon: true,
    time: new Date(),
    temperature: 0,
    humidity: 0,
    apparentTemperature: 0,
    cloudcover: 0,
    windspeed: 0,
    precipitation: 0,
    snowfall: 0,
    precipitationProbability: 0,
    rain: 0,
    showers: 0,
    weatherDescription: '',
    snowDepth: 0,
    visibility: 0,
    isDay: true,
  }));

  let found = false;
  let countIndex = 0;
  hourlyForecasts.forEach((ele) => {
    if (found === true && countIndex < 4) {
      homeForecasts[countIndex] = ele;
      countIndex++;
    }
    if (ele.time === currentWeather.time) {
      found = true;
      homeForecasts[countIndex] = ele;
      countIndex++;
    }
  });

  homeForecasts.forEach((ele, i) => {
    if (i !== 0) {
      ele.displayIcon = false;
    }
  });
  const reports = [];

  return (
    //This <> tag and it's closing tag are an important part of wrapping the app for dark/light modes
    // <>
    
    <div className={isDark ? 'dark' : 'light'}>
      <UserContext.Provider value={user!}></UserContext.Provider>
      <UserContext.Provider
        value={{
          user,
          geoLocation,
          userBadges,
          setUserBadges,
          selectedBadge,
          setSelectedBadge,
          updateBadgeCounter,
          addBadge,
          tierCheck,
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<App />}>
              <Route
                path='/home'
                element={
                  <Home
                    homeForecasts={homeForecasts}
                    windSpeedMeasurementUnit={windSpeedMeasurementUnit}
                    temperatureMeasurementUnit={temperatureMeasurementUnit}
                    precipitationMeasurementUnit={precipitationMeasurementUnit}
                    prepareWeatherIcon={prepareWeatherIcon}
                  />
                }
              />
              <Route path='bulletinBoard' element={<BulletinBoard />} />
              <Route path='bikeRoutes' element={<RouteM />} />
              <Route
                path='weather'
                element={
                  <Weather
                    windSpeedMeasurementUnit={windSpeedMeasurementUnit}
                    temperatureMeasurementUnit={temperatureMeasurementUnit}
                    precipitationMeasurementUnit={precipitationMeasurementUnit}
                    sunriseHour={sunriseHour}
                    sunsetHour={sunsetHour}
                    hourlyForecasts={hourlyForecasts}
                    prepareWeatherIcon={prepareWeatherIcon}
                    setWindSpeedMeasurementUnit={setWindSpeedMeasurementUnit}
                    setTemperatureMeasurementUnit={
                      setTemperatureMeasurementUnit
                    }
                    setPrecipitationMeasurementUnit={
                      setPrecipitationMeasurementUnit
                    }
                    getForecasts={getForecasts}
                  />
                }
              />
              <Route
                path='profile'
                element={
                  <Profile
                    handleToggleStyle={handleToggleStyle}
                    isDark={isDark}
                    setIsDark={setIsDark}
                  />
                }
              />
              <Route path='directMessages' element={<DirectMessages />} />
              <Route path='createReport' element={<CreateReport />} />
              <Route
                path='reportsList'
                element={<ReportsList reports={reports} />}
              />
              <Route
                path='reportsList'
                element={<ReportsList reports={reports} />}
              />
              <Route path='reportsMap' element={<ReportsMap />} />
              {/* <Route path='stopwatch' element={<Stopwatch />} /> */}
              <Route path='directMessages' element={<DirectMessages />} />
            </Route>
          </Routes>
          {/* <button onClick={handleToggleStyle}>{isDark ? 'Light Mode' : 'Dark Mode'}</button> */}
          {isDark ? <GlobalStyleDark /> : <GlobalStyleLight />}
          {/* <Stopwatch /> */}
        </BrowserRouter>
      </UserContext.Provider>
    </div>
    // </>
  );
};

export default Root;
