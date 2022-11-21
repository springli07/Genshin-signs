class Onion {
  tasks = []
  middleFunc

  constructor(config) {
    this.middleFunc =
      config?.middle ??
      (() => () => {
        /* noop */
      })
  }

  /**
   * Add to queue
   * 添加到队列
   * @param { Array<Function> } tasks
   */
  use(...tasks) {
    this.tasks.push(...tasks)
  }

  /**
   * Add to end
   * 设置中间件最后执行的函数
   * @param { Function } middleFunc
   */
  middle(middleFunc) {
    this.middleFunc = middleFunc
  }

  /**
   * Create an onion model
   * 创建洋葱模型
   * @param { Context } ctx: context
   * @param { number } index
   */
  dispatch(ctx, index) {
    if (index === this.tasks.length) {
      return () => this.middleFunc(ctx)
    } else {
      return () => this.tasks[index](ctx, this.dispatch(ctx, index + 1))
    }
  }

  /**
   * Execution method
   * 执行方法
   * @param { Context } ctx: your context
   */
  run(ctx) {
    return this.dispatch(Object.assign({}, ctx), 0)()
  }
}

export default Onion
