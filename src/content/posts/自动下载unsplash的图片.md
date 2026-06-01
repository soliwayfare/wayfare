---
title: "自动下载 unsplash 的图片"
date: "2016-12-10 17:04:27"
permalink: "post/自动下载unsplash的图片/"
tags:
  - "学习"
---

unsplash 的图片一直质量很高，用来做壁纸是个不错的选择，网站的首页之前也一直用 unsplash.it 的随机图片来作为背景，可是 unsplash.it 老是挂，所以还是逞着没挂的时候把下载下来吧。这种东西都不用想，肯定之前有人做过，下了一个 python 的和一个 node 的，可是不造为啥都用不了，算了干脆自己写一个吧。

<!-- more -->

### 项目地址 [unsplash](https://github.com/cnwangjie/unsplashs)
~~其实之前还想自己实现一个 unspash.it 那样的 Server 的说~~

用法很简单，就 clone 下来然后 npm install 然后 node app 就行了，然后图片就会自动下载到 saved 目录了。

用了 request 模块来简化请求和图片下载过程

```javascript
// 获取图片信息
request({
  url: url
  ,method: 'HEAD'
}, (err, res, body) => {
  //...
})

// 下载图片
request(url).pipe(fs.createWriteStream(dest)).on('close', callback)
```

还用了 async 来进行多线程下载，本来想自己实现一个的，弄了半天也没成功，最后还是用了 async... 用起来还是很方便的，也算是 node 包依赖的优势吧，什么东西都伸手就有 2333

```javascript
async.mapLimit(picList, 5, (src, cb) => {
  // 顺便自动 retry 防止报错程序中断
  async.retry({
    times: 3,
    interval: 1000
  }, () => {
    download(src, dest, cb)
  }, (err, result) => {

  })
}, (err, result) => {
  if (err) {
    console.log(err)
  } else {
    console.log(result)
  }
})
```
