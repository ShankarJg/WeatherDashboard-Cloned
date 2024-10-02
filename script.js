function initPage() {
    const cityEl = document.getElementById("enter-city");
    const searchEl = document.getElementById("search-button");
    const clearEl = document.getElementById("clear-history");
    const nameEl = document.getElementById("city-name");
    const currentPicEl = document.getElementById("current-pic");
    const currentTempEl = document.getElementById("temperature");
    const currentHumidityEl = document.getElementById("humidity");
    const currentWindEl = document.getElementById("wind-speed");
    const currentUVEl = document.getElementById("UV-index");
    const historyEl = document.getElementById("history");
    const fivedayEl = document.getElementById("fiveday-header");
    const todayweatherEl = document.getElementById("today-weather");
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
    const APIKey = "2c73c8e451cb2ec424af3291b6d1edaf";

    const k2f = (K) => Math.floor((K - 273.15) * 1.8 + 32);

    function getWeather(cityName) {
        const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKey}`;
        
        axios.get(queryURL).then((response) => {
            todayweatherEl.classList.remove("d-none");
            const { name, dt, main, weather, wind, coord, id } = response.data;

            nameEl.innerHTML = `${name} (${new Date(dt * 1000).toLocaleDateString()})`;
            currentPicEl.setAttribute("src", `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`);
            currentPicEl.setAttribute("alt", weather[0].description);
            currentTempEl.innerHTML = `Temperature: ${k2f(main.temp)} &#176F`;
            currentHumidityEl.innerHTML = `Humidity: ${main.humidity}%`;
            currentWindEl.innerHTML = `Wind Speed: ${wind.speed} MPH`;

            const UVQueryURL = `https://api.openweathermap.org/data/2.5/uvi/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${APIKey}&cnt=1`;
            axios.get(UVQueryURL).then((response) => {
                const UVIndex = document.createElement("span");
                const UVValue = response.data[0].value;
                UVIndex.setAttribute("class", UVValue < 4 ? "badge badge-success" : UVValue < 8 ? "badge badge-warning" : "badge badge-danger");
                UVIndex.innerHTML = UVValue;
                currentUVEl.innerHTML = "UV Index: ";
                currentUVEl.append(UVIndex);
            });

            const forecastQueryURL = `https://api.openweathermap.org/data/2.5/forecast?id=${id}&appid=${APIKey}`;
            axios.get(forecastQueryURL).then((response) => {
                fivedayEl.classList.remove("d-none");
                document.querySelectorAll(".forecast").forEach((el, i) => {
                    const forecastIndex = i * 8 + 4;
                    const { dt, main, weather } = response.data.list[forecastIndex];
                    el.innerHTML = `
                        <p class="mt-3 mb-0 forecast-date">${new Date(dt * 1000).toLocaleDateString()}</p>
                        <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
                        <p>Temp: ${k2f(main.temp)} &#176F</p>
                        <p>Humidity: ${main.humidity}%</p>
                    `;
                });
            });
        });
    }

    function renderSearchHistory() {
        historyEl.innerHTML = "";
        searchHistory.forEach((city) => {
            const historyItem = document.createElement("input");
            historyItem.type = "text";
            historyItem.readOnly = true;
            historyItem.className = "form-control d-block bg-white";
            historyItem.value = city;
            historyItem.addEventListener("click", () => getWeather(city));
            historyEl.append(historyItem);
        });
    }

    searchEl.addEventListener("click", () => {
        const searchTerm = cityEl.value;
        getWeather(searchTerm);
        searchHistory.push(searchTerm);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
    });

    clearEl.addEventListener("click", () => {
        localStorage.clear();
        searchHistory = [];
        renderSearchHistory();
    });

    renderSearchHistory();
    if (searchHistory.length > 0) getWeather(searchHistory[searchHistory.length - 1]);
}

initPage();
