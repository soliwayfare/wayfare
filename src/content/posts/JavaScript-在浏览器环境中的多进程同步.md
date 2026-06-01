---
title: "JavaScript 在浏览器环境中的多进程同步"
date: "2019-05-02 17:24:44"
permalink: "post/JavaScript-在浏览器环境中的多进程同步/"
---

这标题看起来有点蠢，因为 JS 是单线程的，多进程其实指的是多个 JS 实例。但是多个 JS 实例是可能并行访问相同的数据的，所以还是会碰到需要多进程同步的情况的。

<!-- more -->

在单一 JS 实例中的纯同步代码确实是不用担心这个问题的。虽然由于事件模型可能会由于用户操作产生并发，但是由于 JS 是单线程的，所有同步操作都可以看做是原子的。比如下面的代码：

```js
var count = 0
button.addEventListener('click', () => {
  count = count + 1
})
for (var i = 0; i < 1000; i += 1)
  button.dispatchEvent(new Event('click'))
// expected count is 1000
```

在其他多线程程序中这种并发操作共享内存的情况就可能会出现异常的情况。下面用 Golang 举个俗套的栗子：

```go
func test() {
  var a int64 = 0
  var wg sync.WaitGroup
  wg.Add(1000)
  for i := 0; i < 1000; i++ {
    go (func() {
      a = a + 1
      wg.Done()
    })()
  }
  wg.Wait()
  fmt.Println(a)
  // expected output less than 1000
}
```

### 异步的情况

可是 JS 也可能会有异步的数据操作，这样的操作就不是原子的了。

```js
var count = 0

var readData = () => new Promise(r => {
  setTimeout(() => r(count), 0)
})

var writeData = data => new Promise(r => {
  setTimeout(() => r(count = data), 0)
})

button.addEventListener('click', async () => {
  const data = await readData()
  await writeData(data + 1)
})
for (var i = 0; i < 1000; i += 1)
  button.dispatchEvent(new Event('click'))
// expected count is 1
```

但是浏览器环境中 localStorage 操作是同步的，所以不用担心这种情况。可是在使用 indexDB 或者 webSQL 这种的时候就不安全了，其实如果直接用 transaction api 或者用 SQL 操作还可以，但是用 localForage 这种的时候就可能会出现这种问题。

```js
const t = async () => {
  const a = +await localforage.getItem('a')
  await localforage.setItem('a', a + 1)
}

for (let i = 0; i < 1000; i += 1) t()
// expected a = 1
```

