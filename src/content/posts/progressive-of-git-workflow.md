---
title: "Git 工作流程的演化"
date: "2021-10-30"
permalink: "post/progressive-of-git-workflow/"
---

很多人协作的 git 仓库经常会变的非常混乱。但是在有一定规范的情况下还是很好避免的。

> 抖音有一个 pack item 服务。负责包装视频对象上的信息，过滤视频等。每个业务线都可能在视频上加一些自己业务用的字段。这个结构体包含几百个字段。这个服务会有几十个业务线 & 数百个研发提交代码。并且这个服务有上万个实例，滚动升级一次需要几个小时。升级需要排队。这个服务几乎无时无刻不在升级。而这样的服务在抖音还有很多。

这篇文章会介绍一下 git 工作流程的演化过程。以及我们如何避免团队开发中的 git 工作流程的混乱。

<!-- more -->

**背景**

这是一个混乱的 git 仓库的 log graph。很难追溯历史。甚至我都不知道该从哪个分支切新的分支。

![https://i.loli.net/2021/10/30/7PVFC6c31Iuy2mi.png](/blog/images/progressive-of-git-workflow/7PVFC6c31Iuy2mi.png)

![https://i.loli.net/2021/10/30/3UtznT1OX8YD56r.png](/blog/images/progressive-of-git-workflow/3UtznT1OX8YD56r.png)

这在人多的项目比较常见。但是有一定规范的情况下还是挺好避免的。


**理想情况**

最理想清晰的 git log graph 是下面这样，一个 feature 接一个 feature，非常清晰。

![https://i.loli.net/2021/10/30/wifjbIF9mWNx5tC.png](/blog/images/progressive-of-git-workflow/wifjbIF9mWNx5tC.png)

理想的 git log graph

**实际情况**

![https://i.loli.net/2021/10/30/HfvT9ZNRblCo8k4.png](/blog/images/progressive-of-git-workflow/HfvT9ZNRblCo8k4.png)

通常情况

但通常因为协同开发会产生分支之间重合的情况。

![https://i.loli.net/2021/10/30/rkg8wEN7vetdB26.png](/blog/images/progressive-of-git-workflow/rkg8wEN7vetdB26.png)

更糟的情况

更糟的情况下分支都来自非常久之前的版本。这样后面的 PR 很容易和之前的代码产生冲突。

![https://i.loli.net/2021/10/30/iyAHtcGlbKZJWrR.png](/blog/images/progressive-of-git-workflow/iyAHtcGlbKZJWrR.png)

一种解决方式是在 feature 分支上合并一下主干。

但是这种情况下之前分支的代码就会被悄无声息的修改。因为通常来说这个 merge 主干产生的 commit 是一个大而杂的 commit。很难注意到其中包含了一些因为解决冲突带来的问题。

![https://i.loli.net/2021/10/30/2f6UGrb75QHEdjD.png](/blog/images/progressive-of-git-workflow/2f6UGrb75QHEdjD.png)

（类似这样）

并且可能一段时间之后，之前代码的作者发现自己的代码被人改了。但是很难从 log 里找出是谁改的。

![https://i.loli.net/2021/10/30/TJbMpFIeHnBCaYG.png](/blog/images/progressive-of-git-workflow/TJbMpFIeHnBCaYG.png)

通常来说可以用 git blame 很容易找到一行代码最后是被谁修改的。但是因为 merge 操作仍然会保留之前的 commit message，但是主干上的代码经过多次 merge 之后就指不定显示 author 是谁了。。

并且会导致 log graph 很乱。不知道这个改动是从什么时候开始的。

![https://i.loli.net/2021/10/30/wRVDlvCmNQbzxpn.png](/blog/images/progressive-of-git-workflow/wRVDlvCmNQbzxpn.png)

**同步上游的推荐方式**

![https://i.loli.net/2021/10/30/wgqroi2IXRTl9dx.png](/blog/images/progressive-of-git-workflow/wgqroi2IXRTl9dx.png)

另一种比较好的方式是通过 rebase 上游。让这个分支看起来像是刚刚 checkout 出来的一样。这样 git graph 就不会和其他的交叉。可以很清晰的看出这次 PR 包含了哪些 commit。**并且如果在 rebase 期间解决了冲突，那么这部分变更会明显的显示出他的作者。**

![https://i.loli.net/2021/10/30/IzTasCJd2bchGVf.png](/blog/images/progressive-of-git-workflow/IzTasCJd2bchGVf.png)

但是如果之前分支上就包括了多个 commit，那么在解决冲突时可能会发生多次冲突，可能需要解决多次冲突。这时可以先在原本分支 squash 一下。把多个 commit 合成一个 commit。这样只需要解决一次冲突了。

并且很多情况下一次 commit 并不是一个完整的 feature，那么最好也在合并到主干之前先 squash 一下。

GitLab 可以设置自动 fast-forward 到目标分支，这样可以自动让 log graph 不会交叉。但是 GitHub 没这个功能。所以只能靠大家手动做这件事情

**开发分支**

![https://i.loli.net/2021/10/30/iNym6lHYbfscX5q.png](/blog/images/progressive-of-git-workflow/iNym6lHYbfscX5q.png)

通常来说在 reviewer 比 developer 少很多的情况下会出现开头的情况。因为 PR 到很迟才会被 review。这样也很容易造成 PR 之间冲突。而且如果一个 PR 被放了很久然后又要回过头来解决冲突挺麻烦的。

这种时候会有个中间的开发分支。这个分支合并的需求比较低（可能没有完整的 review 或者测试，但通常也经过自测并且通过 CI 可以编译）。而一段时间之后再从 dev 尝试合并到主干。这时 review 和测试就会比较完全。

**Release 分支**

![https://i.loli.net/2021/10/30/rV5WMfhRyIq9ax7.png](/blog/images/progressive-of-git-workflow/rV5WMfhRyIq9ax7.png)

这个和上面的 git graph 是完全一致的。但是会直接合并到主干。类似目前的情况。

![https://i.loli.net/2021/10/30/DughMZvXk7LWbEq.png](/blog/images/progressive-of-git-workflow/DughMZvXk7LWbEq.png)

而通常来说 release 分支只有一个（在 git flow 中）。多个版本的情况其实应该非目前版本的代码就暂时不合并。而一个版本确定后也不会再变，所以一般会用 tag 来保证不变（不然任何一个 release 版本都可以 fast forward 到下一个 release。这个带版本号的 release 分支就很鸡肋了。）

**Review**

理想情况下每个 PR 都应该及时经过 review 并尽快合并。避免迟迟不合并造成和上游冲突导致的风险和开销。**最好情况下每个 PR 都由项目的 PO (primary owner) review，如果没有 PO 则由相关代码的原作者 review，如果是新 feature 则由这部分的 BP (backup person, or business partner) review。**
