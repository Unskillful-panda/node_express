const query = require('../utils/db')

class MenuModel {
  constructor() {}

  // 增加角色
  async create(obj) {
    let sql = `insert into sys_menu values (0,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`
    let params = [
      obj.menu_name,
      obj.parent_id,
      obj.perms,
      obj.path,
      obj.icon,
      obj.query,
      obj.sort,
      obj.is_frame,
      obj.component,
      obj.menu_type,
      obj.visible,
      obj.status,
      obj.remark,
      obj.create_by,
      obj.create_date
    ]
    return query(sql, params)
  }

  // 更新角色信息
  async update(obj) {
    let sql = `update sys_menu set menu_name=?, parent_id=?, perms=?, path=?, icon=?, query=?, sort=?, is_frame=?, component=?, menu_type=?, visible=?, status=?, remark=?  where menu_id = ?;`
    let params = [
      obj.menu_name,
      obj.parent_id,
      obj.perms,
      obj.path,
      obj.icon,
      obj.query,
      obj.sort,
      obj.is_frame,
      obj.component,
      obj.menu_type,
      obj.visible,
      obj.status,
      obj.remark,
      obj.menu_id
    ]
    return query(sql, params)
  }

  // 删除角色
  async delete(obj) {
    let sql = `delete from sys_menu where menu_id in (?)`
    let params = [obj.menu_id]
    return query(sql, params)
  }

  // 查询所有
  async findAll(obj) {
    let sql = `SELECT menu_id, menu_name, parent_id, perms, path, icon, query , sort , is_frame, component, menu_type, visible, status, remark, create_date FROM sys_menu ORDER BY sort, create_date`
    return query(sql)
  }

  // 查询所有总数
  async findAllTotal(obj) {
    let sql = `SELECT count(menu_id) total FROM sys_menu`
    return query(sql)
  }

  // 角色查找
  async findOne(obj) {
    let sql = `select menu_id, menu_name, parent_id, perms, path, icon, query, sort, is_frame, component, menu_type, visible, status, remark, create_by, create_date from sys_menu where menu_id = ? or menu_name = ?;`
    let params = [obj.menu_id, obj.menu_name]
    return query(sql, params)
  }

  // 查找角色对应的菜单
  async findRouter(obj) {
    let sql = `SELECT menu_id, menu_name, parent_id, perms, path, icon, query , sort , is_frame, component, menu_type, visible, status, remark, create_date FROM sys_menu WHERE menu_id IN (SELECT menu_id FROM sys_user_role ur, sys_role_menu rm WHERE ur.user_id = ? AND ur.role_id = rm.role_id) AND menu_type != 3 AND status = 1`
    let params = [obj.user_id]
    return query(sql, params)
  }
}

module.exports = new MenuModel()
