const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezoneEl = document.getElementById('timezone');
const coordsEl = document.getElementById('coords');
const currentTempEl = document.getElementById('current-temp');
const weatherForecastEl = document.getElementById('weather-forecast');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const API_KEY = '74087a43755a584e6bf15cc2a7edf687';

// Function to determine time and date of location called at every 1 second interval
setInterval(() => {
    const time = new Date()
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    // if hour is greater than or equal to 13 than modulus the hour else keep it as hour
    const hoursIn12 = hour >= 13 ? hour % 12 : hour;
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? "PM" : "AM"

    timeEl.innerHTML = (hoursIn12 < 10 ? '0' + hoursIn12 : hoursIn12) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + `<span id="am-pm">${ampm}</span>`
    dateEl.innerHTML = days[day] + ', ' + date + ' ' + months[month]

}, 1000);

// Function that allows user to get custom weather data for own location (uses two API calls, 1 to determine coords of location and then the other for weekly forecast info) 
function getCustomWeatherData() {
    const input = document.querySelector(".search-bar").value;
    console.log(input)

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${input}&units=metric&appid=74087a43755a584e6bf15cc2a7edf687`)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            let { lat, lon } = data.coord;
            console.log(lon, lat)
            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`).then(response => response.json()).then(data => {
                console.log(data)
                showWeatherData(data);
            });
        })
}

// Function that fetches weather data from OpenWeatherMap API based on users current location or based on infomration passed into search field
getWeatherData();
// Might have to set initial value for customLat and customLon so it doesnt give an undefined error?  (CustomLat=0, customLon=0)
function getWeatherData() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            // object destructuring to extract values of latitude and longitude
            let { latitude, longitude } = position.coords;

            // fetches the api with custom lat and long. Then it converts that information to JSON format . Then passes that information to the showWeatherData function
            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`).then(response => response.json()).then(data => {
                console.log(data)
                showWeatherData(data);
            });
        });
    }
}

// Allows search to happen when the search button is pressed or when enter key is pressed
document.querySelector(".search-btn").addEventListener("click", function () {
    getCustomWeatherData();
})

document.querySelector(".search-bar").addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
        getCustomWeatherData()
    }
})

// Function that dispalys the fetched weather data onto website
function showWeatherData(data) {
    let { humidity, pressure, wind_speed, sunrise, sunset, weather, feels_like } = data.current;
    desc = weather[0].main

    timezoneEl.innerHTML = data.timezone;

    // needed moment package to properly format some content
    currentWeatherItemsEl.innerHTML =
        `
    <div class="weather-item">
        <div>Feels Like (°C):</div>
        <div>${feels_like}</div>
    </div>
    <div class="weather-item">
        <div>Description:</div>
        <div>${desc}</div>
    </div>
    <div class="weather-item">
        <div>Humidity (%):</div>
        <div>${humidity}</div>
    </div>
    <div class="weather-item">
        <div>Pressure:</div>
        <div>${pressure}</div>
    </div>
    <div class="weather-item">
        <div>Wind Speed (km/h):</div>
        <div>${wind_speed}</div>
    </div>
    <div class="weather-item">
        <div>Sunrise (am):</div>
        <div>${window.moment(sunrise * 1000).format('HH:mm')}</div> 
    </div>
    <div class="weather-item">
        <div>Sunset (pm):</div>
        <div>${window.moment(sunset * 1000).format('HH:mm')}</div>
    </div>`;
    // adds background from unsplash that correlates with the key word from the description
    document.body.style.backgroundImage = "url('https://source.unsplash.com/1600x900/?" + desc + "')";


    let otherDayForecast = '';
    data.daily.forEach((day, index) => {
        if (index == 0) {
            currentTempEl.innerHTML = `
            <img src="http://openweathermap.org/img/wn//${day.weather[0].icon}@4x.png" alt="Weather Icon" class="weather-icon" />
            <div class="today-info-container">
                <div class="day">${window.moment(day.dt * 1000).format('dddd')}</div>
                <div class="temp">Day - ${day.temp.day}°C</div>
                <div class="temp">Night - ${day.temp.night}°C</div>
            </div>`
        }
        else {
            otherDayForecast += `
            <div class="weather-forecast-item">
                <div class="day">${window.moment(day.dt * 1000).format('ddd')}</div>
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="Weather Icon" class="weather-icon" />
                <div class="temp">Day - ${day.temp.day}°C</div>
                <div class="temp">Night - ${day.temp.night}°C</div>
            </div>`
        }
    })

    weatherForecastEl.innerHTML = otherDayForecast;

}