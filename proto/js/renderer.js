import { NodeType } from './models.js'

export class PrototypeRenderer {
  constructor(container) {
    this.container = container
    this.width = container.clientWidth
    this.height = container.clientHeight
    this.nodes = new Map()
    this.links = new Map()
    this.zoom = null
    this.transform = { k: 1, x: 0, y: 0 }

    this.initSVG()
    this.initZoom()
    this.setupDefs()
  }

  // 初始化SVG容器
  initSVG() {
    this.svg = d3
      .select(this.container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, this.width, this.height])

    this.g = this.svg.append('g')

    // 创建图层
    this.linksG = this.g.append('g').attr('class', 'links')
    this.nodesG = this.g.append('g').attr('class', 'nodes')
  }

  // 初始化缩放行为
  initZoom() {
    this.zoom = d3
      .zoom()
      .scaleExtent([0.1, 2])
      .on('zoom', (event) => {
        this.transform = event.transform
        this.g.attr('transform', event.transform)
      })

    this.svg.call(this.zoom)
  }

  // 设置SVG渐变和箭头定义
  setupDefs() {
    const defs = this.svg.append('defs')

    // 流光渐变
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'link-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')

    gradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(0, 240, 255, 0)')
    gradient.append('stop').attr('offset', '50%').attr('stop-color', 'rgba(0, 240, 255, 0.8)')
    gradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(0, 240, 255, 0)')

    // 定义不同类型连接的流光颜色
    const flowColors = {
      proto: '#9d00ff', // 紫色
      prototype: '#f0ff00', // 黄色
      constructor: '#00f0ff', // 青色
    }

    // 为每种类型的连接创建渐变
    Object.entries(flowColors).forEach(([type, color]) => {
      const flowGradient = defs
        .append('linearGradient')
        .attr('id', `flow-${type}-gradient`)
        .attr('gradientUnits', 'userSpaceOnUse')

      flowGradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', `${color}`)
        .attr('stop-opacity', '0.8')

      flowGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', `${color}`)
        .attr('stop-opacity', '0')
    })

    // 箭头标记
    const arrows = defs
      .selectAll('marker')
      .data(['proto', 'prototype', 'constructor'])
      .enter()
      .append('marker')
      .attr('id', (d) => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')

    arrows
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('class', (d) => `link-${d}`)
  }

  // 渲染节点
  renderNode(node) {
    const nodeG = this.nodesG
      .append('g')
      .attr('class', `node ${node.type}`)
      .attr('transform', `translate(${node.position.x},${node.position.y})`)

    // 计算实际需要的高度
    const headerHeight = 36 // 标题栏高度
    const propertyHeight = 34 // 每个属性行的高度
    const padding = 8 // 上下内边距
    const totalHeight = headerHeight + node.properties.length * propertyHeight + padding * 2

    // 创建外部容器
    const foreign = nodeG
      .append('foreignObject')
      .attr('width', 420)
      .attr('height', totalHeight)
      .attr('x', 0)
      .attr('y', 0)

    // 创建节点卡片
    const card = foreign
      .append('xhtml:div')
      .attr('class', 'node-card')
      .style('height', `${totalHeight}px`)

    // 添加连接点
    nodeG
      .append('circle')
      .attr('class', 'input-port')
      .attr('cx', 0)
      .attr('cy', 18)
      .attr('r', 4)
      .style('fill', '#00f0ff')
      .style('filter', 'drop-shadow(0 0 2px #00f0ff)')

    nodeG
      .append('circle')
      .attr('class', 'output-port')
      .attr('cx', 420)
      .attr('cy', 18)
      .attr('r', 4)
      .style('fill', '#00f0ff')
      .style('filter', 'drop-shadow(0 0 2px #00f0ff)')

    // 创建标题栏
    const header = card.append('div').attr('class', 'node-header')

    header.append('div').attr('class', 'node-title').text(node.name)

    header.append('div').attr('class', 'node-type').text(node.type)

    // 创建属性列表
    const content = card.append('div').attr('class', 'node-content')

    const propertyRows = content
      .selectAll('.property-row')
      .data(node.properties)
      .enter()
      .append('div')
      .attr('class', 'property-row')

    // 创建属性名称元素
    const propertyNames = propertyRows
      .append('div')
      .attr('class', 'property-name')
      .text((d) => d.name)
      .on('click', (event, d) => {
        if (d.mdnLink) {
          window.open(d.mdnLink, '_blank')
        }
      })

    // 添加属性悬停提示
    propertyNames.each((d, i, nodes) => {
      const propertyName = nodes[i]
      const descriptor = d.descriptor

      if (descriptor) {
        const tooltip = document.createElement('div')
        tooltip.className = 'tooltip'
        document.body.appendChild(tooltip)

        d3.select(propertyName)
          .on('mouseover', (event) => {
            const tooltipContent = this.getPropertyDescription(descriptor)
            tooltip.innerHTML = tooltipContent
            tooltip.style.display = 'block'
            tooltip.style.left = event.pageX + 10 + 'px'
            tooltip.style.top = event.pageY + 10 + 'px'
          })
          .on('mousemove', (event) => {
            tooltip.style.left = event.pageX + 10 + 'px'
            tooltip.style.top = event.pageY + 10 + 'px'
          })
          .on('mouseout', () => {
            tooltip.style.display = 'none'
          })
      }
    })

    propertyRows
      .append('div')
      .attr('class', 'property-type')
      .attr('data-type', (d) => d.type)
      .text((d) => d.type)

    // 添加拖拽行为
    const dragHandler = d3
      .drag()
      .on('start', (event) => {
        const draggedNode = this.nodes.get(node.id).node
        draggedNode.isDragging = true
        const transform = d3.zoomTransform(this.svg.node())
        draggedNode.dragOffset = {
          x: draggedNode.position.x - (event.x - transform.x) / transform.k,
          y: draggedNode.position.y - (event.y - transform.y) / transform.k,
        }
      })
      .on('drag', (event) => {
        const draggedNode = this.nodes.get(node.id).node
        const transform = d3.zoomTransform(this.svg.node())
        const newX = (event.x - transform.x) / transform.k + draggedNode.dragOffset.x
        const newY = (event.y - transform.y) / transform.k + draggedNode.dragOffset.y

        draggedNode.setPosition(newX, newY)
        nodeG.attr('transform', `translate(${newX},${newY})`)

        this.updateConnectedLinks(draggedNode)
      })
      .on('end', (event) => {
        const draggedNode = this.nodes.get(node.id).node
        draggedNode.isDragging = false
        delete draggedNode.dragOffset
      })

    nodeG.call(dragHandler)

    this.nodes.set(node.id, { node, element: nodeG })

    return nodeG
  }

  // 获取属性描述
  getPropertyDescription(descriptor) {
    const parts = []

    // 添加属性特性描述
    const attributes = []
    if (descriptor.configurable) attributes.push('可配置的')
    if (descriptor.enumerable) attributes.push('可枚举的')
    if (descriptor.writable) attributes.push('可写的')
    if (attributes.length > 0) {
      parts.push(`<div>特性：${attributes.join('、')}</div>`)
    }

    // 添加属性类型和值
    if (descriptor.get || descriptor.set) {
      parts.push('<div>类型：访问器属性</div>')
      if (descriptor.get) parts.push('<div>getter: ✓</div>')
      if (descriptor.set) parts.push('<div>setter: ✓</div>')
    } else {
      parts.push(`<div>类型：数据属性</div>`)
      if (descriptor.value !== undefined) {
        const valueType = typeof descriptor.value
        let valueStr = descriptor.value
        if (valueType === 'function') {
          valueStr = 'ƒ ()'
        } else if (valueType === 'object') {
          valueStr = descriptor.value === null ? 'null' : '{...}'
        }
        parts.push(`<div>值：${valueStr}</div>`)
      }
    }

    return parts.join('')
  }

  // 渲染连接线
  renderLink(link) {
    const linkG = this.linksG
      .append('g')
      .attr('class', `link-group link-${link.type}-group`)
      .style('pointer-events', 'none')

    const path = linkG
      .append('path')
      .attr('class', `link link-${link.type}`)
      .style('pointer-events', 'none')

    // 创建流光动画组
    const flowGroup = linkG.append('g').attr('class', 'flow-group')

    const glowCircle = flowGroup
      .append('circle')
      .attr('r', 4)
      .attr('class', `link-flow link-${link.type}-flow`)
      .style('pointer-events', 'none')
      .style('fill', link.type === 'proto' ? '#9d00ff' : '#f0ff00')
      .style('filter', `drop-shadow(0 0 3px ${link.type === 'proto' ? '#9d00ff' : '#f0ff00'})`)

    const animation = glowCircle
      .append('animateMotion')
      .attr('dur', '3s')
      .attr('repeatCount', 'indefinite')

    // 更新路径
    const updatePath = () => {
      const d = link.generatePath()
      path.attr('d', d)
      animation.attr('path', d)
    }

    updatePath()
    link.pathElement = path.node()

    // 存储连接线引用
    this.links.set(link.id, {
      link,
      element: linkG,
      updatePath,
      path,
      flowGroup,
      glowCircle,
      animation,
    })

    return path
  }

  // 重置视图
  resetView() {
    this.svg.transition().duration(750).call(this.zoom.transform, d3.zoomIdentity)
  }

  // 导出为SVG
  exportSVG() {
    const svgData = this.svg.node().outerHTML
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'prototype-chain.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  // 更新与节点相关的所有连接线
  updateConnectedLinks(node) {
    this.links.forEach(({ link, element, path, flowGroup }) => {
      if (link.source === node || link.target === node) {
        // 移除旧的流光动画组
        flowGroup.remove()

        // 创建新的流光动画组
        const newFlowGroup = element.append('g').attr('class', 'flow-group')

        const glowCircle = newFlowGroup
          .append('circle')
          .attr('r', 4)
          .attr('class', `link-flow link-${link.type}-flow`)
          .style('pointer-events', 'none')
          .style('fill', link.type === 'proto' ? '#9d00ff' : '#f0ff00')
          .style('filter', `drop-shadow(0 0 3px ${link.type === 'proto' ? '#9d00ff' : '#f0ff00'})`)

        const animation = glowCircle
          .append('animateMotion')
          .attr('dur', '3s')
          .attr('repeatCount', 'indefinite')

        // 更新路径
        const d = link.generatePath()
        path.attr('d', d)
        animation.attr('path', d)

        // 更新引用
        this.links.get(link.id).flowGroup = newFlowGroup
        this.links.get(link.id).glowCircle = glowCircle
        this.links.get(link.id).animation = animation
      }
    })
  }

  // 添加图例说明
  addLegend() {
    const legend = document.createElement('div')
    legend.style.cssText = `
      position: fixed;
      top: 15px;
      right: 15px;
      background: rgba(13, 17, 23, 0.95);
      padding: 15px;
      border-radius: 4px;
      border: 1px solid rgba(157, 0, 255, 0.3);
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
      color: #fff;
      font-family: 'Monaco', 'Courier New', monospace;
      z-index: 1000;
      min-width: 200px;
      backdrop-filter: blur(10px);
    `

    const relationships = [
      {
        name: '__proto__',
        color: '#9d00ff',
        style: 'dashed',
      },
      {
        name: 'prototype',
        color: '#f0ff00',
        style: 'solid',
      },
    ]

    relationships.forEach((rel) => {
      const item = document.createElement('div')
      item.style.cssText = `
        display: flex;
        align-items: center;
        margin: 8px 0;
      `

      const line = document.createElement('div')
      line.style.cssText = `
        width: 30px;
        height: 2px;
        margin-right: 10px;
        background: ${rel.color};
        box-shadow: 0 0 5px ${rel.color};
      `
      if (rel.style === 'dashed') {
        line.style.borderTop = `1px dashed ${rel.color}`
        line.style.background = 'transparent'
      }

      const name = document.createElement('div')
      name.style.cssText = `
        font-size: 12px;
        color: #fff;
      `
      name.textContent = rel.name

      item.appendChild(line)
      item.appendChild(name)
      legend.appendChild(item)
    })

    document.body.appendChild(legend)
  }
}
