
const util = require( '../../../utils/util.js' );

Page( {
    data: {
        // text:"这是一个页面"
        data: [],
        databody: null,
        comments : [],  // 评论
        comment:"",
        reply4Comment:null,
        reply4reply:null,
        post:null,
        replies:null,
        winHeight: 0,   // 设备高度
        
        // 弹窗
        modalHidden: true,
        modalValue: null,
        post_id:"",
        shareShow: 'none',
        shareOpacity: {},
        shareBottom: {},
        commentHolder:"我也说两句"

    },
    onLoad: function( options ) {
        // 页面初始化 options 为页面跳转所带来的参数
        var that = this
        var id = options.id;
        console.log(options.post_id);
        that.setData({"post_id":options.post_id})
        // 请求内容数据
        util.AJAX2( "post/" + options.post_id, function( res ) {
            var post = res.data.post;
            var comments =  res.data.replies;
            // 重新写入数据
            that.setData( {
                post: post,
                comments: comments
            });
        });
        /**
         * 获取系统信息
         */
        wx.getSystemInfo( {
            success: function( res ) {
                that.setData( {
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });
            }
        });
    },





 replyComment: function(event) {
      var that = this;
    var id = event.currentTarget.dataset.id;
    var comments = that.data.comments;
    var reply4Comment="";
    for (var i = 0; i < comments.length; i++) {
      if (comments[i]._id == id) {
        reply4Comment=comments[i];
        break;
      }
    }
    that.setData({commentHolder:"回复:"+reply4Comment.from_user_name})
    that.setData({reply4Comment:reply4Comment})
    console.log(reply4Comment)
  },



 reply4reply: function (event) {
     var that = this;
     var id = event.currentTarget.dataset.id;
     var replyid = event.currentTarget.dataset.replyid;
     var comments = that.data.comments;
     var reply4reply = "";
     for (var i = 0; i < comments.length; i++) {
         if (comments[i]._id == id) {
             for (var j = 0; j < comments[i].childrens.length; j++) {
                 if (comments[i].childrens[j]._id == replyid) {
                     reply4reply = comments[i].childrens[j];
                     break;
                 }
             }
         }
     }
     that.setData({ commentHolder: "回复:" + reply4reply.from_user_name })
     that.setData({ reply4reply: reply4reply })
     console.log(reply4reply)
 },




  // 提交 TODO
  submit: function (event) {
       var that = this;
       var formData={"content":event.detail.value.comment,
         "post_id":that.data.post_id,"poster_id":"qihuiqiang2008",
          from_user_id:"qihuiqiang2009",from_user_name:"会飞的雨",
          to_user_id:"qihuiqiang2009",to_user_name:"你好么",
       }
       if(that.data.reply4Comment){
            formData={"content":event.detail.value.comment,
            main_id:that.data.reply4Comment._id,
           "post_id":that.data.post_id,"poster_id":"qihuiqiang2008",
            from_user_id:"qihuiqiang2009",from_user_name:"会飞的雨",
            to_user_id:"qihuiqiang2009",to_user_name:"你好么",
          }
       }
        if(that.data.reply4reply){
            formData={"content":event.detail.value.comment,
            main_id:that.data.reply4reply.main_id,
            reply_id:that.data.reply4reply._id,
           "post_id":that.data.post_id,"poster_id":"qihuiqiang2008",
            from_user_id:"qihuiqiang2009",from_user_name:"会飞的雨",
            to_user_id:that.data.reply4reply.from_user_id,to_user_name:that.data.reply4reply.from_user_name,
          }
       }
        // 请求评论
       util.AJAX1( "create/comment",formData,"post","", function( res ) {
            that.setData({"comment":""});
             that.setData({reply4Comment:null});
            that.setData({reply4reply:null});
            console.log(res)

        });

  },



    /**
     * 显示分享
     */
    showShare: function( e ) {

        // 创建动画
        var animation = wx.createAnimation( {
            duration: 100,
            timingFunction: "ease",
        })
        this.animation = animation;

        var that = this;
        that.setData( {
            shareShow: "block",
        });

        setTimeout( function() {
            that.animation.bottom( 0 ).step();
            that.setData( {
                shareBottom: animation.export()
            });
        }.bind( this ), 400 );

        // 遮罩层
        setTimeout( function() {
            that.animation.opacity( 0.3 ).step();
            that.setData( {
                shareOpacity: animation.export()
            });
        }.bind( this ), 400 );

    },

    /**
     * 关闭分享
     */
    shareClose: function() {
        // 创建动画
        var animation = wx.createAnimation( {
            duration: 0,
            timingFunction: "ease"
        })
        this.animation = animation;

        var that = this;

        setTimeout( function() {
            that.animation.bottom( -210 ).step();
            that.setData( {
                shareBottom: animation.export()
            });
        }.bind( this ), 500 );

        setTimeout( function() {
            that.animation.opacity( 0 ).step();
            that.setData( {
                shareOpacity: animation.export()
            });
        }.bind( this ), 500 );

        setTimeout( function() {
            that.setData( {
                shareShow: "none",
            });
        }.bind( this ), 1500 );
    },

    /**
     * 点击分享图标弹出层
     */
    modalTap: function( e ) {
        var that = this;
        that.setData( {
            modalHidden: false,
            modalValue: e.target.dataset.share
        })
    },



    
    /**
     * 关闭弹出层
     */
    modalChange: function( e ) {
        var that = this;
        that.setData( {
            modalHidden: true
        })
    },

    onReady: function() {
        // 页面渲染完成
        // 修改页面标题
        wx.setNavigationBarTitle( {
            title: this.data.data.title
        })


    },
    onShow: function() {
        // 页面显示
    },
    onHide: function() {
        // 页面隐藏
    },
    onUnload: function() {
        // 页面关闭
    }
})