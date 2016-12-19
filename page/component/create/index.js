

var util = require("../../../utils/util1.js")

var app = getApp()
var that;
var recordTimeInterval;
Page({
  data: {
    emoij: false, // 是否选择emoij
    artContent: "",
    address: {
      "hidlat": "",
      "hidlng": "",
      "hidspeed": "",
      "hidaddress": "",
    },
    locationMsg: "点击确定位置",
    selectedImgs: [],
    voice: null,
    audioIcon: "http://i.pengxun.cn/content/images/voice/voiceplaying.png",
    recording: 0,
    playing: 0,
    hasRecorded: 0,
    recordTime: 0,
    formatedRecordTime: "00:00:00",
    voiceSelected: 0,
    tmpImage: "",
    video: null,
    post_type: "text"
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    that = this;
    that.init();

    wx.getLocation({
  type: 'wgs84',
  success: function(res) {
    console.log(res)
    var latitude = res.latitude
    var longitude = res.longitude
    var speed = res.speed
    var accuracy = res.accuracy
  }
})

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    that.init();
  },
  onHide: function () {
    // 页面隐藏
    that.init();
  },
  onUnload: function () {
    // 页面关闭
    this.resetData()
  },

  init: function () {
    that.setData({
      voice: null, audioIcon: "http://i.pengxun.cn/content/images/voice/voiceplaying.png", recording: 0, playing: 0,
      hasRecorded: 0, recordTime: 0, formatedRecordTime: "00:00:00", voiceSelected: 0, tempRecordFile: "", locationMsg: "点击确定位置",
    })
  },
  /**
   * 重置数据
   */
  resetData: function () {
    this.setData({
      "emoij": false, "title": "", "artContent": "", "selectedCateogry": null
      , "address": { "hidlat": "", "hidlng": "", "hidspeed": "", "hidaddress": "" }
      , "locationMsg": "点击确定位置", "selectedImgs": null, "voice": null
      , "recording": 0, "playing": 0,"post_type":"text"
    })
  },

  checkstatus: function () {
    if (that.data.post_type == "text") {
      return true;
    };
    wx.showToast({
      title: '只能选择语言或者图片或者视频中的一种提交',
      icon: 'fail',
      duration: 2000
    })
    return false;
  },

  // 提交 TODO
  submit: function (event) {
    var that = this;
    var tmpfile="";
    var post_type=that.data.post_type;
    switch(post_type){
       case "images" :  
       tmpfile=that.data.selectedImgs.toString();
       break;
       case "voice":
        tmpfile=that.data.voice;
       break;
       case "video":
        tmpfile=that.data.video;
       break;
    }
    console.log("=====" +tmpfile)
    var content=event.detail.value.artContent;
    var address=that.data.address
    var formdata= {"poster_id":"qihuiqiang","poster_name":"一条爱笑的雨","text":content, "type":post_type}
    if(address.hidlat&&address.hidlng){
       formdata= {"poster_id":"qihuiqiang","poster_name":"一条爱笑的雨","text":content, "type":post_type,"latitude":address.hidlat,"longitude":address.hidlng,"address":address.hidaddress}
    }
    console.log(formdata)
     wx.uploadFile({
       url: 'http://192.168.1.103:3000/create/post',
     /* url: 'https://ab.welife001.com/create/post',*/
      filePath: tmpfile,
      name: 'file',
      // header: {}, // 设置请求的 header
      formData:formdata , // HTTP 请求中其他额外的 form data
      success: function (res) {
        console.log("发帖成功", res);
        wx.navigateTo({ "url": "/page/component/pics/pics" });
      },
      complete: function () { // 重置数据
        that.resetData();
      }
    })
  },
  // 获取Content值
  saveContent: function (e) {
    this.setData({ "artContent": e.detail.value });
  },

  // 定位
  getLocate: function () {
    console.info("定位")
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res)
        var latitude = res.latitude;
        var longitude = res.longitude;
        var address = res.address;
        that.setData({
          "address": { "hidlat": latitude, "hidlng": longitude, "hidaddress": address },
           "locationMsg": address
        });
        console.log(that.address);
      }
    })
  },
  // 实现表情
  changeEmoij: function () {
    var emoij = that.data.emoij;
    if (emoij != 0) {
      emoij = 0;
    } else {
      emoij = 1
    }
    that.setData({
      emoij: emoij
    })
  },
  // 选择表情
  emoijSelected: function (event) {
    var code = event.currentTarget.dataset.code;
    var content = that.data.artContent + code;
    that.setData({ artContent: content })
  },
  // 获取图片
  selectImg: function (event) {
    if (this.checkstatus()) {
      wx.chooseImage({
        count: 9, // 最多可以选择的图片张数，默认9
        sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
        sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
        success: function (res) {
          that.setData({ "selectedImgs": res.tempFilePaths, "post_type": "images" })
        }
      })
    }
  },
  // 删除图片
  removeImg: function (event) {
    console.log(event)
    var id = event.currentTarget.dataset.id;
    var imgs = that.data.selectedImgs;
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i] == id) {
        imgs.splice(i, 1)
        break;
      }
    }
    that.setData({
      selectedImgs: imgs
    })
    if (imgs.length == 0) {
      that.setData({
        post_type: "text"
      })
    }
    console.info(that.data);
  },
  /**
   * 录音 
   */
  selectVoice: function () {
     if (that.checkstatus()) {
       console.log("语音")
       that.setData({ "voiceSelected": 1 })
     }
  },

  /**
   * 开始录音
   */
  startRecord: function () {
    let that = this;
    if (that.checkstatus()) {
      that.setData({ recording: 1 })
      recordTimeInterval = setInterval(function () {
        var recordTime = that.data.recordTime + 1;
        that.setData({
          recordTime: recordTime,
          formatedRecordTime: util.formatTime(recordTime)
        })
      }, 1000)
      wx.startRecord({
        success: function (res) {
          console.log("录音完成了")
          that.setData({ "voice": res.tempFilePath, "post_type": "voice" })
        },
        complete: function () {
          that.setData({ recording: 0, voiceSelected: 0, formatedRecordTime: "00:00:00" })
          clearInterval(recordTimeInterval);
          console.info("StartRecord: 录音完成");
        }
      })

    }
  },
  /**
   * 结束录音
   */
  stopRecord: function () {
    wx.stopRecord();
  },


  playAudio: function () {
    var that = this;
    wx.playVoice({
      filePath: that.data.voice,
      complete: function () {
      }
    })
  },


  /**
   *  取消录音 
   */
  cancleRecord: function () {
    this.setData({ "voiceSelected": 0, "recording": 0 })
  },

  /**
   * 上传视频
   */
  selectVdeio: function (event) {
    var that = this;

    if (this.checkstatus()) {
      wx.chooseVideo({
        sourceType: ['album', 'camera'], // album 从相册选视频，camera 使用相机拍摄
        maxDuration: 60, // 拍摄视频最长拍摄时间，单位秒。最长支持60秒
        camera: ['front', 'back'],
        success: function (res) {
          that.setData({ video: res.tempFilePath, "post_type": "video" })
          console.log(res)
        }
      })
    }

  },


})