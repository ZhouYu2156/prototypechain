import { CardConfig, deepMerge, defaultCardConfig } from './config'

// 深度递归将属性变为可选属性
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/** 卡片对象 */
export class Card {
  x: number
  y: number
  width: number
  height: number
  radius: number
  hue: string
  title: string
  header: DeepPartial<CardConfig['header']>
  splitLine: DeepPartial<CardConfig['splitLine']>
  property: DeepPartial<CardConfig['property']>
  properties: DeepPartial<CardConfig['properties']>
  propertyPositions: { x: number; y: number; width: number; height: number; text: string }[] = []
  titlePosition: { x: number, y: number, width: number, height: number, text: string } | null = null
  ctx: CanvasRenderingContext2D
  ref: Function | Object | null


  constructor(ref: Function | Object | null, ctx: CanvasRenderingContext2D, partialConfig: DeepPartial<CardConfig>) {
    const config = deepMerge(defaultCardConfig, partialConfig)
    this.ref = ref
    this.ctx = ctx
    this.x = config.card?.x
    this.y = config.card?.y
    this.width = config.card?.width
    this.radius = config.card?.radius
    this.hue = config.card?.hue
    this.title = config.title
    this.header = config.header
    this.splitLine = config.splitLine
    this.property = config.property
    this.properties = config.properties

    // 如果没有属性文本， 则不计算属性文本的高度
    const cardHeight =
      this.header.fontSize! +
      this.header.padding! * 2 +
      (this.properties.length
        ? (this.property.fontSize! + this.property.padding!) * this.properties.length + this.property.padding!
        : 0)
    this.height = config.card?.height ?? cardHeight
  }
  /** 绘制卡片 */
  drawCard () {
    this.ctx.save()
    this.ctx.fillStyle = this.hue
    this.ctx.strokeStyle = this.hue
    this.ctx.lineWidth = 3
    /** 绘制圆角矩形的卡片 */
    this.ctx.beginPath()
    this.ctx.moveTo(this.x + this.radius, this.y)
    this.ctx.lineTo(this.x + this.width - this.radius, this.y)
    // 绘制右上圆角
    this.ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + this.radius)
    this.ctx.lineTo(this.x + this.width, this.y + this.height - this.radius)
    // 绘制右下圆角
    this.ctx.quadraticCurveTo(
      this.x + this.width,
      this.y + this.height,
      this.x + this.width - this.radius,
      this.y + this.height,
    )
    this.ctx.lineTo(this.x + this.radius, this.y + this.height)
    // 绘制左下圆角
    this.ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - this.radius)
    this.ctx.lineTo(this.x, this.y + this.radius)
    // 绘制左上圆角
    this.ctx.quadraticCurveTo(this.x, this.y, this.x + this.radius, this.y)
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.stroke()
    this.ctx.restore()
  }
  /** 绘制卡片标题 */
  drawTitle () {
    this.ctx.save()
    this.ctx.fillStyle = this.header.fg!
    this.ctx.font = `${this.header.fontSize}px ${this.header.fontFamily}`
    this.ctx.textAlign = this.header.align!
    this.ctx.textBaseline = this.header.baseline!
    this.ctx.fillText(this.title, this.x + this.width / 2, this.y + this.header.fontSize! + this.header.padding!)

    // 计算标题文本的位置信息
    const metrics = this.ctx.measureText(this.title)
    this.titlePosition = { x: this.x + this.width / 2 - metrics.width / 2, y: this.y + this.header.padding!, width: metrics.width, height: this.header.fontSize!, text: this.title }
    // 如果没有属性文本, 则不绘制分割线
    if (this.properties.length) {
      // 绘制标题下方的分割线
      this.ctx.strokeStyle = this.splitLine.color!
      this.ctx.lineWidth = this.splitLine.width!
      this.ctx.beginPath()
      this.ctx.moveTo(this.x, this.y + this.header.fontSize! + this.header.padding! * 2)
      this.ctx.lineTo(this.x + this.width, this.y + this.header.fontSize! + this.header.padding! * 2)
      this.ctx.stroke()
    }
    this.ctx.restore()
  }
  /** 绘制卡片属性字符串列表 */
  drawProperty () {
    this.ctx.save()
    // 绘制卡片属性字符串列表
    this.ctx.fillStyle = this.property.fg!
    this.ctx.font = `${this.property.fontSize}px ${this.property.fontFamily}`
    this.ctx.textAlign = this.property.align!
    this.ctx.textBaseline = this.property.baseline!
    this.propertyPositions = [] // 清空之前的位置信息
    const headerHeight = this.header.fontSize! + this.header.padding! * 2
    for (let i = 0; i < this.properties.length; i++) {
      const text = this.properties[i]!
      const x = this.x + this.property.blockPadding!
      const y = this.y + headerHeight + this.property.fontSize! * (i + 1) + this.property.padding! * (i + 1)
      this.ctx.fillText(text, x, y)

      // 在每一行的前面绘制一个圆点，表示一个端口一样的东西
      const portRadius = 3
      this.ctx.beginPath()
      this.ctx.arc(this.x, y - this.property.fontSize! / 2, portRadius, 0, Math.PI * 2)
      this.ctx.fill()

      // 计算文本的宽度和高度
      const metrics = this.ctx.measureText(text)
      const width = metrics.width
      const height = this.property.fontSize!

      // 存储文本的位置信息
      this.propertyPositions.push({ x, y: y - height, width, height, text })
    }
    this.ctx.restore()
  }
  update (x: number, y: number) {
    this.x = x
    this.y = y
  }
  /** 是否在卡片内 */
  isMouseInCard (mouse: { offsetX: number, offsetY: number }) {
    return (
      mouse.offsetX >= this.x &&
      mouse.offsetX <= this.x + this.width &&
      mouse.offsetY >= this.y &&
      mouse.offsetY <= this.y + this.height
    )
  }
  highlightPropertyText (pos: { x: number; y: number; width: number; height: number; text: string }) {
    // 如果鼠标经过属性文本，则设置这行文本的背景色为淡蓝色
    this.ctx.save()
    this.ctx.fillStyle = this.property.fg!
    this.ctx.globalAlpha = 0.55
    // 清除背景区域
    this.ctx.clearRect(pos.x, pos.y, pos.width, pos.height)
    this.ctx.fillRect(pos.x, pos.y, pos.width, pos.height)
    this.ctx.globalAlpha = 1
    this.ctx.fillStyle = this.property.fg!
    this.ctx.font = `${this.property.fontSize}px ${this.property.fontFamily}`
    this.ctx.textBaseline = this.property.baseline!
    this.ctx.fillText(pos.text, pos.x, pos.y + pos.height)
    this.ctx.restore()
  }
  render () {
    this.drawCard()
    this.drawTitle()
    if (this.properties.length) {
      this.drawProperty()
    }
  }
}