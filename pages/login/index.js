const app = getApp();
const regeneratorRuntime = app.runtime;

Page({
  data: {
    loginByPhone: false,
    count: 0,
    wxUserInfo: {}, // 微信授权登陆用户信息
    loginCode: "", // 登陆code
    loginRes: {},
    phoneNumber: "",
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
  async getPhoneNumber({ detail }) {
    console.log(detail);
    if (detail.errMsg == "getUserInfo:fail auth deny") {
      app.toast("用户取消授权");
      return false;
    }

    const par = {
      sessionKey: this.data.loginRes.session_key,
      encryptedData: detail.encryptedData,
      iv: detail.iv
    }
    const res1 = await app.fetch({ url: `Api/api/decryptData`, data: par });

    this.setData({
      phoneNumber: JSON.parse(res1).phoneNumber
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.addUser(res.userInfo)
      }
    })
  },
  //获取用户信息
  async onGetUserInfo({ detail }) {
    console.log(detail);
    if (detail.errMsg == "getUserInfo:fail auth deny") {
      app.toast("用户取消授权");
      return false;
    }
    this.addUser(detail.userInfo)
  },
  async addUser(userInfo) {
    // 交换信息
    const data = {
      nickname: userInfo.nickName, 
      headimg: userInfo.avatarUrl, 
      openid: this.data.loginRes.openid,
      promoter_user_id: wx.getStorageSync('ICode') || "",
      phone: this.data.phoneNumber
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
    // console.log(res)
    this.setData({
      loginRes: res,
    });
  },
});
