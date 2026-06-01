---
title: "一个简单的 canvas 弹幕引擎"
date: "2016-12-17 17:02:10"
permalink: "post/一个简单的canvas弹幕引擎/"
tags:
  - "学习"
---

突然发现前端很有意思啊，学着用 canvas 做了个网页弹幕引擎。之前看到有人用 svg 做了一个弹幕播放器，所以想着自己也做一个玩，然后就有了这个。在计算弹幕出现的位置和消失的位置这两个地方有点麻烦

<!-- more -->

[演示地址](https://cnwangjie.github.io/danmaku/)

用`setInterval`每 16ms 计算一下每条弹幕的位置，然后用`requestAnimationFrame`绘制出每条弹幕，通过`cvs.width = cvs.width`可以清空画布。之前什么都不知道，用循环来绘图，然后会出现不明卡顿，搜了一下才发现计算和绘图分开才可以避免浏览器带来的卡顿

```javascript
setInterval(() => {
  // 在这里计算和更改弹幕的位置
}, 16)

function draw () {
  // 在这里绘制弹幕
  window.requestAnimationFrame(() => {
    cvs.width = cvs.width
    draw()
  })
}
```

~~这个 [代码](https://github.com/cnwangjie/danmaku) 写的很烂都不想给别人看~~
