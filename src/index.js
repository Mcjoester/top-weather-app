import "./style.css";

let currentUnit = 'F';
let parsedWeatherData = [];

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
    return data.days.slice(0, 7).map(day => ({
      date: updateDateFormat(day.datetime),
      tempF: day.temp,
      tempC: convertToC(day.temp),
      minTemp: day.tempmin,
      minTempC: convertToC(day.tempmin),
      maxTemp: day.tempmax,
      maxTempC: convertToC(day.tempmax),
      icon: day.icon
    }));
  }

  function convertToC(fTemp) {
    let currentTemp = fTemp;
    let convertedTemp = ((currentTemp - 32) * 5 / 9).toFixed(1);
    return convertedTemp;
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

  function updateCards(weatherData) {
    const cards = document.querySelectorAll('.card');

    weatherData.forEach((day, index) => {
        if (cards[index]) {
            cards[index].querySelector('.weather-icon').src = `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/refs/heads/main/SVG/1st%20Set%20-%20Color/${day.icon}.svg`;
            cards[index].querySelector('.date').textContent = `Date: ${day.date}`;
            cards[index].querySelector('.temp').textContent = `Temperature: ${currentUnit === 'F' ? day.tempF + '°F' : day.tempC + '°C'}`;
            cards[index].querySelector('.minTemp').textContent = `Min: ${currentUnit === 'F' ? day.minTemp + '°F' : day.minTempC + '°C'}`;
            cards[index].querySelector('.maxTemp').textContent = `Max: ${currentUnit === 'F' ? day.maxTemp + '°F' : day.maxTempC + '°C'}`;
        }
    });
  }


document.getElementById('go').addEventListener('click', async () => {
    const location = document.getElementById('search').value;
    const rawData = await fetchWeather(location);
    if (!rawData) return;
 
    parsedWeatherData = parseWeatherData(rawData);
    const city = getLocation(rawData);
    const address = document.querySelector('.location');

    updateCards(parsedWeatherData);
    
    address.textContent = `${city.address}`;
    console.log(parsedWeatherData);
});

document.getElementById('toggle-temp').addEventListener('click', () => {
  currentUnit = currentUnit === 'F' ? 'C' : 'F';
  updateCards(parsedWeatherData);
  document.getElementById('toggle-temp').textContent = currentUnit === 'F' ? 'Switch to °C' : 'Switch to °F';
});


