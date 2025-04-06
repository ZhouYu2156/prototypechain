import { NodeType, PrototypeLink, PrototypeNode, getObjectProperties } from './models.js'
import { PrototypeRenderer } from './renderer.js'

class PrototypeVisualizer {
  constructor() {
    this.container = document.getElementById('prototype-graph')
    this.renderer = new PrototypeRenderer(this.container)
    this.nodes = []
    this.links = []

    this.initializeControls()
    this.initializePanel()
    this.initializeSearch()
    this.loadExampleData()
  }

  // 初始化控制按钮
  initializeControls() {
    document.getElementById('reset-view').addEventListener('click', () => {
      this.renderer.resetView()
    })

    document.getElementById('export-svg').addEventListener('click', () => {
      this.renderer.exportSVG()
    })

    document.getElementById('add-custom').addEventListener('click', () => {
      this.showCustomObjectDialog()
    })
  }

  // 初始化标准内置对象面板
  initializePanel() {
    const config = {
      title: 'JS标准内置对象',
      children: [
        { text: 'Object', value: 'Object' },
        { text: 'Function', value: 'Function' },
        { text: 'Array', value: 'Array' },
        { text: 'String', value: 'String' },
        { text: 'Number', value: 'Number' },
        { text: 'Boolean', value: 'Boolean' },
        { text: 'Symbol', value: 'Symbol' },
        { text: 'RegExp', value: 'RegExp' },
        { text: 'Date', value: 'Date' },
        { text: 'Error', value: 'Error' },
        { text: 'Map', value: 'Map' },
        { text: 'Set', value: 'Set' },
        { text: 'JSON', value: 'JSON' },
        { text: 'Math', value: 'Math' },
        { text: 'Promise', value: 'Promise' },
        { text: '查看所有', value: 'all' },
      ],
    }

    // 创建面板
    const panel = document.createElement('div')
    panel.className = 'pannel'

    // 添加标题
    const title = document.createElement('h1')
    title.textContent = config.title
    panel.appendChild(title)

    // 创建按钮容器
    const buttonContainer = document.createElement('div')
    buttonContainer.className = 'stardard-objects'

    // 添加按钮
    config.children.forEach((item) => {
      const button = document.createElement('button')
      button.className = 'item'
      button.textContent = item.value
      button.addEventListener('click', () => this.handleObjectSelect(item.value))
      buttonContainer.appendChild(button)
    })

    panel.appendChild(buttonContainer)
    document.body.appendChild(panel)
  }

