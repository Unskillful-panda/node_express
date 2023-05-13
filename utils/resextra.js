/**
 *  添加统一返回结果方法
 */
module.exports = function (req, res, next) {
  res.sendResult = function (obj) {
    res.json({
      code: obj.code,
      data: obj.data,
      msg: obj.msg
    })
  }

  //   自定义格式
  res.sendResultAto = function (obj) {
    res.json({ ...obj })
  }

  next()
}
