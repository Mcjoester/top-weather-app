import "./style.css";

// Services
class WeatherService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
  }

  async fetchWeather(location) {
    try {
      const response = await fetch(`${this.baseUrl}/${location}?key=${this.apiKey}`, {mode: 'cors'});
      if (!response.ok) throw new Error("Network Error");
      return await response.json();
    } catch (error) {
      console.log("Error fetching weather data:", error);
    }
  }
}

class WeatherParser {
  static parseForecast(data) {
    return data.days.slice(0, 7).map(day => ({
      date: DateFormatter.format(day.datetime),
      tempF: day.temp,
      tempC: TemperatureConverter.toC(day.temp),
      minTemp: day.tempmin,
      minTempC: TemperatureConverter.toC(day.tempmin),
      maxTemp: day.tempmax,
      maxTempC: TemperatureConverter.toC(day.tempmax),
      icon: day.icon,
      dayOfWeek: DateFormatter.getDayOfWeek(day.datetime),
    }));
  }

  static parseCurrentConditions(data) {
    return data.currentConditions;
  }

  static parseLocation(data) {
    return data.resolvedAddress;
  }
}

// Utilities
class TemperatureConverter {
  static toC(fTemp) {
    return ((fTemp - 32) * 5 / 9).toFixed(1);
  }
}

class DateFormatter {
  static getDayOfWeek(date) {
    const [year, month, day] = date.split("-");
    const dateObject = new Date(year, month - 1, day);
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekdays[dateObject.getDay()];
  }

  static format(date) {
    const [year, month, day] = date.split("-");
    return `${month}/${day}/${year}`;
  }
}

// UI Rendering
class WeatherUI {
  constructor() {
    this.currentUnit = "F";
  }

  toggleUnit() {
    this.currentUnit = this.currentUnit === "F" ? "C" : "F";
  }

  renderLocation(resolvedLocation) {
    const locationContainer = document.querySelector('.location-container');
    locationContainer.textContent = '';
    locationContainer.appendChild(this.createSpan(resolvedLocation, "location"));
  }

  renderMainCard(forecast, currentData) {
    const today = forecast[0];
    const container = document.querySelector('.main-card-container');
    container.textContent = '';

    const mainCard = this.createDiv('main-card');
    const todayContainer = this.createDiv('today-container');
    const todayLabel = this.createSpan('Today', 'today');

    const mainCardWrapper = this.createDiv('main-card-wrapper');

    const leftCard = this.createDiv('left-card');
    const icon = this.createIcon(currentData.icon, 'weather-icon-main');

    const rightCard =  this.createDiv('right-card');
    const weekday = this.createSpan(today.dayOfWeek, 'weekday-main');
    const date = this.createSpan(today.date, 'date');
    const temp = this.createSpan(`Temperature: ${this.formatTemp(today.tempF, today.tempC)}`, "temp");
    const minTemp = this.createSpan(`Low: ${this.formatTemp(today.minTemp, today.minTempC)}`, "minTemp");
    const maxTemp = this.createSpan(`High: ${this.formatTemp(today.maxTemp, today.maxTempC)}`, "maxTemp");

    container.appendChild(mainCard);
    mainCard.appendChild(todayContainer);
    todayContainer.appendChild(todayLabel);

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

  renderWeatherCards(forecast) {
    const cardContainer = document.querySelector('.card-container');
    cardContainer.textContent = '';

    forecast.slice(1).forEach(day => {
      const card = this.createDiv('card');
      card.appendChild(this.createIcon(day.icon, 'weather-icon'));
      card.appendChild(this.createSpan(day.dayOfWeek, 'weekDay'));
      card.appendChild(this.createSpan(day.date, 'date'));
      card.appendChild(this.createSpan(`Low: ${this.formatTemp(day.minTemp, day.minTempC)}`, "minTemp"));
      card.appendChild(this.createSpan(`High: ${this.formatTemp(day.maxTemp, day.maxTempC)}`, "maxTemp"));
      cardContainer.appendChild(card);
    });
  }

  renderTempToggleButton(callback) {
    const headerRight = document.querySelector('.header-right');
    if (headerRight.querySelector('button')) return;

    const btn = document.createElement('button');
    btn.id = 'toggle-temp';
    btn.textContent = 'Switch to °C';

    btn.addEventListener('click', () => {
      this.toggleUnit();
      btn.textContent = this.currentUnit === "F" ? "Switch to °C" : "Switch to °F";
      callback();
    });

    headerRight.appendChild(btn);
  }

  convertTemp(forecast) {
    const today = forecast[0];
    const rightCard = document.querySelector('.right-card');
    const mainTemp = rightCard.querySelector('.temp');

    mainTemp.textContent = `Temperature: ${this.formatTemp(today.tempF, today.tempC)}`;
  }

  // Helpers
  formatTemp(f, c) {
    return this.currentUnit === "F" ? `${f}°F` : `${c}°C`;
  }

  createDiv(className) {
    const div = document.createElement('div');
    div.className = className;
    return div;
  }

  createSpan(text, className) {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = className;
    return span;
  }

  createIcon(icon, className) {
    const img = document.createElement('img');
    img.className = className;
    img.src = `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/refs/heads/main/SVG/1st%20Set%20-%20Color/${icon}.svg`;
    return img; 
  }
}

// Controller 
class WeatherApp {
  constructor(apiKey) {
    this.service = new WeatherService(apiKey);
    this.ui = new WeatherUI();
    this.forecast = [];
    this.currentConditions = {};
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('go').addEventListener('click', async () => {
      const input = document.getElementById('search');
      if(!input.value) return;
      await this.loadWeather(input.value);
      input.value = '';
    });
  }

  async loadWeather(location) {
    const rawData = await this.service.fetchWeather(location);
    console.log(rawData);
    if (!rawData) return;

    this.forecast = WeatherParser.parseForecast(rawData);
    this.currentConditions = WeatherParser.parseCurrentConditions(rawData);
    this.resolvedAddress = WeatherParser.parseLocation(rawData);

    this.ui.renderLocation(this.resolvedAddress);
    this.ui.renderMainCard(this.forecast, this.currentConditions);
    this.ui.renderWeatherCards(this.forecast);
    this.ui.renderTempToggleButton(() => {
      this.ui.renderMainCard(this.forecast, this.currentConditions);
      this.ui.renderWeatherCards(this.forecast);
    })
  }
}

const app = new WeatherApp("EYNL5FK7HKUDJM6QSA4Z828ND");




