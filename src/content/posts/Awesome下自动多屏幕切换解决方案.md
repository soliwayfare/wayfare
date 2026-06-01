---
title: "Awesome 下自动多屏幕切换解决方案"
date: "2018-09-18 21:24:49"
permalink: "post/Awesome下自动多屏幕切换解决方案/"
tags:
  - "教程"
  - "awesome"
---

Gnome 下是会在接入屏幕后自动切换的，并且 gnome-control-center 中也带一个类似 Windows 和 macos 的多屏幕配置界面。到了 awesome 下之后即使启用 gnome-control-center 也不能配置显示器了~~查了很久也没有解决~~。所以一直以来都是用 xrandr 进行多屏幕设置。

<!-- more -->

先说一下在此之前的手动解决方案吧，先写一个切换屏幕的脚本，然后绑定一个快捷键。这样就可以只需要按一下快捷键就在多屏幕和单屏幕直接切换了。

```lua
awful.key({ modkey, "Control" }, "m", function() xrandr.xrandr() end)
```

切换的脚本在 [这里](https://github.com/cnwangjie/furry-shell/blob/master/toggle-display.sh)

然后因为公司开会非常频繁，动不动就要带着笔记本去开会。所以即使每次只要按一下快捷键，还是觉得有些麻烦。今天问了一下百合仙子有没有什么好的解决方案，结果仙子也是手动切换。后来我去 github 上问了一下才知道在 4.2 版本加了`screen::change`这么一个“signal”。这样就可以接收显示器处理事件了，在回调中调用 xrandr 就可以在这里进行屏幕的切换了。下面是我当前的配置。放在 rc.lua 的任何地方就可以启用了。

```lua
awesome.connect_signal("screen::change", function (output, state)
    local command = ""
    if state == "Disconnected" then
        command = "xrandr --output eDP1 --auto --output " .. output .. " --off"
    else
        command = "xrandr --output eDP1 --auto --output " .. output .. " --auto --same-as eDP1"
    end
    awful.util.spawn(command, false)
    naughty.notify({ text = output .. " " .. state })
end)
```

为了方便投屏所以默认设置了复制屏幕，对于需要频繁的插拔来说这样方便了很多。还可以根据自己的需要设置自己期望的行为。虽然如何也比不上 airdrop 投屏方便，但是这样也算是一种还行的解决方案了。

------

有空分享一下我在 Awesome 下其他方面的解决方案。尽量集合在一篇文章里，要是每个写一篇文章实在太多了点。
