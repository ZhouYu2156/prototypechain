// 节点类型枚举
export const NodeType = {
  CONSTRUCTOR: 'constructor',
  PROTOTYPE: 'prototype',
  INSTANCE: 'instance',
}

// 原型链节点类
export class PrototypeNode {
  constructor(config) {
    this.id = `node-${Math.random().toString(36).substr(2, 9)}`
    this.type = config.type // NodeType枚举值
    this.name = config.name // 构造函数名称
    this.properties = config.properties.map((p) => ({
      ...p,
      mdnLink: p.isBuiltin ? this.generateMDNLink(p.name) : null,
    }))
    this.position = { x: 0, y: 0 }
    this.width = 280
    this.height = 0 // 将在渲染时计算
    this.connectionPoints = {
      input: { x: 0, y: 0 }, // 输入连接点（顶部中点）
      output: { x: 0, y: 0 }, // 输出连接点（底部中点）
    }
  }

  // 生成MDN文档链接
  generateMDNLink(propertyName) {
    // 获取基础对象名称（去掉.prototype部分）
    const baseName = this.name.split('.')[0]

    // 特殊处理：如果是原型对象上的方法，使用实例方法的文档链接
    if (this.type === NodeType.PROTOTYPE) {
      return `https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/${baseName}/${propertyName}`
    }

    // 构造函数的静态方法
    return `https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/${baseName}/${propertyName}`
  }

  // 更新节点位置
  setPosition(x, y) {
    this.position.x = x
    this.position.y = y
    this.updateConnectionPoints()
  }

  // 更新连接点位置
  updateConnectionPoints() {
    this.connectionPoints.input = {
      x: this.position.x + this.width / 2,
      y: this.position.y,
    }
    this.connectionPoints.output = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height,
    }
  }

  // 计算节点高度
  calculateHeight() {
    const headerHeight = 36
    const propertyHeight = 24
    const padding = 12
    this.height = headerHeight + this.properties.length * propertyHeight + padding * 2
    this.updateConnectionPoints()
    return this.height
  }
}

// 连接线类
export class PrototypeLink {
  constructor(source, target, type = 'proto') {
    this.id = `link-${Math.random().toString(36).substr(2, 9)}`
    this.source = source
    this.target = target
    this.type = type // 'proto', 'prototype', 'constructor'
    this.pathElement = null
  }

  // 生成贝塞尔曲线路径
  generatePath() {
    if (!this.source || !this.target) {
      console.error('Missing source or target for link:', this)
      return ''
    }

    // 所有连线都从源节点的右端口连接到目标节点的左端口
    const sourcePoint = {
      x: this.source.position.x + 420, // 右端口
      y: this.source.position.y + 18, // 端口y坐标
    }

    const targetPoint = {
      x: this.target.position.x, // 左端口
      y: this.target.position.y + 18, // 端口y坐标
    }

    // 计算控制点
    const dx = Math.abs(targetPoint.x - sourcePoint.x)
    const dy = Math.abs(targetPoint.y - sourcePoint.y)

    let cp1x, cp1y, cp2x, cp2y

    if (dy < 50) {
      // 水平连接
      cp1x = sourcePoint.x + dx * 0.25
      cp1y = sourcePoint.y
      cp2x = targetPoint.x - dx * 0.25
      cp2y = targetPoint.y
    } else {
      // 对角线连接
      cp1x = sourcePoint.x + dx * 0.25
      cp1y = sourcePoint.y
      cp2x = targetPoint.x - dx * 0.25
      cp2y = targetPoint.y
    }

    // 从源节点的右端口到目标节点的左端口
    return `M ${sourcePoint.x},${sourcePoint.y} 
            C ${cp1x},${cp1y} 
              ${cp2x},${cp2y} 
              ${targetPoint.x},${targetPoint.y}`
  }

  // 更新连接线位置
  update() {
    if (this.pathElement) {
      this.pathElement.setAttribute('d', this.generatePath())
    }
  }
}

// 工具函数：从JavaScript对象获取属性描述
export function getObjectProperties(obj) {
  const props = []
  const descriptors = Object.getOwnPropertyDescriptors(obj)

  for (const [name, descriptor] of Object.entries(descriptors)) {
    const type = getPropertyType(descriptor)
    props.push({
      name,
      type,
      isBuiltin: true, // 默认为内置属性
      descriptor,
    })
  }

  return props
}

// 工具函数：获取属性类型
function getPropertyType(descriptor) {
  if (descriptor.get || descriptor.set) {
    return 'accessor'
  }
  if (typeof descriptor.value === 'function') {
    return 'function'
  }
  return typeof descriptor.value
}
