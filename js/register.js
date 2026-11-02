
document.addEventListener("DOMContentLoaded", function () {

    const cropSelect = document.getElementById("crop");
    const otherCropGroup = document.getElementById("otherCropGroup");
    const otherCrop = document.getElementById("otherCrop");

    const registerForm = document.getElementById("registerForm");
    const registerMessage = document.getElementById("registerMessage");
    const registerBtn = document.getElementById("registerBtn");

    // Show or hide the Other Crop input
    function toggleOtherCrop() {
        const isOther = cropSelect.value.trim() === "Other";

        otherCropGroup.style.display = isOther ? "block" : "none";
        otherCrop.required = isOther;

        if (!isOther) {
            otherCrop.value = "";
        }
    }

    cropSelect.addEventListener("change", toggleOtherCrop);

    // Run once when page loads
    toggleOtherCrop();

    function getValue(id) {
        return document.getElementById(id).value.trim();
    }

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = getValue("name");
        const phone = getValue("phone");
        const village = getValue("village");
        const field = getValue("field");
        const latitude = getValue("latitude");
        const longitude = getValue("longitude");
        const soilMoisture = getValue("soilMoisture");

        const crop = cropSelect.value === "Other"
            ? otherCrop.value.trim()
            : cropSelect.value;

        if (
            !name || !phone || !village || !field ||
            !crop || !latitude || !longitude || !soilMoisture
        ) {
            alert("Please fill in all required fields.");
            return;
        }

        if (!/^[6-9][0-9]{9}$/.test(phone)) {
            alert("Please enter a valid 10-digit Indian mobile number.");
            return;
        }

        const lat = Number(latitude);
        const lng = Number(longitude);
        const moisture = Number(soilMoisture);

        if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
            alert("Latitude must be between -90 and 90.");
            return;
        }

        if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
            alert("Longitude must be between -180 and 180.");
            return;
        }

        if (!Number.isFinite(moisture) || moisture < 0 || moisture > 100) {
            alert("Soil moisture must be between 0 and 100%.");
            return;
        }

        const farmerData = {
            name,
            phone,
            village,
            field,
            crop,
            latitude: lat,
            longitude: lng,
            soilMoisture: moisture
        };

        try {
            registerBtn.disabled = true;
            registerBtn.textContent = "Registering...";

            registerMessage.textContent = "Please wait, registering farmer...";
            registerMessage.style.color = "#555";

            const response = await fetch(
                "http://localhost:5678/webhook/register-farmer",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(farmerData)
                }
            );

            const data = await response.json();

            if (!response.ok || data.success !== true) {
                throw new Error(data.message || "Registration failed.");
            }

            registerMessage.textContent = "Registration successful!";
            registerMessage.style.color = "#168650";

            alert(
                "Registration Successful!\n\n" +
                "Farmer ID: " + data.farmerId + "\n" +
                "Field ID: " + data.fieldId +
                "\n\nYou can now login."
            );

            window.location.href = "index.html";

        } catch (error) {
            console.error("Registration Error:", error);
            registerMessage.textContent = error.message;
            registerMessage.style.color = "red";

        } finally {
            registerBtn.disabled = false;
            registerBtn.textContent = "Register Farmer";
        }
    });

});
