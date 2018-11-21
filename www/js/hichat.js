; (function () {

    function Hichart() {
        this.socket = null;
    }

    Hichart.prototype = {
        init: function () {
            var that = this;


            this.socket = io.connect();

            this.socket.on('connect', function () {
                document.getElementById('info').textContent = 'get yourself a nickname :)';
                document.getElementById('nickWrapper').style.display = 'block';
                document.getElementById('nicknameInput').focus();


                that.login();

                that.postMsg();

                that.uploadImg();
            });

            this.socket.on('nickExisted', function () {
                document.getElementById('info').textContent = '!nickname is taken, choose another pls';
            });

            this.socket.on('loginSuccess', function () {
                document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
                document.getElementById('loginWrapper').style.display = 'none';//隐藏遮罩层显聊天界面
                document.getElementById('messageInput').focus();//让消息输入框获得焦点
            });

            this.socket.on('system', function (nickname, userCount, type) {
                var msg = nickname + (type === 'login' ? ' joined' : ' left');
                that.displayNewMsg('system ', msg, 'red');
                document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';

            });

            this.socket.on('newMsg', function (nickname, msg) {
                that.displayNewMsg(nickname, msg);
            });

            this.socket.on('newImg', function (nickname, newImg) {
                that.displayImage(nickname, newImg);
            });
        },

        login: function () {
            var that = this;
            document.getElementById('loginBtn').addEventListener('click', function () {
                var nickname = document.getElementById('nicknameInput').value;
                if (nickname.trim().length) {
                    that.socket.emit('login', nickname);
                } else {
                    document.getElementById('nicknameInput').focus();
                }
            }, false)

        },

        displayNewMsg: function (user, msg, color) {
            var container = document.getElementById('historyMsg');
            var msgToDisplay = document.createElement('p');
            var data = new Date().toTimeString().substr(0, 8);
            msgToDisplay.style.color = color || '#000';
            msgToDisplay.innerHTML = user + '<span class="timespan">(' + data + '): </span>' + msg;
            container.appendChild(msgToDisplay);
            container.scrollTop = container.scrollHeight;

        },
        displayImage: function (user, imgData, color) {
            var container = document.getElementById('historyMsg'),
                msgToDisplay = document.createElement('p'),
                date = new Date().toTimeString().substr(0, 8);
            msgToDisplay.style.color = color || '#000';
            msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
            container.appendChild(msgToDisplay);
            container.scrollTop = container.scrollHeight;
        },

        postMsg: function () {
            var that = this;
            var sendBtn = document.getElementById('sendBtn');
            var messageInput = document.getElementById('messageInput');

            sendBtn.addEventListener('click', function () {
                var msg = messageInput.value;
                if (msg.trim().length != 0) {
                    messageInput.value = '';
                    messageInput.focus();
                    that.socket.emit('postMsg', msg);
                    that.displayNewMsg('me', msg);
                }
            });
        },

        uploadImg: function () {
            var that = this;
            document.getElementById('sendImage').addEventListener('change', function () {
                if (this.files.length) {
                    var file = this.files[0];
                    var reader = new FileReader();

                    if (!reader) {
                        that.displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
                        this.value = '';
                        return;
                    }

                    reader.onload = function (e) {
                        this.value = '';
                        that.socket.emit('img', e.target.result);
                        that.displayImage('me', e.target.result);
                    }

                    reader.readAsDataURL(file);
                }
            })
        }
    }

    window.onload = function () {
        var hichart = new Hichart();

        hichart.init();
    }







})()