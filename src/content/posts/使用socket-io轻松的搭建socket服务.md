---
title: "使用 socket.io 轻松的搭建 socket 服务以及 socket 中身份的验证"
date: "2016-12-01 15:58:04"
permalink: "post/使用socket-io轻松的搭建socket服务/"
tags:
  - "学习"
---

之前对于 socket 几乎一无所知。只在之前看过一个演讲说 socket 的，最近发现 socket 应用场景非常多，所以特意花时间研究了一下 socket.io 话说 socket.io 真的是简单，完全不需要对 socket 有任何了解，socket.io 帮你把服务端和客户端都写的好好的了

<!-- more -->

### socket.io 的用法

使用起来非常简单，后端只要创建一个 http server，然后作为 socket.io 的参数然后 socket 服务器就完成了。socket 的端口就是 http server 所监听的端口
```javascript
var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(3000)
```
网页端 socket.io 也准备好了，直接`io.connect()`就好了
```javascript
var socket = io.connect('http://server.domain:3000');
```

方法常用的也就一个简单的`io.on()`来监听 socket 的事件，第一个参数是字符串表示事件，第二个参数是回调函数，参数是 socket 对象

socket 对象也就两个方法，一个`socket.on()`来监听 socket 会话的事件，一样第一个参数是事件名，第二个参数是回调，参数是客户端发来的消息。还有一个方法是`socket.emit()`用来给对方发消息，第一个参数是消息类型，第二个参数是消息内容。

要想给连接发消息可以用`socket.broadcast.emit()`，想给所有连接发消息可以`io.sockets.emit()`

其他的功能还有命名空间、房间、中间件什么的，具体可以看 [socket.io 的代码](https://github.com/socketio/socket.io/blob/master/lib/socket.js)

### socket 身份验证

如果要验证身份的话可以在连接建立后，先自行商议一个 auth 事件，然后进行身份验证的处理，然后如果通过了直接给 socket 对象设置一个验证通过的属性，在后面每次接收消息的时候都验证一下。如果没通过验证可以不管，也可以返回错误消息或者直接从服务端断开连接

```javascript
io.on('connection', (socket) => {
    socket.on('auth', (msg) => {
        // 身份验证
        if (authentication) {
            socket.auth = true
            // ...
        } else {
            socket.auth = false
            // ...
        }
    })

    socket.use('message', (next) => {
        if (socket.auth) {
            next()
        } else {
            socket.disconnect()
        }
    })

    socket.on('message', (msg) => {
        // ...
    })
})
```
