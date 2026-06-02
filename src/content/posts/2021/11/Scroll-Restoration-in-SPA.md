---
title: "SPA 应用切换页面如何保留滚动位置及可能遇到的问题"
date: "2021-11-10 22:53:49"
permalink: "post/Scroll-Restoration-in-SPA/"
---

在应用中通常会有在页面切换时保留滚动位置的需求。一种方式是自行控制滚动状态。但是其实浏览器很早之前就可以自动保存页面的滚动位置。

可以参考 [History API: Scroll Restoration](https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration)

浏览器的滚动位置保存在 history 中。在使用 history API 手动控制 url 时也可以保留滚动的位置。

但是如果在 SPA 应用中，页面切换时，如果首屏渲染的页面高度不够原本的滚动位置，就会出现滚动位置不对的问题。

<!-- more -->

### 示例

下面以 React + React Router 为例，演示一下这个问题。

```jsx
export default function BasicExample() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <ItemList />
        </Route>
        <Route path="/item/:id">
          <Item />
        </Route>
      </Switch>
    </Router>
  );
}
```

有两个页面，分别是一个 item list 和 item 的 detail 页。

```jsx
function ItemList() {
  const list = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      return (
        <Link to={`/item/${i}`} key={i}>
          <div
            style={{
              width: 200,
              height: 100
            }}
          >
            {i}
          </div>
        </Link>
      );
    });
  }, []);

  return (
    <div>
      <h2>ItemList</h2>
      {list}
    </div>
  );
}

function Item() {
  const history = useHistory();

  return (
    <div>
      <h2>Item</h2>
      <button onClick={() => history.goBack()}>back</button>
    </div>
  );
}
```

Item Detail 页有按钮可以返回列表页。也可以直接用浏览器的返回按钮。

可用代码的完整内容可以在 [CodeSandbox](https://codesandbox.io/s/save-scroll-position-example-9lndo?file=/example.js) 查看。（但是在 iframe 的预览框里没法保留位置，需要在新页面中打开预览地址）

### 无法保留滚动位置的情况

但是一些开发的时候，可以会默认进行一个 loading 的操作。

```jsx

function ItemList() {
  const list = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      return (
        <Link to="/about">
          <div
            style={{
              width: 200,
              height: 100
            }}
          >
            {i}
          </div>
        </Link>
      );
    });
  }, []);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div>
      <h2>ItemList</h2>
      {loading ? "loading" : list}
    </div>
  );
}
```

这时在第一次 render 时。页面上只有 loading，而没有渲染整个列表（虽然这个列表之前被渲染过了。他的数据可以被缓存下来）。

### 推荐的最佳实践

所以如果需要保留滚动位置，必须缓存之前的页面的数据。这有很多种办法实现。缓存或者全局状态都可以。

而最简单便捷的一种方式是使用 [SWR](https://swr.vercel.app/) 这个库。这是 Vercel 的 data fetching 库。自带了缓存的功能。使用起来非常方便。

下面是他的官方示例。

```jsx
import useSWR from 'swr'

function Profile () {
  const { data, error } = useSWR('/api/user/123', fetcher)

  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>

  // render data
  return <div>hello {data.name}!</div>
}
```

这也就是为什么 [SWR 的 demo](https://swr.vercel.app/docs/getting-started) 中是在没有 data 时 return loading，而不是在 isValidating 的时候 return loading。

### 如何排查这样的问题

如果代码比较复杂的时候很难确定是在什么地方导致列表没有渲染。这种情况如果要排查的话可以用到 React Devtool 的 Profiler 功能。

先从列表页进入内容详情页。然后点 profiler 页的 Record 按钮。

![Screen Shot 2021-11-11 at 00.15.57.png](/blog/images/Scroll-Restoration-in-SPA/iEvmgrcj2F687Py.png)

然后返回列表页。然后 Stop Profiling。

之后就可以看到这期间的页面 rerender 的过程。

![Screen Shot 2021-11-11 at 00.12.02.png](/blog/images/Scroll-Restoration-in-SPA/Uni9O5wjs2aELqr.png)

这里可以看到在第二个 frame 中页面切换到了列表页。但是这时并没有渲染列表。

![Screen Shot 2021-11-11 at 00.12.30.png](/blog/images/Scroll-Restoration-in-SPA/lizS1kPfmCWKIdu.png)

在第三个 frame 中列表元素才渲染出来。

所以就可以知道没有渲染列表元素的组件层级。然后就可以比较好的缩小排查范围了。

（但是很蛋疼的是组件全是 Anonymous。又可以写一篇这方面的最佳实践了_(:з」∠)_
