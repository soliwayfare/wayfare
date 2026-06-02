---
title: "Legacy BIOS 和 UEFI 的区别"
date: "2018-03-07 16:25:42"
permalink: "post/Legacy-BIOS-和-UEFI-的区别/"
---

之前关于安装 Arch 的文章提到了 Legacy BIOS 和 UEFI 引导有很大区别，然而当时我也不很懂就一带而过了。之后还是有同学在安装各种系统时在引导上有很多问题，所以这次查阅了一些资料并且给出一些建议。

<!-- more -->

### 基本介绍

传统的 [BIOS](https://en.wikipedia.org/wiki/BIOS) (Basic Input/Output System) 和 [UEFI](https://en.wikipedia.org/wiki/Unified_Extensible_Firmware_Interface) (Unified Extensible Firmware Interface) 都可以看做是电脑的固件，他们的工作都是在电脑启动后初始化所有连接的硬件设备，之后从硬盘中运行引导程序。

这里就要说一下 [MBR](https://en.wikipedia.org/wiki/Master_boot_record) (Master Boot Record) 和 [GPT](https://en.wikipedia.org/wiki/GUID_Partition_Table) (GUID Partition Table) 的区别了，这两个都是硬盘的分区方式。MBR 固定是硬盘最开始的 512 字节的区域，这部分包含了引导和分区表。而 MBR 分区方式最多只允许 4 个主分区，其中可以有一个是逻辑分区。而 GPT 则不限制分区数量，而且分区都是主分区。

Legacy BIOS 会执行 MBR 区域的程序。而 UEFI 可以在 GPT 上寻找 [ESP](https://en.wikipedia.org/wiki/EFI_system_partition) (EFI system partition) 来运行其中的程序。

### 一些问题

GPT 是兼容 MBR 的，因此及时是 GPT 分区也可以通过 MBR 引导启动或者往 MBR 区域写入引导程序。所以在安装时你可以不管是 GPT 分的区还是 MBR 分区都直接以传统方式安装 GRUB。如果 grub-install 发现你是 GPT 分区那么会自动把 GRUB 安装到 boot 分区，并且还可以在 MBR 分区写入引导，引导执行 boot 分区的 grub 程序。

包含 Windows 的双系统下不能同时使用 GPT 和 MBR，这是 Windows 的强制限制，使用只能使用 GPT+UEFI 启动或者 MBR+BIOS 启动。所以如果你先安装了 Windows，并且之后要安装其他系统的话就必须要注意在分区时不能够改变这分区方式，并且如果是 GPT 的话，不能改变 ESP 分区。这是在存在 Windows 时安装其他系统的前提条件，但是如果你不知道系统的安装程序做了什么的话你可以也会无法引导。可以在系统安装好之后再在 Windows 的引导程序中加入其他系统的选项，也可以在 GRUB 中加入启动 Windows 的选项。如果是 GPT 分区的话通常还可以在 boot 界面选择哪个系统启动。

###### 怎么看现在是 MBR 分区还是 GPT 分区？

Windows 下打开磁盘管理，右键一个磁盘选择“属性”，在“卷”标签下即可看到。其他系统使用`gdisk -l`即可查看。

###### 应该选择 BIOS 还是 UEFI？

首先要决定以那种方式来分区，这里 ArchLinux 的 wiki 给出了 [一个简单的参考](https://wiki.archlinux.org/index.php/Partitioning#Choosing_between_GPT_and_MBR)。

一旦采取 MBR 分区，那么只能选择 BIOS 启动。如果 GPT 分区，并且 ESP 设置正确，那么可以选择使用 UEFI 启动。

### 参考

[GRUB - ArchLinux](https://wiki.archlinux.org/index.php/GRUB)
[Partitioning - ArchWiki](https://wiki.archlinux.org/index.php/Partitioning)
[BIOS - Wikipedia](https://en.wikipedia.org/wiki/BIOS)
[Unified Extensible Firmware Interface - Wikipedia](https://en.wikipedia.org/wiki/Unified_Extensible_Firmware_Interface)
[Master boot record - Wikipedia](https://en.wikipedia.org/wiki/Master_boot_record)
[GUID Partition Table - Wikipedia](https://en.wikipedia.org/wiki/GUID_Partition_Table)
[Difference between Legacy BIOS and UEFI - Ask Ubuntu](https://askubuntu.com/questions/993269/difference-between-legacy-bios-and-uefi)
