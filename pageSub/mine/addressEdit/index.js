const app = getApp()
const regeneratorRuntime = app.runtime
import cityList from '../../../static/city.js'
Page({
  data: {
    userName: '',
    phone: '',
    area: '',
    address: '',
    code: '',
    areaValues: [],
    isShowArea: false,
    areaList: cityList,
    checked: false, // 默认地址
    isEdit: false
  },
  onLoad(options) {
    let detail = {}

    console.log(options)
    if (options.item != "{}") {
      detail = JSON.parse(decodeURIComponent(options.item));
      this.setData({
        "id": detail.id,
        userName: detail.name,
        code: detail.code,
        "area": `${detail.province}/${detail.city}/${detail.district}`,
        "address": detail.remark,
        phone: detail.mobile,
        checked: detail.is_default > 0
      })
    };
    wx.setNavigationBarTitle({
      title: detail.id > 0 ? '编辑地址' : '新增地址',
    })
    this.setData({
      isEdit: detail.id > 0,
    })
  },
  togglePop() {
    this.setData({
      isShowArea: !this.data.isShowArea
    })
  },
  onChange({
    currentTarget
  }) {
    const checked = currentTarget.dataset.checked
    this.setData({
      checked: !checked
    })
  },
  confirmArea({
    detail
  }) {
    this.togglePop()
    console.log(detail.values)
    const address = detail.values
    this.setData({
      areaValues: address,
      area: `${address[0].name}/${address[1].name}/${address[2].name}`
    })
  },
  // 保存地址
  async save() {
    const par = this.data

    console.log(par)
    
    if (!par.userName.length) {
      return app.toast('收货人姓名不能为空')
    }
    if (!par.phone.length) {
      return app.toast('手机号不能为空')
    }
    var myreg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    if (!myreg.test(par.phone)) {
      return app.toast('手机号格式不正确')
    }

    if (!par.address.length) {
      return app.toast('详细地址不能为空')
    }

    if (!par.areaValues.length) {
      par.areaValues = [
        {name: par.area[0]},
        {name: par.area[1]},
        {name: par.area[2]},
      ]
    }

    if (!par.areaValues[0].name) {
      return app.toast('请选择地区')
    }
    const data = {
      "uid": app.globalData.userInfo.id,
      "name": par.userName,
      "code": par.areaValues[2].code || this.data.code,
      "remark": par.address,
      "mobile": par.phone,
      is_default: par.checked,
    }
    if (par.id) {
      data.id = par.id
    }
    const res = await app.fetch({
      url: "Api/Address/address_edit",
      data
    })

    app.toast('保存成功')

    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
      })
    }, 500)
  },
  // 删除地址
  remove() {
    wx.showModal({
      title: "提示",
      content: "删除当前地址？",
      success: async(res) => {
        if (res.confirm) {
          console.log('用户点击确定')

          const data = {
            id: this.data.id
          }
          const res = await app.fetch({
            url: "Api/Address/address_del",
            data
          })
      
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