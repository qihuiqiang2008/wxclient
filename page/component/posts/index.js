//index.js
//获取应用实例
var app = getApp()
var requestUrl = "http://192.168.1.103:3000/posts?type=";
var curPage = 1;
var isPullDownRefreshing = false;
Page({
  data: {
    // tab切换
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    motto: 'Hello World',
    userInfo: {},
    postsHot: {},
    postsNearby: {}
  },

  lower: function () {
    console.log("reach to lower...");
    var that = this;
    this.fetchPosts();
  },
  onLoad: function () {
    var that = this;

    /**
            * 获取系统信息
            */
    wx.getSystemInfo({

      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }

    });


    console.log('onLoad')
    var that = this
    this.fetchPosts();


  },
  onPullDownRefresh: function () {
    console.log('onPullDownRefresh...');
    curPage = 1;
    isPullDownRefreshing = true;
    this.fetchPosts();
  },

  fetchPosts: function () {
    wx.showNavigationBarLoading();
    var that = this;
    wx.request({
      url: requestUrl + that.data.currentTab,
      data: {
        'showapi_appid': app.globalData.appid,
        'showapi_sign': app.globalData.apiKey,
        'page': curPage.toString(),
        'type': app.globalData.tImg
      },
      method: 'GET',
      success: function (res) {
        console.log(res)
        // success
        if (curPage == 1) {
         
            that.setData({ postsNearby: res.data });
          
            that.setData({ postsHot: res.data });
          
        }


        else {
          
            that.setData({ postsNearby: that.data.posts.concat(res.data) });
        
            that.setData({ postsHot: that.data.posts.concat(res.data) });
        
        }


        curPage = curPage + 1;
        console.log(res.data)
        wx.hideNavigationBarLoading();
        if (isPullDownRefreshing)
          wx.stopPullDownRefresh();
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },


  /**
      * 滑动切换tab
      */
  bindChange: function (e) {

    var that = this;
    that.setData({ currentTab: e.detail.current });

  },



  likePost: function (e) {
    var that = this;
    var post_id = e.currentTarget.dataset.id;
    var postsHot=that.data.postsHot.map( function(item) { if(item._id==post_id){ item.like_count++;}  return item; } ); 
     that.setData({postsHot:postsHot });
    that.setData({postsNearby:postsHot });
   
  },




  /**
   * 点击tab切换
   */
  swichNav: function (e) {

    var that = this;

    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
    that.fetchPosts();
  },


  previewImg: function (e) {
    console.log(e);
    wx.previewImage({
      // current: 'String', // 当前显示图片的链接，不填则默认为 urls 的第一张
      urls: [e.currentTarget.dataset.imgurl],
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  }

})

