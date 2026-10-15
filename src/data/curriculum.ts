export interface Topic { id: string; title: string; module: string; description: string; minutes: number }
const m = (module: string, items: [string, string, number][]): Topic[] =>
  items.map(([title, description, minutes], i) => ({ id: `${module.toLowerCase().replace(/[^a-z]+/g, '-')}-${i + 1}`, title, module, description, minutes }))
export const MODULES = ['HTML Fundamentals','CSS Fundamentals','Responsive Web Design','JavaScript Fundamentals','JavaScript DOM and Events','Git and GitHub','React Fundamentals','React Components and State','API Integration Basics','Final Portfolio Project']
export const CURRICULUM: Topic[] = [
  ...m(MODULES[0], [['Tags, Text and Links','Document structure, headings, links, images.',90],['Forms and Semantic HTML','Inputs, labels, semantic layout elements.',90]]),
  ...m(MODULES[1], [['Selectors and Box Model','Selectors, specificity, spacing, borders.',120],['Colors, Fonts and Flexbox','Typography, color variables, flex layouts.',120]]),
  ...m(MODULES[2], [['Media Queries','Breakpoints and mobile-first CSS.',90],['CSS Grid Layouts','Grid areas, auto-fit columns.',90]]),
  ...m(MODULES[3], [['Variables, Types and Operators','let/const, types, conditionals.',120],['Functions, Arrays and Objects','Functions, array methods, objects.',120]]),
  ...m(MODULES[4], [['Selecting and Changing the DOM','querySelector, text and attribute updates.',90],['Events and Mini Project','Event listeners, build a to-do app.',120]]),
  ...m(MODULES[5], [['Git Basics','init, add, commit, branches.',90],['GitHub Workflow','Remotes, push, pull requests.',90]]),
  ...m(MODULES[6], [['JSX and Project Setup','Vite, JSX, props.',90],['Component Composition','Splitting UI into components.',90]]),
  ...m(MODULES[7], [['useState and Events','State updates and handlers.',120],['useEffect and Lists','Effects, keys, rendering lists.',120]]),
  ...m(MODULES[8], [['Fetch and JSON','Promises, async/await, fetch.',90],['Loading and Error States','Show data from an API safely.',120]]),
  ...m(MODULES[9], [['Plan and Build Layout','Pick an idea, wireframe, build pages.',120],['Add Features','Interactivity and API data.',120],['Polish and Deploy','Responsive fixes, README, deploy.',120]]),
]
