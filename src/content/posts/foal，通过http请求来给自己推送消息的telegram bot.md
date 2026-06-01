---
title: "foal，通过 http 请求来给自己推送消息的 telegram bot"
date: "2017-06-17 12:08:32"
permalink: "post/foal，通过http请求来给自己推送消息的telegram bot/"
---

我需要的只是在电脑执行完一个长时间任务后将结果推送给我的手机

<!-- more -->

可是就这样简单的需求却找不到现成的轮子，连 IFTTT 居然都不能主动推送，我虽然不是 ios 开发者，可是我也想好好用一下 APN 啊。对于个人 web 开发者来说 telegram 可能是最容易的了。可是怎么也找不到现成的，好吧，那就只能自己动手了。

### 过程

如何创建一个 telegram bot 网上已经有很多教程了，无非就是找 bot father 点两下，相比微信公众号简单了太多。API 在 [https://core.telegram.org/bots/api](https://core.telegram.org/bots/api) 都写的很详细。因为功能不是很复杂，所以也就不用轮子了，拿起 express 就是干。开发的方式和微信公众号差不多，还是本地做内网穿透，因为 tg 被墙了，所以请求要加个代理，部署就放在 DO 了。

虽然 api 文档很详细，但是还是有一点点小问题。文档里貌似说 webhook 方式会请求 token 路径，实际上只请求了根目录。还有就是必须要 https，开发的时候内网穿透自带 https 所以没注意，部署之后一直请求失败，后来才发现没有加 https，然后再用 let's encrypt，有点小麻烦，其实应该和原来的站一起走 cdn 的。

### 使用

只要给 [https://telegram.me/foal_bot](https://telegram.me/foal_bot) 发一个消息就行啦！

目前功能还很简单，仅限发简单的纯文本消息，后面如果还有别的需求还会继续迭代。代码 [https://github.com/cnwangjie/foal](https://github.com/cnwangjie/foal)
