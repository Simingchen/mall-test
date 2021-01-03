const app = getApp()
const regeneratorRuntime = app.runtime
import cityList from '../../../static/city.js'

Page({
  data: {
    userInfo: {
      turename: '',
      sex: '',
      brithday: '',
      city: '',
      phone: '',
      wxid: ''
    },
    isShowSexPop: false,
    columnsSex: [
      {id: 1, text: '男'},
      {id: 2, text: '女' },
    ],
    isShowBrithDayPop: false,
    minDate: new Date(1920, 10, 1).getTime(),
    maxDate: new Date().getTime(),
    currentDate: new Date().getTime(),
    isShowAreaPop: false,
    areaList: cityList,
    city: '',
    cityCode: '',
    areaValues: [],
  },
  async onLoad() {
    const userInfo = app.globalData.userInfo
    // console.log(userInfo)

    const par = {}
    if (userInfo.brithday) {
      par.currentDate = userInfo.brithday * 1000
      userInfo.brithday = this.filterTime(userInfo.brithday * 1000)
      // console.log(this.filterTime(userInfo.brithday * 1000))
    }
    console.log(par.currentDate)
    if (userInfo.city > 0) {
      par.cityCode = userInfo.city,
      userInfo.city = this.filterCity(userInfo.city)
    }

    this.setData({
      userInfo,
      cityCode: par.cityCode? par.cityCode : "",
      currentDate: par.currentDate ? par.currentDate : new Date().getTime()
    })
  },
  filterCity (code) {
    if (!code) {
      return ''
    }
    const province = cityList.province_list[code.slice(0,2) + '0000']
    const city = cityList.city_list[code.slice(0,4) + '00']
    const county = cityList.county_list[code]
    return `${province}/${city}/${county}`
  },
  onClose() {
    this.setData({
      isShowSexPop: false,
      isShowAreaPop: false,
      isShowBrithDayPop: false
    })
  },
  openPop({currentTarget}) {
    const type = currentTarget.dataset.type
    this.setData({
      [type]: true
    })
  },
  onConfirmSex({detail}) {
    const temp = detail.value.text == "男" ? 1 : 2

    console.log(detail.value.text == "男")
    this.setData({
      ['userInfo.sex']: temp
    })
    this.onClose()
  },
  onConfirmBrithDay({detail}) {
    this.setData({
      ['userInfo.brithday']: this.filterTime(detail)
    })
    this.onClose()
  },
  filterTime: function (date) {
    date = new Date(date)
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
  },
  confirmArea({detail}) {
    console.log(detail.values)
    const address = detail.values
    this.setData({
      areaValues: address,
      ['userInfo.city']: `${address[0].name}/${address[1].name}/${address[2].name}`
    })
    this.onClose()
  },
  logout() {
    wx.showModal({
      // title: '提示',
      content: '确认退出登录吗',
      success(res) {
        if (res.confirm) {
          wx.setStorageSync('token', '')

          app.globalData.userInfo = {}

          wx.reLaunch({
            url: '/pages/index/index',
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    });
  },
     // 输入框更改
 onChangeInput({currentTarget, detail}) {
  this.setData({
    [currentTarget.dataset.type]: detail.trim()
  })
 },
  // 保存
  save: app.throttle(async function({currentTarget}){  //节流
    const { userInfo } = this.data
    if (!userInfo.truename.length) {
      return app.toast('请输入姓名')
    }
    if (!userInfo.phone.length) {
      return app.toast('请输入手机号')
    }
    if (!/^1[3456789]\d{9}$/.test(userInfo.phone)) {
      return app.toast('手机号格式错误')
    }
    const data = {
      "uid": app.globalData.userInfo.id || '',
      turename: userInfo.truename,
      sex: userInfo.sex,
      city: this.data.areaValues.length ? this.data.areaValues[2].code : this.data.cityCode,
      brithday: userInfo.brithday,
      wxid: userInfo.wxid,
      phone: userInfo.phone,
    }

    let res = await app.fetch({url: "Api/User/editUserInfo", data })

    app.toast('修改完成')
    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
      })
    }, 1000)
  }),
  // 选择头像
  chooseImg () {
    const { userInfo } = this.data
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        console.log(res)
        wx.showLoading({
          title: '上传中',
        })
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        var avatarSrc = res.tempFilePaths
        console.log(avatarSrc[0].slice(-3))
        console.log(tempFilePaths)
        let token = wx.getStorageSync('token')
        wx.uploadFile({
          filePath: tempFilePaths[0],
          name: 'upfile',
          url: `https://service.aomit.cn/actions/UpLoadFile.ashx?delfile=${userInfo.avatar}&fileName=${avatarSrc[0]}`,
          header: {
            "content-type": "multipart/form-data",
            'Authorization': token
          },
          success (res){
            let data = res.data
            if (Object.prototype.toString.call(data) == "[object String]") {
              data = JSON.parse(data)
            }
            that.saveAvatar(data[0].Data[0].path)
          }
        })
      }
    })
  },
})