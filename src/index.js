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

  function createTempBtn() {
    const headerRight = document.querySelector('.header-right');

    const tempBtnContainer = document.createElement('div');
    const tempBtn = document.createElement('button');

    tempBtnContainer.className = 'temp-btn-container';
    tempBtn.id = 'toggle-temp';
    tempBtn.textContent = 'Switch to °C';

    tempBtnContainer.appendChild(tempBtn);
    headerRight.appendChild(tempBtnContainer);

    tempBtn.addEventListener('click', () => {
      currentUnit = currentUnit === 'F' ? 'C' : 'F';
      renderMainCard(parsedWeatherData, parsedTodayWeatherData);
      renderWeatherCards(parsedWeatherData);
      tempBtn.textContent = currentUnit === 'F' ? 'Switch to °C' : 'Switch to °F';
    });
  }

  function renderLocationSpan(location) {
    const locationContainer = document.querySelector('.location-container');
    locationContainer.textContent = '';
    const locationSpan = createSpan(location, 'location');

    locationContainer.appendChild(locationSpan);
}

function renderMainCard(weatherData, currentData) {
  const mainCardContainer = document.querySelector('.main-card-container');
  mainCardContainer.textContent = '';

  const mainCard = createDiv('main-card');
  const todayContainer = createDiv('today-container');
  const todayDay = createSpan('Today', 'today');
  const today = weatherData[0];
  const currentConditionsData = currentData;
  
  const mainCardWrapper = createDiv('main-card-wrapper');

  const leftCard = createDiv('left-card');
  const icon = document.createElement('img');
  icon.className = 'weather-icon-main';
  icon.src = `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/refs/heads/main/SVG/1st%20Set%20-%20Color/${currentConditionsData.icon}.svg`;

  const rightCard = createDiv('right-card');
  const weekday = createSpan(`${today.dayOfWeek}`, 'weekday-main');
  const date = createSpan(`${today.date}`, 'date');
  const temp = createSpan(`Temperature: ${currentUnit === 'F' ? today.tempF + '°F' : today.tempC + '°C'}`, 'temp');
  const minTemp = createSpan(`Low: ${currentUnit === 'F' ? today.minTemp + '°F' : today.minTempC + '°C'}`, 'minTemp');
  const maxTemp = createSpan(`High: ${currentUnit === 'F' ? today.maxTemp + '°F' : today.maxTempC + '°C'}`, 'maxTemp');

  mainCardContainer.appendChild(mainCard);
  mainCard.appendChild(todayContainer);
  todayContainer.appendChild(todayDay);

  mainCard.appendChild(mainCardWrapper);

  mainCardWrapper.appendChild(leftCard);
  leftCard.appendChild(icon);

  mainCardWrapper.appendChild(rightCard);
  rightCard.appendChild(weekday);
  rightCard.appendChild(date);
  rightCard.appendChild(temp);
  rightCard.appendChild(minTemp);
  rightCard.appendChild(maxTemp);
}

function renderWeatherCards(weatherData) {
  const cardContainer = document.querySelector('.card-container');
  cardContainer.textContent = '';

  weatherData.slice(1).forEach(day => {
    const card = createCard(day);
    cardContainer.appendChild(card);
  });
}
  
function createCard(day) {
  const card = createDiv('card');

  const weatherIcon = document.createElement('img');
  weatherIcon.className = 'weather-icon';
  weatherIcon.src = `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/refs/heads/main/SVG/1st%20Set%20-%20Color/${day.icon}.svg`;

  const weekDay = createSpan(`${day.dayOfWeek}`, 'weekDay');
  const date = createSpan(`${day.date}`, 'date');
  const minTemp = createSpan(`Low: ${currentUnit === 'F' ? day.minTemp + '°F' : day.minTempC + '°C'}`, 'minTemp');
  const maxTemp = createSpan(`High: ${currentUnit === 'F' ? day.maxTemp + '°F' : day.maxTempC + '°C'}`, 'maxTemp');

  card.appendChild(weatherIcon);
  card.appendChild(weekDay);
  card.appendChild(date);
  card.appendChild(minTemp);
  card.appendChild(maxTemp);

  return card;
}

function createDiv(className = '') {
  const div = document.createElement('div');
  if (className) div.className = className;
  return div;
}

function createSpan(text, className = '') {
  const span = document.createElement('span');
  span.textContent = text;
  if (className) span.className = className;
  return span;
}

document.getElementById('go').addEventListener('click', async () => {
  const searchInput = document.getElementById('search');
  if (searchInput.value.length === 0) return;

  const location = document.getElementById('search').value;
  const rawData = await fetchWeather(location);
  const headerRight = document.querySelector('.header-right');
  const headerRightDivs = headerRight.querySelectorAll('div').length;
  console.log(`header right divs: ${headerRightDivs}`);

  if (!rawData) return;

  parsedWeatherData = parseWeatherData(rawData);
  parsedTodayWeatherData = parseCurrentConditionsData(rawData);

if (headerRightDivs === 0) {
  createTempBtn();
}

  renderLocationSpan(location);
  renderMainCard(parsedWeatherData, parsedTodayWeatherData);
  renderWeatherCards(parsedWeatherData);

  searchInput.value = '';
});


