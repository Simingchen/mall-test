const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    userInfo: {
      sex: ''
    },
    isShowSexPop: false,
    columnsSex: [
      {id: 0, text: '男'},
      {id: 1, text: '女' },
    ],
    isShowBrithDayPop: false,
    minDate: new Date().getTime(),
    maxDate: new Date(2019, 10, 1).getTime(),
    currentDate: new Date().getTime(),
  },
  async onLoad() {
    // console.log(app.globalData.userInfo)
    const userInfo = wx.getStorageSync('userInfo')
    // console.log(userInfo)
    this.setData({
      userInfo
    })
  },
  onClose() {
    this.setData({
      isShowSexPop: false
    })
  },
  openPop({currentTarget}) {
    const type = currentTarget.dataset.type
    this.setData({
      [type]: true
    })
  },
  onConfirmSex({detail}) {
    this.setData({
      ['userInfo.sex']: detail.value.text
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
  onChange(event) {
    // event.detail 为当前输入的值
    console.log(event.detail);
    this.setData({
      ['userInfo.nick_name']: event.detail.trim()
    })
  },
  // 保存
  save: app.throttle(async function({currentTarget}){  //节流
    const { userInfo } = this.data
    if (!userInfo.nick_name.length) {
      return app.toast('请输入会员名称')
    }

    let res = await app.fetch({url: "SaveUserInfo.ashx", data: {nick_name: this.data.userInfo.nick_name} })

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
  async saveAvatar (fileName) {
    const data = {
      fileName,
      "x": "0",
      "y": "0",
      "w": "0",
      "h": "0"
    }
    let res = await app.fetch({url: "CropUserAvatar.ashx", data})
    wx.hideLoading()

    this.setData({
      ['userInfo.avatar'] : res.path
    })
    app.toast('修改成功')
  }
})