---
title: "JavaScript 的现状"
date: "2019-10-02 04:06:48"
permalink: "post/JavaScript-的现状/"
tags:
  - "编程语言"
---

有些事情我必须要吐槽一下了。

<!-- more -->

JavaScript 此前一直是我比较喜欢的编程语言。类 c 的语法和动态弱类型的特点让他非常容易上手。对于编程的初学者来说非常容易编写。怎么写不容易报错。

并且它是一个真正意义上的完全跨平台语言。因为它是浏览器环境唯一的编程语言。而在其他几乎任何环境都有 JS 的运行环境。还有著名的 Atwood's law：

> “Any application that can be written in JavaScript, will eventually be written in JavaScript.”
> — Jeff Atwood, Author, Entrepreneur, Cofounder of StackOverflow

不知道大家有没有想过为什么是 JS。而不是其他什么语言？~~我这篇文章是黑 JS 的。之后可能会写一篇写 JS 优点的~~

### 基础问题：为什么要有那么多的编程语言？

不同的编程语言有什么区别？有什么是某个语言做的不到的吗？

理论上来说所有编程语言都是图灵完备的。只要一个语言的运行环境实现了对应功能的接口。那么他就可以做到任何事情。

但是这就够了吗？显然不啊！图灵完备的要求非常低，甚至不需要有条件分支结构。比如被曾被广泛使用的 Fortran。可为什么 Fortran 后来要加入条件分支结构？为什么一直用 Fortran？显然这是个基础功能啊。相对的。随着现代编程语言和软件工程的发展。越来越多的功能为开发者所需要。

比如模式匹配（pattern matching）：

很多现代编程语言都有了的功能。

比如通过模式匹配实现一个阶乘：

```haskell
factorial 0 = 1
factorial n = n * factorial (n-1)
```

而 JS 的实现方式：

```js
const fact = N => N > 0
  ? N * fact(N-1)
  : 1
```

注意到了吗，不能用模式匹配的话必须判断参数来走向不同的逻辑。

再举一个实用场景的例子。我萌可能经常需要根据一个“符号”来走向不同的逻辑。比如我萌做一个 rogue 游戏。根据键盘事件来改变人物的坐标，我萌可能会写出这样的代码：

```js
// 返回一个 tuple，分别表示 X 坐标和 Y 坐标的变化量
const onKeyPress = keycode => {
  if (keycode === 'up') return [0, 1]
  if (keycode === 'down') return [0, -1]
  if (keycode === 'left') return [-1, 0]
  if (keycode === 'right') return [1, 0]
  // ？？这里该干嘛？？
}
```

而使用模式匹配的话：

```haskell
onKeyPress "up" = (0, 1)
onKeyPress "down" = (0, -1)
onKeyPress "left" = (-1, 0)
onKeyPress "right" = (1, 0)
```

非常清晰。并且可以保证函数的返回值。而试图传入不期望的参数？这个函数的签名压根就不存在。函数的参数会包括在函数的签名中。这样不管多少逻辑分支。时间复杂度都是 O(1)。而如果像 JS 代码那样提前返回的方式。每一次都是 O(n)。如果判断就包括复杂的逻辑，那么耗时将会更久。

我萌不妨实现一个上面的函数的反函数：

```js
const genKeyCode = pos => {
  if (pos[0] === 0 && pos[1] === 1) return 'up'
  if (pos[0] === 0 && pos[1] === -1) return 'down'
  if (pos[0] === -1 && pos[1] === 0) return 'left'
  if (pos[0] === 1 && pos[1] === 0) return 'right'
}
```

使用模式匹配：

```haskell
genKeyCode (0, 1) = "up"
genKeyCode (0, -1) = "down"
genKeyCode (-1, 0) = "left"
genKeyCode (1, 0) = "right"
```

