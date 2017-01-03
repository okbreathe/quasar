export const BrightThemes = [
  { name: "Chrome", value: "chrome" },
  // { name: "Clouds", value: "clouds" },
  // { name: "Crimson Editor", value: "crimson_editor" },
  // { name: "Dawn", value: "dawn" },
  // { name: "Dreamweaver", value: "dreamweaver" },
  { name: "Eclipse", value: "eclipse" },
  { name: "GitHub", value: "github" },
  // { name: "IPlastic", value: "iplastic" },
  { name: "Solarized Light", value: "solarized_light" },
  { name: "TextMate", value: "textmate" },
  { name: "Tomorrow", value: "tomorrow" },
  { name: "XCode", value: "xcode" },
  // { name: "Kuroir", value: "kuroir" },
  // { name: "KatzenMilch", value: "katzenmilch" },
  // { name: "SQL Server", value: "sqlserver" },
]

export const DarkThemes = [
  { name: "Ambiance", value: "ambiance" },
  { name: "Chaos", value: "chaos" },
  { name: "Clouds Midnight", value: "clouds_midnight" },
  // { name: "Cobalt", value: "cobalt" },
  // { name: "Gruvbox", value: "gruvbox" },
  { name: "idle Fingers", value: "idle_fingers" },
  // { name: "krTheme", value: "kr_theme" },
  // { name: "Merbivore", value: "merbivore" },
  // { name: "Merbivore Soft", value: "merbivore_soft" },
  { name: "Mono Industrial", value: "mono_industrial" },
  { name: "Monokai", value: "monokai" },
  { name: "Pastel on dark", value: "pastel_on_dark" },
  { name: "Solarized Dark", value: "solarized_dark" },
  { name: "Terminal", value: "terminal" },
  { name: "Tomorrow Night", value: "tomorrow_night" },
  { name: "Tomorrow Night Blue", value: "tomorrow_night_blue" },
  { name: "Tomorrow Night Bright", value: "tomorrow_night_bright" },
  { name: "Tomorrow Night 80s", value: "tomorrow_night_eighties" },
  { name: "Twilight", value: "twilight" },
  { name: "Vibrant Ink", value: "vibrant_ink" },
]

export const EditorModes = [
  { name: "Normal", value: "" },
  { name: "Vim", value: "vim" },
  { name: "Emacs", value: "emacs" },
]

export const EditorColumns = [
  { name: "Split", value: "2" },
  { name: "Edit", value: "0" },
  { name: "View", value: "1" },
]

export const Fonts = [
  { name: 'Source Code Pro',  value: 'Source Code Pro', monospace: true },
  { name: 'Source Sans Pro',  value: 'Source Sans Pro'  },
  { name: 'Ubuntu',  value: 'Ubuntu'  },
  { name: 'Ubuntu Mono',  value: 'Ubuntu Mono', monospace: true },
]

export const StyleUnits = {
  font_size     : 'px',
  line_height   : 'rem',
  padding       : v => `0 ${v}px`,
  margin_bottom : "rem"
}

export const Palettes = [
  { name: 'Default', value: 'default' },
  { name: 'Material', vallue: 'material' }
]

export const Colors = {
  default: [
    "#333333",
    "#444444",
    "#555555",
    "#666666",
    "#3C5256",
    "#454B5E",
    "#4D465F",
    "#54425C",
    "#725061",
    "#8B6461",
    "#496A50",
    "#728259",
  ],
  material: [
    "#b71c1c",
    "#880e4f",
    "#4a148c",
    "#311b92",
    "#1a237e",
    "#0d47a1",
    "#01579b",
    "#006064",
    "#004d40",
    "#1b5e20",
    "#33691e",
    "#827717",
    "#f57f17",
    "#ff6f00",
    "#e65100",
    "#bf360c",
    "#3e2723",
    "#212121",
    "#263238",
  ]
}

export const AutoCompletion = [
  { name: "None", value: 0 },
  { name: "Basic", value: 1 },
  { name: "Live", value: 2 },
]

export const TabSizes = [
  { name: "2", value: 2 },
  { name: "4", value: 4 },
  { name: "8", value: 8 },
]

export default {
  AutoCompletion,
  BrightThemes,
  Colors,
  DarkThemes,
  EditorColumns ,
  EditorModes,
  Fonts,
  StyleUnits,
  TabSizes,
}
