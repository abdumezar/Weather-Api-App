let MainApi = new XMLHttpRequest();
let searchInput = document.querySelector(".search input");
let searchWord = "";
let days = ["Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let currentDayIndex = -1;
let currentMonthIndex = -1;
let currentDay = -1;
let weatherJson;

if (localStorage.getItem("searchWord") != null) {
  currentDay = localStorage.getItem("currentDay");
  currentDayIndex = localStorage.getItem("currentDayIndex");
  currentMonthIndex = localStorage.getItem("currentMonthIndex");
  StartWeatherApi(localStorage.getItem("searchWord"));
} else {
  StartWeatherApi("Cairo");
}

searchInput.addEventListener("keyup", function () {
  searchWord = searchInput.value;
  StartWeatherApi(searchWord);
});

document.querySelector(".search button").addEventListener("click", function () {
  searchWord = searchInput.value;
  StartWeatherApi(searchWord);
});

function StartWeatherApi(searchWord) {
  MainApi.open("POST", `https://api.weatherapi.com/v1/forecast.json?key=203041c514c0438fae8134055222812&q=${searchWord}&days=3&aqi=no&alerts=no`);
  if (searchWord.length > 2) {
    MainApi.send();
    MainApi.addEventListener("readystatechange", function () {
      if (MainApi.readyState == 4 && MainApi.status == 200) {
        weatherJson = JSON.parse(MainApi.response);
        localStorage.setItem("searchWord", JSON.parse(MainApi.response).location.name);
        changeweather();
      }
    });
  }
}

function changeweather() {
  changeweatherToday();
  changeweatherTomorrow();
  changeweatherAfterTomorrow();
}

// Zeller’s congruence formula.
function getDayOfWeek(date) {
  let day = Number(date.slice(8, 10));
  let month = Number(date.slice(5, 7));
  let year1 = Math.floor(date.slice(0, 4) % 100);
  let year2 = Math.floor(date.slice(0, 4) / 100);
  currentDay = day;
  currentMonthIndex = month - 1;
  localStorage.setItem("currentDay", currentDay);
  localStorage.setItem("currentMonthIndex", currentMonthIndex);
  if (month > 12 || month < 0 || day < 0 || day > 31) {
    return "Invalid date";
  }
  else {
    // if user entered January we will put it 13 in the EQUATION, The same for February = 14.
    if (month < 2) {
      month += 12;
      year1--;
    }
    currentDayIndex = Math.floor((day + 26 * (month + 1) / 10 + year1 + year1 / 4 + year2 / 4 + 5 * year2) % 7);
    localStorage.setItem("currentDayIndex", currentDayIndex);
    return days[currentDayIndex];
  }
}

function changeImg(linkCommented, selector) {
  document.querySelector(selector).setAttribute("src", "http://" + linkCommented.slice(2,));
}

function changeweatherToday() {
  document.querySelector(".today .day").innerHTML = getDayOfWeek(weatherJson.location.localtime);
  document.querySelector(".today .date").innerHTML = currentDay + " " + months[currentMonthIndex];
  document.querySelector(".today .location").innerHTML = weatherJson.location.name;
  document.querySelector(".today .currentTemperature span").innerHTML = weatherJson.current.temp_c + " ";
  changeImg(weatherJson.current.condition.icon, ".today .currentImg img");
  document.querySelector(".today .weatherStatusWord").innerHTML = weatherJson.current.condition.text;
  document.querySelector(".today .windSpeed").innerHTML = weatherJson.current.wind_kph + " km/h";
  document.querySelector(".today .windDirection").innerHTML = windDir(weatherJson.current.wind_dir);
}

function changeweatherTomorrow() {
  document.querySelector(".tomorrow .day").innerHTML = getDayOfWeek(weatherJson.forecast.forecastday[1].date);
  document.querySelector(".tomorrow .maxTemperature .temp").innerHTML = weatherJson.forecast.forecastday[1].day.maxtemp_c;
  document.querySelector(".tomorrow .minTemperature .temp").innerHTML = weatherJson.forecast.forecastday[1].day.mintemp_c;
  document.querySelector(".tomorrow .weatherStatus").innerHTML = weatherJson.forecast.forecastday[1].day.condition.text;
  changeImg(weatherJson.forecast.forecastday[1].day.condition.icon, ".tomorrow img");
}

function changeweatherAfterTomorrow() {
  document.querySelector(".afterTomorrow .day").innerHTML = getDayOfWeek(weatherJson.forecast.forecastday[2].date);
  document.querySelector(".afterTomorrow .maxTemperature .temp").innerHTML = weatherJson.forecast.forecastday[2].day.maxtemp_c;
  document.querySelector(".afterTomorrow .minTemperature .temp").innerHTML = weatherJson.forecast.forecastday[2].day.mintemp_c;
  document.querySelector(".afterTomorrow .weatherStatus").innerHTML = weatherJson.forecast.forecastday[2].day.condition.text;
  changeImg(weatherJson.forecast.forecastday[2].day.condition.icon, ".afterTomorrow img");
}

function windDir(word) {
  if (word.length > 2) {
    word = word.slice(-2,);
  }
  switch (word) {
    case "S": return "South";
    case "N": return "North";
    case "W": return "West";
    case "E": return "East";
    case "SW": return "Southwest";
    case "SE": return "Southeast";
    case "NW": return "Northwest";
    case "NE": return "Northeast";
  }
}
