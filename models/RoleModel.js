const query = require('../utils/db')

class RoleModel {
  constructor() {}

  // 增加角色
  async create(obj) {
    let sql = `insert into sys_role values (0,?,?,?,?,?,?,?,?,?);`
    let params = [
      obj.role_name,
      obj.role_key,
      obj.sort,
      obj.status,
      obj.remark,
      obj.create_by,
      obj.create_date,
      obj.update_by,
      obj.update_time
    ]
    return query(sql, params)
  }

  // 更新角色信息
  async update(obj) {
    let sql = `update sys_role set role_name=?, role_key=?, sort=?, status=?, remark=?, update_by=?, update_time=? where role_id = ?;`
    let params = [
      obj.role_name,
      obj.role_key,
      obj.sort,
      obj.status,
      obj.remark,
      obj.update_by,
      obj.update_time,
      obj.role_id
    ]
    return query(sql, params)
  }

  // 删除角色
  async delete(obj) {
    let sql = `delete from sys_role where role_id in (?) and role_id != 100;`
    let params = [obj.roleIds]
    return query(sql, params)
  }

  // 查询所有
  async findAll(obj) {
    let sql = `SELECT role_id, role_name, role_key, sort, status, remark, create_date FROM sys_role ORDER BY sort, create_date LIMIT ?, ?;`
    let params = [obj.page, obj.limit]
    return query(sql, params)
  }

  // 查询所有总数
  async findAllTotal(obj) {
    let sql = `SELECT count(role_id) total FROM sys_role`
    return query(sql)
  }

  // 角色查找
  async findOne(obj) {
    let sql = `select role_name, role_id, role_key, status from sys_role where role_id = ? or role_name = ? or role_key = ?;`
    let params = [obj.role_id, obj.role_name, obj.role_key]
    return query(sql, params)
  }

  // 查询角色对应的菜单信息
  async findRoleAndMenu(obj) {
    let sql = `SELECT menu_id FROM sys_role_menu WHERE role_id = ?;`
    let params = [obj.role_id]
    return query(sql, params)
  }

  // 生成角色和菜单关联
  async createRoleAndMenu(obj) {
    let sql = `insert into sys_role_menu values ?;`
    let params = [obj.roleMenuIds]
    return query(sql, params)
  }

  // 删除角色和菜单关联
  async deleteRoleAndMenu(obj) {
    let sql = `delete from sys_role_menu where role_id in (?);`
    let params = [obj.roleIds]
    return query(sql, params)
  }

  // 查询角色对应的用户
  async findRoleAndUser(obj) {
    let sql = `select user_id from sys_user_role where role_id IN (?);`
    let params = [obj.roleIds]
    return query(sql, params)
  }
}

module.exports = new RoleModel()
