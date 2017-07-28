app.controller("findCtrl", ['$scope', '$rootScope', '$http', '$timeout',
    ($scope, $rootScope, $http, $timeout) => {
        const x = document.getElementById("demo");
        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                x.innerHTML = "Geolocation is not supported by this browser.";
            }
        }
        function showPosition(position) {
            x.innerHTML = "Latitude: " + position.coords.latitude +
                "<br>Longitude: " + position.coords.longitude;
        }
        getLocation();
    }
]);