很显然，模式匹配是个很好用的功能。所以当然会有人提议给 JS 加入模式匹配的功能 [ECMAScript Pattern Matching](https://github.com/tc39/proposal-pattern-matching)。但是这个提案从 tc39 成立之初就有。却至今未被加入 JS 中。这是为啥？这个暂且不说。我萌先来看看前人为 JS 做出的贡献。

### Lodash

Lodash 是 JS 的一个非常实用的工具库。他从 15 年开始加入了 enum[#cond](https://lodash.com/docs/4.17.15#cond) 方法。

使用他我萌可以简化上面的 `genKeyCode` 方法：

```js
const genKeyCode = _.cond([
  [_.matches([0, 1]), () => 'up'],
  [_.matches([0, -1]), () => 'down'],
  [_.matches([-1, 0]), () => 'left'],
  [_.matches([1, 0]), () => 'right'],
])
```

可以看到。他的作用很简单。就是通过封装。来简化一些常用的逻辑。虽然他无法改变语言本身的实现。但是可以通过封装成函数这种方式来完成这种程序编写的方式。

这里必须插一句。编程的发展就是从链接到封装再到库。一个程序员的基本素质就是复用现有的实现以及编写可复用的代码。而不断写重复代码就是及其可耻的开倒车行为。

![](/blog/images/JavaScript-的现状/w4NiHvfnDprQyEb.png)

> 之前在 review 代码的时候有个场景。编写了大量奇怪的代码来实现用 Lodash 很容易实现的功能。这感觉就和写 C++ 却不用 STL 一样。这样的为啥还要写 ES6 再编译成 ES5？你咋不直接写 ES5？很多人就是这样的自相矛盾体。当时看到这个回复我是倒吸一口凉气。

### TypeScript

TS 是个很流行的东西。~~很多人对 TS 一知半解就对着 TS 一通狂吹~~

他能流行起来的一个原因可能就是因为 vscode 了。编辑器的原生支持让 TS 具有最好的工具链和生态。让很多人得以有机会尝试 TS 并从 TS 中收益。但是 TS 这个语言还是有很多槽点：

TS 已经具备了函数重载的能力。但为什么只允许声明重载而不允许实现重载？

很多人觉得 TS 只是 JavaScript with type？那为啥不直接用 Flow ？

TS 一点也没改变吗？不。TS 加入了 enum，是一个全新的东西，而并非单纯语法层面上的改动。

TS 其实作为一门全新的语言。他完全可以做的更多，做的更好。他已经有能力引领 JS 的发展。可是在 TS 得势之后。他就变得小心翼翼。可能是生怕走错一步就失去现在的口碑和声誉。

另一个在 TC39 成立之初就有的提案是 [Optional Chaining](https://github.com/tc39/proposal-optional-chaining)。早在 TS 的初期，就有人提议为 TS 加入该功能。TS 的 [第 16 个 issue](https://github.com/microsoft/TypeScript/issues/16) 就是对此功能的建议。可是迟迟没有被加入。而开发者的答复是什么？「害怕和 TC39 的最终定义不一致」。看起来很荒唐。TypeScript 为什么要和 ES 一致？TS 哪里和 ES 相关了？你 TS 的代码能直接被 ES 的解释器处理？你最后还不是要编译成 JS？那你现在和他一不一致又有什么关系？

### CoffeeScript 👍

CoffeeScript 就是很棒一个语言。他很自然的对 JS 的易用性做出了改善。加入了很多实用的功能便于它的开发者编写优雅的代码。早在实现之初就实现了 Optional Chaining 的功能：[The Existential Operator](https://coffeescript.org/#existential-operator)

使用 CoffeeScript 能写出非常美观、简化的代码。它拥有一大批的受众。为 Atom 编辑器原生支持。在 JS 的发展历程中迈出了重要的一步。对开发者来说他是 ES6 之前的一个很好的跨越。

### ECMA-262

JS 近些年似乎看起来比较火热。其实他在很长一段时间里都止步不前。

看看 JS 的历史吧：

| Edition | Date published |           Name           |
| :-----: | :------------: | :----------------------: |
|    1    |   June 1997    |                          |
|    2    |   June 1998    |                          |
|    3    | December 1999  |                          |
|    4    |  *Abandoned*   |                          |
|    5    | December 2009  |                          |
|   5.1   |   June 2011    |                          |
|    6    |   June 2015    | ECMAScript 2015 (ES2015) |
|    7    |   June 2016    | ECMAScript 2016 (ES2016) |
|    8    |   June 2017    | ECMAScript 2017 (ES2017) |

1997 年发布了第一版。1999 年发布了第三版。到 2009 年才发布第五版：也就是 ES5。而到 2015 年才发布 ES6。在这中间。很长一段时间都是空白。只有广大的开发者不断贡献自己的热情，ES 却没有任何动静。直到 2015 年 ECMA 才想起来 ES。成立 tc39 来发展 ES。

开发者们的热情高涨。很多一直以来的诉求都被撰写为正式的提案，并且为他实现 babel plugin，让开发者可以首先就体验到新特性的益处。但 tc39 却不知道在干什么。很多重要特性或者基础功能迟迟没有得到推进。而却有一些争议提案却即将被正式纳入规范。**[proposal-class-fields](https://github.com/tc39/proposal-class-fields)** 就是极大的争议。

这也是我写这篇文章的一个契机。9 月 5 号的时候我看到一条推。提到 9 月 8 日将在上海举办一场关于 class fileds 提案的讨论会。这才对这个提案有了细致的了解。同时也意识到其中的弊端。

但让人啼笑皆非的是。TS 却很早就支持了在 class 中申明和定义属性。因为他很符合主流面向对象语言的形式。能写出很像 Java 的类的代码。而现在在 class fields 提案饱受争议的时候，甚至会有人考虑是否应该兼容一下已被广泛使用的 TS。此时的我已经是一头的问号？？？

### 总结

JavaScript 真辣鸡

### References

- [“Why Are There So Many Programming Languages?”](https://stackoverflow.blog/2015/07/29/why-are-there-so-many-programming-languages/)
- [CoffeeScript](https://coffeescript.org/)
- [Linker](https://en.wikipedia.org/wiki/Linker_(computing))
- [JavaScript的『class fields』提案中文讨论](https://github.com/hax/js-class-fields-chinese-discussion)
