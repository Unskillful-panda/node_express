const Base = require('./Base')
const roleModel = require('../models/RoleModel')
const dayjs = require('dayjs')

class RoleControllers extends Base {
  constructor() {
    super()
    this.createRole = this.createRole.bind(this)
    this.updateRole = this.updateRole.bind(this)
    this.deleteRole = this.deleteRole.bind(this)
    this.getRoleInfo = this.getRoleInfo.bind(this)
    this.getRoleList = this.getRoleList.bind(this)
    this.roleSelect = this.roleSelect.bind(this)
  }

  //   生成角色
  async createRole(req, res, next) {
    const { user_id, user_name } = req.auth
    const { role_name, role_key, sort, status, remark, menuIds } = req.body

    try {
      if (!role_name) return res.sendResultAto({ code: '010', msg: '角色名称不能为空！' })
      if (!role_key) return res.sendResultAto({ code: '010', msg: '权限字符不能为空！' })
      if (!sort) return res.sendResultAto({ code: '010', msg: '角色顺序不能为空！' })

      const isRoleAndKey = await roleModel.findOne({ role_name, role_key })

      if (isRoleAndKey[0]?.role_name === role_name) {
        return res.sendResultAto({ code: '010', msg: '角色名称重复！' })
      }

      if (isRoleAndKey[0]?.role_key === role_key) {
        return res.sendResultAto({ code: '010', msg: '权限字符重复！' })
      }

      let time = dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')
      const result = await roleModel.create({
        role_name,
        role_key,
        sort: Number(sort),
        status: Number(status),
        remark,
        create_by: user_id,
        create_date: time,
        update_by: user_id,
        update_time: time
      })

      if (menuIds.length) {
        let roleMenuIds = menuIds?.map(item => [result.insertId, item])
        await roleModel.createRoleAndMenu({ roleMenuIds })
      }

      res.sendResult({ code: '000', data: null, msg: 'success' })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }

  //   编辑角色
  async updateRole(req, res, next) {
    const { user_id, user_name } = req.auth
    const { role_id, role_name, role_key, sort, status, remark, menuIds } = req.body
    try {
      if (!role_name) return res.sendResultAto({ code: '010', msg: '角色名称不能为空！' })
      if (!role_key) return res.sendResultAto({ code: '010', msg: '权限字符不能为空！' })
      if (!sort) return res.sendResultAto({ code: '010', msg: '角色顺序不能为空！' })

      const isRoleAndKey = await roleModel.findOne({ role_name, role_key })

      if (isRoleAndKey[0]?.role_name === role_name && isRoleAndKey[0]?.role_id != role_id) {
        return res.sendResultAto({ code: '010', msg: '角色名称重复！' })
      }

      if (isRoleAndKey[0]?.role_key === role_key && isRoleAndKey[0]?.role_id != role_id) {
        return res.sendResultAto({ code: '010', msg: '权限字符重复！' })
      }
      let time = dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')
      const result = await roleModel.update({
        role_id,
        role_name,
        role_key,
        sort: Number(sort),
        status: Number(status),
        remark,
        update_by: user_id,
        update_time: time
      })
      await roleModel.deleteRoleAndMenu({ roleIds: [role_id] })

      if (menuIds.length) {
        let roleMenuIds = menuIds?.map(item => [role_id, item])
        await roleModel.createRoleAndMenu({ roleMenuIds })
      }
      res.sendResult({ code: '000', data: null, msg: 'success' })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }
  //   删除角色
  async deleteRole(req, res, next) {
    const { roleIds } = req.body
    try {
      if (!roleIds.length) {
        return res.sendResult({ code: '010', data: [], msg: 'roleIds 不能为空！' })
      }
      const result = await roleModel.findRoleAndUser({ roleIds })

      if (!!result.length) {
        return res.sendResultAto({ code: '010', msg: '存在关联的用户，删除失败！' })
      }
      await roleModel.delete({ roleIds })
      await roleModel.deleteRoleAndMenu({ roleIds })

      res.sendResult({ code: '000', data: null, msg: 'success' })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }
  //   获取角色信息
  async getRoleInfo(req, res, next) {
    try {
      const { role_id } = req.query
      if (!role_id) return res.sendResultAto({ code: '010', msg: '角色ID不能为空！' })
      const result = await roleModel.findOne({ role_id: Number(role_id) })
      if (!result.length) {
        return res.sendResult({ code: '000', data: null, msg: 'success' })
      }
      const menuIds = await roleModel.findRoleAndMenu({ role_id: Number(role_id) })
      let list = menuIds.map(item => item.menu_id)
      res.sendResult({
        code: '000',
        data: { ...result[0], menuIds: list },
        msg: 'success'
      })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }
  //   获取角色列表
  async getRoleList(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query

      let index = (page - 1) * limit
      const result = await roleModel.findAll({ page: index, limit: Number(limit) })
      const total = await roleModel.findAllTotal()
      if (!result?.length) {
        return res.sendResult({ code: '000', data: { list: [] }, msg: 'success' })
      }
      res.sendResult({
        code: '000',
        data: { list: result, total: total[0].total },
        msg: 'success'
      })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }

  // 角色选择配置
  async roleSelect(req, res, next) {
    try {
      const result = await roleModel.findAll({ page: 0, limit: 99999 })

      if (!result?.length) {
        return res.sendResult({ code: '000', data: [], msg: 'success' })
      }
      res.sendResult({
        code: '000',
        data: result,
        msg: 'success'
      })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }
}

const roleControllers = new RoleControllers()
module.exports = roleControllers
