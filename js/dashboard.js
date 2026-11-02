
const CHECK_WEATHER_URL = "http://localhost:5678/webhook/check-weather";

document.addEventListener("DOMContentLoaded", function () {
    const farmer = JSON.parse(
        localStorage.getItem("loggedInFarmer") || "{}"
    );

    console.log("Logged-in farmer data:", farmer);

    // Display farmer details
    setText("farmerName", farmer.name || "Farmer");
    setText("welcomeName", farmer.name || "Farmer");
    setText("farmerId", farmer.farmerId || "Not available");
    setText("fieldId", farmer.fieldId || "Not available");
    setText("village", farmer.village || "Not available");
    setText("crop", farmer.crop || "Not available");

    // Load previously saved weather data
    const savedWeather = JSON.parse(
        localStorage.getItem("latestWeatherData") || "{}"
    );

    if (savedWeather.temperature !== undefined) {
        setText("temperature", savedWeather.temperature + " °C");
    }

    if (savedWeather.humidity !== undefined) {
        setText("humidity", savedWeather.humidity + " %");
    }

    if (savedWeather.soilMoisture !== undefined) {
        setText("soilMoisture", savedWeather.soilMoisture + " %");
    }

    if (savedWeather.rainStatus) {
        setText("rainStatus", savedWeather.rainStatus);
    }
});

// Helper function to update text safely
function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

// Check weather and rain
async function checkRain() {
    const button = document.getElementById("checkRainBtn");
    const message = document.getElementById("rainMessage");
    const rainStatus = document.getElementById("rainStatus");

    button.disabled = true;
    button.textContent = "Checking weather...";
    message.textContent = "Connecting to weather service...";

    try {
        const farmer = JSON.parse(
            localStorage.getItem("loggedInFarmer") || "{}"
        );

        console.log("Farmer sending weather request:", farmer);

        const phone = String(
            farmer.phone || farmer.phoneNo || ""
        ).trim();

        const fieldId = String(farmer.fieldId || "").trim();

        if (!phone || !fieldId) {
            throw new Error(
                "Phone number or Field ID is missing. Please login again."
            );
        }

        const requestData = {
    phone: phone,
    farmerId: farmer.farmerId || "",
    village: farmer.village || "",
    fieldId: fieldId
};

        console.log("Weather request body:", requestData);

        const response = await fetch(CHECK_WEATHER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        const rawResponse = await response.text();

        console.log("Weather HTTP status:", response.status);
        console.log("Weather response:", rawResponse);

        if (!response.ok) {
            throw new Error("Server returned HTTP " + response.status);
        }

        if (!rawResponse.trim()) {
            throw new Error(
                "n8n returned an empty response. Check Respond to Webhook."
            );
        }

        const data = JSON.parse(rawResponse);

        if (data.success === false) {
            throw new Error(data.message || "Weather check failed.");
        }

        const weather = String(
            data.rainStatus ||
            data.weather ||
            data.condition ||
            data.message ||
            ""
        );

        if (!weather) {
            throw new Error("No rain status received from n8n.");
        }

        // Save latest weather readings
        localStorage.setItem(
            "latestWeatherData",
            JSON.stringify({
                temperature: data.temperature,
                humidity: data.humidity,
                soilMoisture: data.soilMoisture,
                rainStatus: weather
            })
        );

        // Update dashboard
        setText("rainStatus", weather);
        setText("rainMessage", "Weather check result: " + weather);

        if (data.temperature !== undefined) {
            setText("temperature", data.temperature + " °C");
        }

        if (data.humidity !== undefined) {
            setText("humidity", data.humidity + " %");
        }

        if (data.soilMoisture !== undefined) {
            setText("soilMoisture", data.soilMoisture + " %");
        }

    } catch (error) {
        console.error("Rain check error:", error);

        if (message) {
            message.textContent = "Rain check failed: " + error.message;
        }

        if (rainStatus) {
            rainStatus.textContent = "Error";
        }

    } finally {
        button.disabled = false;
        button.textContent = "🌧️ Check Rain Now";
    }
}

// Demo pump controls (not connected to physical hardware)
function setPump(status) {
    const pumpText = document.getElementById("pumpText");
    const pumpIndicator = document.getElementById("pumpIndicator");
    const pumpNote = document.getElementById("pumpNote");

    if (pumpText) {
        pumpText.textContent =
            status === "ON" ? "Pump is currently ON" : "Pump is currently OFF";
    }

    if (pumpIndicator) {
        pumpIndicator.textContent = status;
    }

    if (pumpNote) {
        pumpNote.textContent = "Demo mode: these buttons update the dashboard only.";
    }
}

// Logout
function logout() {
    localStorage.removeItem("loggedInFarmer");
    localStorage.removeItem("latestWeatherData");
    window.location.href = "index.html";
}
