const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const path = require('path')
const mount = require('mount-routes') // 路由加载
const fs = require('fs')
const app = express()
const log = require('./utils/logger')

//访问 .env文件
const dotenv = require('dotenv')
dotenv.config()

app.use(logger('dev'))

// 输出请求日志
var accessLogStream = fs.createWriteStream(path.join(__dirname, '/log/request.log'), {
  flags: 'a',
  encoding: 'utf8'
})
// app.use(logger('combined', { stream: accessLogStream }))

// 处理请求参数解析
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// app.use(express.static(path.join(__dirname, 'public')))

app.all('/api/*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, token')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Authorization')
  res.header('Content-Type', 'application/json;charset=UTF-8')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type,Content-Length, Authorization, Accept,X-Requested-With'
  )
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  /*让options请求快速返回*/
  if (req.method == 'OPTIONS') res.send(200)
  else next()
})

// 中间件签名
app.use(cookieParser())

// 统一响应机制
const UnifiedResponse = require('./utils/resextra')
app.use(UnifiedResponse)

const admin_passport = require('./utils/permission')

// 处理其他路径
app.use(function (req, res, next) {
  const reg = /\/api/g
  if (req.url === '/favicon.ico' || req.url === '/') {
    res.sendFile(path.join(__dirname, 'public/html/index.html'))
    return
  }
  if (!reg.test(req.url)) {
    res.status(200).sendResultAto({ code: 502, msg: '请求方式或路由错误' })
    return
  }
  next()
})

// 设置 passport 验证路径 ('/api/private/' 开头的都需要进行token)
app.use(admin_passport.tokenAuth)
// app.use('/api/*', admin_passport.permissionAuth)

//token 失败时处理
app.use(function (err, req, res, next) {
  const pm = req.body
  if (err.name === 'UnauthorizedError') {
    log.error(
      `${req.method} ${req.baseUrl + req.path} *** 响应：${JSON.stringify({
        data: null,
        code: err.status || 401,
        message: err.message || 'token错误'
      })}`
    )
    res.status(401).sendResultAto({ code: 401, msg: '登录已过期' })
  }
})

// 带路径的用法并且可以打印出路有表  true 代表展示路由表在打印台
mount(app, path.join(process.cwd(), '/routes'), true)

// 处理无响应 如果没有路径处理
app.use(function (req, res, next) {
  res.status(200).sendResultAto({ code: 502, msg: '请求方式或路由错误' })
})

app.listen(3300, () => {
  console.log('服务器启动完毕')
})

module.exports = app
