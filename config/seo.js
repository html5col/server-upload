/**
 * config
 */

var path = require('path');

var config = {
     desktop:{
       classfiedCode:{
          title: 'Classfied Page',
          keywords: 'Classfied Page',
          description: 'No Viewing without classfied Code',  
       },
       home:{
          title: '生活情景1对1外教',
          keywords: '英语,国际交换生,互惠生,外教带回家,驻家外教,国外交流生',
          description: '提供专业的外教服务，把外教带回家，在生活情境中让您的孩子体验国际文化，拥有一口流利的英语口语',  
       },

       courses:{
         t2h:{
          title: '带个外教带回家',
          keywords: '英语,国际交换生,互惠生,外教带回家,驻家外教,国外交流生',
          description: '带个外教回家，新增一个家庭成员，让孩子好奇主动学习，在生活中不知不觉说出一口流利的英语口语.每天保证和外教愉快主动地学习1年，效果远是传统口语培训机构不能相比...',             
         },
         t2a:{
          title: '生活情境课程: 外教真人情境课程',
          keywords: '英语,国际交换生,互惠生,外教带回家,驻家外教,国外交流生',
          description: '不需要再去学习枯燥的青少儿传统英语口语课程了；科学及观察证明，青少儿学习英语等二外语言是人生最佳时机，为什么不去学习更有效的外教情境模式呢？！孩子天性爱玩，那就顺应规律，让孩子在游玩的过程中潜移默化地练就一门熟练的二外，我们的课程引进欧美本地教材，外教每节课都会亲自按照教材设计生活情境，其设计原则是以好玩为目的，让小孩不知不觉在玩的过程中学好一门第二语言!...',             
         },
         speakdaily:{
          title: '带个外教出去玩，在玩中练好口语',
          keywords: '英语,国际交换生,互惠生,外教带出去玩,驻家外教,国外交流生',
          description: '不需要再去学习枯燥的传统课程了，学英语最好的方式是在游玩的过程中潜移默化地学习，外教随时随地等待您的召唤，陪玩，过生日，购物，you name it!...',             
         },
         questions:{
          title: '外教服务后勤',
          keywords: '英语,外教服务后勤',
          description: '外教服务的问题与解答...',             
         },
         signup:{
          title: '注册',
          keywords: '注册，外教',
          description: '注册使用外教服务...',             
         },
         login:{
          title: '登录',
          keywords: '登录，外教',
          description: '登录使用外教服务...',             
         },
         betutor:{
          title: 'Apply for the tutor',
          keywords: 'Apply for the tutor,living in native Chinese home,learn Chinese',
          description: 'We provide a creative and interesting life style for expatriates in China to live with native Chinese families, learning the Chinese language and its culture in daily life. In the meantime, we provide a free single room for you or a regular way to make money as well as experiencing the Chinese life style!',             
         },
         book:{
          title: '预定审核',
          keywords: '预定审核，预定外教，找外教',
          description: '预定外教服务...',             
         },

       },
     
     },
      
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
          rule: {
            title: '契约计划规则',
            keywords: 'X-Plan英语口语计划，B-Plan欧美书籍计划，规则,契约计划',
            description: 'X-Plan英语口语计划,B-Plan欧美书籍计划契约规则',                
          },              
      },
      vip: {
        download: {
            title: 'VIP资源',
            keywords: 'VIP语言学习精华资源',
            description: 'X-Plan计划英语学习视音频资源',           
        }
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
          hotUsers: {
             title: '活跃用户',
            keywords: '活跃用户',
            description: 'X-Plan计划活跃用户...',               
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