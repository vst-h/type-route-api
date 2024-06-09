import { createApi, createReqHandler } from "../src"

// 处理请求
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

// 构建路由 api 结构和类型信息
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

interface User { userId: number }
interface Post { postId: number }

interface Comment { commentId: number }
