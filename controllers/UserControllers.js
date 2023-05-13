const Base = require('./Base')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userModel = require('../models/UserModel')
const dayjs = require('dayjs')

class UserControllers extends Base {
  constructor() {
    super()
    this.login = this.login.bind(this)
    this.getClientIp = this.getClientIp.bind(this)
    this.getUserInfo = this.getUserInfo.bind(this)
    this.getUserAll = this.getUserAll.bind(this)
    this.deleteUser = this.deleteUser.bind(this)
    this.createUser = this.createUser.bind(this)
    this.updateUser = this.updateUser.bind(this)
    this.updatePassword = this.updatePassword.bind(this)
  }

  // 登录
  async login(req, res, next) {
    const { user_name, password } = req.body
    try {
      if (!user_name) return res.sendResultAto({ code: '010', msg: '用户名不能为空！' })
      if (!password) return res.sendResultAto({ code: '010', msg: '密码不能为空' })

      const user = await userModel.findUserOne({ user_name })
      if (!user.length) {
        return res.sendResultAto({ code: '010', msg: '账号名或密码不正确' })
      }
      const isPassword = await bcrypt.compare(password, user[0].password)
      if (!isPassword) {
        return res.sendResultAto({ code: '010', msg: '账号名或密码不正确' })
      }
      if (!user[0].user_status) {
        return res.sendResultAto({ code: '010', msg: '账户已被禁用！请联系管理员' })
      }

      const token =
        'Bearer ' +
        jwt.sign(
          {
            user_id: user[0].user_id,
            user_name: user[0].user_name
          },
          process.env['SIGN_KEY'],
          {
            expiresIn: 3600 * 24 * 1 //一天
          }
        )
      res.sendResult({ code: '000', data: { token: token }, msg: 'success' })

      const ip = this.getClientIp(req)
      await userModel.setUserInfo({
        ip,
        loginTime: dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss'),
        user_id: user[0].user_id
      })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }

  // 退出登陆
  async logout(req, res, next) {
    try {
      res.sendResult({ code: '000', data: null, msg: 'success' })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }

  // 根据ID获取当前登录用户信息
  async getUserInfo(req, res, next) {
    try {
      const { user_id, user_name } = req.auth
      const userInfo = await userModel.findUserId({ user_id })
      if (!userInfo.length) {
        return res.sendResult({ code: '000', data: null, msg: 'success' })
      }
      res.sendResult({
        code: '000',
        data: {
          ...userInfo[0],
          server_time: dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')
        },
        msg: 'success'
      })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }

  // 获取所有用户列表
  async getUserAll(req, res, next) {
    try {
      const { user_id, user_name } = req.auth
      const { page = 1, limit = 10 } = req.query
      let index = (page - 1) * limit
      const userList = await userModel.findUserAll({ user_id, page: index, limit: Number(limit) })
      const total = await userModel.findUserTotal({ user_id })

      if (!userList.length) {
        return res.sendResult({ code: '000', data: { list: [] }, msg: 'success' })
      }
      res.sendResult({
        code: '000',
        data: { list: userList, total: total[0].total },
        msg: 'success'
      })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }

  // 删除多个用户 后续需要添加权限
  async deleteUser(req, res, next) {
    const { uIds } = req.body
    try {
      if (!uIds.length) {
        return res.sendResult({ code: '010', data: [], msg: 'uIds 不能为空' })
      }
      await userModel.delete({ uIds })
      await userModel.deleteUserRole({ uIds })
      res.sendResult({ code: '000', data: null, msg: 'success' })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }

  // 创建用户
  async createUser(req, res, next) {
    // 取到当前登录用户
    const { user_id, user_name } = req.auth
    const {
      account_name,
      nick_name = '',
      password,
      expire_date,
      sex = 2,
      user_status = 1,
      remark = null,
      roleId
    } = req.body

    if (!account_name) return res.sendResultAto({ code: '010', msg: '用户名不能为空！' })
    if (!password) return res.sendResultAto({ code: '010', msg: '密码不能为空！' })
    if (!expire_date) return res.sendResultAto({ code: '010', msg: '失效时间不能为空！' })
    if (!roleId) return res.sendResultAto({ code: '010', msg: '角色不能为空！' })

    try {
      const salt = await bcrypt.genSalt(10)
      const passw = await bcrypt.hash(password, salt)
      const user = {
        account_name,
        nick_name,
        password: passw,
        create_by: user_id,
        expire_date: dayjs(expire_date).format('YYYY-MM-DD HH:mm:ss'),
        sex: Number(sex),
        user_status: Number(user_status),
        remark,
        time: dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')
      }

      // 验证用户名
      const isUser = await userModel.findUserOne({ user_name: account_name })
      if (!!isUser.length) {
        return res.sendResultAto({ code: '010', msg: '用户名已存在！' })
      }
      // 创建用户
      const createUser = await userModel.create({ ...user })

      // 关联用户和角色对应的关系
      const user_role = await userModel.createUserRole({
        user_id: createUser.insertId,
        role_id: roleId
      })
      res.sendResult({ code: '000', data: null, msg: 'success' })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }

  // 更新用户数据
  async updateUser(req, res, next) {
    const { user_id, user_name } = req.auth
    const { nick_name, expire_date, sex, user_status, remark, roleId, uId } = req.body
    try {
      const user = {
        nick_name,
        expire_date: dayjs(expire_date).format('YYYY-MM-DD HH:mm:ss'),
        sex: Number(sex),
        user_status: Number(user_status),
        remark,
        update_time: dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss'),
        update_by: user_id,
        uId
      }

      if (!uId) {
        return res.sendResult({ code: '010', data: [], msg: 'uId不能为空！' })
      }

      await userModel.update({ ...user })
      await userModel.updateUserRole({
        role_id: roleId,
        user_id: uId
      })
      res.sendResult({ code: '000', data: null, msg: 'success' })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }

  // 更新用户的密码
  async updatePassword(req, res, next) {
    try {
      const { user_id, user_name } = req.auth
      const { password, newPassword, confirmPassword } = req.body

      if (!password) return res.sendResultAto({ code: '010', msg: '密码不能为空' })
      if (!newPassword) return res.sendResultAto({ code: '010', msg: '请输入新密码' })
      if (newPassword != confirmPassword)
        return res.sendResultAto({ code: '010', msg: '两次密码不一，请检查后再试！' })

      const user = await userModel.findUserOne({ user_name })

      const isPassword = await bcrypt.compare(password, user[0].password)
      if (!isPassword) {
        return res.sendResultAto({ code: '010', msg: '账号名或密码不正确' })
      }
      const salt = await bcrypt.genSalt(10)
      const passw = await bcrypt.hash(newPassword, salt)

      await userModel.updatePass({ user_id, password: passw })

      res.sendResult({ code: '000', data: null, msg: 'success' })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }

  getClientIp(req) {
    var ipAddress,
      forwardedIpsStr = req.header('x-forwarded-for')
    if (forwardedIpsStr) {
      var forwardedIps = forwardedIpsStr.split(',')
      ipAddress = forwardedIps[0]
    }
    if (!ipAddress) {
      ipAddress = req.connection.remoteAddress
    }
    return ipAddress
  }
}

const userControllers = new UserControllers()
module.exports = userControllers
