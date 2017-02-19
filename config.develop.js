/**
 * config
 */
"use strict";
const path = require('path');
const appDir = path.dirname(require.main.filename);

var child_process = require("child_process");
let hostname;
let dbUsername = process.env.dbUsername;
let dbPassword = process.env.dbPassword;
let mongoPort = process.env.MongoPort || 27017;
console.log(dbUsername, dbPassword,mongoPort);

child_process.exec("hostname -f", function(err, stdout, stderr) {
   hostname = stdout.trim();
});

var config = {
  // debug 为 true 时，用于本地调试
  debug: true,
  env: 'product',
  yearlyCharge: 588,
  trialCharge: 99,
  contractVipYear: 8,//month long
  //get mini_assets() { return !this.debug; }, // 是否启用静态文件的合并压缩，详见视图中的Loader

  // site_logo: '/public/images/cnodejs_light.svg', // default is `name`
  // site_icon: '/public/img/node_icon_32.png', // 默认没有 favicon, 这里填写网址
  // // 右上角的导航区
  // site_navs: [
  //   // 格式 [ path, title, [target=''] ]
  //   [ '/about', '关于' ]
  // ],
  // // cdn host，如 http://cnodejs.qiniudn.com
  // site_static_host: '', // 静态文件存储域名
  // 社区的域名
  host: hostname,
  // 默认的Google tracker ID，自有站点请修改，申请地址：http://www.google.com/analytics/

  uploadDir: path.join(appDir,'src/public/upload/'),

  // google_tracker_id: '',
  // // 默认的cnzz tracker ID，自有站点请修改
  // cnzz_tracker_id: '',

  // mongodb 配置
  db: {
      mongo:{
            port: mongoPort,
            uri: `mongodb://localhost:${mongoPort}`,//?authSource=groupForum
            options: {
              user: dbUsername || '',
              pass: dbPassword || '',
              db: {reconnectTries: Number.MAX_VALUE },
              server: {
                poolSize: 5,
              },
            },
       },
       redis:{
        //redis config, default to the localhost
            'host':'127.0.0.1',
            'port':'6379',
            'db':'0',
            'pw':'',
            'ttl':1000 * 60 * 60 * 24 * 30
       },          
  }, 

  session_secret: 'node_site_secret', // 务必修改
  auth_cookie_name: 'node_site',

  // 程序运行的端口
  port: process.env.PORT || 8000,

  // 话题列表显示的话题数量
  list_topic_count: 3,

  // 邮箱配置
  mail_opts: {
    host: 'smtp.ym.163.com',
    port: 994,
    secure: true,
    auth: {
      user: 'admin@trver.com',
      pass: 'trver123456'
    },
  },

  //   // RSS配置
  // rss: {
  //   title: 'site title',
  //   link: 'http://yourapp.com',
  //   language: 'zh-cn',
  //   description: 'site：one world description',
  //   //最多获取的RSS Item数量
  //   max_rss_items: 50
  // },

  // //weibo app key
  // weibo_key: 10000000,
  // weibo_id: 'your_weibo_id',

  // admin 可删除话题，编辑标签。把 user_login_name 换成你的登录名
  admins: { frank25184: true },

  // 是否允许直接注册（否则只能走 github 的方式）
  allow_sign_up: true,

  // oneapm 是个用来监控网站性能的服务
  oneapm_key: '',

  // 下面两个配置都是文件上传的配置

  // 7牛的access信息，用于文件上传
  // qn_access: {
  //   accessKey: 'your access key',
  //   secretKey: 'your secret key',
  //   bucket: 'your bucket name',
  //   origin: 'http://your qiniu domain',
  //   // 如果vps在国外，请使用 http://up.qiniug.com/ ，这是七牛的国际节点
  //   // 如果在国内，此项请留空
  //   uploadURL: 'http://xxxxxxxx',
  // },

  // 文件上传配置
  // 注：如果填写 qn_access，则会上传到 7牛，以下配置无效
  
  // upload: {
  //   path: path.join(__dirname, 'public/upload/'),
  //   url: '/public/upload/'
  // },

  file_limit: '5MB',

  // 版块
  tabs: [
    ['share', '分享'],
    ['ask', '问答'],
    ['job', '招聘'],
  ],

  // // 极光推送
  // jpush: {
  //   appKey: 'YourAccessKeyyyyyyyyyyyy',
  //   masterSecret: 'YourSecretKeyyyyyyyyyyyyy',
  //   isDebug: false,
  // },

  create_post_per_day: 1000, // 每个用户一天可以发的主题数
  create_reply_per_day: 1000, // 每个用户一天可以发的评论数
  visit_per_day: 1000, // 每个 ip 每天能访问的次数
};

if (process.env.NODE_ENV === 'test') {
  config.db = 'mongodb://127.0.0.1/db_name_test';
}

module.exports = config;