---
title: "Vue transition-group 组件实现类似 Google Keep 的延迟动画"
date: "2018-10-25 21:18:44"
permalink: "post/Vue-transition-group-组件实现类似-Google-Keep-的延迟动画/"
tags:
  - "教程"
---

最近在重构某项目，前端想模仿 Google Keep 来做。非常喜欢点搜索框之后卡片滑动进入的动画效果。

![GIFrecord_2018-10-25_211426-min.gif](/blog/images/Vue-transition-group-组件实现类似-Google-Keep-的延迟动画/5bd1cee4220b3.gif)

昨天研究了一晚才搞定。因为这次实在是没找到相关的文章，所以在这记录一下。

<!-- more -->

关于 transition 和 transition-group 组件的基本用法可以参考 [官方文档](https://cn.vuejs.org/v2/guide/transitions.html)，写了很多特殊情况的用法。但是没有这种延迟的动画效果。

首先写一下动画各个阶段的样式。

```scss
.slide-enter-active {
  transition: all ease-out .22s; // 进入时为 0.22s 的滑入动画
}
.slide-leave-active  {
  transition: all 0; // 离开时直接消失
}
.slide-enter-to {
  opacity: 1;
}
.slide-enter {
  transform: translateY(100px);
  opacity: 0.3;
}
```

何时应用哪个类在文档中写的非常清晰。尤其是这个图一看就非常明了。

![transition.png](/blog/images/Vue-transition-group-组件实现类似-Google-Keep-的延迟动画/5bd1c699eeba9.png)

然后是模板部分。这里用两个单独的元素来举例子。省略了不重要的部分。

```html
<transition-group
  tag="v-layout"
  name="slide"
  @after-leave="afterLeave"
>
  <v-flex key="date" v-if="card > 0">
    ...
  </v-flex>
  <v-flex key="color" v-if="card > 1">
    ...
  </v-flex>
</transition-group>
```

如果用`v-for`的话就是下面这样。
```html
<div v-for="i in 10" key="i" v-if="card > i - 1"></div>
```

然后重点就在这里啦。其实就是通过延时来增加计数器。使得元素一个一个渲染啦。

```js
export default {
  data() {
    return {
      card: 0,
    }
  },
  activated() {
    this.slideCard()
  },
  deactivated() {
    this.card = 0
  },
  methods: {
    slideCard() {
      if (this.card === 2) return
      this.toBeHide = this.card += 1
      setTimeout(this.slideCard, 200)
    },
  },
}
```

然后这样就可以保证组件激活的时候出现延迟进入的动画效果啦。如果组件没有`keep-alive`的话直接在`created`里调用`slideCard`就行了。

虽然这样就足够实现我萌想要的效果了。但是可以稍微引申一点点。我们想要重置动画的话，比如等所以卡片隐藏之后再重新来一遍。如果想知道卡片全部移除的话需要用一个计数器。因为事件里只有一个`after-leave`，并没有全部移除的事件。所以需要在`after-leave`事件里修改计数器来达到这个效果。

```js
export default {
  data() {
    return {
      card: 0,
      toBeHide: 0,
    }
  },
  activated() {
    this.loadListColors()
    if (this.card === 0) this.slideCard()
    else this.card = 0
  },
  methods: {
    slideCard() {
      if (this.card === 2) return
      this.toBeHide = this.card += 1
      setTimeout(this.slideCard, 200)
    },
    afterLeave() {
      this.toBeHide -= 1
      if (this.toBeHide === 0) {
        this.slideCard()
      }
    },
  },
}
```

这就是最终的效果啦。

![GIFrecord_2018-10-25_211508.gif](/blog/images/Vue-transition-group-组件实现类似-Google-Keep-的延迟动画/5bd1c2ddc3326.gif)

碎碎念：

我一个后端开发怎么搞 vue 来了呢 (⊙o⊙)? 这个项目的同步服务正在进行一个复杂的重构，等完全弄好了整理一下发个文章吧。

为什么 Google Keep 说改版就改版了。底色变的全白了好刺眼啊，还有各种难看的圆角。还是原来的好。

### 参考

[https://cn.vuejs.org/v2/api/#transition-group](https://cn.vuejs.org/v2/api/#transition-group)
[https://codepen.io/dizzyluo/pen/yJLwWm](https://codepen.io/dizzyluo/pen/yJLwWm)
