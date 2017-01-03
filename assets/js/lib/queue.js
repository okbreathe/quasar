import hash from 'object-hash'

class Task {
  constructor(args = {}){
    this.id = hash(args)
    this.args = args
    this.failed = 0
    this.retried = 0
  }

  fail = () => {
    this.failed = new Date().getTime()
    this.retried++
    return this
  }

  retry = () => {
    this.retried--
    return this
  }

  reset = () => {
    this.retried = this.failed = 0
    return this
  }
}

export class Queue {
  defaultOptions = {
    retry: 5, // retry up to five times befor giving up
    interval: ( 10 * 1000 ), // Retry failed job every 10 seconds
    increment: 0, // Add n millseconds between interval. Effect is additive, that is if increment is 1000, the first retry will occur in interval + 1000, the second interval + 2000
    debug: false, // Whether to log to the console
    concurrency: 2, // Number of workers that can be run at once
  }

  states = {
    QUEUED: 'QUEUED',
    RUNNING: 'RUNNING',
  }

  constructor(worker, options = {}){
    this.worker      = worker
    this.options     = {...this.defaultOptions, ...options}
    this.state       = {}
    this.queue       = []
    this.failed      = []
    this.running     = 0
    this.onStart     = []
    this.onComplete  = []
    this.onError     = []
    this.onEmpty     = []
  }

  inQueue = (args) => this.state[hash(args)]

  start = fn => this.onStart.push(fn) && this

  error = fn => this.onError.push(fn) && this

  complete = fn => this.onComplete.push(fn) && this

  empty = fn => this.onEmpty.push(fn) && this

  add = (args = {}) => {
    if (!(args instanceof Object)) throw "Arguments must be an Object"

    const task = new Task(args)

    if (this.options.debug) console.log(`Task::Created - ${task.id}`)

    this.state[task.id] = this.states.QUEUED

    return this._addTask(task)
  }

  // Force a retry of a particular task
  retry = (args = {}) => {
    const idx = this.failed.indexOf(hash(args))

    if (idx > -1) {
      this._addTask(this.failed.splice(idx,1).reset())
    }

    return this
  }

  // Force a retry of all failed tasks
  retryAll = () => {
    this.failed.forEach(t => this._addTask(t.reset()))
    this.failed.length = 0
    return this
  }

  _addTask = (task) => {
    this.queue.push(task)

    if (this.running < this.options.concurrency) {
      this.running++
      this.invoke()
    }

    return this
  }

  invoke = () => {
    const task = this.queue.shift()

    new Promise((resolve, reject) => {
      if ( task ) {
        if (this.options.debug && task.failed) console.log(`Queue::Retry - ${task.id}: ${task.retried}`)
        this.state[task.id] = this.states.RUNNING
        this.worker(task.args, resolve, reject)
      } else {
        resolve()
      }
    })
    .then(res => {
      this.onComplete.forEach(f => f(res))

      if (this.options.debug) console.log(`Queue::Complete - ${task.id}`, res)

      delete this.state[task.id]

      if (this.queue.length) {
        this.invoke()
      } else {
        this.running--

        if (!this.running) {
          if (this.options.debug) console.log("Queue::Empty")
          this.onEmpty.forEach(f => f())
        }
      }
    })
    .catch(err => {
      if (this.options.debug) console.log(`Queue::Error - ${task.id}`)

      this.onError.forEach(f => f(err))

      if (task.retried < this.options.retry) {
        setTimeout(() => {
          if (this.options.debug) console.log(`Queue::Requeing - ${task.id}`)
          this._addTask(task.fail())
          this.invoke()
        }, this.options.interval + (this.options.increment * task.retried))
      } else {
        if (this.options.debug) console.log(`Queue::Giving Up - ${task.id}`)
        this.failed.push(task)
        this.running--
      }
    })

    return this
  }
}
