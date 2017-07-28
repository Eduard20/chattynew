app.controller("chatCtrl", ['$scope', '$rootScope', '$http', '$timeout',
    ($scope, $rootScope, $http, $timeout) => {
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
        var socket = io();
        let chatInfo;
        $scope.openChat = obj => {
            $( ".socket" ).remove();
            chatInfo = obj;
            if (obj) socket.emit("joinChat", obj);
            $http({url : "/api/getHistory", method : "POST", data : obj}).success((data) => {
                if (!data.error) {
                    $scope.chatHistory = data;
                } else {
                    // $scope.errorMsg = data;
                }
            });
        };
        socket.on('connectToRoom', data => {
            // roomId = data;
            console.log(data);
        });

        $scope.getChats();
        var $chat = $(".view ul");
        var $users = $("#users");
        var $nickError = $("#nickError");
        socket.emit('new user', $rootScope.userInfo.username, function(data){
            console.log(data);
            if(data) {
                $('#nickWrap').hide();
                $('#contentWrap').show();
            } else {
                $nickError.html('try again baby');
            }
        });

        socket.on('usernames', function(data) {
            var html = '';
            for(i=0; i < data.length; i++) {
                html += data[i] + '<br/>'
            }
            $users.html(html);
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
            if (data.nick === $rootScope.userInfo.username) {
                $chat.append(`<li style="width:100%"><div class="pull-left" style="width: 10%"><div><img class="img-circle" style="width:18px;height:18px" src="/files/img/man.png" /></div><p><small>${data.date}</small></p></div><div class="msj macro pull-left"><p>${data.msg}</p></div></li>`);
            } else {
                $chat.append(`<li style="width:100%"><div class="pull-right" style="width: 10%"><div><img class="img-circle" style="width:18px;height:18px" src="/files/img/man.png" /></div><p><small>${data.date}</small></p></div><div class="msj macro pull-right"><p>${data.msg}</p></div></li>`);
            }
        });
        var me = {};
        me.avatar = "https://lh6.googleusercontent.com/-lr2nyjhhjXw/AAAAAAAAAAI/AAAAAAAARmE/MdtfUmC0M4s/photo.jpg?sz=48";

        var you = {};
        you.avatar = "https://a11.t26.net/taringa/avatares/9/1/2/F/7/8/Demon_King1/48x48_5C5.jpg";

//-- No use time. It is a javaScript effect.
//         function insertChat(who, text, time = 0){
//             var control = "";
//             var date = formatAMPM(new Date());
//
//             if (who == "me"){
//
//                 control = '<li style="width:100%">' +
//                   '<div class="msj macro">' +
//                   '<div class="avatar"><img class="img-circle" style="width:48px;" src="/files/img/man.png" /></div>' +
//                   '<div class="text text-l">' +
//                   '<p>'+ text +'</p>' +
//                   '<p><small>'+date+'</small></p>' +
//                   '</div>' +
//                   '</div>' +
//                   '</li>';
//             } else {
//                 control = '<li style="width:100%;">' +
//                   '<div class="msj-rta macro">' +
//                   '<div class="text text-r">' +
//                   '<p>'+text+'</p>' +
//                   '<p><small>'+date+'</small></p>' +
//                   '</div>' +
//                   '<div class="avatar" style="padding:0px 0px 0px 10px !important"><img class="img-circle" style="width:100%;" src="'+you.avatar+'" /></div>' +
//                   '</li>';
//             }
//             setTimeout(
//               function(){
//                   $(".view ul").append(control);
//
//               }, time);
//
//         }

        // function resetChat(){
        //     $(".view ul").empty();
        // }
        //
        // $(".mytext").on("keyup", function(e){
        //     if (e.which == 13){
        //         var text = $(this).val();
        //         if (text !== ""){
        //             insertChat("me", text);
        //             $(this).val('');
        //         }
        //     }
        // });

//-- Clear Chat
//         resetChat();

//-- Print Messages
//         insertChat("me", "Hello Tom...", 0);
//         insertChat("you", "Hey Bro", 100);
//-- NOTE: No use time on insertChat.
    }
]);

