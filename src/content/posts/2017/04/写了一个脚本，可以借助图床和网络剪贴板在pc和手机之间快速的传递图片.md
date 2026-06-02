---
title: "写了一个脚本，可以借助图床和网络剪贴板在 pc 和手机之间快速的传递图片"
date: "2017-04-16 19:27:12"
permalink: "post/写了一个脚本，可以借助图床和网络剪贴板在pc和手机之间快速的传递图片/"
tags:
  - "学习"
  - "教程"
---

在手机和电脑之间传递图片一直是一个常见的需求吧，手机截图传到电脑上处理是最常见的了。把电脑上截的图片传到手机上从手机 qq 里发出去对于我这样的 linux 用户应该也是挺常见的~~（要是所有好友都用 Telegram 就没有这种问题了）~~，这里就不多赘述了。其实采取的方式很简单，就是传到一个网盘或者图床然后再下载下来，可是手动这样未免很麻烦，还要从另一个终端输网址啊，于是我就写了一个脚本配合 iphone 上的 Workflow~~（android 也有类似应用）~~来快速的完成这一过程

<!-- more -->

### 上传脚本

首先获取最近的一个截图

```bash
user=$(whoami)
filename=$(ls -t /home/${user}/Pictures | head -n 1)
```

然后使用 curl 将图片上传至图床或是网盘，并获取图片的链接。如果图床有 API 就很简单啦，如果没有 api 的话也可以通过表单上传然后从网页中提取返回的链接

```bash
url=$(curl -F "smfile=@/home/${user}/Pictures/${filename}" -F "format=xml" https://sm.ms/api/upload | grep -Po 'https://[a-z0-9./]+.png')
```

然后这样应该会得到一个图片的链接，可是这个链接很长，所以找一个可以自定义的网络剪贴板中转一下。这种服务还是挺多的，这里就用一下 ptpb 吧，其实我最早知道这种还是一个什么。io 的网站，可是当时还小没在意，后来就找不到了。现在突然觉得这玩意很有用，所以也想以后有时间自己写一个。

ptpb 这个需要先传一个什么东西，然后通过更新的 API 来取得一个固定网址的效果

```bash
echo ${url} | curl -X PUT -F c=@- https://ptpb.pw/17c5829d-81a0-4eb6-8681-ba72f83ffbf3
```

### 上传的 Workflow

总共就用了这些步骤，需要根据自己使用的图床而修改。我这里也丢一个 [我的链接](https://workflow.is/workflows/7931063024694529b4ac96416862f6be)

 - Find Photos
 - Set Variable
 - Text
 - Get Contents of URL
 - Get Dictionary Value
 - Set Variable
 - Text
 - Get Contents of URL

### 下载的部分

下载最简单就不说了，PC 端直接 wget 或者浏览器打开再保存就行。手机端就用一个`Get Contents of URL`和一个`Save to Photo Album`就行了

### 总结

借助脚本&工作流和各种各样的在线服务和 API 可以极大的提高工作效率和学习效率哦。只要回想一下自己日常中有哪些麻烦的又需要重复做的事情，就可以想办法把它自动化哦
