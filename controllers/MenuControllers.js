const Base = require('./Base')
const menuModel = require('../models/MenuModel')
const dayjs = require('dayjs')

class MenuControllers extends Base {
  constructor() {
    super()
    this.createMenu = this.createMenu.bind(this)
    this.updateMenu = this.updateMenu.bind(this)
    this.deleteMenu = this.deleteMenu.bind(this)
    this.createRouters = this.createRouters.bind(this)
    this.getMenuList = this.getMenuList.bind(this)
    this.createTreeData = this.createTreeData.bind(this)
    this.getTreeselect = this.getTreeselect.bind(this)
    this.routerTreeDataFormat = this.routerTreeDataFormat.bind(this)
  }

  //   生成菜单
  async createMenu(req, res, next) {
    const { user_id, user_name } = req.auth
    const {
      menu_name,
      parent_id,
      perms,
      path,
      icon,
      query,
      sort,
      is_frame = 0,
      component,
      menu_type = 1,
      visible = 1,
      status = 1,
      remark
    } = req.body
    try {
      if (!menu_name) return res.sendResultAto({ code: '010', msg: '菜单名称不能为空！' })
      if (!path && menu_type != 3) {
        return res.sendResultAto({ code: '010', msg: '路由地址不能为空！' })
      }
      if (!sort) return res.sendResultAto({ code: '010', msg: '显示顺序不能为空！' })

      const isMenuName = await menuModel.findOne({ menu_name })

      if (isMenuName[0]?.menu_name === menu_name) {
        return res.sendResultAto({ code: '010', msg: '菜单名称重复！' })
      }
      const result = await menuModel.create({
        menu_name,
        parent_id: Number(parent_id),
        perms,
        path,
        icon,
        query,
        sort: Number(sort),
        is_frame: Number(is_frame),
        component,
        menu_type: Number(menu_type),
        visible: Number(visible),
        status: Number(status),
        remark,
        create_by: user_id,
        create_date: dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')
      })
      res.sendResult({ code: '000', data: null, msg: 'success' })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }

  //   编辑菜单
  async updateMenu(req, res, next) {
    const { user_id, user_name } = req.auth
    const {
      menu_id,
      menu_name,
      parent_id,
      perms,
      path,
      icon,
      query,
      sort,
      is_frame = 0,
      component,
      menu_type = 1,
      visible = 1,
      status = 1,
      remark
    } = req.body
    try {
      if (!menu_name) return res.sendResultAto({ code: '010', msg: '菜单名称不能为空！' })
      if (!path && menu_type != 3) {
        return res.sendResultAto({ code: '010', msg: '路由地址不能为空！' })
      }
      if (!sort) return res.sendResultAto({ code: '010', msg: '显示顺序不能为空！' })

      const isMenuName = await menuModel.findOne({ menu_name })

      if (isMenuName[0]?.menu_name === menu_name && isMenuName[0]?.menu_id != menu_id) {
        return res.sendResultAto({ code: '010', msg: '菜单名称重复！' })
      }

      const result = await menuModel.update({
        menu_name,
        parent_id: Number(parent_id),
        perms,
        path,
        icon,
        query,
        sort: Number(sort),
        is_frame: Number(is_frame),
        component,
        menu_type: Number(menu_type),
        visible: Number(visible),
        status: Number(status),
        remark,
        menu_id
      })

      res.sendResult({ code: '000', data: null, msg: 'success' })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }
  //   删除菜单
  async deleteMenu(req, res, next) {
    const { menu_id } = req.body
    try {
      await menuModel.delete({ menu_id })
      res.sendResult({ code: '000', data: null, msg: 'success' })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }
  //   生成菜单路由信息
  async createRouters(req, res, next) {
    try {
      const { user_id, user_name } = req.auth
      const result = await menuModel.findRouter({ user_id })

      let treeMenu = this.createTreeData(result)

      let routers = this.routerTreeDataFormat(treeMenu)
      res.sendResult({ code: '000', data: routers, msg: 'success' })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }
  //   获取菜单列表
  async getMenuList(req, res, next) {
    try {
      const result = await menuModel.findAll()

      if (!result?.length) {
        return res.sendResult({ code: '000', data: { list: [] }, msg: 'success' })
      }
      let list = this.createTreeData(result)
      res.sendResult({
        code: '000',
        data: { list: list },
        msg: 'success'
      })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }

  // 获取树形选择数据
  async getTreeselect(req, res, next) {
    try {
      const { roleId } = req.query
      const result = await menuModel.findAll()

      if (!result?.length) {
        return res.sendResult({ code: '000', data: { list: [] }, msg: 'success' })
      }
      let list = this.createTreeData(result)
      let arr = this.treedataFormat(list)
      res.sendResult({
        code: '000',
        data: { list: arr },
        msg: 'success'
      })
    } catch (error) {
      this.handleException(req, res, error)
    }
  }

  // 生成树形结构
  createTreeData(data, parentId = 0) {
    let list = []
    for (const key in data) {
      if (data.hasOwnProperty.call(data, key)) {
        const item = data[key]
        if (item.parent_id === parentId) {
          item.children = this.createTreeData(data, item.menu_id)
          list.push(item)
        }
      }
    }
    return list
  }

  // 树形结构格式化成 {id: xx, label: xx, children:[]}
  treedataFormat(data) {
    let list = []
    for (const key in data) {
      if (data.hasOwnProperty.call(data, key)) {
        const item = data[key]
        let obj = {
          id: item.menu_id ?? null,
          label: item.menu_name ?? '',
          children: []
        }
        if (item && item.children.length) {
          obj.children = this.treedataFormat(item.children)
        }
        list.push(obj)
      }
    }
    return list
  }

  // 树形结构格式化成前端路由
  routerTreeDataFormat(data) {
    let list = []
    for (const key in data) {
      if (data.hasOwnProperty.call(data, key)) {
        const item = data[key]
        let obj = {
          id: item.menu_id,
          path: item.path,
          name: item.path,
          component: item.component,
          meta: {
            title: item.menu_name,
            icon: item.icon,
            hidden: !item.visible,
            _blank: item.is_frame
          },
          children: []
        }
        if (item && item.children.length) {
          obj.children = this.routerTreeDataFormat(item.children)
        }
        list.push(obj)
      }
    }
    return list
  }
}

const menuControllers = new MenuControllers()
module.exports = menuControllers
