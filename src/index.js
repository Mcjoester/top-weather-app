import "./style.css";

let currentUnit = 'F';
let parsedWeatherData = [];
let parsedTodayWeatherData = [];

async function fetchWeather(location) {
    try {
        const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=EYNL5FK7HKUDJM6QSA4Z828ND`, { mode: 'cors' });
        if (!response.ok) throw new Error("Network error");
        const weatherData = await response.json();
        console.log(weatherData);
        return weatherData;
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

function parseWeatherData(data) {
    return data.days.slice(0, 8).map(day => ({
      date: updateDateFormat(day.datetime),
      tempF: day.temp,
      tempC: convertToC(day.temp),
      minTemp: day.tempmin,
      minTempC: convertToC(day.tempmin),
      maxTemp: day.tempmax,
      maxTempC: convertToC(day.tempmax),
      icon: day.icon, 
      dayOfWeek: getDayOfWeek(day.datetime)
    }));
  }

  function parseCurrentConditionsData(data) {
    const currentConditions = data.currentConditions;
    return currentConditions;
  }

  function convertToC(fTemp) {
    let currentTemp = fTemp;
    let convertedTemp = ((currentTemp - 32) * 5 / 9).toFixed(1);
    return convertedTemp;
  }

  function getDayOfWeek(date) {
    const dateObject = new Date(date);
    const dayOfWeekNumber = dateObject.getDay();
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dayOfWeekName = weekdays[dayOfWeekNumber];
    return dayOfWeekName;
  }



  function updateDateFormat(date) {
    const currentDate = date;
    const splitDate = currentDate.split('-');
    const month = splitDate[1];
    const day = splitDate[2];
    const year = splitDate[0];
    const formattedDate = `${month}-${day}-${year}`;
    return formattedDate;
  }

  function getLocation(data) {
    return {
        address: data.resolvedAddress,
    };
  }

  function updateCards(weatherData, currentData) {
    const mainCard = document.querySelector('.main-card');
    const cards = document.querySelectorAll('.card');

    const today = weatherData[0];
    const currentConditionsData = currentData;
    if (mainCard && today && currentConditionsData) {
        mainCard.querySelector('.weather-icon-main').src =
            `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/refs/heads/main/SVG/1st%20Set%20-%20Color/${currentConditionsData.icon}.svg`;
        mainCard.querySelector('.weekday-main').textContent = `${today.dayOfWeek}`;    
        mainCard.querySelector('.date').textContent = `Date: ${today.date}`;
        mainCard.querySelector('.temp').textContent =
            `Temperature: ${currentUnit === 'F' ? today.tempF + '°F' : today.tempC + '°C'}`;
        mainCard.querySelector('.minTemp').textContent =
            `Low: ${currentUnit === 'F' ? today.minTemp + '°F' : today.minTempC + '°C'}`;
        mainCard.querySelector('.maxTemp').textContent =
            `High: ${currentUnit === 'F' ? today.maxTemp + '°F' : today.maxTempC + '°C'}`;
    }

    weatherData.slice(1).forEach((day, index) => {
        if (cards[index]) {
            cards[index].querySelector('.weather-icon').src = `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/refs/heads/main/SVG/1st%20Set%20-%20Color/${day.icon}.svg`;
            cards[index].querySelector('.weekDay').textContent = `${day.dayOfWeek}`;
            cards[index].querySelector('.date').textContent = `Date: ${day.date}`;
            cards[index].querySelector('.minTemp').textContent = `Low: ${currentUnit === 'F' ? day.minTemp + '°F' : day.minTempC + '°C'}`;
            cards[index].querySelector('.maxTemp').textContent = `High: ${currentUnit === 'F' ? day.maxTemp + '°F' : day.maxTempC + '°C'}`;
        }
    });
  }


document.getElementById('go').addEventListener('click', async () => {
    const location = document.getElementById('search').value;
    const rawData = await fetchWeather(location);
    const searchInput = document.getElementById('search');

    const buttonContainer = document.querySelector('.temp-btn-container');
    const mainCardContainer = document.querySelector('.main-card-container');
    const cardContainer = document.querySelector('.card-container');


    if (!rawData) return;

    parsedWeatherData = parseWeatherData(rawData);
    parsedTodayWeatherData = parseCurrentConditionsData(rawData);
    const city = getLocation(rawData);
    const address = document.querySelector('.location');

    updateCards(parsedWeatherData, parsedTodayWeatherData);
    
    address.textContent = `${city.address}`;
    console.log(parsedWeatherData);
    searchInput.value = '';
    buttonContainer.classList.add('active');
    mainCardContainer.classList.add('active');
    cardContainer.classList.add('active');
    
});

document.getElementById('toggle-temp').addEventListener('click', () => {
  currentUnit = currentUnit === 'F' ? 'C' : 'F';
  updateCards(parsedWeatherData, parsedTodayWeatherData);
  document.getElementById('toggle-temp').textContent = currentUnit === 'F' ? 'Switch to °C' : 'Switch to °F';
});


