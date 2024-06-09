
# TypeRouteApi Demo

一个 Demo，覆盖到类型安全，类型提示。提供一种方便书写的 API 路由路径。

## 使用示例

``` ts
// 使用演示
async function test() {
  // 推导出参数的类型和返回值类型，不用手动指定

  // route + param: /user/info?id=1
  const user1: User = await myApi.user.info.get({ id: 1 })
  // route + param: /post/info?id=1
  const post1: Post = await myApi.post.info.get({ id: 1 })

  // route: /post/add
  const add1: number = await myApi.post.add.post({ postId: 1 })
  // route：/post/delete
  const delete1: boolean = await myApi.post.delete.post(1)
}
```

``` ts
// myApi 构建路由 api 结构和类型信息
const myApi = createApi(myReq, ({ get, post }) => ({
  user: {
    info: get<(p: { id: number }) => User>
  },
  post: {
    info: get<(p: { id: number }) => Post>,
    list: get<() => Post[]>,
    add: post<(data: Post) => number>,
    delete: post<(id: number) => boolean>,
  }
}))

interface User { userId: number }
interface Post { postId: number }
```

``` ts
// myReq 对象处理请求
const myReq = createReqHandler({
  get(api, param) {
    const route = api.route // 这里会得到路由信息
    if (param instanceof Object) {
      param = "?" + Object.entries(param).map(([k, v]) => `${k}=${v}`).join("&")
    }
    const url = "http://localhost:1234" + route + param
    // demo 使用 fetch 来演示
    return fetch(url, { method: "get" }).then(resp => resp.json())
  },
  post(api, data) {
    const route = api.route // 这里会得到路由信息
    const url = "http://localhost:1234" + route
    // demo 使用 fetch 来演示
    return fetch(url, { method: "post", body: JSON.stringify(data) })
      .then(resp => resp.json())
  },
})

```

## 后继功能添加

- 支持 REST API
``` ts
// route: /post/2/comment/33/detail
myApi.post.id(2).comment.id(33).detail.get()
```

