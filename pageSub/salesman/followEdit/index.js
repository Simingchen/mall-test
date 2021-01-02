const app = getApp()
const regeneratorRuntime = app.runtime
import cityList from '../../../static/city.js'
Page({
  data: {
    id: '',
    puid: 0,
    message: '',
  },
  onLoad(options) {
    let detail = {}

    if (options.item && options.item != "{}") {
      detail = JSON.parse(decodeURIComponent(options.item));

      console.log(detail)
      this.setData({
        "id": detail.id,
        puid: detail.puid,
        message: detail.content || '',
      })
    };
    wx.setNavigationBarTitle({
      title: detail.id > 0 ? '编辑跟进' : '新增跟进',
    })
    this.setData({
      isEdit: detail.id > 0,
    })
  },
  // 输入框更改
  onChangeInput({currentTarget, detail}) {
    const string = detail.trim()
    this.setData({
      [currentTarget.dataset.type]: string
    })
  },
  // 保存
  async save() {
    const par = this.data

    if (!par.message.length) {
      return app.toast('请输入跟进信息')
    }

    const data = {
      "uid": app.globalData.userInfo.id,
      content: par.message,
      puid: par.puid,
    }
    if (par.id) {
      data.id = par.id
    }
    const res = await app.fetch({ url: "Api/user/promoterUserGjAE", data })

    app.toast('保存成功')

    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
      })
    }, 500)
  },
  // 删除
  remove() {
    wx.showModal({
      title: "提示",
      content: "删除当前信息？",
      success: async(res) => {
        if (res.confirm) {
          console.log('用户点击确定')

          const data = {
            id: this.data.id
          }
          const res = await app.fetch({ url: "Api/user/promoterUserGjDel", data })
      
          app.toast('删除成功')
      
          setTimeout(() => {
            wx.navigateBack({
              delta: 1,
            })
          }, 500)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
});