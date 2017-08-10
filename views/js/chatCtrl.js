app.controller("chatCtrl", ['$scope', '$rootScope', '$http',
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
                    $('#chatModal').modal('close');
                    Materialize.toast("Chat was created", 4000);
                    $scope.getChats();
                } else {
                    $scope.errorMsg = data;
                }
            });
        };
        $scope.openChatModal = () => {
            $('#chatModal').modal('open');
        };
        $scope.getChats = () => {
            $http({url : "/api/getChats", method : "GET"}).success((data) => {
                if (!data.error) {
                    $scope.chats = data.doc;
                } else {
                    $scope.errorMsg = data;
                }
            });
        };
        let socket = io();
        let chatInfo;
        $scope.openChat = obj => {
            $( ".socket" ).remove();
            chatInfo = obj;
            if (obj) socket.emit("joinChat", obj);
            $http({url : "/api/getHistory", method : "POST", data : obj}).success((data) => {
                if (!data.error) {
                    console.log($scope.chatHistory);
                    $scope.chatHistory = data;
                }
            });
        };
        $scope.getChats();
        let $chat = $(".view ul");
        let $nickError = $("#nickError");
        socket.emit('new user', $rootScope.userInfo.username, function(data){
            if(data) {
                $('#nickWrap').hide();
                $('#contentWrap').show();
            } else {
                $nickError.html('try again baby');
            }
        });
        $scope.sendMessage = message => {
            let Data = {
                username : $rootScope.userInfo.username,
                chatName : chatInfo.name,
                chatId : chatInfo._id,
                message : message,
            };
            socket.emit('send message', Data, function(data){
                $chat.append('<span class="error">' + data + '</span><br>');
            });
            $scope.message = "";
        };

        socket.on('new message', function(data){
            if (data.nick !== $rootScope.userInfo.username) {
                $chat.append(`<li style="width:100%"><div class="pull-left" style="width: 10%"><div><p style="margin:0">${data.nick}</p></div><p><small>${data.date}</small></p></div><div class="msj macro pull-left"><p>${data.msg}</p></div></li>`);
            } else {
                $chat.append(`<li style="width:100%"><div class="pull-right" style="width: 10%"><div><p style="margin:0">${data.nick}</p></div><p><small>${data.date}</small></p></div><div class="msj macro pull-right"><p>${data.msg}</p></div></li>`);
            }
        });
    }
]);

