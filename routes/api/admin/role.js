var express = require('express')
var router = express.Router()
const role = require('../../../controllers/RoleControllers')

/**
 * 创建角色
 * @apiParam
 */
router.post('/create', role.createRole)

/**
 * 编辑角色
 * @apiParam
 */
router.post('/update', role.updateRole)

/**
 * 删除角色
 * @apiParam
 */
router.post('/delete', role.deleteRole)

/**
 * 获取角色信息
 * @apiParam
 */
router.get('/getInfo', role.getRoleInfo)

/**
 * 获取角色列表
 * @apiParam
 */
router.get('/getList', role.getRoleList)

/**
 * 选择角色配置列表
 * @apiParam
 */
router.get('/roleSelect', role.roleSelect)

module.exports = router
