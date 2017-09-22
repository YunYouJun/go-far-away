var express = require('express');
var session = require('express-session');
var i18n = require("i18n");
var path = require('path');
var config = require('config-lite')(__dirname);
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var pkg = require('./package');
var common = require('./lib/common');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

i18n.configure({
  // setup some locales - other locales default to en silently
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  // sets a custom cookie name to parse locale settings from
  cookie: 'go-far-away',
  queryParameter: 'lang',
  register: global,
  // autoReload: true,
  extension: '.js',
  // where to store json files - defaults to './locales'
  directory: __dirname + '/locales'
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//公用（导航栏激活、语言链接修改）
app.use(common.helper);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(i18n.init);
app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({
//   name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
//   secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
//   cookie: {
//     maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
//   }
// }));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// 设置模板全局常量
app.locals.gofaraway = {
  title: pkg.name,
  description: pkg.description
};

module.exports = app;
