// ==========================================
// NOAKHALI BIKE
// DRIVER APP
// STEP 17
// EARNINGS + RIDE HISTORY
// ==========================================


// ==========================================
// ELEMENTS
// ==========================================

const onlineToggle =
    document.getElementById("onlineToggle");

const statusText =
    document.getElementById("statusText");

const statusSubtext =
    document.getElementById("statusSubtext");

const locationText =
    document.getElementById("locationText");

const locationStatus =
    document.getElementById("locationStatus");

const locateDriver =
    document.getElementById("locateDriver");

const requestSection =
    document.getElementById("requestSection");

const waitingSection =
    document.getElementById("waitingSection");

const activeRide =
    document.getElementById("activeRide");

const acceptRide =
    document.getElementById("acceptRide");

const rejectRide =
    document.getElementById("rejectRide");

const completeRide =
    document.getElementById("completeRide");

const requestTimer =
    document.getElementById("requestTimer");

const waitingText =
    document.getElementById("waitingText");


// Pages

const homePage =
    document.getElementById("homePage");

const earningsPage =
    document.getElementById("earningsPage");

const historyPage =
    document.getElementById("historyPage");

const profilePage =
    document.getElementById("profilePage");


// Earnings

const todayEarnings =
    document.getElementById("todayEarnings");

const todayRides =
    document.getElementById("todayRides");

const onlineTime =
    document.getElementById("onlineTime");

const earningsTotal =
    document.getElementById("earningsTotal");

const earningsRides =
    document.getElementById("earningsRides");

const averageFare =
    document.getElementById("averageFare");


// History

const historyList =
    document.getElementById("historyList");

const emptyHistory =
    document.getElementById("emptyHistory");


// Navigation

const navButtons =
    document.querySelectorAll(".nav-button");


// ==========================================
// STATE
// ==========================================

let isOnline = false;

let requestTimerId = null;
let demoRequestId = null;
let onlineTimerId = null;

let secondsOnline = 0;


// ==========================================
// STORAGE
// ==========================================

function getEarnings() {

    return Number(
        localStorage.getItem(
            "nbDriverEarnings"
        )
    ) || 0;
}


function getRides() {

    return Number(
        localStorage.getItem(
            "nbDriverRides"
        )
    ) || 0;
}


function getHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "nbDriverHistory"
            )
        ) || [];

    } catch {

        return [];
    }
}


function saveHistory(history) {

    localStorage.setItem(
        "nbDriverHistory",
        JSON.stringify(history)
    );
}


// ==========================================
// UPDATE STATS
// ==========================================

function updateStats() {

    const earnings =
        getEarnings();

    const rides =
        getRides();

    todayEarnings.textContent =
        "৳" + earnings;

    todayRides.textContent =
        rides;

    onlineTime.textContent =
        Math.floor(
            secondsOnline / 60
        ) + "m";


    earningsTotal.textContent =
        "৳" + earnings;

    earningsRides.textContent =
        rides;


    if (rides > 0) {

        averageFare.textContent =
            "৳" +
            Math.round(
                earnings / rides
            );

    } else {

        averageFare.textContent =
            "৳0";
    }
}


// ==========================================
// ONLINE
// ==========================================

onlineToggle.addEventListener(
    "click",
    function () {

        if (isOnline) {

            goOffline();

        } else {

            goOnline();
        }

    }
);


// ==========================================
// GO ONLINE
// ==========================================

function goOnline() {

    isOnline = true;

    onlineToggle.classList.add(
        "online"
    );

    statusText.textContent =
        "You're Online";

    statusSubtext.textContent =
        "Looking for nearby rides";

    waitingText.textContent =
        "You're online. New ride requests will appear here.";

    startOnlineCounter();

    getDriverLocation();


    clearTimeout(
        demoRequestId
    );


    demoRequestId =
        setTimeout(
            function () {

                if (!isOnline) {
                    return;
                }

                showRideRequest();

            },
            3000
        );
}


// ==========================================
// GO OFFLINE
// ==========================================

function goOffline() {

    isOnline = false;

    onlineToggle.classList.remove(
        "online"
    );

    statusText.textContent =
        "You're Offline";

    statusSubtext.textContent =
        "Go online to receive rides";

    waitingText.textContent =
        "Go online to start receiving ride requests in Noakhali.";

    clearTimeout(
        demoRequestId
    );

    stopRequestTimer();

    stopOnlineCounter();

    requestSection.classList.add(
        "hidden"
    );

    activeRide.classList.add(
        "hidden"
    );

    waitingSection.classList.remove(
        "hidden"
    );
}


