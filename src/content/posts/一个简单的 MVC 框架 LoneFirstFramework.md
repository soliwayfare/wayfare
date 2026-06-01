---
title: "一个简单的 MVC 框架 LoneFirstFramework"
date: "2016-11-01 13:23:14"
permalink: "post/一个简单的 MVC 框架 LoneFirstFramework/"
tags:
  - "作品"
  - "学习"
---

博客算是一直荒废着，看见民那好像都很喜欢把自己平时做的小玩意儿放在博客里，那么我也这样玩吧。

<!-- more -->

~~其实写这个已经 17 年了，但是还算假装是 16 年写的 2333..~~

其实这个东西做出来很久了，是高三暑假做的，一个是平时写 PHP 很多但是却没啥东西可以做，还有是当时在学 Laravel，觉得好流弊，所以做了这个。不是也有很多人说 PHP 算入门至少要先自己写个框架出来嘛，这不就写了么。~~话说还拿这个来做过私活，不过感觉好不负责任哦，以后还是会继续用 Laravel 做~~

### 项目地址 : [LoneFirstFramework](https://github.com/cnwangjie/LoneFirstFramework/)

-------

但是也不可能丢个链接就跑了，还是多少說一下做这个的收获吧。

首先是模仿 Laravel 做了一个路由，之前并没有研究过 Laravel 的 Framework，只是想着自己想办法解决。然后使用了`call_user_func_array()`来给一个方法按顺序传入不确定数量参数。

```php
/**
 * 把第一个参数作为回调函数（callback）调用，把参数数组作（param_arr）为回调函数的的参数传入
 * $callback 被调用的回调函数。
 * $param_arr 要被传入回调函数的数组，这个数组得是索引数组。
 * 返回回调函数的结果。如果出错的话就返回 FALSE
 */
mixed call_user_func_array ( callable $callback , array $param_arr )
```

在为了封装模型类的时候又遇到了安全执行 SQL 语句的问题，之前如果单独用的话都是直接`PDO::prepare`一下然后执行就好，就可以做到防止注入了，但是如果这样的话就没有办法检测实际执行的 SQL 语句了。其实可以把拼接的内容保存下来，执行的时候还是用 prepare~~，实际采取了给所有参数`PDO::quote`的方法~~

```php
// 理想状况
$PDOst->prepare($sql)
      ->execute($parameter)
      ->fetch();
```

实现视图模板的时候就是采用正则替换啦，期间一个是补了一下正则，还有一个是涉及到了一个如果要在模板里写 PHP 代码就必须先把 PHP 代码保存一下不然有可能会被替换掉。其中用了`preg_replace_callback()`来将正则匹配到的东西替换成完全不同的东西。最终实现了一个类似 smarty 的视图模板。

之前一直没研究过异常处理，都是直接 throw 就不管了，因为要成个体系，所以这里还要做一个异常页面，特意研究了一下异常处理。
```php
set_exception_handler();
set_error_handler();
```

最后为了像别人一样弄一个 travis 的 build passing 的小徽标还研究了一下 PHPUnit。但是发现不是 TDD 真的好难写测试用例啊 QAQ

整个框架并没有做的特别精致，但是期间也是把文档好好研究了一遍，也把各种坑探了一遍。现在这个框架用来做一些简单的网站还是很便捷哒。
