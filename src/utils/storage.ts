import { Assignments } from './scheduler'
export interface Profile { name: string; role: 'Student' | 'Professional'; level: string; field: string; goal: string; dailyMin: number; days: 30 | 60 | 90 }
export interface State { profile: Profile; start: string; assignments: Assignments; done: string[]; leaves: string[] }
const KEY = 'careerpath.v1'
const strs = (x: unknown): x is string[] => Array.isArray(x) && x.every(i => typeof i === 'string')
export function load(): State | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null')
    const p = s?.profile
    if (!p || !['Student', 'Professional'].includes(p.role) || typeof p.dailyMin !== 'number' || ![30, 60, 90].includes(p.days)) return null
    if (typeof s.start !== 'string' || typeof s.assignments !== 'object' || !strs(s.done) || !strs(s.leaves)) return null
    return s as State
  } catch { return null }
}
export const save = (s: State | null) => { try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY) } catch { /* storage unavailable */ } }