// ==========================================
// ONLINE TIMER
// ==========================================

function startOnlineCounter() {

    stopOnlineCounter();

    secondsOnline = 0;

    updateStats();

    onlineTimerId =
        setInterval(
            function () {

                if (!isOnline) {
                    return;
                }

                secondsOnline++;

                updateStats();

            },
            1000
        );
}


function stopOnlineCounter() {

    if (onlineTimerId) {

        clearInterval(
            onlineTimerId
        );

        onlineTimerId = null;
    }
}


// ==========================================
// SHOW REQUEST
// ==========================================

function showRideRequest() {

    if (!isOnline) {
        return;
    }

    requestSection.classList.remove(
        "hidden"
    );

    waitingSection.classList.add(
        "hidden"
    );

    activeRide.classList.add(
        "hidden"
    );

    startRequestTimer();
}


// ==========================================
// REQUEST TIMER
// ==========================================

function startRequestTimer() {

    stopRequestTimer();

    let seconds = 30;

    requestTimer.textContent =
        seconds;

    requestTimerId =
        setInterval(
            function () {

                seconds--;

                requestTimer.textContent =
                    seconds;

                if (seconds <= 0) {

                    stopRequestTimer();

                    hideRequest();
                }

            },
            1000
        );
}


function stopRequestTimer() {

    if (requestTimerId) {

        clearInterval(
            requestTimerId
        );

        requestTimerId = null;
    }
}


// ==========================================
// HIDE REQUEST
// ==========================================

function hideRequest() {

    stopRequestTimer();

    requestSection.classList.add(
        "hidden"
    );

    activeRide.classList.add(
        "hidden"
    );

    waitingSection.classList.remove(
        "hidden"
    );

    if (isOnline) {

        waitingText.textContent =
            "You're online. Waiting for another ride request...";
    }
}


// ==========================================
// ACCEPT
// ==========================================

acceptRide.addEventListener(
    "click",
    function () {

        stopRequestTimer();

        requestSection.classList.add(
            "hidden"
        );

        waitingSection.classList.add(
            "hidden"
        );

        activeRide.classList.remove(
            "hidden"
        );

        document.getElementById(
            "activeStatus"
        ).textContent =
            "Ride Accepted";

        saveCurrentRide();
    }
);


// ==========================================
// REJECT
// ==========================================

rejectRide.addEventListener(
    "click",
    function () {

        hideRequest();

        if (!isOnline) {
            return;
        }

        waitingText.textContent =
            "Ride rejected. Looking for another request...";


        demoRequestId =
            setTimeout(
                function () {

                    if (isOnline) {

                        showRideRequest();
                    }

                },
                5000
            );
    }
);


// ==========================================
// COMPLETE RIDE
// ==========================================

completeRide.addEventListener(
    "click",
    function () {

        const fareElement =
            document.getElementById(
                "activeFare"
            );

        const fareText =
            fareElement.textContent ||
            "৳161";

        const fare =
            Number(
                fareText.replace(
                    /[^0-9]/g,
                    ""
                )
            ) || 161;


        const pickup =
            document.getElementById(
                "activePickup"
            ).textContent.trim();


        const destination =
            document.getElementById(
                "activeDestination"
            ).textContent.trim();


        // Create history record

        const history =
            getHistory();


        history.unshift({

            id:
                "NB-" +
                Date.now(),

            pickup:
                pickup,

            destination:
                destination,

            distance:
                "9.0 km",

            fare:
                fare,

            status:
                "Completed",

            completedAt:
                new Date().toISOString()

        });


        saveHistory(history);


        // Update earnings

        const newEarnings =
            getEarnings() + fare;

        const newRides =
            getRides() + 1;


        localStorage.setItem(
            "nbDriverEarnings",
            newEarnings
        );

        localStorage.setItem(
            "nbDriverRides",
            newRides
        );


        updateStats();

        renderHistory();


        localStorage.removeItem(
            "nbDriverCurrentRide"
        );


        activeRide.classList.add(
            "hidden"
        );

        waitingSection.classList.remove(
            "hidden"
        );


        waitingText.textContent =
            "Ride completed successfully. Ready for your next ride.";


        if (isOnline) {

            demoRequestId =
                setTimeout(
                    function () {

                        if (isOnline) {

                            showRideRequest();
                        }

                    },
                    5000
                );
        }
    }
);


// ==========================================
// SAVE CURRENT RIDE
// ==========================================

