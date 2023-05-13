const { MY_HOST, MY_USER, MY_PASSWORD, MY_DATABASE, MY_POST } = process.env

const mysql = {
  host: MY_HOST,
  user: MY_USER,
  password: MY_PASSWORD,
  database: MY_DATABASE,
  port: MY_POST,
  timezone: '08:00'
}

module.exports = mysql
