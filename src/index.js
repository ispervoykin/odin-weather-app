import "./style.scss";

const apiKey = "59109672c5e44401a84104816230210";
const apiProvider = `http://api.weatherapi.com/v1/`;

async function getCurrentWeatherJson(location) {
    const response = await fetch(
        `${apiProvider}current.json?key=${apiKey}&q=${location}`,
        {
            mode: "cors",
        }
    );
    const data = await response.json();
    return data;
}

async function getCurrentWeatherData(location) {
    const json = await getCurrentWeatherJson(location);
    const leftSideData = [
        `Location: ${json.location.name}/${json.location.country}^location`,
        `Time & Date: ${proccessTime(json.location.localtime)}^time`,
        `Temperature: ${json.current.temp_c}°C^temperature`,
        `Feels like: ${json.current.feelslike_c}°C^feelsLikeTemperature`,
        `Condition: ${json.current.condition.text}&${json.current.condition.icon}^text+image`,
    ];
    const rightSideData = [
        `Wind speed: ${json.current.wind_kph} kph^wind`,
        `Pressure: ${json.current.pressure_mb} mb^pressure`,
        `Precipitation: ${json.current.precip_mm} mm^precipitation`,
        `Humidity: ${json.current.humidity}%^humidity`,
        `Vision: ${json.current.vis_km} km^vision`,
    ];

    return [leftSideData, rightSideData];
}

async function getForecastWeatherJson(location, days = 8) {
    const response = await fetch(
        `${apiProvider}forecast.json?key=${apiKey}&q=${location}&days=${days}`,
        {
            mode: "cors",
        }
    );
    const data = await response.json();
    return data;
}

async function getForecastWeatherData(location, days = 8) {
    const json = await getForecastWeatherJson(location, days);
    const currDayForecast = json["forecast"]["forecastday"]["0"]["day"];

    const leftSideData = [
        `Max: ${currDayForecast.maxtemp_c}°C, min: ${currDayForecast.mintemp_c}°C^temperature`,
        `Average temperature: ${currDayForecast.avgtemp_c}°C^temperature`,
    ];
    const rightSideData = [
        `UV index: ${currDayForecast.uv}^uvIndex`,
        `Chance of rain: ${currDayForecast.daily_chance_of_rain}%^chanceOfRain`,
        `Chance of snow: ${currDayForecast.daily_chance_of_snow}%^chanceOfSnow`,
        `Condition: ${currDayForecast.condition.text}&${currDayForecast.condition.icon}^text+image`,
    ];
    const bottomData = [];
    for (let i = 1; i < 8; i++) {
        const ithDayForecast = json["forecast"]["forecastday"][i]["day"];
        bottomData.push([
            `Date: ${proccessDate(
                json["forecast"]["forecastday"][i]["date"]
            )}^date`,
            `Temperature: ${ithDayForecast.avgtemp_c}°C^temperature`,
            `Max: ${ithDayForecast.maxtemp_c}°C, min: ${ithDayForecast.mintemp_c}°C^temperature`,
            `Chance of rain: ${ithDayForecast.daily_chance_of_rain}%^chanceOfRain`,
            `Chance of snow: ${ithDayForecast.daily_chance_of_snow}%^chanceOfSnow`,
            `Condition: ${ithDayForecast.condition.text}&${ithDayForecast.condition.icon}^text+image`,
        ]);
    }

    return [leftSideData, rightSideData, bottomData];
}

async function printCurrentWeather(location) {
    try {
        const data = await getCurrentWeatherData(location);
        deleteAllChildren(leftSide);
        putSearchCityBtn(leftSide);
        putDataInHtml(data[0], ".leftSide");
        deleteAllChildren(rightSide);
        putDataInHtml(data[1], ".rightSide");
    } catch (error) {
        console.log(error);
        alert(`The "${location}" city doesn't exist`);
    }
}

async function printForecastWeather(location) {
    try {
        const data = await getForecastWeatherData(location);
        putDataInHtml(data[0], ".leftSide");
        putDataInHtml(data[1], ".rightSide");
        for (let children of bottom.children) {
            deleteAllChildren(children);
        }
        putDataInHtml(data[2], ".forecastWeather");
    } catch (error) {
        console.log(error);
    }
}

function printWeather(location) {
    printCurrentWeather(location);
    printForecastWeather(location);
}

function putDataInHtml(dataArray, divClass) {
    const container = document.querySelector(divClass);
    dataArray.forEach((element, index) => {
        if (Array.isArray(element)) {
            putDataInHtml(element, `.forecastDay${index + 1}`);
        } else {
            const [elementText, elementClass] = element.split("^");
            if (elementClass == "text+image") {
                putTextAndImage(elementText, container);
            } else {
                const htmlElement = document.createElement("div");
                htmlElement.textContent = elementText;
                htmlElement.className = elementClass;
                container.appendChild(htmlElement);
            }
        }
    });
}

function deleteAllChildren(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.lastChild);
    }
}

function putTextAndImage(texts, parent) {
    texts = texts.split("&");
    const textElement = document.createElement("div");
    textElement.textContent = texts[0];
    textElement.className = "conditionText";

    const imgElement = document.createElement("img");
    imgElement.src = texts[1];
    imgElement.className = "conditionImage";

    const div = document.createElement("div");
    div.className = "condition";
    div.appendChild(textElement);
    div.appendChild(imgElement);
    parent.appendChild(div);
}

function putSearchCityBtn(parent) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter a city";

    const searchCityBtn = document.createElement("button");
    searchCityBtn.type = "button";
    searchCityBtn.id = "searchCityBtn";
    searchCityBtn.textContent = "Search";

    const div = document.createElement("div");
    div.className = "inputPlusSearch";
    div.appendChild(input);
    div.appendChild(searchCityBtn);
    parent.appendChild(div);

    searchCityBtn.addEventListener("click", () => {
        printWeather(input.value);
        input.value = "";
    });
}

function proccessTime(localtime) {
    const [date, time] = localtime.split(" ");
    return `${time}, ${proccessDate(date)}`;
}

function proccessDate(date) {
    let nums = date.split("-");
    [nums[0], nums[2]] = [nums[2], nums[0]];
    nums = nums.join("-");
    return nums;
}

const leftSide = document.querySelector(".leftSide");
const rightSide = document.querySelector(".rightSide");
const bottom = document.querySelector(".bottom");

putSearchCityBtn(leftSide);
printWeather("Moscow");
