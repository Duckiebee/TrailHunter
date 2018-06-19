$(document).ready(function () {

    //Global variables
    var radius;
    var locationInput;

    var convertDifficulty = function (difficultyColor) {
        if (difficultyColor === "green") {
            return "Easy";
        }
        else if (difficultyColor === "greenBlue") {
            return "Easy/Medium";
        }
        else if (difficultyColor === "blue") {
            return "Medium";
        }
        else if (difficultyColor === "blueBlack") {
            return "Medium/Hard";
        }
        else if (difficultyColor === "black") {
            return "Hard";
        } else {
            return "Unknown";
        }
    };

    var geocodingDataIsValid = function (geocodingData) {
        if (geocodingData.results.length <= 0) {
            $("#errorMessage").html("<strong>No results returned.</strong>");
            $("#errorMessage").show();
            return false;
        }
        else if (geocodingData.results.length > 1) {
            $("#errorMessage").html("<strong>More than 1 result returned. Please narrow search.</strong>");
            $("#errorMessage").show();
            return false;
        }
        else {
            $("#errorMessage").hide();
            return true;
        }
    };

    var getTrailsData = function () {

        $.ajax({
            url: "https://www.hikingproject.com" + "/data/get-trails" + "?lat=" + searchCoordinates.lat + "&lon=" + searchCoordinates.lng + "&maxDistance=" + radius + "&key=200147703-07bf8d789bb5f945f6246689684605c2",
            method: "GET",
            async:false,
            success: function (data) {
                if(data.trails.length <= 0) {
                    $("#errorMessage").html("<strong>No trails found.</strong>");
                    $("#errorMessage").show();
                }
                else {
                    $("#trails-info").html("");
                    for (i = 0; i < data.trails.length; i++) {
                        $("#trails-info").append("<h3>" + data.trails[i].name + "</h3>");
                        $("#trails-info").append("<h4>" + data.trails[i].location + "</h4>");
                        $("#trails-info").append("<p>" + data.trails[i].summary + "</p>");
                        $("#trails-info").append("<strong>Difficulty Level: " + convertDifficulty(data.trails[i].difficulty) + " | " + "Length: " + data.trails[i].length + " mi.</strong>");
                        $("#trails-info").append("<h5>Rating: " + data.trails[i].stars + "/5</h5>");
                        // Retrieving the URL for the image
                        var imgURL = data.trails[i].imgSmall;
                        // Creating an element to hold the image
                        var image = $("<img>").attr("src", imgURL);
                        // Appending the image
                        $("#trails-info").append(image);
        
                    //TODO: Also append location info or more general trail data if possible           
                    window.locations.push({"name":data.trails[i].name,"summary":data.trails[i].summary,"difficulty":data.trails[i].difficulty, lat: data.trails[i].latitude, lng: data.trails[i].longitude });
                }
                // console.log(window.locations);
                // console.log(data);
                console.log(locations);
                window.initMap();
            }
            console.log(data);
        },
            error: function (data) {
                console.log(data);
                $("#errorMessage").html("<strong>Unable to retrieve trails around " + locationInput + ".</strong>");
                $("#errorMessage").show();
            },
            fail: function (data) {
                console.log(data);
                $("#errorMessage").html("<strong>An error occurred.</strong>");
                $("#errorMessage").show();
            }
        });
    };

    var getWeatherData = function () {

        $.ajax({
            url: "http://api.openweathermap.org" + "/data/2.5/weather" + "?lat=" + searchCoordinates.lat + "&lon=" + searchCoordinates.lng + "&appid=8f1e1fe8ad21fd905884311228d4b797",
            method: "GET",
            success: function (data) {
                var tempF = Math.floor((((data.main.temp) - 273) * 1.8) + 32);
                $("#weatherName").html(data.name);
                $("#weatherTemp").html("Temperature: " + tempF + "&#176; F");
                $("#weatherHumidity").html("Humidity: " + data.main.humidity + "%");
                $("#weatherDescription").html("Forecast: " + data.weather[0].description);
                $("#weatherIcon").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
                getTrailsData();
            },
            error: function (data) {
                console.log(data);
                $("#errorMessage").html("<strong>Unable to retrieve weather for " + locationInput + ".</strong>");
                $("#errorMessage").show();
            },
            fail: function (data) {
                console.log(data);
                $("#errorMessage").html("<strong>An error occurred.</strong>");
                $("#errorMessage").show();
            }
        });
    };

    var getGeocodingData = function (location) {

        $.ajax({
            url: "https://maps.googleapis.com" + "/maps/api/geocode/json" + "?address=" + location + "&key=AIzaSyBOglb0LjVuwKiFDQz52dk_MSTfMJvbq5g",
            method: "GET",
            success: function (data) {
                // console.log(data);
                if (geocodingDataIsValid(data)) {
                    window.searchCoordinates = { lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng}
                    getWeatherData();
                }
            },
            error: function (data) {
                console.log(data);
                $("#errorMessage").html("<strong>Enter valid location.</strong>");
                $("#errorMessage").show();
            },
            fail: function (data) {
                console.log(data);
                $("#errorMessage").html("<strong>An error occurred.</strong>");
                $("#errorMessage").show();
            }
        });
    };

    $("#trailSearch").on("click", function () {
        var isRadiusValid = true;
        window.locations = [];
        radius = $("#radius").val().trim();
        $("#errorMessage").hide();

        if (radius == "") {
            radius = 20;
        }
        else if (radius > 1000 || radius < 0) {
            $("#errorMessage").html("<strong>Radius must be between 0-1000 miles.</strong>");
            $("#errorMessage").show();
            isRadiusValid = false;
        }

        if (isRadiusValid) {
            var locationInput = $("#locationInput").val().trim();
            getGeocodingData(locationInput);
        };
    });
});