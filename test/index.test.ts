import { assert, describe, expect, test } from 'vitest'
import { createApi, createReqHandler } from '../src/index'

interface User { }
interface Post { }
interface Comment { }

describe("createApi", () => {
  const myReq = createReqHandler({
    get(api, param) { return api },
    post: (api, data) => api,
  })

  const myApi = createApi(myReq, ({ get, post }) => ({
    user: {
      info: get<(id: number) => User>
      // info2: { get(id: number) { return this } },
    },
    post: {
      info: get<(id: number) => Post>,
      list: get<() => Post[]>,
      add: post<(data: Post) => number>,
      delete: post<(id: number) => boolean>,
      comment: {
        list: get<(p: { postId: number }) => Comment[]>,
        detial: get<(p: { postId: number, commentId: number }) => Comment>,
      }
    }
  }))

  test("get level2", () => {
    const level2 = myApi.user.info.get(1)
    expect((level2 as any).route).toEqual("/user/info")
  })

  test("get level2 and next level2", () => {
    const level2_1 = myApi.post.info.get(1)
    const level2_2 = myApi.post.list.get()
    expect((level2_1 as any).route).toEqual("/post/info")
    expect((level2_2 as any).route).toEqual("/post/list")
  })

  test("get level2 and level3", () => {
    const level2 = myApi.user.info.get(1)
    const level3 = myApi.post.comment.list.get({ postId: 1 })
    expect((level2 as any).route).toEqual("/user/info")
    expect((level3 as any).route).toEqual("/post/comment/list")
  })

  test("post", () => {
    const add = myApi.post.add.post({})
    const del = myApi.post.delete.post(3)
    expect((add as any).route).toEqual("/post/add")
    expect((del as any).route).toEqual("/post/delete")
  })
})
