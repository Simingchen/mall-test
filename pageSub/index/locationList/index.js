const app = getApp()
const regeneratorRuntime = app.runtime
Page({
  data: {
    storeList: []
  },
  async onShow () {
    this.getUserLocation()
  },
  async getList() {
    const data = {
      "lng": this.data.longitude,
      "lat": this.data.latitude
    }
    const storeList = await app.fetch({ url: "GetStoreList.ashx", data })
    this.setData({ storeList })
  },
  // 去详情导航
  goDetail ({currentTarget}) {
    // const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item))
    // wx.navigateTo({
    //   url: `/pageSub/index/locationDetail/index?item=${item}`,
    // })

    const item = currentTarget.dataset.item
    wx.openLocation({
      latitude: item.lat,//要去的纬度-地址
      longitude: item.lng,//要去的经度-地址
      name: item.title
    })
  },
    // 判断用户是否拒绝地理位置信息授权，拒绝的话重新请求授权
    getUserLocation: function () {
      let that = this;
      wx.getSetting({
        success: (res) => {
          console.log(JSON.stringify(res))
          // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
          // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
          // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
          if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
            wx.showModal({
              title: '请求授权当前位置',
              content: '需要获取您的地理位置，请确认授权',
              success: function (res) {
                if (res.cancel) {
                  app.toast('拒绝授权')
                } else if (res.confirm) {
                  wx.openSetting({
                    success: function (dataAu) {
                      if (dataAu.authSetting["scope.userLocation"] == true) {
                        //再次授权，调用wx.getLocation的API
                        that.getLocation();
                      } else {
                        app.toast('授权失败')
                      }
                    }
                  })
                }
              }
            })
          } else if (res.authSetting['scope.userLocation'] == undefined) {
            //调用wx.getLocation的API
            that.getLocation();
          }
          else {
            //调用wx.getLocation的API
            that.getLocation();
          }
        }
      })
    },
    // 获取定位当前位置的经纬度
    getLocation () {
      let that = this;
      wx.getLocation({
        type: 'wgs84',
        success:  (res) => {
          let latitude = res.latitude
          let longitude = res.longitude
          app.globalData.lat = res.latitude;//
          app.globalData.lng = res.longitude;//把onload定位时候的经纬度存到全局
          this.setData({
            latitude, 
            longitude
          }, () => {
            this.getList()
          })
          
        },
        fail: function (res) {
          console.log('fail' + JSON.stringify(res))
        }
      })
    },
    // 获取当前地理位置
    getLocal: function (latitude, longitude) {
      let that = this;
      qqmapsdk.reverseGeocoder({
        location: {
          latitude: latitude,
          longitude: longitude
        },
        success: function (res) {
          let province = res.result.ad_info.province
          let city = res.result.ad_info.city
          let district = res.result.ad_info.district;
          // 保存一下当前定位的位置留着后面重新定位的时候搜索附近地址用
          app.globalData.currentLocation = district;
          that.setData({
            province: province,
            city: city,
            latitude: latitude,
            longitude: longitude,
            district: district
          })
  
        },
        fail: function (res) {
          console.log(res);
        },
        complete: function (res) {
          // console.log(res);
        }
      });
    },
});