const query = require('../utils/db')

class UserModel {
  constructor() {}

  // 通过用户账号查询一个用户
  async findUserOne(obj) {
    let sql = `select user_name, password, user_status, user_id from sys_user where user_name = ?;`
    let params = [obj.user_name]
    return query(sql, params)
  }

  // 通过用户ID查询用户信息
  async findUserId(obj) {
    let sql = `SELECT u.user_id, u.user_name, u.nick_name, u.create_date, u.expire_date, u.sex, u.user_status, u.remark, r.role_id, r.role_name, r.role_key, r.status FROM sys_user u, sys_user_role ur, sys_role r WHERE u.user_id = ? AND u.user_id = ur.user_id AND ur.role_id = r.role_id `
    let params = [obj.user_id]
    return query(sql, params)
  }

  // 获取所有用户信息和角色信息
  async findUserAll(obj) {
    let sql = `select e.user_id, e.user_name, e.nick_name, e.create_date, e.create_by, e.expire_date, e.login_date, e.login_ip, e.update_time, e.update_by, e.sex,e.user_status, e.remark, e.role_id, e.role_name, e.create_name, k.nick_name 'update_name' from (SELECT u.user_id, u.user_name, u.nick_name, u.create_date, u.create_by, u.expire_date, u.login_date, u.login_ip, u.update_time, u.update_by, u.sex, u.user_status, u.remark, r.role_id, r.role_name, j.nick_name 'create_name'  from sys_user u, sys_user_role ur, sys_role r, sys_user j  WHERE u.user_id != ? and u.user_id = ur.user_id AND ur.role_id = r.role_id and u.create_by = j.user_id) e left join sys_user k on e.update_by = k.user_id LIMIT ? ,?;`
    let params = [obj.user_id, obj.page, obj.limit]
    return query(sql, params)
  }

  // 查询用户总数
  async findUserTotal(obj) {
    let sql = `select count(user_id) total from sys_user where user_id != ? and user_id != 1`
    let params = [obj.user_id]
    return query(sql, params)
  }

  // 设置用户地址和IP
  async setUserInfo(obj) {
    let sql = `update sys_user set login_date=?, login_ip=? where user_id = ?;`
    let params = [obj.loginTime, obj.ip, obj.user_id]
    return query(sql, params)
  }

  // 删除用户
  async delete(obj) {
    let sql = `delete from sys_user where user_id in (?) and user_id != 1;`
    let params = [obj.uIds]
    return query(sql, params)
  }

  // 增加用户
  async create(obj) {
    let sql = `insert into sys_user values (0,?,?,?, ?,?,?,null,null,?,?,?,?,?);`
    let params = [
      obj.account_name,
      obj.nick_name,
      obj.password,
      obj.time,
      obj.create_by,
      obj.expire_date,
      obj.time,
      obj.create_by,
      obj.sex,
      obj.user_status,
      obj.remark
    ]
    return query(sql, params)
  }

  // 更新用户信息
  async update(obj) {
    let sql = `update sys_user set nick_name=?, expire_date=?, update_time=?, update_by=?, sex=?, user_status=?, remark=? where user_id = ?;`
    let params = [
      obj.nick_name,
      obj.expire_date,
      obj.update_time,
      obj.update_by,
      obj.sex,
      obj.user_status,
      obj.remark,
      obj.uId
    ]
    return query(sql, params)
  }

  // 更新用户密码
  async updatePass(obj) {
    let sql = `update sys_user set password=? where user_id = ?;`
    let params = [obj.password, obj.user_id]
    return query(sql, params)
  }

  // 生成用户和角色关联
  async createUserRole(obj) {
    let sql = `insert into sys_user_role values (?,?);`
    let params = [obj.user_id, obj.role_id]
    return query(sql, params)
  }

  // 删除用户和角色的关联
  async deleteUserRole(obj) {
    let sql = `delete from sys_user_role where user_id in (?) and user_id != 1;`
    let params = [obj.uIds]
    return query(sql, params)
  }

  // 更新 用户角色关联表
  async updateUserRole(obj) {
    let sql = `update sys_user_role set role_id=? where user_id = ?;`
    let params = [obj.role_id, obj.user_id]
    return query(sql, params)
  }
}

module.exports = new UserModel()
