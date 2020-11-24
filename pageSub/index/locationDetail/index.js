const app = getApp()
const regeneratorRuntime = app.runtime
Page({
  data: {
    markers: [{
      // iconPath: "/resources/others.png",
      id: 0,
      latitude: 23.099994,
      longitude: 113.324520,
      width: 20,
      height: 30
    }],
    //当前定位位置
    latitude: '',
    longitude: '',
    detail: {}
  },
  onLoad(option) {
    this.getLocation()
    try {
      let detail = {}
      if(!option.item) {
        // detail = JSON.parse(decodeURIComponent(option.item));
        
        // 标记要去的点
        const { markers } = this.data 
        console.log(markers)
        // markers[0].latitude = 113
        // markers[0].longitude = 23
        
        this.setData({
          markers,
          detail
        })
      };
    } catch (e) {
      console.error(e)
    }
    
  },
  // 获取当前
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
          console.log(this.data)
          // this.navigate()
        })
        
      },
      fail: function (res) {
        console.log('fail' + JSON.stringify(res))
      }
    })
  },
  // 导航
  navigate() {
    const { markers, detail } = this.data
    // console.log(markers)
    // 使用微信内置地图查看标记点位置，并进行导航
    wx.openLocation({
      latitude: markers[0].latitude,//要去的纬度-地址
      longitude: markers[0].longitude,//要去的经度-地址
      name: detail.title
    })
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.detail.markerId)
  },
  controltap(e) {
    console.log(e.detail.controlId)
  },
});