// ==========================================
// NOAKHALI BIKE - CUSTOMER APP
// ==========================================


// ==========================================
// ELEMENTS
// ==========================================

const pickupLocation =
    document.getElementById("pickupLocation");

const destination =
    document.getElementById("destination");

const findRide =
    document.getElementById("findRide");


// ==========================================
// MAP VARIABLES
// ==========================================

let map = null;

let userMarker = null;

let userLatitude = null;

let userLongitude = null;


// ==========================================
// INITIALIZE MAP
// ==========================================

function initializeMap() {

    if (typeof L === "undefined") {

        console.error(
            "Leaflet library was not loaded."
        );

        return;
    }


    // Initial map position
    // Maijdi / Noakhali area

    map = L.map("map").setView(
        [22.8696, 91.0995],
        13
    );


    // OpenStreetMap tiles

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);
}


// ==========================================
// UPDATE USER LOCATION ON MAP
// ==========================================

function updateMapLocation(
    latitude,
    longitude
) {

    if (!map) {
        return;
    }


    // Save coordinates

    userLatitude = latitude;

    userLongitude = longitude;


    // Move map

    map.setView(
        [latitude, longitude],
        16
    );


    // Remove previous marker

    if (userMarker) {

        map.removeLayer(
            userMarker
        );
    }


    // Create new marker

    userMarker = L.marker([
        latitude,
        longitude
    ]).addTo(map);


    // Popup

    userMarker.bindPopup(
        "<strong>You are here</strong><br>" +
        "Noakhali Bike"
    );


    // Open popup

    userMarker.openPopup();
}


// ==========================================
// LOCATION DETECTION
// ==========================================

function detectLocation() {

    // Browser support check

    if (
        !navigator.geolocation
    ) {

        pickupLocation.textContent =
            "Location not supported";

        return;
    }


    // Loading state

    pickupLocation.textContent =
        "Detecting your location...";


    // Ask browser for location

    navigator.geolocation.getCurrentPosition(

        // SUCCESS

        function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            // Save coordinates

            userLatitude =
                latitude;

            userLongitude =
                longitude;


            // Show coordinates temporarily

            pickupLocation.textContent =
                `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;


            // Update map

            updateMapLocation(
                latitude,
                longitude
            );


            // Try to get readable location name

            reverseGeocode(
                latitude,
                longitude
            );
        },


        // ERROR

        function(error) {

            console.error(
                "Location error:",
                error
            );


            if (
                error.code ===
                error.PERMISSION_DENIED
            ) {

                pickupLocation.textContent =
                    "Location permission denied";

            } else if (
                error.code ===
                error.POSITION_UNAVAILABLE
            ) {

                pickupLocation.textContent =
                    "Location unavailable";

            } else if (
                error.code ===
                error.TIMEOUT
            ) {

                pickupLocation.textContent =
                    "Location request timed out";

            } else {

                pickupLocation.textContent =
                    "Unable to detect location";
            }
        },


        // OPTIONS

        {
            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0
        }
    );
}


// ==========================================
// REVERSE GEOCODING
// ==========================================

async function reverseGeocode(
    latitude,
    longitude
) {

    try {

        const url =
            "https://nominatim.openstreetmap.org/reverse" +
            `?lat=${latitude}` +
            `&lon=${longitude}` +
            "&format=json" +
            "&zoom=18";


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Reverse geocoding failed"
            );
        }


        const data =
            await response.json();


        if (
            data &&
            data.display_name
        ) {

            pickupLocation.textContent =
                data.display_name;
        }

    } catch (error) {

        console.log(
            "Address lookup unavailable:",
            error
        );

        // Keep coordinates if address fails
    }
}


// ==========================================
// FIND RIDE BUTTON
// ==========================================

findRide.addEventListener(
    "click",
    function() {

        const destinationValue =
            destination.value.trim();


        // Destination required

        if (!destinationValue) {

            alert(
                "Please enter your destination."
            );

            destination.focus();

            return;
        }


        // Location required

        if (
            userLatitude === null ||
            userLongitude === null
        ) {

            alert(
                "Please allow location access first."
            );

            detectLocation();

            return;
        }


        // Temporary ride request

        alert(
            "Ride request ready!\n\n" +

            "Pickup:\n" +
            `${userLatitude.toFixed(5)}, ` +
            `${userLongitude.toFixed(5)}\n\n` +

            "Destination:\n" +
            destinationValue
        );
    }
);


// ==========================================
// DESTINATION ENTER KEY
// ==========================================

destination.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            findRide.click();
        }
    }
);


// ==========================================
// START APP
// ==========================================

initializeMap();

detectLocation();
