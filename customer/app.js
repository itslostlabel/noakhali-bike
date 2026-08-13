const pickupLocation = document.getElementById("pickupLocation");
const destination = document.getElementById("destination");
const findRide = document.getElementById("findRide");

function detectLocation() {
    if (!navigator.geolocation) {
        pickupLocation.textContent = "Location not supported";
        return;
    }

    pickupLocation.textContent = "Detecting location...";

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            pickupLocation.textContent =
                `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        },

        () => {
            pickupLocation.textContent =
                "Location permission required";
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}


findRide.addEventListener("click", () => {

    const destinationValue = destination.value.trim();

    if (!destinationValue) {
        alert("Please enter your destination.");
        destination.focus();
        return;
    }

    alert(
        `Ride request ready!\\n\\nDestination: ${destinationValue}`
    );
});


detectLocation();
