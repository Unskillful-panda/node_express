var express = require('express')
var router = express.Router()
const User = require('../../../controllers/UserControllers')

/**
 * 创建用户
 * @apiParam
 */
router.post('/create', User.createUser)

/**
 * 编辑用户
 * @apiParam
 */
router.post('/update', User.updateUser)

/**
 * 删除用户
 * @apiParam
 */
router.post('/delete', User.deleteUser)

/**
 * 获取用户信息
 * @apiParam
 */
router.get('/getInfo', User.getUserInfo)

/**
 * 获取用户列表
 * @apiParam
 */
router.get('/getList', User.getUserAll)

/**
 * 用户登出
 * @apiParam
 */
router.post('/logout', User.logout)

/**
 * 用户更新密码
 * @apiParam
 */
router.post('/update_pass', User.updatePassword)

module.exports = router
