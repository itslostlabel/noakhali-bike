// ==========================================
// NOAKHALI BIKE
// CUSTOMER APP
// STEP 15
// Premium Customer Experience
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

const bikeFareDisplay =
    document.getElementById("bikeFareDisplay");

const premiumFareDisplay =
    document.getElementById("premiumFareDisplay");

const bikeRideCard =
    document.getElementById("bikeRideCard");

const premiumRideCard =
    document.getElementById("premiumRideCard");

const locateMe =
    document.getElementById("locateMe");

const mapStatus =
    document.getElementById("mapStatus");


// ==========================================
// MAP STATE
// ==========================================

let map = null;

let userMarker = null;

let destinationMarker = null;

let userLatitude = null;

let userLongitude = null;

let destinationLatitude = null;

let destinationLongitude = null;

let selectedRide = "bike";

let lastBikeFare = null;

let lastPremiumFare = null;

let lastDistance = null;

let lastDestinationName = "";


// ==========================================
// MAP INITIALIZATION
// ==========================================

function initializeMap() {

    if (typeof L === "undefined") {

        console.error(
            "Leaflet library was not loaded."
        );

        return;
    }


    map =
        L.map("map").setView(
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
// UPDATE MAP LOCATION
// ==========================================

function updateMapLocation(
    latitude,
    longitude
) {

    if (!map) return;


    userLatitude =
        latitude;

    userLongitude =
        longitude;


    if (userMarker) {

        map.removeLayer(
            userMarker
        );
    }


    userMarker =
        L.marker([
            latitude,
            longitude
        ]).addTo(map);


    userMarker.bindPopup(
        "<strong>Your pickup location</strong>"
    );


    map.setView(
        [
            latitude,
            longitude
        ],
        15
    );


    mapStatus.textContent =
        "Location detected";
}


// ==========================================
// DETECT LOCATION
// ==========================================

function detectLocation() {

    if (!navigator.geolocation) {

        pickupLocation.textContent =
            "Location not supported";

        mapStatus.textContent =
            "Location unavailable";

        return;
    }


    pickupLocation.textContent =
        "Detecting your location...";

    mapStatus.textContent =
        "Locating you...";


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

                mapStatus.textContent =
                    "Allow location access";

            } else if (
                error.code ===
                error.POSITION_UNAVAILABLE
            ) {

                pickupLocation.textContent =
                    "Location unavailable";

                mapStatus.textContent =
                    "GPS unavailable";

            } else if (
                error.code ===
                error.TIMEOUT
            ) {

                pickupLocation.textContent =
                    "Location request timed out";

                mapStatus.textContent =
                    "GPS is taking longer";

            } else {

                pickupLocation.textContent =
                    "Unable to detect location";

                mapStatus.textContent =
                    "Location error";
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
// LOCATE BUTTON
// ==========================================

locateMe.addEventListener(
    "click",
    function() {

        detectLocation();
    }
);


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
// DESTINATION SEARCH
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
            `?q=${encodeURIComponent(
                query +
                ", Noakhali, Bangladesh"
            )}` +
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
                parseFloat(
                    results[0].lat
                ),

            longitude:
                parseFloat(
                    results[0].lon
                ),

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
// SHOW DESTINATION
// ==========================================

function showDestinationOnMap(
    latitude,
    longitude,
    name
) {

    if (!map) return;


    destinationLatitude =
        latitude;

    destinationLongitude =
        longitude;


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
                padding: [
                    35,
                    35
                ]
            }
        );

    } else {

        map.setView(
            [
                latitude,
                longitude
            ],
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

    const earthRadius =
        6371;


    const dLat =
        (
            lat2 -
            lat1
        ) *
        Math.PI /
        180;


    const dLon =
        (
            lon2 -
            lon1
        ) *
        Math.PI /
        180;


    const a =
        Math.sin(
            dLat / 2
        ) *
        Math.sin(
            dLat / 2
        ) +

        Math.cos(
            lat1 *
            Math.PI /
            180
        ) *

        Math.cos(
            lat2 *
            Math.PI /
            180
        ) *

        Math.sin(
            dLon / 2
        ) *

        Math.sin(
            dLon / 2
        );


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return (
        earthRadius *
        c
    );
}


// ==========================================
// FARE CALCULATION
// ==========================================

function calculateBikeFare(
    distanceKm
) {

    const baseFare =
        35;

    const perKm =
        14;


    return Math.max(
        40,

        Math.round(
            baseFare +
            (
                distanceKm *
                perKm
            )
        )
    );
}


function calculatePremiumFare(
    distanceKm
) {

    const baseFare =
        50;

    const perKm =
        18;


    return Math.max(
        55,

        Math.round(
            baseFare +
            (
                distanceKm *
                perKm
            )
        )
    );
}


// ==========================================
// UPDATE RIDE CARDS
// ==========================================

function updateRidePrices(
    bikeFare,
    premiumFare
) {

    bikeFareDisplay.textContent =
        `৳ ${bikeFare}`;


    premiumFareDisplay.textContent =
        `৳ ${premiumFare}`;
}


// ==========================================
// RIDE SELECTION
// ==========================================

bikeRideCard.addEventListener(
    "click",
    function() {

        selectedRide =
            "bike";


        bikeRideCard.classList.add(
            "selected"
        );


        premiumRideCard.classList.remove(
            "selected"
        );
    }
);


premiumRideCard.addEventListener(
    "click",
    function() {

        selectedRide =
            "premium";


        premiumRideCard.classList.add(
            "selected"
        );


        bikeRideCard.classList.remove(
            "selected"
        );
    }
);


// ==========================================
// SHOW FARE RESULT
// ==========================================

function showFareResult(
    distanceKm,
    bikeFare,
    premiumFare,
    destinationName
) {

    lastBikeFare =
        bikeFare;

    lastPremiumFare =
        premiumFare;

    lastDistance =
        distanceKm;

    lastDestinationName =
        destinationName;


    updateRidePrices(
        bikeFare,
        premiumFare
    );


    const oldResult =
        document.getElementById(
            "fareResult"
        );


    if (oldResult) {

        oldResult.innerHTML =
            "";

        oldResult.className =
            "";
    }


    const result =
        document.getElementById(
            "fareResult"
        );


    result.className =
        "trip-result";


    result.innerHTML = `

        <div class="trip-label">
            TRIP ESTIMATE
        </div>


        <div class="trip-destination">
            ${destinationName}
        </div>


        <div class="trip-row">

            <span>
                Distance
            </span>

            <strong>
                ${distanceKm.toFixed(1)} km
            </strong>

        </div>


        <div class="trip-row">

            <span>
                Noakhali Bike
            </span>

            <strong>
                ৳${bikeFare}
            </strong>

        </div>


        <div class="trip-row">

            <span>
                Bike Premium
            </span>

            <strong>
                ৳${premiumFare}
            </strong>

        </div>


        <button
            id="confirmRide"
            class="confirm-button"
            type="button"
        >
            CONFIRM RIDE
        </button>
    `;


    document
        .getElementById(
            "confirmRide"
        )
        .addEventListener(
            "click",
            confirmRide
        );
}


// ==========================================
// CONFIRM RIDE
// ==========================================

function confirmRide() {

    const rideName =
        selectedRide === "premium"
            ? "Bike Premium"
            : "Noakhali Bike";


    const rideFare =
        selectedRide === "premium"
            ? lastPremiumFare
            : lastBikeFare;


    const rideData = {

        id:
            "NB-" +
            Date.now(),

        pickup:
            pickupLocation.textContent,

        destination:
            lastDestinationName,

        destinationLatitude:
            destinationLatitude,

        destinationLongitude:
            destinationLongitude,

        distanceKm:
            lastDistance,

        rideType:
            rideName,

        fare:
            rideFare,

        status:
            "searching",

        createdAt:
            new Date().toISOString()
    };


    localStorage.setItem(
        "noakhaliBikeCurrentRide",

        JSON.stringify(
            rideData
        )
    );


    showRideSearching(
        rideData
    );
}


// ==========================================
// RIDE SEARCHING SCREEN
// ==========================================

function showRideSearching(
    rideData
) {

    const overlay =
        document.createElement(
            "div"
        );


    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 9999;

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 25px;

        background: #090909;

        color: #fff;

        text-align: center;
    `;


    overlay.innerHTML = `

        <div style="
            width:100%;
            max-width:420px;
        ">

            <div style="
                width:70px;
                height:70px;

                display:flex;
                align-items:center;
                justify-content:center;

                margin:0 auto 22px;

                border-radius:22px;

                background:#dfff00;

                font-size:32px;
            ">
                🏍️
            </div>


            <div style="
                color:#888;
                font-size:9px;
                font-weight:900;
                letter-spacing:2px;
            ">
                NOAKHALI BIKE
            </div>


            <h2 style="
                margin-top:8px;
                font-size:26px;
            ">
                Finding your driver
            </h2>


            <p style="
                margin-top:12px;
                color:#999;
                font-size:12px;
                line-height:1.7;
            ">
                Searching nearby drivers...
                <br>
                Ride ID: ${rideData.id}
            </p>


            <div style="
                width:45px;
                height:45px;

                margin:28px auto;

                border:3px solid #333;
                border-top-color:#dfff00;

                border-radius:50%;

                animation:
                    nbSpin 1s linear infinite;
            "></div>


            <div style="
                color:#dfff00;
                font-size:10px;
                font-weight:800;
                letter-spacing:1px;
            ">
                DEMO DRIVER SEARCH
            </div>

        </div>
    `;


    document.body.appendChild(
        overlay
    );


    const animation =
        document.createElement(
            "style"
        );


    animation.textContent = `
        @keyframes nbSpin {
            from {
                transform:rotate(0deg);
            }

            to {
                transform:rotate(360deg);
            }
        }
    `;


    document.head.appendChild(
        animation
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


        findRide.disabled =
            true;


        findRide.querySelector(
            "span"
        ).textContent =
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


            findRide.disabled =
                false;


            findRide.querySelector(
                "span"
            ).textContent =
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


        findRide.disabled =
            false;


        findRide.querySelector(
            "span"
        ).textContent =
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
            event.key ===
            "Enter"
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
