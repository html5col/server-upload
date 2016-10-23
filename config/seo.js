/**
 * config
 */

var path = require('path');

var config = {
      home: {
          title: '语言学习社区',
          keywords: '英语，法语，日语，德语，中文，编程，学习计划，学习路径，国外交流生',
          description: '专业的语言学习社区，提供完善的自学解决方案，包括图书、视音频的推荐、各种督促学习计划、线下聚会等',
         // bodyClass:'',
      },
      about:{
          service: {
            title: '提供的服务',
            keywords: '服务,契约计划',
            description: 'Trver.com提供的服务列表',                
          },        
      },
      group: {
          groups:{
            title: '语言学习小组',
            keywords: '英语，法语，日语，德语，中文，编程，学习计划，学习路径，国外交流生，语言学习，英语学习',
            description: '包括各种全面的语言(英语，法语，日语等)学习小组，为您的自学语言提供全套解决方案',            
          },

          new:{
            title: '新建小组',
            keywords: '小组，论坛，新建小组',
            description: '包括各种全面的语言(英语，法语，日语等)学习小组，为您的自学语言提供全套解决方案',                
          },
          edit: {
            title: '小组更新',
            keywords: '小组,更新',
            description: '小组更新页面',               
          },         

          
      },
      user:{
          profile: {
            title: '的私人页面',
            keywords: '的私人页面',
            description: '的主页，我们相信：语言学习本来就在每个人的DNA中',                 
          },
          signup: {
            title: '小组用户注册',
            keywords: '组成',
            description: '注册页面',                 
          },
          login: {
            title: '小组用户登录',
            keywords: '登录',
            description: '登录页面',                   
          }, 
          logoUpload:{
            title: '用户图像上传',
            keywords: '用户图像上传',
            description: '用户图像上传...', 
          }, 
          update:{
            title: '用户信息更新',
            keywords: '用户信息，用户信息更新',
            description: '用户信息更新...', 
          },     
          forgotPw: {
             title: '忘记密码',
            keywords: '忘记密码，密码重置',
            description: '用户密码重置，请输入邮箱...',              
          },         
          resetPW: {
             title: '重置密码',
            keywords: '密码重置',
            description: '用户密码重置...',               
          },     
      },
      post:{
          make: {
            title: '发布文章',
            keywords: '个人日记，文章发表，英语日记',
            description: '发布文章',              
          },
          person: {
            title: '的文章记录',
            keywords: '个人日记，英语日记',
            description: '的文章日记记录',               
          },
          edit: {
            title: '文章日记编辑',
            keywords: '文章日记编辑',
            description: '文章日记编辑页面',               
          },
          tagPosts: {
            title: '标签所属文章',
            keywords: '标签，标签文章',
            description: '的标签所有所有文章...',                 
          },
          search: {
             title: '文章日记搜索',
            keywords: '搜索，文章搜索',
            description: '搜索所有所有文章...',                   
          },

      },

  
};

module.exports = config;