  // 初始化搜索功能
  initializeSearch() {
    const searchInput = document.getElementById('searchInput')
    const searchBtn = document.getElementById('searchBtn')

    // 处理回车搜索
    searchInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        const searchValue = searchInput.value.trim()
        if (searchValue) {
          this.visualizeObjectStructure(searchValue)
        }
      }
    })

    // 处理按钮点击搜索
    searchBtn.addEventListener('click', () => {
      const searchValue = searchInput.value.trim()
      if (searchValue) {
        this.searchMDN(searchValue)
      }
    })
  }

  // 可视化对象结构
  visualizeObjectStructure(objectName) {
    // 验证输入的对象名是否存在
    const Constructor = window[objectName]
    if (!Constructor) {
      alert(`未找到内置对象: ${objectName}`)
      return
    }

    // 调用现有的对象选择处理方法
    this.handleObjectSelect(objectName)
  }

  // 在 MDN 中搜索
  searchMDN(keyword) {
    const baseUrl = 'https://developer.mozilla.org/zh-CN/search'
    const searchUrl = `${baseUrl}?q=${encodeURIComponent(keyword)}`
    window.open(searchUrl, '_blank')
  }

  // 处理内置对象选择
  handleObjectSelect(objectName) {
    // 清除现有的节点和连接
    this.nodes = []
    this.links = []
    this.renderer.nodesG.selectAll('*').remove()
    this.renderer.linksG.selectAll('*').remove()

    if (objectName === 'all') {
      // 显示所有对象的原型链
      this.loadExampleData()
      return
    }

    // 获取选中对象的构造函数
    const Constructor = window[objectName]
    if (!Constructor) return

    // 创建 null 节点
    const nullNode = new PrototypeNode({
      type: 'null',
      name: 'null',
      properties: [],
    })

    // 创建 Object.prototype 节点
    const objectPrototypeNode = new PrototypeNode({
      type: NodeType.PROTOTYPE,
      name: 'Object.prototype',
      properties: getObjectProperties(Object.prototype),
    })

    // 创建 Function.prototype 节点
    const functionPrototypeNode = new PrototypeNode({
      type: NodeType.PROTOTYPE,
      name: 'Function.prototype',
      properties: getObjectProperties(Function.prototype),
    })

    // 创建构造函数节点
    const constructorNode = new PrototypeNode({
      type: NodeType.CONSTRUCTOR,
      name: objectName,
      properties: getObjectProperties(Constructor),
    })

    // 创建原型对象节点
    const prototypeNode = new PrototypeNode({
      type: NodeType.PROTOTYPE,
      name: `${objectName}.prototype`,
      properties: getObjectProperties(Constructor.prototype),
    })

    // 设置节点位置
    nullNode.setPosition(-400, 0)
    objectPrototypeNode.setPosition(-200, 0)
    functionPrototypeNode.setPosition(200, -200)
    constructorNode.setPosition(400, 0)
    prototypeNode.setPosition(200, 200)

    // 创建连接
    const links = [
      // null -> Object.prototype
      new PrototypeLink(nullNode, objectPrototypeNode, 'proto'),

      // Object.prototype -> Function.prototype
      new PrototypeLink(objectPrototypeNode, functionPrototypeNode, 'proto'),

      // Object.prototype -> 对象原型
      new PrototypeLink(objectPrototypeNode, prototypeNode, 'proto'),

      // Function.prototype -> 构造函数
      new PrototypeLink(functionPrototypeNode, constructorNode, 'proto'),

      // 原型对象 -> 构造函数 (修正方向)
      new PrototypeLink(prototypeNode, constructorNode, 'prototype'),
    ]

    // 特殊处理 Function 构造函数
    if (objectName === 'Function') {
      // Function.prototype -> Function
      links.push(new PrototypeLink(functionPrototypeNode, constructorNode, 'proto'))
    }

    // 特殊处理 Object 构造函数
    if (objectName === 'Object') {
      // Object.prototype -> Object
      links.push(new PrototypeLink(objectPrototypeNode, constructorNode, 'proto'))
    }

    // 渲染节点
    const allNodes = [
      nullNode,
      objectPrototypeNode,
      functionPrototypeNode,
      constructorNode,
      prototypeNode,
    ]
    allNodes.forEach((node) => {
      this.nodes.push(node)
      this.renderer.renderNode(node)
    })

    // 渲染连接
    links.forEach((link) => {
      this.links.push(link)
      this.renderer.renderLink(link)
    })

    // 重置视图以适应新的节点
    setTimeout(() => {
      this.renderer.resetView()
    }, 100)
  }

  // 加载示例数据
  loadExampleData() {
    // 第一层：null
    const nullConstructor = new PrototypeNode({
      type: 'null',
      name: 'null',
      properties: [],
    })

    // 第二层：Object.prototype
    const objectPrototype = new PrototypeNode({
      type: NodeType.PROTOTYPE,
      name: 'Object.prototype',
      properties: getObjectProperties(Object.prototype),
    })

    // 第三层：各个内置对象的原型对象
    const functionPrototype = new PrototypeNode({
      type: NodeType.PROTOTYPE,
      name: 'Function.prototype',
      properties: getObjectProperties(Function.prototype),
    })

    const arrayPrototype = new PrototypeNode({
      type: NodeType.PROTOTYPE,
      name: 'Array.prototype',
      properties: getObjectProperties(Array.prototype),
    })

    const stringPrototype = new PrototypeNode({
      type: NodeType.PROTOTYPE,
      name: 'String.prototype',
      properties: getObjectProperties(String.prototype),
    })

    const numberPrototype = new PrototypeNode({
      type: NodeType.PROTOTYPE,
      name: 'Number.prototype',
      properties: getObjectProperties(Number.prototype),
    })

    const booleanPrototype = new PrototypeNode({
      type: NodeType.PROTOTYPE,
      name: 'Boolean.prototype',
      properties: getObjectProperties(Boolean.prototype),
    })

    const datePrototype = new PrototypeNode({
      type: NodeType.PROTOTYPE,
      name: 'Date.prototype',
      properties: getObjectProperties(Date.prototype),
    })

    const regexpPrototype = new PrototypeNode({
      type: NodeType.PROTOTYPE,
      name: 'RegExp.prototype',
      properties: getObjectProperties(RegExp.prototype),
    })

    const promisePrototype = new PrototypeNode({
      type: NodeType.PROTOTYPE,
      name: 'Promise.prototype',
      properties: getObjectProperties(Promise.prototype),
    })

    // 第四层：构造函数
    const objectConstructor = new PrototypeNode({
      type: NodeType.CONSTRUCTOR,
      name: 'Object',
      properties: getObjectProperties(Object),
    })

    const functionConstructor = new PrototypeNode({
      type: NodeType.CONSTRUCTOR,
      name: 'Function',
      properties: getObjectProperties(Function),
    })

    const arrayConstructor = new PrototypeNode({
      type: NodeType.CONSTRUCTOR,
      name: 'Array',
      properties: getObjectProperties(Array),
    })

    const stringConstructor = new PrototypeNode({
      type: NodeType.CONSTRUCTOR,
      name: 'String',
      properties: getObjectProperties(String),
    })

    const numberConstructor = new PrototypeNode({
      type: NodeType.CONSTRUCTOR,
      name: 'Number',
      properties: getObjectProperties(Number),
    })

    const booleanConstructor = new PrototypeNode({
      type: NodeType.CONSTRUCTOR,
      name: 'Boolean',
      properties: getObjectProperties(Boolean),
    })

    const dateConstructor = new PrototypeNode({
      type: NodeType.CONSTRUCTOR,
      name: 'Date',
      properties: getObjectProperties(Date),
    })

    const regexpConstructor = new PrototypeNode({
      type: NodeType.CONSTRUCTOR,
      name: 'RegExp',
      properties: getObjectProperties(RegExp),
    })

    const promiseConstructor = new PrototypeNode({
      type: NodeType.CONSTRUCTOR,
      name: 'Promise',
      properties: getObjectProperties(Promise),
    })

    // 设置节点位置
    // null 节点
    nullConstructor.setPosition(-1442, 549)

    // Object.prototype 节点
    objectPrototype.setPosition(-781, 489)

    // Function.prototype 节点
    functionPrototype.setPosition(465, -22)

    // Array.prototype 节点
    arrayPrototype.setPosition(-51, -1491)

    // String.prototype 节点
    stringPrototype.setPosition(500, -1986)

    // Number.prototype 节点
    numberPrototype.setPosition(497, 403)

    // Boolean.prototype 节点
    booleanPrototype.setPosition(500, 724)

    // Date.prototype 节点
    datePrototype.setPosition(544, 962)

    // RegExp.prototype 节点
    regexpPrototype.setPosition(1079, 1147)

    // Promise.prototype 节点
    promisePrototype.setPosition(1079, 939)

    // 构造函数节点位置
    functionConstructor.setPosition(1144, -452)
    arrayConstructor.setPosition(2013, -534)
    stringConstructor.setPosition(1772, -174)
    numberConstructor.setPosition(1654, 167)
    booleanConstructor.setPosition(2279, 146)
    dateConstructor.setPosition(2266, 393)
    regexpConstructor.setPosition(2208, 803)
    promiseConstructor.setPosition(1662, 824)
    objectConstructor.setPosition(33, 993)

    // 第三层：原型对象
    const prototypeObjects = [
      functionPrototype,
      arrayPrototype,
      stringPrototype,
      numberPrototype,
      booleanPrototype,
      datePrototype,
      regexpPrototype,
      promisePrototype,
    ]

    // 第四层：构造函数
    const constructors = [
      functionConstructor,
      arrayConstructor,
      stringConstructor,
      numberConstructor,
      booleanConstructor,
      dateConstructor,
      regexpConstructor,
      promiseConstructor,
      objectConstructor,
    ]

    // 创建连接
    const links = [
      // null -> Object.prototype
      new PrototypeLink(nullConstructor, objectPrototype, 'proto'),

      // Object.prototype -> 所有原型对象（包括 Function.prototype）
      ...prototypeObjects.map((proto) => new PrototypeLink(objectPrototype, proto, 'proto')),

      // Function.prototype -> 所有构造函数（除了 Object）
      ...constructors
        .filter((ctor) => ctor !== objectConstructor)
        .map((ctor) => new PrototypeLink(functionPrototype, ctor, 'proto')),

      // Object.prototype -> Object 构造函数
      new PrototypeLink(objectPrototype, objectConstructor, 'proto'),

      // 原型对象 -> 对应的构造函数
      new PrototypeLink(functionPrototype, functionConstructor, 'prototype'),
      new PrototypeLink(arrayPrototype, arrayConstructor, 'prototype'),
      new PrototypeLink(stringPrototype, stringConstructor, 'prototype'),
      new PrototypeLink(numberPrototype, numberConstructor, 'prototype'),
      new PrototypeLink(booleanPrototype, booleanConstructor, 'prototype'),
      new PrototypeLink(datePrototype, dateConstructor, 'prototype'),
      new PrototypeLink(regexpPrototype, regexpConstructor, 'prototype'),
      new PrototypeLink(promisePrototype, promiseConstructor, 'prototype'),
      new PrototypeLink(objectPrototype, objectConstructor, 'prototype'),
    ]

    // 渲染所有节点
    const allNodes = [nullConstructor, objectPrototype, ...prototypeObjects, ...constructors]

    allNodes.forEach((node) => {
      this.nodes.push(node)
      this.renderer.renderNode(node)
    })

    // 渲染所有连接
    links.forEach((link) => {
      this.links.push(link)
      this.renderer.renderLink(link)
    })

    // 添加图例说明
    this.renderer.addLegend()
  }

  // 添加图例说明
  addLegend() {
    const legend = document.createElement('div')
    legend.style.cssText = `
      position: fixed;
      top: 20px;
      right: 200px;
      background: rgba(30, 30, 50, 0.95);
      padding: 15px;
      border: 2px solid;
      border-image: linear-gradient(135deg, #9d00ff, #00f0ff) 1;
      box-shadow: 0 0 15px rgba(157, 0, 255, 0.7);
      color: #00f0ff;
      font-family: 'Courier New', monospace;
      z-index: 1000;
    `

    const legendContent = `
      <div style="margin-bottom: 10px; font-weight: bold;">原型链关系图例：</div>
      <div style="display: flex; align-items: center; margin: 5px 0;">
        <div style="width: 50px; height: 2px; background: #f0ff00; margin-right: 10px;"></div>
        <span>prototype</span>
      </div>
      <div style="display: flex; align-items: center; margin: 5px 0;">
        <div style="width: 50px; height: 2px; background: #9d00ff; margin-right: 10px; border-top: 1px dashed rgba(255,255,255,0.3);"></div>
        <span>__proto__</span>
      </div>
      <div style="display: flex; align-items: center; margin: 5px 0;">
        <div style="width: 50px; height: 2px; background: #00f0ff; margin-right: 10px;"></div>
        <span>constructor</span>
      </div>
    `

    legend.innerHTML = legendContent
    document.body.appendChild(legend)
  }

  // 显示添加自定义对象对话框
  showCustomObjectDialog() {
    const defaultCode = `function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log('Hello, ' + this.name);
};`

    const code = prompt('请输入自定义构造函数代码：', defaultCode)
    if (code) {
      this.executeCustomCode(code)
    }
  }

  // 执行自定义代码
  executeCustomCode(code) {
    try {
      // 直接在全局作用域中执行代码
      const constructorFunc = new Function(`
        "use strict";
        ${code};
        return ${code.match(/function\s+(\w+)/)[1]};
      `)()

      if (!constructorFunc) {
        throw new Error('未能找到构造函数')
      }

      const constructorName = constructorFunc.name

      // 创建构造函数节点
      const constructorNode = new PrototypeNode({
        type: NodeType.CONSTRUCTOR,
        name: constructorName,
        properties: this.getObjectProperties(constructorFunc),
      })

      // 创建原型节点
      const prototypeNode = new PrototypeNode({
        type: NodeType.PROTOTYPE,
        name: `${constructorName}.prototype`,
        properties: this.getObjectProperties(constructorFunc.prototype),
      })

      // 设置节点位置
      const offset = this.nodes.length * 50
      constructorNode.setPosition(300 + offset, 400)
      prototypeNode.setPosition(300 + offset, 550)

      // 创建连接
      const prototypeLink = new PrototypeLink(constructorNode, prototypeNode, 'prototype')
      const constructorLink = new PrototypeLink(prototypeNode, constructorNode, 'constructor')

      // 连接到 Function.prototype
      const functionProtoNode = this.nodes.find((n) => n.name === 'Function.prototype')
      if (functionProtoNode) {
        const functionProtoLink = new PrototypeLink(constructorNode, functionProtoNode, 'proto')
        this.links.push(functionProtoLink)
        this.renderer.renderLink(functionProtoLink)
      }

      // 连接到 Object.prototype
      const objectProtoNode = this.nodes.find((n) => n.name === 'Object.prototype')
      if (objectProtoNode) {
        const objectProtoLink = new PrototypeLink(prototypeNode, objectProtoNode, 'proto')
        this.links.push(objectProtoLink)
        this.renderer.renderLink(objectProtoLink)
      }

      // 渲染节点和连接
      this.nodes.push(constructorNode, prototypeNode)
      this.renderer.renderNode(constructorNode)
      this.renderer.renderNode(prototypeNode)
      this.links.push(prototypeLink, constructorLink)
      this.renderer.renderLink(prototypeLink)
      this.renderer.renderLink(constructorLink)

      // 如果代码中包含实例创建，则创建一个实例并显示
      if (code.includes('new')) {
        // 创建一个实例
        const instance = new constructorFunc('Example')

        // 创建实例节点
        const instanceNode = new PrototypeNode({
          type: NodeType.INSTANCE,
          name: 'instance',
          properties: this.getObjectProperties(instance),
        })

        // 设置实例节点位置
        instanceNode.setPosition(300 + offset, 250)

        // 创建实例到原型的连接
        const instanceProtoLink = new PrototypeLink(instanceNode, prototypeNode, 'proto')

        // 渲染实例节点和连接
        this.nodes.push(instanceNode)
        this.renderer.renderNode(instanceNode)
        this.links.push(instanceProtoLink)
        this.renderer.renderLink(instanceProtoLink)
      }
    } catch (error) {
      console.error('代码执行错误：', error.message)
      alert('代码执行错误：' + error.message)
    }
  }

  // 获取对象的所有属性
  getObjectProperties(obj) {
    if (!obj) return []
    return Object.getOwnPropertyNames(obj).map((name) => {
      const descriptor = Object.getOwnPropertyDescriptor(obj, name)
      let type = 'undefined'

      if (descriptor.get || descriptor.set) {
        type = 'accessor'
      } else if (typeof descriptor.value === 'function') {
        type = 'function'
      } else if (descriptor.value !== null) {
        type = typeof descriptor.value
      }

      return {
        name,
        type,
        isBuiltin: true, // 这里可以根据需要判断是否为内置属性
      }
    })
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new PrototypeVisualizer()
})
