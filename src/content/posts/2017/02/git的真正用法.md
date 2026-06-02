---
title: "git 的真正用法"
date: "2017-02-01 20:04:20"
permalink: "post/git的真正用法/"
tags:
  - "学习"
  - "教程"
---

之前在某群里看到某个学长对于个人开发使用 git 不屑一顾，认为 git 只是为了团队合作可以合并代码，而没有意识到 git 对于版本管理的重要作用，甚至还认为“最近的版本就一定是正确的”这样的想法。估摸着这位学长一直沉迷学习，并没有什么实际开发经验，也不能怪他。虽然对于 git 的作用和用法在网上早已普及，但我这里浅述一下我认为 git 在个人开发过程中的真正用法吧~~（其实也就把笔记复制过来再加点说明而已~~

<!-- more -->

### 提示

不是 git 的基础使用方法，如果还不会使用 git 请参考 [git 简明指南](http://rogerdudler.github.io/git-guide/index.zh.html) 或 [猴子都能懂的 git 入门](http://backlogtool.com/git-guide/cn/)

同样不包括远程仓库操作的方法，因为主题还是个人开发的玩法

### 以下开始

#### 一些非常常用的操作

    git rm --cached <filename> # 无视一个文件的变化

也就是字面的意思啦

    git reset HEAD~ # 撤销提交

当发现自己某个版本提交了密码之类的不可公开的信息时应当立即撤销那个提交，reset 后面的是版本号，最近的就 HEAD～

    git checkout -- <filename> # 删除当前的修改

喝多了之后一通乱改醒来后后悔了，可是编辑器的历史记录已经不足矣撤回到最开始的情况了。这个是不可逆的

    git reset --hard HEAD # 将工作区直接切换到最近一次提交

和上一个类似但这个是一次撤销所有的更改了，和上一个一样是不可逆的。也可以直接切换到之前的某一个版本，把 HEAD 改成某个 version 就行了

    git checkout <version> # 切换到某个版本

当然也可以只是临时回去看一眼。光看不知道和上面那个的区别，上面那个是直接改当前的所有文件，而这个是将当前的分支切换到之前的某个版本了

    git commit --amend # 修改最近的提交

发现有文件忘了添加，或者提交之后立即进行了小改动

    git stash # 隐藏改变到脏工作目录

这个就感觉就有点骚操作了，就是可以先把当前的改动存起来，比如说和之前那个喝醉了一样的情况，可以先用这个把改动临时存一下~~所以叫脏目录~~。之后可以用`git stash apply`和`git stash pop`再把里面的东西放出来，具体看 manual。~~其实一般用不着~~

#### 一些小设置

    git config --global credential.helper store # 存储通过 https 提交时的帐号和密码

建议还是不要全局都储存，也要小心自己的系统备份公开

    git config --global https.proxy http://127.0.0.1:9256 # 配置代理

通常用不到，一般当私有的公共版本库限制了 ip 之类的情况走代理这样设置。如果只是连偶尔连 github 比较慢可以临时`export HTTPS_PROXY`。如果一直连 github 有障碍请参考之前的文章《网络环境优化方法及工具汇总》及《翻墙简单教程》

### 总结

 - 善用 man 或者 help 来临时查看作用
 - 善用自动补全~~不管是手写还是复制 sha1 值都很蛋疼~~

### 参考资料

以下网站或文章可供参考

[git manual](https://git-scm.com/docs)
[git pro](https://git-scm.com/book/en/v2)
[git pro 中文版](http://git.oschina.net/progit/)
