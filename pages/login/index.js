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
      nickname: detail.userInfo.nickName, 
      headimg: detail.userInfo.avatarUrl, 
      openid: this.data.loginRes.openid,
      promoter_user_id: wx.getStorageSync('ICode') || ""
      // unionid
    };

    const res = await app.fetch({ url: `Api/Api/addUser`, data });
    
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
    
    const res = await app.fetch({
      url: "Api/Api/getOpenId",
      data
    })
    this.setData({
      loginRes: res,
    });
  },
});