早在很多年前就有 [文章](https://balpha.de/2012/03/javascript-concurrency-and-locking-the-html5-localstorage/) 阐述过这个问题。文章所说的是浏览器中同域名下的多页面同时访问 localStorage 的情况。但是现在 localStorage 是多线程安全的。

主要还是对于指提供了 set 和 get 两种操作的异步数据操作来说比较危险。而扩展中的 storage API 就是这样的，所以就必须进行访问控制了。

###### 延迟操作

可以使用一个变量来标志是否正在进行读写操作，如果正在进行的话就延迟执行。

```js
let processing = false
const t = async () => {
  if (processing) return setTimeout(t, 0)
  processing = true
  const a = +await localforage.getItem('a')
  await localforage.setItem('a', a + 1)
  processing = false
}
for (let i = 0; i < 1000; i += 1) t()
```

###### 轮询阻塞

但是上面的方法就无法通过 await 进行流程控制了，不知道实际会在什么时候执行，所以最好可以阻塞到操作结束。下面的方式可以实现这样的效果。

```js
let processing = false
const wait = () => new Promise(r => {
  const _wait = () => {
    setTimeout(() => {
      if (processing) _wait()
      else r()
    }, 0);
  }
  _wait()
})

const t = async () => {
  await wait()
  processing = true
  const a = +await localforage.getItem('a')
  await localforage.setItem('a', a + 1)
  processing = false
}
for (let i = 0; i < 1000; i += 1) await t()
```

###### 使用 Promise

还有一种方式是 Promise，通过每次创建一个 Promise，在处理结束后将 Promise resolve，在创建时就等待当前的 Promise resolve。这样可以避免使用 setTimeout 造成的递归的代码。

```js
let processing = Promise.resolve()
const start = () => {
  let end
  const start = new Promise(r => { end = r })
  const wait = processing.then(() => end) // 阻塞到当前执行完毕后将结束方法返回
  processing = processing.then(() => start) // 设置当前状态为进行中
  return wait
}
const t = async () => {
  const end = await start()
  const a = +await localforage.getItem('a')
  await localforage.setItem('a', a + 1)
  end()
}
for (let i = 0; i < 1000; i += 1) await t()
```

这些控制方式都依赖于 JS runtime 本身的调度方式。只适用于单进程的并发情况。

### 多进程同步

一个方法是通过进程间通讯将操作交由一个线程进行

```js
const init = async () => {
  const c = new BroadcastChannel('tabs')
  const cbs = {}
  // 通过这种方式来实现可以响应的信息交互
  c.addEventListener('message', ({data: {id, msg}}) => {
    if (cbs[id]) {
      cbs[id](msg)
      delete cbs[id]
    }
    if (msg === 'init' && isMain) {
      c.postMessage({id, msg: 'hasMain'})
    }
  })

  // 实现发送消息的函数
  c.sendMessage = msg => new Promise(r => {
    const id = Math.random()
    c.postMessage({id, msg})
    setTimeout(() => r('timeout'), 1000)
    cbs[id] = r
  })

  const result = await c.sendMessage('init')
  c.isMain = result === 'timeout'
  return c
}
```

这种方式在浏览器扩展环境还是比较实用的，在浏览器环境中可以有一个一直运行的 background 进程，可以把页面中的交互操作发送给 background 进行执行。但是为了暴露相同的 API 同样需要一个初始化的过程，来判断当前环境是否是 background，如果是 background 直接执行，不是 background 则发送消息。

###### Web Locks API

这个是个比较新的 API，用法很简单，参考 [提案](https://wicg.github.io/web-locks) 即可，但是目前并未在所有平台实现，兼容性可以参考 [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)。

```js
const sleep = ms => new Promise(r => setTimeout(r, ms))
navigator.locks.request('test', async () => {
  console.time()
  await sleep(1000)
})
navigator.locks.request('test', async () => {
  await sleep(1000)
  console.timeEnd()
})
// expect output default: 2000ms
```

###### SharedArrayBuffer 和 Atomics

通过 SharedArrayBuffer 和 Atomics 实现锁操作可以参考 [js-lock-and-condition](https://github.com/lars-t-hansen/js-lock-and-condition)
通过 haredWorker 共享 SharedArrayBuffer 大概是这么个流程

```js
const initLock = async () => {
  const worker = new SharedWorker('worker.js')
  const buffer = await new Promise(resolve => {
    work.onmessage = buf => r(buf)
    setTimeout(() => {
      const buf = new SharedArrayBuffer(100)
      work.postMessage(buf)
      resolve(buf)
    }, 100)
  })
  return new Int32Array(buffer)
}

// worker.js
let locks
onconnect = e => {
  const [port] = e.ports
  if (locks) port.postMessage(locks)
  else port.onmessage = ({data}) => { locks = data }
}
```

通过 SharedArrayBuffer 和 Atomics 实现的共享内存，再在其之上实现的锁操作。这个就很麻烦了。要先通过 SharedWorker 共享 SABs，然后才能借此进行同步。并且 SABs API 之前还曾被禁用过，因此倒不如使用 localStorage API 实现：

```js

const lock = (key, fn) => new Promise(resolve => {
  const K = key + '_LOCK'
  const _tryLock = () => {
    setTimeout(async () => {
      if (localStorage[K]) _tryLock()
      else {
        localStorage[K] = 1
        await fn()
        delete localStorage[K]
        resolve()
      }
    }, 50)
  }
  _tryLock()
})

const sleep = ms => new Promise(r => setTimeout(r, ms))

lock('t', async () => {
  console.time()
  await sleep(1000)
})
lock('t', async () => {
  await sleep(1000)
  console.timeEnd()
})
// expect output default: 2000ms
```

### 参考

 - [Are Mutexes needed in javascript?](https://stackoverflow.com/questions/124764/are-mutexes-needed-in-javascript)
 - [JavaScript concurrency and locking the HTML5 localStorage](https://balpha.de/2012/03/javascript-concurrency-and-locking-the-html5-localstorage/)
 - [LockableStorage](https://bitbucket.org/balpha/lockablestorage/src/default/lockablestorage.js)
 - [await-mutex](https://github.com/mgtitimoli/await-mutex)
 - [node issue #22702](https://github.com/nodejs/node/issues/22702)
