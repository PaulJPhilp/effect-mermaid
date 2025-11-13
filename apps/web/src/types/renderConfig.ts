/**
 * Element-level rendering configuration for fine-grained control over diagram appearance
 * Controls styling for nodes, edges, labels, layout, and container properties
 */

export interface NodeRenderConfig {
  fontSize: string
  fontFamily: string
  borderWidth: number
  padding: number
  backgroundColor: string
}

export interface EdgeRenderConfig {
  lineWidth: number
  color: string
  style: 'solid' | 'dashed' | 'dotted'
  curve: 'basis' | 'linear' | 'cardinal' | 'monotoneX'
}

export interface LabelRenderConfig {
  fontSize: string
  backgroundColor: string
}

export interface LayoutRenderConfig {
  nodeSpacing: number
  rankSpacing: number
  padding: number
}

export interface ContainerRenderConfig {
  width?: string
  useMaxWidth: boolean
  backgroundColor: string
}

export interface ElementLevelRenderConfig {
  nodes: NodeRenderConfig
  edges: EdgeRenderConfig
  labels: LabelRenderConfig
  layout: LayoutRenderConfig
  container: ContainerRenderConfig
}

/**
 * Default rendering configuration - based on Mermaid defaults
 */
export const DEFAULT_RENDER_CONFIG: ElementLevelRenderConfig = {
  nodes: {
    fontSize: '16px',
    fontFamily: 'trebuchet ms, verdana, arial, sans-serif',
    borderWidth: 2,
    padding: 15,
    backgroundColor: '#ECECFF',
  },
  edges: {
    lineWidth: 2,
    color: '#333333',
    style: 'solid',
    curve: 'basis',
  },
  labels: {
    fontSize: '14px',
    backgroundColor: '#ffffff',
  },
  layout: {
    nodeSpacing: 50,
    rankSpacing: 50,
    padding: 15,
  },
  container: {
    useMaxWidth: true,
    backgroundColor: 'transparent',
  },
};

/**
 * Presentation preset - optimized for slides and presentations
 */
export const PRESENTATION_PRESET: ElementLevelRenderConfig = {
  ...DEFAULT_RENDER_CONFIG,
  nodes: {
    ...DEFAULT_RENDER_CONFIG.nodes,
    fontSize: '18px',
    padding: 20,
  },
  edges: {
    ...DEFAULT_RENDER_CONFIG.edges,
    lineWidth: 3,
  },
  labels: {
    ...DEFAULT_RENDER_CONFIG.labels,
    fontSize: '16px',
  },
  layout: {
    ...DEFAULT_RENDER_CONFIG.layout,
    nodeSpacing: 60,
    rankSpacing: 60,
    padding: 20,
  },
};

/**
 * Print preset - optimized for printing and PDF export
 */
export const PRINT_PRESET: ElementLevelRenderConfig = {
  ...DEFAULT_RENDER_CONFIG,
  nodes: {
    ...DEFAULT_RENDER_CONFIG.nodes,
    fontSize: '12px',
    borderWidth: 1,
  },
  edges: {
    ...DEFAULT_RENDER_CONFIG.edges,
    lineWidth: 1,
  },
  labels: {
    ...DEFAULT_RENDER_CONFIG.labels,
    fontSize: '11px',
  },
  layout: {
    ...DEFAULT_RENDER_CONFIG.layout,
    nodeSpacing: 40,
    rankSpacing: 40,
    padding: 10,
  },
};

/**
 * Compact preset - minimized spacing for smaller displays
 */
export const COMPACT_PRESET: ElementLevelRenderConfig = {
  ...DEFAULT_RENDER_CONFIG,
  nodes: {
    ...DEFAULT_RENDER_CONFIG.nodes,
    fontSize: '13px',
    padding: 10,
  },
  edges: {
    ...DEFAULT_RENDER_CONFIG.edges,
    lineWidth: 1.5,
  },
  labels: {
    ...DEFAULT_RENDER_CONFIG.labels,
    fontSize: '12px',
  },
  layout: {
    ...DEFAULT_RENDER_CONFIG.layout,
    nodeSpacing: 30,
    rankSpacing: 30,
    padding: 8,
  },
};

export type RenderPreset = 'default' | 'presentation' | 'print' | 'compact'

export const PRESETS: Record<RenderPreset, ElementLevelRenderConfig> = {
  default: DEFAULT_RENDER_CONFIG,
  presentation: PRESENTATION_PRESET,
  print: PRINT_PRESET,
  compact: COMPACT_PRESET,
}

/**
 * Convert ElementLevelRenderConfig to Mermaid config format
 */
export function toMermaidConfig(config: ElementLevelRenderConfig): {
  themeVariables: Record<string, string | number>
  flowchart: Record<string, string | number>
} {
  return {
    themeVariables: {
      // Primary colors based on node background
      primaryColor: config.nodes.backgroundColor,
      primaryBorderColor: adjustColor(config.nodes.backgroundColor, -20),
      primaryTextColor: getContrastColor(config.nodes.backgroundColor),

      // Font settings
      fontFamily: config.nodes.fontFamily,
      fontSize: config.nodes.fontSize,
      nodeFontSize: config.nodes.fontSize,
      edgeLabelFontSize: config.labels.fontSize,

      // Edge/line settings
      lineColor: config.edges.color,

      // Label settings
      edgeLabelBackground: config.labels.backgroundColor,

      // Other element colors (secondary, tertiary)
      secondaryColor: '#006064',
      secondaryBorderColor: '#004D4F',
      tertiaryColor: '#FFF2CC',
      tertiaryBorderColor: '#FFD700',
    },
    flowchart: {
      nodeSpacing: config.layout.nodeSpacing,
      rankSpacing: config.layout.rankSpacing,
      padding: config.layout.padding,
      curve: config.edges.curve,
    },
  }
}

/**
 * Helper function to adjust color brightness
 */
function adjustColor(color: string, percent: number): string {
  // Simple brightness adjustment - in production, use a library like chroma.js
  return color
}

/**
 * Helper function to determine contrast color (black or white)
 */
function getContrastColor(hexColor: string): string {
  // Simplified luminance calculation
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? '#000000' : '#ffffff'
}
