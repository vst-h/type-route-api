
type ReqMethod = typeof reqMethod[number]
const reqMethod = ["get", "post", "put", "delete", "patch", "head", "options", "trace", "connect"] as const

export type ApiInfo = {
  route: string
}

export interface ReqHandler {
  get?: (api: ApiInfo, ...args: _[]) => _
  post?: (api: ApiInfo, json: _, param: string | object) => _
  // put?: (api: ApiInfo, ...args: _[]) => _
  // delete?: (api: ApiInfo, ...args: _[]) => _
  // patch?: (api: ApiInfo, ...args: _[]) => _
  // head?: (api: ApiInfo, ...args: _[]) => _
  // options?: (api: ApiInfo, ...args: _[]) => _
  // trace?: (api: ApiInfo, ...args: _[]) => _
  // connect?: (api: ApiInfo, ...args: _[]) => _
}

declare const symGet: unique symbol
declare const symPost: unique symbol
type SymGet = typeof symGet
type SymPost = typeof symPost

type _Fn = (...args: any) => any
type ReqFnObj = {
  get<T extends _Fn>(...args: Parameters<T>): [ReturnType<T>, SymGet]
  post<T extends _Fn>(...json: Tup.One<Parameters<T>>): [ReturnType<T>, SymPost]
}

type ReqFn<T extends ReqHandler = never> = {
  [K in keyof T]: K extends keyof ReqFnObj ? ReqFnObj[K] : "never"
}

export function createReqHandler<T extends ReqHandler>(obj: T): T {
  return obj
}

type ApiObj<T> = {
  [K in keyof T]

  : T[K] extends (...args: infer A) => [infer R, SymGet]
  ? { get(...args: A): Promise<R> }
  : T[K] extends (...args: never[]) => [infer R, SymPost]
  ? { post(...json: Tup.One<Parameters<T[K]>>): Promise<R> }
  : ApiObj<T[K]>
}


export function createApi<T extends {}, TReq extends ReqHandler>(
  reqHandler: TReq, route: (fn: ReqFn<TReq>) => T
): ApiObj<T> {
  const routeObj = route(reqHandler as any)
  const routeStack = [] as string[]

  return forEachRouteObj(routeObj)

  function forEachRouteObj(routeObj: object) {
    const routeApiObj = {} as any
    Object.entries(routeObj).forEach(([k, v]) => {
      if (v instanceof Function) {
        const fn = v as Function

        // // 请求方法 user.info.get({ id: 3 })

        // 请求方法 user.info: get<(id: number) => number>
        if (reqHandler[fn.name as never] === fn) {
          const route = "/" + routeStack.join("/") + "/" + k
          const apiInfo = { route }
          routeApiObj[k] = {
            [fn.name]: (...args: _[]) => fn(apiInfo, ...args)
          }
        }
        // 路由参数 user.id(3).info.get()
        else {
          // const nextRoute = GetNextRoute(fn, k)
          const routeStack_ = routeStack.slice()
          routeApiObj[k] = (...args: (number | string)[]) => {
            routeStack_.push(...args.map(x => x.toString())) // 参数默认值获取不到
            return fn(...args)
          }
        }
      } else { // object
        routeStack.push(k)
        routeApiObj[k] = forEachRouteObj(v)
      }
    })
    routeStack.pop()
    return routeApiObj
  }

  function GetNextRoute(f: Function, key: string) {
    try {
      return f()
    } catch (e) {
      throw new NextRouteFnError(routeStack.join("/"), key)
    }
  }
}

class NextRouteFnError extends Error {
  constructor(public route: string, public key: string) {
    super("Run NextRoute Error: \n")
  }
}

