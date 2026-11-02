
document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        console.error("Login form not found!");
        return;
    }

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const phone = document.getElementById("phone").value.trim();
        const farmerId = document.getElementById("farmerId").value.trim();

        if (!phone || !farmerId) {
            alert("Please enter Phone Number and Farmer ID.");
            return;
        }

        const loginButton = loginForm.querySelector("button[type='submit']");

        loginButton.disabled = true;
        loginButton.innerText = "Logging in...";

        try {
            const response = await fetch(
                "http://localhost:5678/webhook/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        farmerId: farmerId,
                        phone: phone
                    })
                }
            );

            const text = await response.text();

            console.log("HTTP Status:", response.status);
            console.log("Server Response:", text);

            if (!response.ok) {
                throw new Error("Server returned HTTP " + response.status);
            }

            if (!text.trim()) {
                throw new Error("Server returned an empty response.");
            }

            const data = JSON.parse(text);
            console.log("LOGIN RESPONSE:", data);
console.log("NEW USER VALUE:", data.newUser);
// Redirect new users to registration
if (data.newUser === true || data.newUser === "true") {
    localStorage.setItem("registrationPhone", phone);
    window.location.href = "register.html";
    return;
}
            if (data.success === true && data.farmer) {

                const farmer = data.farmer;

                // Ensure phone number is saved
                const farmerDetails = {
                    ...farmer,
                    phone: String(
                        farmer.phone ||
                        farmer.phoneNo ||
                        farmer["Phone No."] ||
                        phone
                    ).trim()
                };

                console.log("Farmer data received from login:", farmerDetails);

                localStorage.setItem(
                    "loggedInFarmer",
                    JSON.stringify(farmerDetails)
                );

                window.location.href = "dashboard.html";

            } else {
                alert(data.message || "Invalid Farmer ID or Phone Number.");
            }

        } catch (error) {
            console.error("LOGIN ERROR:", error);
            alert("Login failed: " + error.message);

        } finally {
            loginButton.disabled = false;
            loginButton.innerText = "Login";
        }
    });

});
