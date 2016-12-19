var common = require('../../../utils/util.js');
let app = getApp();
let seek = 0;
Page({
    data: {
        music: {},
        playtime: "00:00",
        duration: "00:00",
        percent: 1,
        imgload: false,
        playing: true,
        showlrc: false,
        commentscount: 0,
        lrc: {}
    },
    onLoad: function () {
        var music = app.globalData.list_fm[app.globalData.index_fm];
        app.globalData.playtype = 2;
        var that = this;
        if (music) {
            this.setData({
                music: music,
                duration: common.formatduration(music.duration),
            });
            common.loadrec(0, 0, that.data.music.commentThreadId, function (res) {
                that.setData({
                    commentscount: data.total
                })
            })
        } else {
            app.nextfm();
        }
    },
    loadlrc: function () {
        common.loadlrc(this);
    },
    onShow: function () {
        var that = this;
        if (app.globalData.playtype == 1) {
            app.nextfm();
        }
        seek = setInterval(function () {
            common.playAlrc(that, app)
        }, 500);
      //  wx.setNavigationBarTitle({ title: app.globalData.curplay.name + "-" + app.globalData.curplay.artists[0].name || "" });
    },
    onHide: function () {
        clearInterval(seek)
    },
    like: function () {

    },
    trash: function () {

    },
    loadimg: function (e) {
        this.setData({
            imgload: true
        })
    },
    play: function (m) {
        var that = this
        if (this.data.playing) {
            that.setData({ playing: false });
            app.stopmusic(1);
        } else {
            app.seekmusic(2, function () {
                that.setData({
                    playing: true
                });
            }, app.globalData.currentPosition);
        }
    },
    nextplay: function () {
        this.setData({
            imgload: true,
            lrc: [],
            playtime: common.formatduration(0),
            percent: .1,
            music: {},
            commentscount: 0,
            playing: false,
            showlrc: false
        })
        app.nextfm();
    }
})