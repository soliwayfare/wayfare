---
title: "ArchLinux 安装教程和常见问题"
date: "2017-08-17 00:20:42"
permalink: "post/ArchLinux安装教程和常见问题/"
---

之前安装只过两次 Arch，相对都还比较顺利。最近又帮同学安装了一次 Arch，这次有了更深入的了解。这里说一下 Arch 的安装方法已经可能遇到的各种问题，希望可以有所帮助。

<!-- more -->

照理来说，只要按照 arch 的 wiki 上的 [Installation guide](https://wiki.archlinux.org/index.php/Installation_guide_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)) 一步一步的来应该就可以顺利安装上了，可是可能其中一些东西有人不是很理解。也有很多细节可能会忽略，最后导致没有安装成功。陷入了深深的疑惑之中

### 安装步骤

###### 制作一个 live cd 启动盘

这算是大多系统安装的通用步骤吧，不管 Windows 还是通常的 Linux 发行版，第一步都是下载一个镜像然后用 U 盘做一个启动盘。下载只需要在 [科大镜像站](https://mirrors.ustc.edu.cn) 之类的镜像站下个 ISO 就行了。就在`archlinux/iso/latest`目录下下载唯一一个 iso 文件就行了。md5sums.txt 是各个文件的 md5 值，用于确保下载的文件是完全正确的。之前是 Windows 的话通常来说用 UltraISO 写到 U 盘里就行了，可是这里有一个问题就是写入类型不能像其他的一样选 HDD 什么的都行，**这里必须得是 raw 格式**。如果是 linux 系统就好办了，直接用 dd 命令就行了。Windows 也可以用 ddforwindows 之类的软件。

###### 从 U 盘启动

通常来说进 boot 列表选 U 盘就行了，可是不同引导方式其实也有区别。通常主板里可以选择是 UEFI 还是 legacy BIOS。这个的区别就在于系统安装完之后引导的方式也不同，一个是通过执行 MBR 区的代码，一个则是执行 ESP 分区的代码。安装 Arch 需要你最后在安装引导程序的时候手动来决定。

两种方式进入 live cd 的操作选择界面也不一样，legacy BIOS 启动会粗糙一些。不过引导的内容都一样。

------

 > 从这部分开始就都是 [Installation guide](https://wiki.archlinux.org/index.php/Installation_guide_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)) 里的内容了

###### 键盘布局

中国大陆都是用的美式布局，Arch 默认就是美式布局，所以不要纠结这个了。

###### 验证启动模式

就是"从 U 盘启动"那部分说的事情，这个步骤之前就该做了，如果你不确定可以通过运行`ls /sys/firmware/efi/efivars`来看目录下有没有文件来判断启动模式（如果目录下是空的或者不存在这个目录则是 BIOS 启动，否则是 UEFI）

###### 连接到因特网

安装 Arch 必须联网，如果插了网线而且上级有不需要验证的 DHCP（比如说家里插了网线就有网的那种情况）的话应该直接就有网了，如果没有的话启动一下 dhcpd 就好了。**如果是在学校需要有什么验证的话建议自己用手机开个热点，然后用 wifi-menu 来连上 wifi 来安装**

可以通过`curl ip.cn`来判断自己有没有网。

###### 更新系统时间

这个是为了确保正确使用 https。直接执行`timedatectl set-ntp true`就好

###### 建立硬盘分区

这个也是所有系统安装都会有的部分，一般都是图形界面装，Arch 不过是用命令行工具装罢了，都是一样的。享受这个有趣的过程吧

我一般使用 fdisk 这个工具 ([fdisk 的用法](https://wiki.archlinux.org/index.php/Fdisk#Create_new_table))

首先执行`fdisk -l`看一下自己的硬盘，然后通过`fdisk /dev/sda`之类的来选择操作哪个硬盘。如果是硬盘是 NVME 就使用`fdisk /dev/nvme0n1`这种就好了 (NVME 还有别的坑，后面再说）

以下是 fdisk 创建分区的用法

 > 创建分区表：
 > Command (m for help): 输入 o 并按下 Enter
 > 然后建立第一个分区：
 > Command (m for help): 输入 n 并按下 Enter
 > Partition type: Select (default p): 按下 Enter
 > Partition number (1-4, default 1): 按下 Enter
 > First sector (2048-209715199, default 2048): 按下 Enter
 > Last sector, +sectors or +size{K,M,G} (2048-209715199....., default 209715199): 输入 +15G 并按下 Enter
 > 然后建立第二个分区：
 > Command (m for help): 输入 n 并按下 Enter
 > Partition type: Select (default p): 按下 Enter
 > Partition number (1-4, default 2): 按下 Enter
 > First sector (31459328-209715199, default 31459328): 按下 Enter
 > Last sector, +sectors or +size{K,M,G} (31459328-209715199....., default 209715199): 按下 Enter

这里说一下怎么分区，通常来说不用分很多区。分一个/boot 一个/swap 一个/就行了。

boot 分区用来放引导程序，GRUB 那种。如果是 UEFI 需要一个 [ESP 分区](https://wiki.archlinux.org/index.php/EFI_System_Partition_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))。上面说建议分 512M，其实我就分了 100M，并无所谓。BIOS 也可以用 GRUB，所以不管咋样都先分 100M 给 boot 并没什么问题。只是格式不一样罢了

swap 是内存满的时候用的，如果你的内存很大根本用不满不分也罢，如果你的硬盘太太差劲，被用来当内存也会很慢，所以 swap 分区通常都不需要很大，根据需要留一些做缓冲就好了。~~我的本本是 16G 内存，刚开始觉得够用，如今越发觉得不够用了。~~

其他的都给/就好了，如果还有别的硬盘则完全没必要分区

###### 格式化分区

swap 使用`mkswap /dev/sdxy` `swapon /dev/sdxy`命令设置

/分区使用 ext4 就行

###### 挂载分区

先挂载/分区，按之前的顺序就是第三个分区是/分区。`mount /dev/sda3 /mnt`，`mount /dev/sda1 /mnt/boot`就行。如果还有其他的硬盘再依次挂载到对应的位置上。这里之后就可以使用`genfstab`了，不过教程上放在了后面就后面再说吧

------

 > 这里是安装的部分了

###### 选择镜像

编辑`/etc/pacman.d/mirrorlist`这个文件，livecd 带很多编辑器。这里用 vim 就行了。开始这个文件会有全世界所有的 arch 镜像，这里把除了需要的都删了就行，留几个中国的就行了，比如科大的，清华的，网易的都行。

###### 安装基本系统

运行`pacstrap -i /mnt base base-devel`，这就是 arch 的基本带的包了。接下来就是漫长的等待安装过程，这个过程在所有系统的安装里都会很长。那段时间干的就是这个事情。把基本系统写到硬盘里

------

 > 以下是配置系统的部分

###### Fstab

`genfstab -U /mnt >> /mnt/etc/fstab`这是一个必须的操作，完成后`cat /mnt/etc/fstab`一下，确保正确，不缺少，也不重复

###### Chroot

`arch-chroot /mnt` change root 到新装的系统，这时这些操作哦可以在重启正式进入系统之后在做，但是也可以先进行一些配置和必要的软件的安装。比如说用 wifi 的话一定要先装一波 wifi-menu，在 netctl 包里，可能还会需要 wpa_supplicant，dialog 等包。

###### 时区

`ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime` 设置时区为亚洲/上海

`hwclock --systohc --utc` 设置标准为 UTC

###### Locale

编辑`/etc/locale.gen`文件，把可能用到的语言的字符集前面的#去掉即可。中文和英文的 UTF8 都取消注释就行，然后运行`locale-gen`生成

`echo LANG=en_US.UTF-8 > /etc/locale.conf`设置本地化，终端下必须英文，图形界面下可以设中文，但是得面对着不完整的汉化，就是有的是中文有的是英文

###### 主机名

`echo 主机名 > /etc/hostname`

###### Root 密码

`passwd` 设置 root 密码，创建新用户以及安装 sudo 这个事情可以之后在做

###### 安装引导程序

 > 由于我对于引导的不了解，通常会在这最后一个步骤上栽跟头，可能会重启几次发现进不去然后再进 livecd 再重新挂载，change root 调整好几次。而且我貌似不是一个人，一个北大的朋友也问过我这个问题，我当时也是没法解决。

这个步骤主要就是 [安装 GRUB](https://wiki.archlinux.org/index.php/GRUB_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))

上来先尝试直接`grub-install --target=i386-pc /dev/sda`，如果没有报错执行`grub-mkconfig -o /boot/grub/grub.cfg`生成配置，然后就可以尝试重启了。

如果不行可以尝试"安装到分区上或者无分区磁盘上"这部分
```
chattr -i /boot/grub/i386-pc/core.img
grub-install --target=i386-pc --debug --force /dev/sda1
chattr +i /boot/grub/i386-pc/core.img

pacman -S linux
grub-mkconfig -o /boot/grub/grub.cfg
```
如果没有报错可以再次尝试重启从硬盘启动了。

如果实在不行可以尝试安装 [Syslinux](https://wiki.archlinux.org/index.php/Syslinux_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))

------

如果成功的从硬盘启动的系统，就可以算是完成了 arch 的安装了。

###### 之后要做的事情

官方的 [General recommendations](https://wiki.archlinux.org/index.php/General_recommendations_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)) 给了通常要做的事情的列表

###### 安装一些必备的软件

zsh 是一个比 bash 更好的 shell，再使用 oh-my-zsh 可以很大程度的提高自己的生活质量

###### 创建用户

`useradd -m -g users -G wheel -s /bin/zsh 用户名` 创建用户

`passwd 用户名` 设置密码

`pacman -S sudo` 安装 sudo

`visudo` 修改 sudo 配置，把`%wheel ALL=(ALL) ALL`之前的#去掉，然后保存刚刚创建的用户就可以使用 sudo 了

------

之后就可以按照喜好安装 Gnome KDE Awesome 之类的图形界面了。然后还要安装一下 chrome 输入法等必备的软件。这些都还是挺简单的，再说一下怎么安装 yaourt 吧，只有用上了 aur 才可以算是用上了 arch

###### 安装 yaourt

在`/etc/pacman.conf`的最后添加国内的镜像地址

```
[archlinuxcn]
SigLevel = Optional TrustedOnly
Server   =  http://repo.archlinuxcn.org/$arch
```

执行`sudo pacman -Sy`同步仓库，然后`sudo pacman -S yaourt`就可以啦
