// deklaracja zmiennych - pobranie elementów HTML
const wrapper = document.querySelector(".wrapper"),
inputPart = document.querySelector(".input-part"),
infoTxt = inputPart.querySelector(".info-txt"),
inputField = inputPart.querySelector("input"),
locationBtn = inputPart.querySelector("button"),
weatherPart = wrapper.querySelector(".weather-part"),
wIcon = weatherPart.querySelector("img"),
arrowBack = wrapper.querySelector("header i");
const sIcon = document.querySelector(".mode .sicon");

// zmienna, w której przechowywany będzie link do API
let api;

// funkcja zmiany motywu
function moodchange() {
    var link = document.getElementById('style');
    if (sIcon.id=="siconOFF"){
        sIcon.src = "icons/toggle_on.svg";
        sIcon.id="siconON";
        link.setAttribute('href', 'style2.css');
    } else {
        sIcon.src = "icons/toggle_off.svg";
        sIcon.id="siconOFF"
        link.setAttribute('href', 'style.css');
    }
  }

// nasłuchiwanie na wciśnięcie klawisza na klawiaturze
inputField.addEventListener("keyup", e =>{
    // jeśli użytkownik naciśnie Enter i pole input nie jest puste
    if(e.key == "Enter" && inputField.value != ""){
        // wysłanie zapytania o pogodę
        requestApi(inputField.value);
    }
});

// nasłuchiwanie na wciśnięcie przycisku pobrania lokalizacji
locationBtn.addEventListener("click", () =>{
    if(navigator.geolocation){ // jeśli przeglądarka obsługuje API Geolocation
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }else{
        alert("Your browser not support geolocation api");
    }
});

// funkcja do wysłania zapytania o pogodę dla miasta
function requestApi(city){
    api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=c01738ec178ba41f5a3f2c5f939de2b2`;
    fetchData();
}

// funkcja wykonywana po udanym pobraniu lokalizacji
function onSuccess(position){
    const {latitude, longitude} = position.coords; // pobranie szerokości i długości geograficznej
    api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=c01738ec178ba41f5a3f2c5f939de2b2`;
    fetchData();
}

function onError(error){
    // jeśli wystąpi jakiś błąd podczas pobierania lokalizacji użytkownika, pokażemy go w infoText
    infoTxt.innerText = error.message;
    infoTxt.classList.add("error");
}

function fetchData(){
    infoTxt.innerText = "Getting weather details...";
    infoTxt.classList.add("pending");
    // uzyskanie odpowiedzi api i zwrócenie jej z przetworzeniem na js obj 
    // następnie wywołanie funkcji weatherDetails z przekazaniem wyniku api jako argumentu
    fetch(api).then(res => res.json()).then(result => weatherDetails(result)).catch(() =>{
        infoTxt.innerText = "Something went wrong";
        infoTxt.classList.replace("pending", "error");
    });
}

function weatherDetails(info){
    if(info.cod == "404"){ 
        infoTxt.classList.replace("pending", "error");
        infoTxt.innerText = `${inputField.value} isn't a valid city name`;
    }else{
        //uzyskanie wartości wymaganych właściwości z całej informacji o pogodzie
        const city = info.name;
        const country = info.sys.country;
        const {description, id} = info.weather[0];
        const {temp, feels_like, pressure} = info.main;
        const {sunrise, sunset} = info.sys;
        const timezone = info.timezone;

        //własne ikony pogody 
        if(id == 800){
            wIcon.src = "icons/clear.svg";
        }else if(id >= 200 && id <= 232){
            wIcon.src = "icons/storm.svg";  
        }else if(id >= 600 && id <= 622){
            wIcon.src = "icons/snow.svg";
        }else if(id >= 701 && id <= 781){
            wIcon.src = "icons/haze.svg";
        }else if(id == 801 ){
            wIcon.src = "icons/cloud.svg";
        }else if(id >= 802 && id <= 804){
            wIcon.src = "icons/cloud2.svg";
        }else if((id >= 500 && id <= 531) || (id >= 300 && id <= 321)){
            wIcon.src = "icons/rain.svg";
        }
        //obliczasnie godziny względem strefy czasowej
        var d = new Date();
        var localTime = d.getTime();
        var localOffset = d.getTimezoneOffset() * 60 * 1000;
        var utc = localTime + localOffset;
        var timesec = timezone;
        var actualtime = utc + (1000 * timesec);
        var timetime= new Date(actualtime);
        var time = timetime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
       //obliczanie godziny wschodu i zachodu słońca
        var sunrisesec = sunrise+localOffset/1000+timesec;
        var date = new Date(sunrisesec * 1000);
        var sunrisetime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        var sunsetsec = sunset+localOffset/1000+timesec;
        var date2 = new Date(sunsetsec * 1000);
        var sunsettime = date2.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        
        var currentdate=date.toLocaleDateString("en-GB");
        
        //przekazanie konkretnej informacji o pogodzie do konkretnego elementu
        weatherPart.querySelector(".todaydate .date").innerText = currentdate;
        weatherPart.querySelector(".todaydate .time").innerText = time;
        weatherPart.querySelector(".temp .numb").innerText = Math.floor(temp);
        weatherPart.querySelector(".weather").innerText = description;
        weatherPart.querySelector(".location span").innerText = `${city}, ${country}`;
        weatherPart.querySelector(".temp .numb-2").innerText = Math.floor(feels_like);
        weatherPart.querySelector(".sunrise .tsunrise").innerText = sunrisetime;
        weatherPart.querySelector(".sunset .tsunset").innerText = sunsettime;

        weatherPart.querySelector(".pressure span").innerText = `${pressure} hPa`;
        infoTxt.classList.remove("pending", "error");
        infoTxt.innerText = "";
        inputField.value = "";
        wrapper.classList.add("active");
    }
}

//powrót do wyboru miasta
arrowBack.addEventListener("click", ()=>{
    wrapper.classList.remove("active");
});
