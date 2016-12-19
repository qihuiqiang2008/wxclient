var crypt = require("./utils/crypt.js");
var util = require("./utils/util.js");
var Promise = require("./utils/bluebird.js")
var api = require("./utils/api.js")
//app.js
var that;
var inited = false;// 初始化过程
var fid = 3;

App({
  onLaunch: function () {
    var that = this;
    //播放列表中下一首
    wx.onBackgroundAudioStop(function () {
      if (that.globalData.globalStop) {
        return;
      }
      if (that.globalData.playtype == 1) {
        that.nextplay(1);
      } else {
        that.nextfm();
      }
    });

  },
  nextplay: function (t) {
    //播放列表中下一首
    this.preplay();
    var list = this.globalData.list_am;
    var index = this.globalData.index_am;
    if (t == 1) {
      index++;
    } else {
      index--;
    }
    index = index > list.length - 1 ? 0 : (index < 0 ? list.length - 1 : index);
    this.globalData.curplay = list[index] || {};
    this.globalData.index_am = index;
    this.seekmusic(1)
  },
  nextfm: function () {
    //下一首fm
    this.preplay()
    var that = this;
    var list = that.globalData.list_fm;
    var index = that.globalData.index_fm;
    index++;
    this.globalData.playtype = 2;
    if (index > list.length - 1) {
      that.getfm();

    } else {
      console.log("获取下一首fm")
      that.globalData.index_fm = index;
      that.globalData.curplay = list[index];
      that.seekmusic(2);
    }

  },
  preplay: function () {
    //歌曲切换 停止当前音乐
    this.globalData.globalStop = true;
    wx.stopBackgroundAudio();
  },
  getfm: function () {
    var that = this;
    console.log("从新获取fm")
    wx.request({
      url: 'https://n.sqaiyan.com/fm?t=' + (new Date()).getTime(),
      method: 'GET',
      success: function (res) {
        that.globalData.list_fm = res.data.data;
        that.globalData.index_fm = 0;
        that.globalData.curplay = res.data.data[0];
        that.seekmusic(2);
      }
    })
  },
  stopmusic: function (type, cb) {
    var that = this;
    wx.pauseBackgroundAudio();
    wx.getBackgroundAudioPlayerState({
      complete: function (res) {
        that.globalData.currentPosition = res.currentPosition || '0'
      }
    })
  },
  seekmusic: function (type, cb, seek) {
    console.log("type:",type)
    var that = this;
    var m = this.globalData.curplay;
    this.globalData.playtype = type;
    if (type == 1) {
      wx.request({
        url: 'https://n.sqaiyan.com/song?id=' + that.globalData.curplay.id,
        success: function (res) {
          if (!res.data.songs[0].mp3Url) {
            that.nextplay(1);
          }
        }
      })
    }
    wx.playBackgroundAudio({
      dataUrl: m.mp3Url,
      title: m.name,
      success: function (res) {
        if (seek != undefined) {
          wx.seekBackgroundAudio({ position: seek })
        };
        that.globalData.globalStop = false;
        cb && cb();
      },
      fail: function () {
        if (type == 1) {
          that.nextplay(1)
        } else {
          that.nextfm();
        }
      }
    })
  },
  shuffleplay: function (shuffle) {
    //播放模式shuffle，1顺序，2单曲，3随机
    var that = this;
    that.globalData.shuffle = shuffle;
    if (shuffle == 1) {
      that.globalData.list_am = that.globalData.list_sf;
    }
    else if (shuffle == 2) {
      that.globalData.list_am = [that.globalData.curplay]
    }
    else {
      that.globalData.list_am = [].concat(that.globalData.list_sf);
      var sort = that.globalData.list_am;
      sort.sort(function () {
        return Math.random() - (0.5) ? 1 : -1;
      })

    }
    for (let s in that.globalData.list_am) {
      if (that.globalData.list_am[s].id == that.globalData.curplay.id) {
        that.globalData.index_am = s;
      }
    }
  },
  onShow: function () {
  },
  onHide: function () {
    wx.setStorageSync('globalData', this.globalData);
  },







/**
     * 获取初始数据
     */
    getInit: function (cb) {
        var that = this;
        var init = wx.getStorageSync('init');
        if (typeof init == 'undefined' || init == '') {
            that.init(cb);
        } else {
            cb(init);
        }
    },

    /**
     * 初始化数据
     */
    init: function (cb) {

        api.wxApi(wx.login)({})
            .then(function (loginRes) {
                return "https://api.weixin.qq.com/sns/jscode2session?" + "appid=wx61575c2a72a69def&secret=442cc056f5824255611bef6d3afe8d33&" +
                    "js_code=" + loginRes.code + "&grant_type=authorization_code";
            })
            .then(function (url) {
                return api.wxApi(wx.request)({ "url": url, "method": "GET" })
                    .then(function (sessionRes) {
                        return sessionRes
                    })
            })
            .then(function (sessionRes) {
                return api.wxApi(wx.getUserInfo)({})
                    .then(function (userInfoRes) {
                        var str = crypt.decryptUserInfo(userInfoRes.encryptedData, sessionRes.data.session_key, userInfoRes.iv); // 解密用户信息
                        var userInfo = JSON.parse(str);
                        console.log("获取用户信息成功", userInfo)
                        wx.setStorageSync('userInfo', userInfo)
                        return userInfo
                    })
            })
            .then(function (userInfo) {
                return api.wxApi(wx.downloadFile)({ "url": "https://snsapi.vzan.com/images/vzan.jpg", "type": "image" })
                    .then(function (res) {
                        console.log("下载文件成功")
                        return res.tempFilePath
                    })
            })
            .then(function (tmpFile) {
                return api.wxApi(wx.saveFile)({ "tempFilePath": tmpFile })
                    .then(function (res) {
                        console.log("保存下载文件到本地成功")
                        wx.setStorageSync('tmpFile', res.savedFilePath);
                        return res.savedFilePath
                    })
            })
            .then(function (tmpFile) {
                let verifyModel = util.primaryLoginArgs(wx.getStorageSync('userInfo').unionId);
                api.wxApi(wx.uploadFile)({
                    "url": "https://snsapi.vzan.com/minisnsapp/userinfo", "filePath": tmpFile, "name": "file",
                    "formData": {
                        "fid": fid, "deviceType": verifyModel.deviceType, "uid": verifyModel.uid,
                        "sign": verifyModel.sign, "timestamp": verifyModel.timestamp, "versionCode": verifyModel.versionCode
                    }
                })
                    .then(function (res) {
                        console.log("APP.js 初始化", res)
                        var result = JSON.parse(res.data);
                        wx.setStorageSync('user', result.obj._LookUser);
                        wx.setStorageSync('minisns', result.obj._Minisns);
                        wx.setStorageSync('myArtCount', result.obj._MyArtCount);
                        wx.setStorageSync('myMinisnsCount', result.obj._MyMinisnsCount);
                        wx.setStorageSync('concernCount', result.obj.ConcernCount);
                        wx.setStorageSync('myConcernCount', result.obj.MyConcernCount);
                        result.obj.tmpFile = wx.getStorageSync('tmpFile');
                        wx.setStorageSync('init', result);
                        console.log("APP.JS loginRes ", res);
                        if (typeof cb == "function") {
                            cb(result);
                        }
                    })
            })



        // wx.login({
        //     success: function (loginRes) {
        //         var url = "https://api.weixin.qq.com/sns/jscode2session?" + "appid=wx61575c2a72a69def&secret=442cc056f5824255611bef6d3afe8d33&" +
        //             "js_code=" + loginRes.code + "&grant_type=authorization_code";
        //         wx.request({
        //             url: url,
        //             method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        //             success: function (sessionRes) {
        //                 wx.getUserInfo({
        //                     success: function (userInfoRes) {
        //                         var str = crypt.decryptUserInfo(userInfoRes.encryptedData, sessionRes.data.session_key, userInfoRes.iv); // 解密用户信息
        //                         var userInfo = JSON.parse(str);
        //                         var verifyModel = util.primaryLoginArgs(userInfo.unionId);
        //                         console.log("获取用户信息成功", userInfo)
        //                         // 登陆服务器
        //                         // wx.request({
        //                         //     url: 'https://snsapi.vzan.com/minisnsapp/loginByWeiXin',
        //                         //     data: {
        //                         //         "deviceType": verifyModel.deviceType, "uid": verifyModel.uid,
        //                         //         "sign": verifyModel.sign, "timestamp": verifyModel.timestamp, "versionCode": verifyModel.versionCode,
        //                         //         "openid": userInfo.openId, "nickname": userInfo.nickName, "sex": userInfo.gender, "province": userInfo.province,
        //                         //         "city": userInfo.city, "country": userInfo.country, "headimgurl": userInfo.avatarUrl, "unionid": userInfo.unionId
        //                         //     },
        //                         //     method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        //                         //     header: { "content-type": "multipart/form-data;charset=UTF-8" }, // 设置请求的 header
        //                         //     success: function (res) {
        //                         //         console.log("loginByWeiXin", res);
        //                         //     }
        //                         // })

        //                         // var formdata = new FormData();
        //                         // formdata.append("fid",fid); formdata.append("deviceType",verifyModel.deviceType);
        //                         // formdata.append("uid", verifyModel.uid); formdata.append("sign", verifyModel.sign);
        //                         // formdata.append("timestamp",verifyModel.timestamp); formdata.append("versionCode", verifyModel.versionCode);


        //                         wx.downloadFile({
        //                             url: "https://snsapi.vzan.com/images/vzan.jpg",
        //                             type: 'image', // 下载资源的类型，用于客户端识别处理，有效值：image/audio/video
        //                             // header: {}, // 设置请求的 header
        //                             success: function (res) {
        //                                 console.log("下载文件", res);
        //                                 wx.saveFile({
        //                                     tempFilePath: res.tempFilePath,
        //                                     success: function (save) {
        //                                         console.log("SaveFile");
        //                                         wx.setStorageSync('tmpFile', save.savedFilePath);
        //                                         wx.uploadFile({ // 获取userInfo
        //                                             url: 'https://snsapi.vzan.com/minisnsapp/userinfo',
        //                                             filePath: wx.getStorageSync('tmpFile'),
        //                                             name: 'file',
        //                                             // header: {}, // 设置请求的 header
        //                                             formData: {
        //                                                 "fid": fid, "deviceType": verifyModel.deviceType, "uid": verifyModel.uid,
        //                                                 "sign": verifyModel.sign, "timestamp": verifyModel.timestamp, "versionCode": verifyModel.versionCode
        //                                             }, // HTTP 请求中其他额外的 form data
        //                                             success: function (res) {
        //                                                 console.log("APP.js 初始化", res)
        //                                                 var result = JSON.parse(res.data);
        //                                                 wx.setStorageSync('user', result.obj._LookUser);
        //                                                 wx.setStorageSync('minisns', result.obj._Minisns);
        //                                                 wx.setStorageSync('myArtCount', result.obj._MyArtCount);
        //                                                 wx.setStorageSync('myMinisnsCount', result.obj._MyMinisnsCount);
        //                                                 wx.setStorageSync('concernCount', result.obj.ConcernCount);
        //                                                 wx.setStorageSync('myConcernCount', result.obj.MyConcernCount);
        //                                                 result.obj.tmpFile = save.savedFilePath;
        //                                                 wx.setStorageSync('init', result);
        //                                                 console.log("APP.JS loginRes ", res);
        //                                                 if (typeof cb == "function") {
        //                                                     cb(result);
        //                                                 }
        //                                             }
        //                                         })
        //                                     }
        //                                 })
        //                             }
        //                         })

        //                     }
        //                 })
        //             }
        //         })
        //     },
        //     complete: function () {
        //         console.log("APP.js wx.login 初始化数据结束");
        //         inited = true;
        //         // 模拟数据
        //         // wx.setStorageSync('minisnsInfo', {"id":3});
        //         // wx.setStorageSync('userInfo', {"unionid":"oW2wBwaOWQ2A7RLzG3fcpmfTgnPU","Openid":"obiMY0YuQSpXSAY21oWjKw-OJC0E",
        //         // "IsSign":true,"ArticleCount":20,"CommentCount":12,"PraiseCount":1231,"IsWholeAdmin":false})
        //     }
        // })
    },




  
  globalData: {
    hasLogin: false,
    list_am: [],
    list_fm: [],
    list_sf: [],
    index_fm: 0,
    index_am: 0,
    playtype: 1,
    curplay: {},
    shuffle: 1,
    globalStop: true,
    currentPosition: 0,
    userInfo:null,
    requestUrl : "https://route.showapi.com/255-1",
    appid : "27982",
    apiKey : "495a1755b3184e4f8dfe30f818eb1a5e",
    tText : '29',
    tImg : '10',
    tAudio : '31',
    tVideo : '41'
  }
















   
})
