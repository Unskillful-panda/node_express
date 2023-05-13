var express = require('express')
var router = express.Router()
const menu = require('../../../controllers/MenuControllers')

/**
 * 创建菜单
 * @apiParam
 */
router.post('/create', menu.createMenu)

/**
 * 编辑菜单
 * @apiParam
 */
router.post('/update', menu.updateMenu)

/**
 * 删除菜单
 * @apiParam
 */
router.post('/delete', menu.deleteMenu)

/**
 * 获取菜单路由
 * @apiParam
 */
router.get('/getRouters', menu.createRouters)

/**
 * 获取菜单列表
 * @apiParam
 */
router.get('/getList', menu.getMenuList)

/**
 * 获取树形选择配置
 */
router.get('/treeselect', menu.getTreeselect)

module.exports = router
