const app = getApp();
const regeneratorRuntime = app.runtime;

Page({
  data: {
    loginByPhone: false,
    count: 0,
    wxUserInfo: {}, // 微信授权登陆用户信息
    loginCode: "", // 登陆code
    loginRes: {},
  },
  async onShow() {
    let loginRes = await wx.login({});
    console.log("loginRes=======>", loginRes);

    this.setData(
      {
        loginCode: loginRes.code,
      },
      () => {
        this.login();
      }
    );

    return;
    let that = this;
    wx.getSetting({
      success: async (res) => {
        if (res.authSetting["scope.userInfo"]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          //静默授权
          wx.getUserInfo({
            success: async (res) => {
              // console.log("静默授权========>", res);

              let loginRes = await wx.login({});
              console.log("loginRes=======>", loginRes);
              if (loginRes.errMsg != "login:ok") {
                return app.toast("登录失败，重新登录");
              }

              that.setData(
                {
                  loginCode: loginRes.code,
                },
                () => {
                  that.login();
                }
              );
            },
          });
        } else {
          //未授权
          // that.setData({ loginByPhone: false });
          let loginRes = await wx.login({});
          console.log("loginRes=======>", loginRes);
          if (loginRes.errMsg != "login:ok") {
            return app.toast("登录失败，重新登录");
          }

          that.setData({ loginCode: loginRes.code }, () => {
            // that.login()
            console.log(that.data);
          });
        }
      },
    });
  },
  //获取用户信息
  async onGetUserInfo({ detail }) {
    console.log(detail);
    if (detail.errMsg == "getUserInfo:fail auth deny") {
      app.toast("用户取消授权");
      return false;
    }

    // 交换信息
    const data = {
      encryptedDataStr: detail.encryptedData,
      sessionKey: this.data.loginRes.session_key,
      iv: detail.iv,
    };

    const res = await app.fetch({ method: "post", url: `GetAESDecrypt.ashx`, data });

    const par = {
      nick_name: res.nickName,
      wx_openid: res.openId,
      unionid: res.unionId,
      avatar: res.avatarUrl,
      sex: res.gender,
    };
    const code = wx.getStorageSync("scene");

    if (code) {
      par.recommend_code = code;
    }

    const res1 = await app.fetch({ method: "post", url: `Login.ashx`, data: par });

    wx.setStorageSync("token", res1.Token);
    wx.setStorageSync("userInfo", res);
    app.globalData.userInfo = res;

    //授权成功后，跳转进入小程序首页
    app.toast("登录成功");

    wx.reLaunch({
      url: "/pages/mine/index",
    });

    // setTimeout(() => {
    //   var pages = getCurrentPages();
    //   if (pages.length < 2) {
    //     wx.reLaunch({
    //       url: "/pages/index/index",
    //     });
    //     return false;
    //   }
    //   var prepage = pages[pages.length - 2];
    //   if (prepage.route.indexOf("updateInfo") != -1) {
    //     wx.reLaunch({ url: "/pages/mine/index" });
    //   } else {
    //     wx.navigateBack();
    //   }
    // }, 1000);
  },
  async login() {
    const data = {
      code: this.data.loginCode,
    };
    const res = await app.fetch({ method: "post", url: `GetMiniAppUserUnionID.ashx`, data });

    this.setData({
      loginRes: res,
    });
  },
});
