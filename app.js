import fetch from "./utils/request";
import runtime from "./utils/runtime";
import "./weapp-cookie/index";
//app.js
App({
  async onLaunch () {
    // this.getConfig()

    // 登录
    // wx.login({
    //   success: res => {
    //     this.login(res.code)
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
    // 获取用户信息
    wx.getSetting({
      success: (res) => {
        if (res.authSetting["scope.userInfo"]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: (res) => {
              // 可以将 res 发送给后台解码出 unionId
              // this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res);
              }
            },
          });
        }
      },
    });
    const userInfo = wx.getStorageSync('userInfo')

    if (userInfo.id) {
      const res = await this.fetch({ url: `GetMyCart.ashx`})
      this.globalData.cartNum = res.GoodsList.length
      console.log(this.globalData.cartNum)
    }
    
  },
  
  globalData: {
    userInfo: {},
    config: {},
    cartNum: 0,
    goodsSortIndex: 0,   // 产品分类索引
  },
  // async await
  runtime,
  // 全局请求
  fetch(data) {
    return fetch(data, this.globalData);
  },
  toast(title, icon = "none") {
    wx.showToast(
      {
        title,
        icon,
      },
      () => {
        wx.hideToast();
      }
    );
  },
  // 监听全局数据变更
  watch(isstr, method) {
    var obj = this.globalData;
    Object.defineProperty(obj, isstr, {
      configurable: true,
      enumerable: true,
      set: function (value) {
        this._consumerGoodsStatus = value; //_consumerGoodsStatus是Object.defineProperty自定义的属性
        method && method(value);
      },
      get: function (value) {
        return this._consumerGoodsStatus;
      },
    });
  },
  // 获取配置信息
  async getConfig(code) {
    const config = await this.fetch({
      url: `api/C/Anonymous/System/GetConfig`,
    });
    this.globalData.config = config;
  },
  // 上报记录
  setRecord(type, id) {
    const data = {
      id,
      type,
    };
    this.fetch({
      url: "api/C/Anonymous/Record/Record",
      data,
    });
  },
  // 分享
  setShare(type, id) {
    const data = {
      id,
      type,
    };
    this.fetch({
      url: "api/C/Common/Share/Share",
      data,
    });
  },
  throttle(fn, interval) {
    //节流
    var enterTime = 0; //触发的时间
    var gapTime = interval || 500; //间隔时间，如果interval不传，则默认300ms
    return function () {
      var context = this;
      var backTime = new Date(); //第一次函数return即触发的时间
      if (backTime - enterTime > gapTime) {
        fn.call(context, arguments[0]);
        enterTime = backTime; //赋值给第一次触发的时间，这样就保存了第二次触发的时间
      }
    };
  },
  // 拆分 URL
  getQueryString(par, name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = par.match(reg);
    if (r != null) {
      return unescape(r[2]);
    }
    return null;
  },
});
