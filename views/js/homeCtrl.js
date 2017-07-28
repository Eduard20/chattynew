app.controller("homeCtrl", ['$scope', '$rootScope', '$http',
    ($scope, $rootScope, $http) => {
        $scope.errorMsg = "";
        $scope.chats = [];
        $scope.createChat = name => {
            if (!name) return $scope.errorMsg = "Please write a name to add";
            $scope.errorMsg = "";
            const Data = {
                username : $rootScope.userInfo.username,
                name,
                long : $rootScope.geoCoordinates.coords.longitude,
                lat : $rootScope.geoCoordinates.coords.latitude,
                date : new Date()
            };
            $http({url : "/api/addChat", method : "POST", data : Data}).success((data) => {
                if (!data.error) {
                    $('#createChat').modal('hide');
                } else {
                    $scope.errorMsg = data;
                }
            });
        };
    }
]);