function saveCurrentRide() {

    const ride = {

        id:
            "NB-DRIVER-" +
            Date.now(),

        pickup:
            document.getElementById(
                "activePickup"
            ).textContent,

        destination:
            document.getElementById(
                "activeDestination"
            ).textContent,

        fare:
            document.getElementById(
                "activeFare"
            ).textContent,

        status:
            "accepted",

        createdAt:
            new Date().toISOString()
    };


    localStorage.setItem(
        "nbDriverCurrentRide",
        JSON.stringify(ride)
    );
}


// ==========================================
// GPS
// ==========================================

function getDriverLocation() {

    if (!navigator.geolocation) {

        locationText.textContent =
            "GPS unavailable";

        locationStatus.textContent =
            "Browser does not support GPS";

        return;
    }


    locationStatus.textContent =
        "Detecting GPS...";


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const lat =
                position.coords.latitude;

            const lng =
                position.coords.longitude;


            locationText.textContent =
                lat.toFixed(5) +
                ", " +
                lng.toFixed(5);


            locationStatus.textContent =
                "GPS location detected";
        },

        function () {

            locationText.textContent =
                "Location unavailable";

            locationStatus.textContent =
                "Allow location permission";
        },

        {
            enableHighAccuracy: true,

            timeout: 20000,

            maximumAge: 30000
        }
    );
}


locateDriver.addEventListener(
    "click",
    getDriverLocation
);


// ==========================================
// HISTORY
// ==========================================

function renderHistory() {

    const history =
        getHistory();


    historyList.innerHTML =
        "";


    if (
        history.length === 0
    ) {

        emptyHistory.classList.remove(
            "hidden"
        );

        return;
    }


    emptyHistory.classList.add(
        "hidden"
    );


    history.forEach(
        function (ride) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "history-card";


            const date =
                new Date(
                    ride.completedAt
                );


            const formattedDate =
                date.toLocaleDateString(
                    "en-BD",
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                );


            const formattedTime =
                date.toLocaleTimeString(
                    "en-BD",
                    {
                        hour: "numeric",
                        minute: "2-digit"
                    }
                );


            card.innerHTML = `

                <div class="history-top">

                    <span class="history-status">
                        COMPLETED
                    </span>

                    <strong class="history-fare">
                        ৳${ride.fare}
                    </strong>

                </div>


                <div class="history-route">

                    <div>

                        <span class="history-dot">
                        </span>

                        <span>
                            PICKUP
                        </span>

                        <strong>
                            ${escapeHTML(
                                ride.pickup
                            )}
                        </strong>

                    </div>


                    <div>

                        <span class="history-dot destination">
                        </span>

                        <span>
                            DESTINATION
                        </span>

                        <strong>
                            ${escapeHTML(
                                ride.destination
                            )}
                        </strong>

                    </div>

                </div>


                <div class="history-meta">

                    <span>
                        ${ride.distance}
                    </span>

                    <span>
                        ${formattedDate}
                        •
                        ${formattedTime}
                    </span>

                </div>

            `;


            historyList.appendChild(
                card
            );
        }
    );
}


// ==========================================
// HTML SAFETY
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ==========================================
// NAVIGATION
// ==========================================

navButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const page =
                    button.dataset.page;


                homePage.classList.add(
                    "hidden"
                );

                earningsPage.classList.add(
                    "hidden"
                );

                historyPage.classList.add(
                    "hidden"
                );

                profilePage.classList.add(
                    "hidden"
                );


                navButtons.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                if (
                    page === "home"
                ) {

                    homePage.classList.remove(
                        "hidden"
                    );

                }


                if (
                    page === "earnings"
                ) {

                    earningsPage.classList.remove(
                        "hidden"
                    );

                    updateStats();
                }


                if (
                    page === "history"
                ) {

                    historyPage.classList.remove(
                        "hidden"
                    );

                    renderHistory();
                }


                if (
                    page === "profile"
                ) {

                    profilePage.classList.remove(
                        "hidden"
                    );
                }

            }
        );

    }
);


// ==========================================
// STARTUP
// ==========================================

function startup() {

    requestSection.classList.add(
        "hidden"
    );

    activeRide.classList.add(
        "hidden"
    );

    waitingSection.classList.remove(
        "hidden"
    );

    homePage.classList.remove(
        "hidden"
    );

    earningsPage.classList.add(
        "hidden"
    );

    historyPage.classList.add(
        "hidden"
    );

    profilePage.classList.add(
        "hidden"
    );

    statusText.textContent =
        "You're Offline";

    statusSubtext.textContent =
        "Go online to receive rides";

    updateStats();

    renderHistory();
}


startup();
