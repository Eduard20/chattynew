app.controller("mainCtrl", ['$scope', '$rootScope', '$http', '$timeout', '$cookies',
     ($scope, $rootScope, $http, $timeout, $cookies) => {
        $scope.reg_username = null;
        $scope.reg_password = null;
        $rootScope.isLogged = false;
        $scope.formData = [];
        $rootScope.latestWords = [];
        $rootScope.userInfo = {};
        $scope.disableSearch = true;
        $rootScope.geoCoordinates = {};
        let getUserInfo = (token) => {
            if (token) {
                 $rootScope.getUserInfo((data) => {
                     if (!data.error) {
                         $rootScope.isLogged = true;
                         $rootScope.userInfo = data.message;
                         console.log($rootScope.userInfo);
                     } else {
                         $rootScope.isLogged = false;
                     }
                 });
             }
         };
        let token = $cookies.get('token');
        getUserInfo(token);
         function getLocation() {
             if (navigator.geolocation) {
                 navigator.geolocation.getCurrentPosition(showPosition);
             } else {
                 console.log("fuck");
                 // x.innerHTML = "Geolocation is not supported by this browser.";
             }
         }
         function showPosition(position) {
             $rootScope.geoCoordinates = position;
         }
         getLocation();
        $scope.register = (name, surname, reg_username, reg_email, reg_password) => {
            let Data = {
                name : name,
                surname : surname,
                username : reg_username.toLowerCase(),
                email : reg_email,
                password : reg_password
            };
            $http({url : "/register", method : "POST", data : Data}).success((data) => {
                if (!data.error) {
                    let token = data.message.token;
                    $cookies.put('token', token);
                    $rootScope.isLogged = true;
                    location.reload();
                } else {
                    $scope.message = data.message;
                    $timeout(() => {
                        $scope.message = "";
                    }, 2000)
                }
            })
        };
        $scope.clearFields = () => {
            $scope.reg_username = null;
            $scope.reg_password = null;
        };
        $scope.login = (username, password) => {
            let Data = {
                username : username.toLowerCase(),
                password : password
            };
            $http({url : "/login", method : "POST", data : Data}).success((data) =>{
                if (!data.error) {
                    console.log(data);
                    let token = data.message.token;
                    $cookies.put('token', token);
                    $rootScope.allWords = data.message.words;
                    $rootScope.isLogged = true;
                    location.reload();
                } else {
                    $scope.message = data.message;
                    $timeout(() => {
                        $scope.message = "";
                    }, 2000)
                }
            })
        };
        $scope.logout = () => {
            $cookies.remove('token');
            $rootScope.isLogged = false;
            location.reload();
        };
        $scope.reload = () => {
            location.reload();
        };
        $scope.findChatModal = false;
        $scope.findChat = () => {
          getLocation();
          $http({url : "/api/findChats", method : "GET"}).success((data) => {
            if (!data.error) {
              $scope.foundChats = data.doc;
              $scope.findChatModal = true;
            } else {
              $scope.errorMsg = data;
            }
          });
        };
        $scope.addChat = data => {
          console.log(data);
          const Data = {
            chatId : data._id,
            username : $rootScope.userInfo.username
          };
          $http({url : "/api/addChatUser", method : "POST", data : Data}).success((data) => {
            if (!data.error) {
              console.log("OK")
            } else {
              $scope.errorMsg = data;
            }
          });
        };
     }
]);

