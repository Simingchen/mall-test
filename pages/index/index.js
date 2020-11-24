const app = getApp();
const regeneratorRuntime = app.runtime;

Page({
  data: {
    bannerList: [],
    navList: [],
    msgList: [],
    goodsList: [],
    eventList: [],
    exchangeList: [],
    cartNum: 0,
    customParams: {}
  },
  onLoad(option) {
    console.log(option);
    // 存储邀请码
    if (option.scene) {
      wx.setStorageSync("scene", option.scene);

      this.parseCode(option.scene)
    }
  },
  async onShow() {
    this.getBanner();
    this.getMsgList();
    this.getNavList();
    this.getEventList();
    this.getGoodsList();
    // this.getExchangeList();
    this.getLiveList()
    this.setData({
      cartNum: app.globalData.cartNum,
    });
  },
  // 获取直播列表
  async getLiveList () {
    const data = {
      "page_size": "10",
      "page_index": "0"
    }

    // 直播间状态。101：直播中，102：未开始，103已结束，104禁播，105：暂停，106：异常，107：已过期
    const res = await app.fetch({ url: "GetLiveRoomList.ashx",data });
   
    res.list.room_info = res.list.room_info.filter(item => {
      return item.live_status == 101 || item.live_status == 102 || item.live_status == 103
    })
    const liveList = res.list.room_info
    console.log(liveList)
    this.setData({ liveList });
  },
  // 跳转直播
  goLiveDetail: app.throttle(function ({ currentTarget }) {
      //节流
    let item = currentTarget.dataset.item;
    // let roomId = [直播房间id] // 填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
    let customParams = encodeURIComponent(JSON.stringify({ path: 'pages/index/index', pid: 1 })) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
    wx.navigateTo({
        url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${item.roomid}&custom_params=${customParams}`
    })
  }),
  async getBanner() {
    const bannerList = await app.fetch({
      url: "GetPictureList.ashx",
      data: {
        category_id: 2,
      },
    });
    this.setData({ bannerList });
  },
  // 解析二维码
  async parseCode(scene) {
    const data = {
      "share_type": 0,
	    scene
    }
    const res = await app.fetch({ url: "GetDecryptScene.ashx", data });
    wx.setStorageSync("scene", res.invitation_code);
  },
  async getMsgList() {
    const msgList = await app.fetch({ url: "GetNewsList.ashx", data: { category_id: 12 } });
    this.setData({ msgList });
  },

  goBannerUrl: app.throttle(function ({ currentTarget }) {
    //节流
    let item = currentTarget.dataset.item;
    // 1.分类列表
    // 2.普通商品列表
    // 3.普通商品详情
    // 4.拼团商品列表
    // 5.拼团商品详情
    // 6.兑换商品列表
    // 7.兑换商品详情
    // 8.直播广场
    // 9.直播间
    if (item.relation_type == 1) {
      app.globalData.goodsSortId = item.link_url
      return wx.switchTab({ url: "/pages/goodsSort/index" });
    }
    if (item.relation_type == 2) {
      return wx.navigateTo({ url: "/pageSub/index/searchList/index" });
    }
    if (item.relation_type == 3 || item.relation_type == 5 || item.relation_type == 7) {
      var channel_id = 12;
      if (item.relation_type == 5) {
        channel_id = 11;
      }
      if (item.relation_type == 7) {
        channel_id = 12;
      }
      const temp = {
        id: item.link_url,
        channel_id,
      };
      const par = encodeURIComponent(JSON.stringify(temp));
      wx.navigateTo({
        url: `/pageSub/index/goodsDetail/index?item=${par}`,
      });
    }
    if (item.relation_type == 4) {
      return wx.navigateTo({ url: "/pageSub/index/seckillList/index" });
    }

    if (item.relation_type == 6) {
      return wx.navigateTo({ url: "/pageSub/mine/goodsList/index" });
    }
    // 跳转直播列表
    if (item.relation_type == 8 || item.relation_type == 9) {
      return app.toast("功能持续开放中");
    }

    // app.goDetail(item.LinkType, item.LinkUrl,item.BannerId)
  }),
  async getNavList() {
    const { navList } = this.data

    if (!navList.length) {
      wx.showLoading({
        title: '加载中',
      })
    }
    let res = await app.fetch({ url: "GetSoftwareNavigation.ashx" });
    function setArr(data, num) {
      let index = 0
      let array = []
      while(index < data.length) {
              array.push(data.slice(index, index += num));
          }
        return array ;
    }
    const newList = setArr(res, 8)
    this.setData({
      navList: newList
    }, () => {
      wx.hideLoading()
    });
  },
  async getEventList() {
    const data = {
      page_size: "10",
      page_index: "0",
      category_id: "0",
    };
    const res = await app.fetch({ url: "GetGroupGoodsList.ashx", data });

    try {
      res.list.forEach((item) => {
        var startDay = new Date(item.start_time).getTime();

        var endDay = new Date(item.end_time).getTime();

        var nowDay = new Date().getTime();
        
        var leftDay = ((endDay - nowDay) / (endDay - startDay)) * 100;
        item.percentDay = parseInt(leftDay);
      });
    } catch (error) {}

    this.setData({
      eventList: res.list,
    });
  },
  async getGoodsList() {
    const data = {
      page_size: "20",
      page_index: "0",
      is_red: "1",
    };
    const res = await app.fetch({ url: "GetGoodsList.ashx", data });

    this.setData({
      goodsList: res.list,
    });
  },
  // 头条跳转
  goInfoDetail: app.throttle(function ({ currentTarget }) {
    //节流
    const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item));
    wx.navigateTo({
      url: `/pageSub/index/infoDetail/index?item=${item}`,
    });
  }),
  // 专卖店列表
  goLocalUrl: app.throttle(function ({ currentTarget }) {
    //节流
    let url = currentTarget.dataset.url;
    wx.navigateTo({ url });
  }),
  goDetail: app.throttle(function ({ currentTarget }) {
    //节流
    const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item));
    wx.navigateTo({
      url: `/pageSub/index/goodsDetail/index?item=${item}`,
    });
  }),
  async getExchangeList() {
    let data = {
      page_index: 10,
      page_size: 1,
      category_id: "0",
    };

    const res = await app.fetch({ method: "post", url: "GetExchangeGoodsList.ashx", data });
    this.setData({
      exchangeList: res.list,
    });
  },
  //转发
  onShareAppMessage: function (res) {
    console.log("button分享页面的内容")
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res.target)
    }
    const userInfo = app.globalData.userInfo || {}
    return {
      title: `${userInfo.user_name}邀请你加入商城`,
      path: `/pages/index/index?scene=${userInfo.invitation_code}`,
      // imageUrl: `${globalData.config.ShareImg}`,
      success: function (res) {  // 不再支持分享回调参数 success 、fail 、complete
        console.log('成功', res)
      }
    }
  },
  // 附近专卖店列表
  goLocationUrl() {
    wx.navigateTo({
      url: '/pageSub/index/locationList/index',
    })
  }
});
