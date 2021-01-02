const app = getApp()
const regeneratorRuntime = app.runtime
let wxparse = require("../../../wxParse/wxParse.js");

Page({
  data: {
    detail: {},
  },
  onLoad (option) {

    if(option.item) {
      const detail = JSON.parse(decodeURIComponent(option.item));
      console.log(detail)
      this.setData({
        detail
      })

      this.getData(detail.id)
    };
    this.getData()
  },

  async getData (id) {
    let detail = {}
    detail.content = `
    <section class="_135editor" data-role="paragraph">
    <p>
        <span style="font-family: 宋体; font-size: 21px; caret-color: red;">丽合三生品牌故事</span>
    </p>
    <p>
        <span style="font-family: 宋体; font-size: 21px; caret-color: red;"><br/></span>
    </p>
</section>
<section class="_135editor" data-role="paragraph">
    <p style="text-indent:32px;line-height:27px;background:#ffffff">
        <span style=";font-family:宋体;font-size:14px"><span style="font-family:宋体">丽合三生生物科技有限公司传承国粹草本养生，以国潮为设计精髓，打造适合东方女性体质的功能产品，旗下品牌宫延之禧，利用宫廷保颜秘方，打造首款以东方素颜为目的，以草本精华及中草药提取物为主要核心成分，运用现代提取工艺，粹取核心成份，精心打造以排毒、紧致、清肤、养颜，适合东方女性的美容养颜品！</span></span>
    </p>
    <p>
        <br/>
    </p>
</section>
`
    if (detail.content) {
      wxparse.wxParse('content', 'html', detail.content, this, 5)
    }
  },
});