const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    detail: {},
    isShowPop: false,
    reasonList: [],
    reasonRadio: '',
    reasonName: '请选择',
    isShowPop2: false,
    wayList: [],
    wayRadio: '',
    wayName: '请选择',
    fileList: []
  },
  onLoad (option) {
    if(option.item) {
      let detail = JSON.parse(decodeURIComponent(option.item));

      this.setData({
        detail
      }, () => {
        console.log(this.data.detail)
        this.getReasonList()
        this.getWayList()
      })
    };
  },

  async getData (id) {
    wx.showLoading({
      title: '加载中',
    })
    let res = await app.fetch({url: "GetUserOrderDetails.ashx", data: {id} })

    wx.hideLoading()

    this.setData({
      detail: res.order_details,
    }, () => {
      console.log(this.data.detail)
    })
  },
  // 获取退款原因
  async getReasonList() {
    var list = { "list": [{ "key": 1, "value": "不想要或拍多" }, { "key": 2, "value": "商品信息拍错（规格/尺码/颜色等）" }, { "key": 3, "value": "地址/电话信息填写错误" }, { "key": 4, "value": "退货纠纷" }, { "key": 5, "value": "其他" }] }
          
    this.setData({
      reasonList: list.list
    })
  },
  // 获取退款方式
  async getWayList() {
    var list = { "list": [{ "key": 1, "value": "退款" }, { "key": 2, "value": "退货退款" }] }
    this.setData({
      wayList: list.list
    })
  },
  onClose() {
    this.setData({
      isShowPop: false,
      isShowPop2: false,
    })
  },
  // 退款原因更改
  onReasonChange(event) {
    this.setData({
      reasonRadio: event.detail
    }, () => {
      console.log(this.data.reasonRadio)
    });
  },
  // 退款选择
  reasonClick(event) {
    const { name } = event.currentTarget.dataset;
    const { reasonList } = this.data
    const index = reasonList.findIndex(item => item.key == name)
    console.log(index)
    const reasonName = reasonList[index].value
    this.setData({
      reasonRadio: name,
      reasonName
    });
  },
  // 打开退款原因弹窗
  openPop() {
    this.setData({
      isShowPop: true
    })
  },
  // 退款原因更改
  onWayChange(event) {
    this.setData({
      wayRadio: event.detail
    }, () => {
      console.log(this.data.wayRadio)
    });
  },
  // 退款方式选择
  wayClick(event) {
    const { name } = event.currentTarget.dataset;

    const { wayList } = this.data
    const index = wayList.findIndex(item => item.key == name)

    const wayName = wayList[index].value

    this.setData({
      wayRadio: name,
      wayName
    });
  },
  // 打开退款方式弹窗
  openPop2() {
    this.setData({
      isShowPop2: true
    })
  },
  // 上传
  async upload(event) {
    const { file } = event.detail;

    const tempList = file.map(item => {
      return {
        url: item.path
      }
    })
    // 上传完成需要更新 fileList
    const { fileList } = this.data;
    let newList = [...fileList, ...tempList];

    console.log(fileList)
    this.setData({ 
      fileList: newList 
    });
  },
  uploadFile (filePath, Authorization) {
    return new Promise((resolve, rej) => {
      wx.uploadFile({
        filePath,
        name: 'upfile',
        url: `https://service.aomit.cn/actions/UpLoadFile.ashx?fileName=${filePath}`,
        header: {
          "content-type": "multipart/form-data",
          Authorization
        },
        success(res) {
          let data = res.data
          if (Object.prototype.toString.call(data) == "[object String]") {
            data = JSON.parse(data)
          }

          resolve(data[0].Data[0].path)
        },
      });
    })
    
  },
  // 同步 async 列表
  async asyncAlls(jobs) {
    try {
      // 循环执行
      let results = jobs.map(async job => await job)
      let res = []
      // 组合数组
      for (const result of results) {
        res.push(await result)
      }
      return res
    } catch (error) {
      throw new Error(error)
    }
  },
  // 删除图片
  removePic ({detail}) {
    console.log(detail.index)
    const { fileList } = this.data;
    fileList.splice(detail.index, 1)
    this.setData({ 
      fileList
    });
  },
  async confirm() {
    const { detail, reasonRadio, wayRadio, message, wayList, reasonList} = this.data
    if (!reasonRadio) {
      return app.toast('请选择退款原因')
    }
    if (!wayRadio) {
      return app.toast('请选择退款方式')
    }

    if(!message.length) {
      return app.toast('请补充描述')
    }

    // 上传视图提交
    // let token = wx.getStorageSync('token')
    // let promiseList = fileList.map(item => this.uploadFile(item.url, token))
    
    // let keyListData = await this.asyncAlls(promiseList)
    const reason = reasonList.filter(item => item.key == reasonRadio)
    const way = wayList.filter(item => item.key == wayRadio)
    const data = {
      "order_id": detail.id,
      "description": message,
      // "images": `,${keyListData.join(',')},`,
      "reason": reason[0].value,
      "postsale_type": wayRadio
    }

    
// 参数：、（1:退款；2:退货退款）、reason、

    console.log(data)
    await app.fetch({url: "Api/Order/postsale", data})
    
    app.toast('提交成功')

    setTimeout(() => {
      wx.redirectTo({
        url: '/pageSub/afterSales/orderList/index',
      })
    }, 1000)
  },
});