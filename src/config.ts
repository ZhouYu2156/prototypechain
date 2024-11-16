import { DeepPartial } from './card'

/** 深层合并两个对象, 将第二个对象的属性合并到第一个对象上 */
export function deepMerge (target: any, source: any): any {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]))
    }
  }
  // 合并两个对象
  return { ...target, ...source }
}

export type CardConfig = {
  card: {
    x: number
    y: number
    width?: number
    height?: number
    radius: number
    hue: string
  }
  title: string
  header: {
    align: CanvasTextAlign
    baseline: CanvasTextBaseline
    fontSize: number
    fontFamily: string
    fg: string
    padding: number
  }
  splitLine: {
    width: number
    color: string
  }
  property: {
    align: CanvasTextAlign
    baseline: CanvasTextBaseline
    fontSize: number
    fontFamily: string
    fg: string
    padding: number
    blockPadding: number
  }
  properties: string[]
}

export const defaultCardConfig: CardConfig = {
  card: {
    x: 100,
    y: 100,
    width: 260,
    // height: 340,
    radius: 16,
    hue: 'rgba(10, 189, 91, 0.25)',
  },
  title: 'Object',
  header: {
    align: 'center',
    baseline: 'bottom',
    fontSize: 20,
    fontFamily: 'JetBrains Mono',
    fg: 'rgba(10, 189, 91, 0.95)',
    padding: 10,
  },
  splitLine: {
    width: 1,
    color: 'rgba(10, 189, 91, 0.95)',
  },
  property: {
    align: 'left',
    baseline: 'bottom',
    fontSize: 12,
    fontFamily: 'JetBrains Mono',
    fg: 'rgba(10, 189, 91, 0.95)',
    padding: 6,
    blockPadding: 10,
  },
  properties: [],
}

/** 卡片调色盘 */
export const Primary: DeepPartial<CardConfig> = {
  card: {
    hue: 'rgba(10, 189, 91, 0.25)',
  },
  header: {
    fg: 'rgba(10, 189, 91, 0.95)',
  },
  splitLine: {
    color: 'rgba(10, 189, 91, 0.95)',
  },
  property: {
    fg: 'rgba(10, 189, 91, 0.95)',
  }
}

export const Violet: DeepPartial<CardConfig> = {
  card: {
    hue: 'rgba(137, 43, 226, 0.25)',
  },
  header: {
    fg: 'rgba(137, 43, 226, 0.95)',
  },
  splitLine: {
    color: 'rgba(137, 43, 226, 0.95)',
  },
  property: {
    fg: 'rgba(137, 43, 226, 0.95)',
  }
}
export const SkyBlue: DeepPartial<CardConfig> = {
  card: {
    hue: 'rgba(255, 165, 0, 0.25)',
  },
  header: {
    fg: 'rgba(255, 165, 0, 0.95)',
  },
  splitLine: {
    color: 'rgba(255, 165, 0, 0.95)',
  },
  property: {
    fg: 'rgba(255, 165, 0, 0.95)',
  }
}
export const Gold: DeepPartial<CardConfig> = {
  card: {
    hue: 'rgba(255, 215, 0, 0.25)',
  },
  header: {
    fg: 'rgba(255, 215, 0, 0.95)',
  },
  splitLine: {
    color: 'rgba(255, 215, 0, 0.95)',
  },
  property: {
    fg: 'rgba(255, 215, 0, 0.95)',
  }
}

export const Teal: DeepPartial<CardConfig> = {
  card: {
    hue: 'rgba(0, 128, 128, 0.25)',
  },
  header: {
    fg: 'rgba(0, 128, 128, 0.95)',
  },
  splitLine: {
    color: 'rgba(0, 128, 128, 0.95)',
  },
  property: {
    fg: 'rgba(0, 128, 128, 0.95)',
  }
}

export const Orange: DeepPartial<CardConfig> = {
  card: {
    hue: 'rgba(255, 165, 0, 0.25)',
  },
  header: {
    fg: 'rgba(255, 165, 0, 0.95)',
  },
  splitLine: {
    color: 'rgba(255, 165, 0, 0.95)',
  },
  property: {
    fg: 'rgba(255, 165, 0, 0.95)',
  }
}

export const Red: DeepPartial<CardConfig> = {
  card: {
    hue: 'rgba(255, 0, 0, 0.25)',
  },
  header: {
    fg: 'rgba(255, 0, 0, 0.95)',
  },
  splitLine: {
    color: 'rgba(255, 0, 0, 0.95)',
  },
  property: {
    fg: 'rgba(255, 0, 0, 0.95)',
  }
}

/** 标准对象 */
export const StarndardObjects = [null, Object, Object.prototype, Function, Function.prototype]
/*[
  null,
  Object,
  String,
  Boolean,
  Number,
  Array,
  Function,
  RegExp,
  Object.prototype,
  Number.prototype,
  String.prototype,
  Array.prototype,
  Function.prototype,
  RegExp.prototype,
]*/


export const ColorPallet = [Primary, Violet, SkyBlue, Gold, Teal, Orange, Red]


export type Point = { x: number, y: number }