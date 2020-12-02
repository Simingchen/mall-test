const app = getApp()
const regeneratorRuntime = app.runtime
import cityList from '../../../static/city.js'
Page({
  data: {
    userName: '',
    phone: '',
    area: '',
    address: '',
    areaValues: [],
    isShowArea: false,
    areaList: cityList,
    checked: false, // 默认地址
    isEdit: false
  },
  onLoad(options) {
    let detail = {}

    console.log(options)
    if (options.item) {
      detail = JSON.parse(decodeURIComponent(options.item));
      // detail.area = detail.area.replace(/,/g, '/')
      this.setData({
        "id": detail.id,
        userName: detail.accept_name,
        "area": detail.area,
        "address": detail.address,
        phone: detail.mobile,
        checked: Boolean(detail.is_default)
      })
    };
    wx.setNavigationBarTitle({
      title: detail.id > 0 ? '编辑地址' : '新增地址',
    })
    this.setData({
      isEdit: detail.id > 0,
    })
  },
  // 获取数据
  getData: app.throttle(async function ({
    id
  }) { //节流
    const res = await app.fetch({
      url: "/Api/Address/address_edit",
      data: {
        Id: id
      }
    })
    this.setData({
      userName: '',
      phone: '',
      area: '',
      address: '',
    })
  }),
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
      const area = par.area.split('/')
      par.areaValues = [
        {name: area[0]},
        {name: area[1]},
        {name: area[2]},
      ]
    }

    if (!par.areaValues[0].name) {
      return app.toast('请选择地区')
    }
    const data = {
      "id": par.id,
      "name": par.userName,
      "provinceid": par.areaValues[0].id,
      "cityid": par.areaValues[1].id,
      "districtid": par.areaValues[2].id,
      "remark": par.address,
      "mobile": par.phone,
      is_default: Number(par.checked),
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
            check_ids: this.data.id
          }
          const res = await app.fetch({
            method: 'post',
            url: "DeleteUserAddress.ashx",
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