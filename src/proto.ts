import { Card } from './card'
import type { Point } from './config'
import { ColorPallet, Primary } from './config'

/** 原型链图谱 */
export class PrototypeChain {
  cvs: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  /** 画布背景色 */
  bgColor: string
  /** 单元格大小 */
  cellSize: number
  /** 单元格网格线颜色 */
  cellLineColor: string
  /** 交叉点绘制圆点颜色 */
  overlapPointColor: string
  /** 卡片对象数组 */
  cards: Card[]

  constructor(
    cvs: HTMLCanvasElement,
    bgColor: string = 'rgb(10, 10, 10)',
    cellSize: number = 16,
    cellLineColor: string = 'rgb(8, 30, 45)',
    overlapPointColor: string = 'rgb(103, 112, 121)',
  ) {
    this.cvs = cvs
    this.ctx = cvs.getContext('2d')!
    // 画布背景色
    this.bgColor = bgColor
    // 单元格大小
    this.cellSize = cellSize
    // 单元格网格线颜色
    this.cellLineColor = cellLineColor
    // 交叉点绘制圆点颜色
    this.overlapPointColor = overlapPointColor
    // 卡片对象数组
    this.cards = []

    this.initCanvas()
  }
  /**
   * 初始化画布
   */
  initCanvas () {
    this.cvs.width = window.innerWidth
    this.cvs.height = window.innerHeight
  }
  /**
   * 刷新画布背景: 重新绘制网格线
   */
  refreshCanvas () {
    this.initCanvas()
    this.drawGrid()
    this.draw3x3GridLines()
  }
  /**
   * 绘制网格: 绘制第一层网格
   */
  drawGrid () {
    this.ctx.save()
    this.ctx.fillStyle = this.bgColor
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height)
    this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height)
    // 绘制第一层网格
    const rows = this.cvs.height / this.cellSize
    const cols = this.cvs.width / this.cellSize
    this.ctx.strokeStyle = this.cellLineColor
    this.ctx.lineWidth = 1
    for (let i = 0; i < rows; i++) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, i * this.cellSize)
      this.ctx.lineTo(this.cvs.width, i * this.cellSize)
      this.ctx.stroke()
    }
    for (let i = 0; i < cols; i++) {
      this.ctx.beginPath()
      this.ctx.moveTo(i * this.cellSize, 0)
      this.ctx.lineTo(i * this.cellSize, this.cvs.height)
      this.ctx.stroke()
    }
    this.ctx.restore()
  }
  /**
   * 绘制网格: 绘制第二层3x3网格线
   */
  draw3x3GridLines () {
    this.ctx.save()
    const rows = this.cvs.height / this.cellSize / 3
    const cols = this.cvs.width / this.cellSize / 3
    this.ctx.strokeStyle = this.cellLineColor
    this.ctx.lineWidth = 2
    // 绘制水平网格线
    for (let i = 0; i < rows; i++) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, i * this.cellSize * 3)
      this.ctx.lineTo(this.cvs.width, i * this.cellSize * 3)
      this.ctx.stroke()
    }
    // 绘制垂直网格线
    for (let i = 0; i < cols; i++) {
      this.ctx.beginPath()
      this.ctx.moveTo(i * this.cellSize * 3, 0)
      this.ctx.lineTo(i * this.cellSize * 3, this.cvs.height)
      this.ctx.stroke()
    }
    // 绘制交叉点
    this.ctx.fillStyle = this.overlapPointColor
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        this.ctx.beginPath()
        this.ctx.arc(j * this.cellSize * 3, i * this.cellSize * 3, 2, 0, Math.PI * 2)
        this.ctx.fill()
      }
    }
    this.ctx.restore()
  }
  /**
   * 根据关键字搜索MDN文档上的JS标准内置对象
   */
  searchByKeyword (kw: string, extra: string = '') {
    window.open(`https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/${kw}${extra ? '/' + extra : ''}`, '_blank')
  }
  /**
   * 获取鼠标在画布上的位置
   */
  getMousePosition (e: MouseEvent) {
    // 画布边界
    const canvasRect = this.cvs.getBoundingClientRect()
    // 鼠标在画布上的位置
    const mouseX = e.clientX - canvasRect.left
    const mouseY = e.clientY - canvasRect.top
    return { mouseX, mouseY }
  }
  /**
   * 计算两个卡片之间的连线坐标: 实现连线在两张卡片之间的位置调换、控制点上下方向切换
   */
  computedBezierCurvePoints (r1: Card, r2: Card) {
    let startPoint, endPoint

    if (r1.x < r2.x) {
      // 如果 r1 在 r2 的左边
      startPoint = { x: r1.x + r1.width, y: r1.y + r1.height / 2 }
      endPoint = { x: r2.x, y: r2.y + r2.height / 2 }
    } else {
      // 如果 r1 在 r2 的右边
      startPoint = { x: r2.x + r2.width, y: r2.y + r2.height / 2 }
      endPoint = { x: r1.x, y: r1.y + r1.height / 2 }
    }

    // 计算中点
    const midPointX = (startPoint.x + endPoint.x) / 2

    // 计算垂直距离的一半
    const verticalOffset = Math.abs(startPoint.y - endPoint.y) / 2

    // 根据相对位置调整控制点
    let controlPoint1, controlPoint2
    if (startPoint.y < endPoint.y) {
      // 如果起点在终点上方
      controlPoint1 = { x: midPointX, y: startPoint.y - verticalOffset }
      controlPoint2 = { x: midPointX, y: endPoint.y + verticalOffset }
    } else {
      // 如果起点在终点下方
      controlPoint1 = { x: midPointX, y: startPoint.y + verticalOffset }
      controlPoint2 = { x: midPointX, y: endPoint.y - verticalOffset }
    }

    return [startPoint, endPoint, controlPoint1, controlPoint2]
  }
  /**
   * 绑定拖动事件: 当鼠标在卡片对象上时，可以拖动卡片对象; 当鼠标在画布上时，可以拖动画布
   */
  bindEvent () {
    let isDraggingCard = false
    let draggingShape: Card | null = null
    // 鼠标按下时, 鼠标在卡片上的X偏移量
    let offsetX = 0
    // 鼠标按下时, 鼠标在卡片上的Y偏移量
    let offsetY = 0
    // 是否按住空格键
    let isPressSpace = false
    // 是否拖动画布
    let isDraggingCanvas = false
    // 鼠标按下时, 鼠标在画布上的X偏移量
    let offsetXCanvas = 0
    // 鼠标按下时, 鼠标在画布上的Y偏移量
    let offsetYCanvas = 0

    /** 鼠标按下事件 */
    this.cvs.addEventListener('mousedown', e => {
      // 获取鼠标在画布上的位置
      const { mouseX, mouseY } = this.getMousePosition(e)
      // 更新被拖动的矩形
      for (let i = 0; i < this.cards.length; i++) {
        // 判断鼠标是否在矩形内
        const shape = this.cards[i]
        if (shape.isMouseInCard({ offsetX: mouseX, offsetY: mouseY })) {
          isDraggingCard = true
          draggingShape = shape
          offsetX = mouseX - shape.x
          offsetY = mouseY - shape.y
          return
        }
      }
      if (isPressSpace && !isDraggingCard) {
        console.log('尽管按着空格键, 但是卡片已经被选中的情况下, 程序优先终止, 不会执行到这一行代码')
        isDraggingCanvas = true
        // 获取鼠标在画布上的位置
        offsetXCanvas = mouseX
        offsetYCanvas = mouseY
      }
    })
    /** 鼠标移动事件 */
    this.cvs.addEventListener('mousemove', e => {
      // 获取鼠标在画布上的位置
      const { mouseX, mouseY } = this.getMousePosition(e)

      // 鼠标在属性文本上时, 显示小手图标并设置属性文本背景色
      let isHovering = false
      for (const shape of this.cards) {
        for (const pos of shape.propertyPositions) {
          if (mouseX >= pos.x && mouseX <= pos.x + pos.width && mouseY >= pos.y && mouseY <= pos.y + pos.height) {
            this.cvs.style.cursor = 'pointer'
            shape.highlightPropertyText(pos)
            isHovering = true
            break
          }
        }
        if (isHovering) break
      }

      if (!isHovering) {
        this.cvs.style.cursor = 'default'
        // 当鼠标不在属性文本上时，重新绘制所有卡片及其内容
        this.refreshCanvas()
        this.cards.forEach(card => card.render())
      }

      /** 当鼠标在卡片标题上时, 显示小手图标 */
      for (const card of this.cards) {
        if (mouseX >= card.titlePosition!.x && mouseX <= card.titlePosition!.x + card.titlePosition!.width && mouseY >= card.titlePosition!.y && mouseY <= card.titlePosition!.y + card.titlePosition!.height) {
          this.cvs.style.cursor = 'pointer'
          break
        }
      }

      /** 卡片被选中的情况下, 拖动卡片的逻辑 */
      if (draggingShape && isDraggingCard) {
        // 刷新画布背景 -> 重新绘制网格线
        this.refreshCanvas()
        // 更新被拖动的卡片位置
        draggingShape!.update(mouseX - offsetX, mouseY - offsetY)
        // 绘制卡片
        this.cards.forEach(card => card.render())
      }
      /** 拖动画布的逻辑 */
      if (isDraggingCanvas) {
        // 重新绘制画布并拖动所有卡片移动
        this.refreshCanvas()
        for (const card of this.cards) {
          // 卡片应该移动的偏移量
          const offsetX = mouseX - offsetXCanvas
          const offsetY = mouseY - offsetYCanvas
          console.log('x偏移量: ', offsetX, 'y偏移量: ', offsetY)
          // 更新卡片位置
          card.x += offsetX
          card.y += offsetY
          // 绘制卡片
          card.render()
        }
        // 更新画布偏移量
        offsetXCanvas = mouseX
        offsetYCanvas = mouseY
      }
    })
    /** 鼠标抬起事件 */
    this.cvs.addEventListener('mouseup', () => {
      isDraggingCard = false
      draggingShape = null
      isDraggingCanvas = false
      offsetXCanvas = 0
      offsetYCanvas = 0
    })
    // 当按住空格键时, 可以拖动画布, 并且显示出抓手图标
    window.addEventListener('keydown', e => {
      if (e.key === ' ') {
        this.cvs.style.cursor = 'grab'
        isPressSpace = true
      }
    })
    window.addEventListener('keyup', e => {
      if (e.key === ' ') {
        this.cvs.style.cursor = 'default'
        isPressSpace = false
      }
    })
    // 根据鼠标滚动, 整个画布及其元素也会移动
    this.cvs.addEventListener(
      'wheel',
      e => {
        // 获取鼠标滚轮的滚动方向, 向上滚动为-1, 向下滚动为1
        const direction = e.deltaY > 0 ? -1 : 1
        this.cards.forEach(card => {
          card.y += direction * this.cellSize
        })
        this.refreshCanvas()
        this.cards.forEach(card => card.render())
      },
      { passive: true },
    )
    // 鼠标点击事件
    this.cvs.addEventListener('click', e => {
      const { mouseX, mouseY } = this.getMousePosition(e)
      // 检查鼠标是否在任何属性文本上
      for (const card of this.cards) {
        for (const pos of card.propertyPositions) {
          if (mouseX >= pos.x && mouseX <= pos.x + pos.width && mouseY >= pos.y && mouseY <= pos.y + pos.height) {
            if (card.ref === null) return
            // 非null的情况下的对象, 获取属性值
            const propertyValue = Reflect.get(card.ref, pos.text)
            if (typeof propertyValue === 'object' || typeof propertyValue === 'function') {
              this.visualize(propertyValue)
            } else {
              console.log('propertyValue: ', propertyValue)
            }
          }
        }
      }
    })
    /** 当鼠标双击卡片的标题时, 可以搜索MDN对应文档的内容 */
    this.cvs.addEventListener('dblclick', (e) => {
      const { mouseX, mouseY } = this.getMousePosition(e)
      for (const card of this.cards) {
        if (card.isMouseInCard({ offsetX: mouseX, offsetY: mouseY })) {
          if (mouseX >= card.titlePosition!.x && mouseX <= card.titlePosition!.x + card.titlePosition!.width && mouseY >= card.titlePosition!.y && mouseY <= card.titlePosition!.y + card.titlePosition!.height) {
            console.log('双击了卡片标题', card.titlePosition)
            card.ref ? this.searchByKeyword(card.ref?.constructor.name) : this.searchByKeyword(card.titlePosition!.text)
            break
          }
        }
      }
    })
  }

  /** 
   * 绘制原型属性
   */
  drawPrototypeProperties (objects: (Function | Object | null)[], randomColor: boolean = true) {
    objects.forEach(item => {
      const color = randomColor ? ColorPallet[Math.floor(Math.random() * ColorPallet.length)] : Primary
      // 随机生成卡片位置
      const randomPositionX = Math.floor(Math.random() * 10) * this.cellSize * 3
      const randomPositionY = Math.floor(Math.random() * 10) * this.cellSize * 3
      // 处理 null 的情况
      if (typeof item === 'object' && item === null) {
        const card = new Card(item, this.ctx, { title: 'null', properties: [], ...color })
        this.cards.push(card)
        return
      }
      let properties = Reflect.ownKeys(item)
      properties = properties.map(property => {
        // 如果属性是symbol类型, 则将其转换为字符串
        if (typeof property === 'symbol') {
          return property.toString()
        }
        return property
      })
      // 处理既是原型对象又是函数的特殊情况: 例如: Function.prototype, 判断依据: 原型没有名称 & 类型为函数
      if (typeof item === 'function' && item.name === '') {
        const card = new Card(item, this.ctx, {
          title: item.constructor.name + '.prototype', properties: properties as string[], ...color, card: {
            x: randomPositionX,
            y: randomPositionY
          }
        })
        this.cards.push(card)
        return
      }
      /** 如果是构造函数则可以拿到函数名称 */
      if (typeof item === 'function') {
        const card = new Card(item, this.ctx, {
          title: item.name, properties: properties as string[], ...color, card: {
            x: randomPositionX,
            y: randomPositionY
          }
        })
        this.cards.push(card)
      }
      /** 如果是对象则可以拿到对象的构造函数名称, 并设置卡片标题为构造函数名称 */
      if (typeof item === 'object' && item !== null) {
        let ItemName = item.constructor.name + '.prototype'
        const card = new Card(item, this.ctx, {
          title: ItemName, properties: properties as string[], ...color, card: {
            x: randomPositionX,
            y: randomPositionY
          }
        })
        this.cards.push(card)
      }
    })
    this.cards.forEach(card => {
      card.render()

      // 遍历所有相邻矩形，绘制贝塞尔曲线
      for (let i = 0; i < this.cards.length - 1; i++) {
        const currentCard = this.cards[i]
        const nextCard = this.cards[i + 1]

        // 检查原型链关系
        if (nextCard.ref && Object.getPrototypeOf(nextCard.ref) === currentCard.ref) {
          const [startPoint, endPoint, controlPoint1, controlPoint2] = this.computedBezierCurvePoints(currentCard, nextCard)

          // 绘制贝塞尔曲线
          this.drawBezierCurve(startPoint, endPoint, controlPoint1, controlPoint2)
        }
      }
    })
  }
  /**
   * 绘制两个卡片之间的贝塞尔曲线连接线
   */
  drawBezierCurve (startPoint: Point, endPoint: Point, controlPoint1: Point, controlPoint2: Point) {
    this.ctx.save()
    this.ctx.lineWidth = 1
    this.ctx.strokeStyle = 'rgb(255,255,255)'
    // 绘制贝塞尔曲线
    this.ctx.beginPath()
    this.ctx.moveTo(startPoint.x, startPoint.y)
    this.ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, endPoint.x, endPoint.y)
    this.ctx.stroke()
    this.ctx.restore()
  }
  /**
   * 可视化外部需要可视化的对象结构
   */
  visualize (target: string) {
    try {
      const o = eval(target)
      // 表达式属于基本字面量: 直接终止
      if (typeof o === 'string' || typeof o === 'number' || typeof o === 'boolean') {
        console.log("结果: ", o)
        return
      }
      /** 如果目标对象是对象或函数, 则可视化其结构 */
      if (typeof o === 'object' || typeof o === 'function') {
        this.cards = []
        this.render(o)
      }
    } catch (error) {
      // 尝试将内容写入 script 标签, 并执行
      const script = document.createElement('script')
      script.textContent = target
      document.body.appendChild(script)
      // 执行完成后删除脚本
      setTimeout(() => {
        script.remove()
      }, 1000)
    }
  }
  /**
   * 渲染: 刷新画布背景并绘制原型属性
   */
  render (...objects: (Function | Object | null)[]) {
    this.refreshCanvas()
    this.drawPrototypeProperties(objects)
  }
}


