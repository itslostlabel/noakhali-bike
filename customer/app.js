// ==========================================
// NOAKHALI BIKE - CUSTOMER APP
// STEP 14
// Destination Search + Fare Estimate
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
let destinationMarker = null;

let userLatitude = null;
let userLongitude = null;

let destinationLatitude = null;
let destinationLongitude = null;


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

    map = L.map("map").setView(
        [22.8696, 91.0995],
        13
    );

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
// UPDATE USER LOCATION
// ==========================================

function updateMapLocation(
    latitude,
    longitude
) {

    if (!map) return;

    userLatitude = latitude;
    userLongitude = longitude;

    map.setView(
        [latitude, longitude],
        16
    );

    if (userMarker) {
        map.removeLayer(userMarker);
    }

    userMarker = L.marker([
        latitude,
        longitude
    ]).addTo(map);

    userMarker.bindPopup(
        "<strong>Your pickup location</strong>"
    );
}


// ==========================================
// DETECT USER LOCATION
// ==========================================

function detectLocation() {

    if (!navigator.geolocation) {

        pickupLocation.textContent =
            "Location not supported";

        return;
    }

    pickupLocation.textContent =
        "Detecting your location...";

    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            updateMapLocation(
                latitude,
                longitude
            );

            pickupLocation.textContent =
                `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

            await reverseGeocode(
                latitude,
                longitude
            );
        },

        function(error) {

            console.log(
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

        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 30000
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
            "Address lookup failed:",
            error
        );
    }
}


// ==========================================
// SEARCH DESTINATION
// ==========================================

async function searchDestination(
    placeName
) {

    const query =
        placeName.trim();

    if (!query) {
        return null;
    }

    try {

        const url =
            "https://nominatim.openstreetmap.org/search" +
            `?q=${encodeURIComponent(query + ", Noakhali, Bangladesh")}` +
            "&format=json" +
            "&limit=1";

        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error(
                "Destination search failed"
            );
        }

        const results =
            await response.json();

        if (
            !results ||
            results.length === 0
        ) {

            return null;
        }

        return {

            latitude:
                parseFloat(results[0].lat),

            longitude:
                parseFloat(results[0].lon),

            name:
                results[0].display_name
        };

    } catch (error) {

        console.log(
            "Destination search error:",
            error
        );

        return null;
    }
}


// ==========================================
// SHOW DESTINATION ON MAP
// ==========================================

function showDestinationOnMap(
    latitude,
    longitude,
    name
) {

    if (!map) return;

    destinationLatitude = latitude;
    destinationLongitude = longitude;

    if (destinationMarker) {

        map.removeLayer(
            destinationMarker
        );
    }

    destinationMarker =
        L.marker([
            latitude,
            longitude
        ]).addTo(map);

    destinationMarker.bindPopup(
        `<strong>${name}</strong>`
    );

    destinationMarker.openPopup();


    // Fit pickup + destination

    if (
        userLatitude !== null &&
        userLongitude !== null
    ) {

        const bounds =
            L.latLngBounds([
                [
                    userLatitude,
                    userLongitude
                ],
                [
                    latitude,
                    longitude
                ]
            ]);

        map.fitBounds(
            bounds,
            {
                padding: [35, 35]
            }
        );

    } else {

        map.setView(
            [latitude, longitude],
            15
        );
    }
}


// ==========================================
// DISTANCE CALCULATION
// ==========================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadius = 6371;

    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;

    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(
            lat1 * Math.PI / 180
        ) *

        Math.cos(
            lat2 * Math.PI / 180
        ) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;
}


// ==========================================
// FARE CALCULATION
// ==========================================

function calculateBikeFare(
    distanceKm
) {

    const baseFare = 35;

    const perKm = 14;

    const fare =
        baseFare +
        (distanceKm * perKm);

    return Math.max(
        40,
        Math.round(fare)
    );
}


function calculatePremiumFare(
    distanceKm
) {

    const baseFare = 50;

    const perKm = 18;

    const fare =
        baseFare +
        (distanceKm * perKm);

    return Math.max(
        55,
        Math.round(fare)
    );
}


// ==========================================
// SHOW FARE RESULT
// ==========================================

function showFareResult(
    distanceKm,
    bikeFare,
    premiumFare,
    destinationName
) {

    const oldResult =
        document.getElementById(
            "fareResult"
        );

    if (oldResult) {
        oldResult.remove();
    }


    const result =
        document.createElement("div");

    result.id =
        "fareResult";


    result.style.cssText = `
        margin-top: 18px;
        background: #090909;
        color: white;
        border-radius: 18px;
        padding: 20px;
    `;


    result.innerHTML = `

        <div style="
            font-size:10px;
            color:#999;
            letter-spacing:1px;
            margin-bottom:7px;
        ">
            TRIP ESTIMATE
        </div>

        <div style="
            font-size:14px;
            font-weight:800;
            margin-bottom:15px;
        ">
            ${destinationName}
        </div>

        <div style="
            display:flex;
            justify-content:space-between;
            margin-bottom:12px;
        ">
            <span>
                Distance
            </span>

            <strong>
                ${distanceKm.toFixed(1)} km
            </strong>
        </div>


        <div style="
            display:flex;
            justify-content:space-between;
            margin-bottom:12px;
        ">
            <span>
                Noakhali Bike
            </span>

            <strong>
                ৳${bikeFare}
            </strong>
        </div>


        <div style="
            display:flex;
            justify-content:space-between;
            margin-bottom:18px;
        ">
            <span>
                Bike Premium
            </span>

            <strong>
                ৳${premiumFare}
            </strong>
        </div>


        <button
            id="confirmRide"
            style="
                width:100%;
                padding:15px;
                border:0;
                border-radius:12px;
                background:#dfff00;
                color:#090909;
                font-weight:900;
                letter-spacing:1px;
            "
        >
            CONFIRM RIDE
        </button>
    `;


    const findRideButton =
        document.getElementById(
            "findRide"
        );

    findRideButton.parentNode.insertBefore(
        result,
        findRideButton.nextSibling
    );


    const confirmRide =
        document.getElementById(
            "confirmRide"
        );


    confirmRide.addEventListener(
        "click",
        function() {

            alert(
                "Ride confirmation screen coming next!"
            );
        }
    );
}


// ==========================================
// FIND RIDE
// ==========================================

findRide.addEventListener(
    "click",
    async function() {

        const destinationValue =
            destination.value.trim();


        if (!destinationValue) {

            alert(
                "Please enter your destination."
            );

            destination.focus();

            return;
        }


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


        findRide.disabled = true;

        findRide.textContent =
            "SEARCHING...";


        const destinationData =
            await searchDestination(
                destinationValue
            );


        if (!destinationData) {

            alert(
                "Destination not found. " +
                "Please try another place name."
            );

            findRide.disabled = false;

            findRide.textContent =
                "FIND A RIDE";

            return;
        }


        showDestinationOnMap(
            destinationData.latitude,
            destinationData.longitude,
            destinationData.name
        );


        const distance =
            calculateDistance(
                userLatitude,
                userLongitude,
                destinationData.latitude,
                destinationData.longitude
            );


        const bikeFare =
            calculateBikeFare(
                distance
            );


        const premiumFare =
            calculatePremiumFare(
                distance
            );


        showFareResult(
            distance,
            bikeFare,
            premiumFare,
            destinationData.name
        );


        findRide.disabled = false;

        findRide.textContent =
            "UPDATE RIDE";
    }
);


// ==========================================
// ENTER KEY
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
