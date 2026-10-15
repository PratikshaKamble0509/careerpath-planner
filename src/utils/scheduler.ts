import { Topic } from '../data/curriculum'
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (s: string, n: number) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d) }
export const today = () => iso(new Date())
export const deadlineOf = (start: string, days: number) => addDays(start, days - 1)

export type Assignments = Record<string, string> // topicId -> date

/** Keeps completed topics on their dates; packs pending topics in order from `from`, skipping leave days. */
export function schedulePending(topics: Topic[], prev: Assignments, done: string[], from: string, dailyMin: number, leaves: string[]): Assignments {
  const out: Assignments = {}
  topics.forEach(t => { if (done.includes(t.id) && prev[t.id]) out[t.id] = prev[t.id] })
  let day = from, used = 0
  for (const t of topics) {
    if (done.includes(t.id)) continue
    while (leaves.includes(day)) { day = addDays(day, 1); used = 0 }
    if (used > 0 && used + t.minutes > dailyMin) { day = addDays(day, 1); used = 0; while (leaves.includes(day)) day = addDays(day, 1) }
    out[t.id] = day; used += t.minutes // a single topic longer than the daily limit still gets its own day
  }
  return out
}
export const generate = (topics: Topic[], start: string, dailyMin: number, leaves: string[]) => schedulePending(topics, {}, [], start, dailyMin, leaves)

export const lastDate = (a: Assignments) => Object.values(a).sort().pop() ?? ''
export const totalMinutes = (topics: Topic[]) => topics.reduce((s, t) => s + t.minutes, 0)
/** Minimum daily minutes (in steps of 15) that would fit the deadline. */
export function minDailyFor(topics: Topic[], start: string, days: number, leaves: string[]) {
  for (let m = 30; m <= 600; m += 15) if (lastDate(generate(topics, start, m, leaves)) <= deadlineOf(start, days)) return m
  return 600
}
export function groupByDate(topics: Topic[], a: Assignments) {
  const g: Record<string, Topic[]> = {}
  topics.forEach(t => { if (a[t.id]) (g[a[t.id]] ||= []).push(t) })
  return Object.entries(g).sort(([x], [y]) => x.localeCompare(y))
}
/** Take a leave: save the date, drop that day's tasks, push pending work forward in original order. */
export function applyLeave(topics: Topic[], a: Assignments, done: string[], leaves: string[], leave: string, start: string, dailyMin: number) {
  if (leaves.includes(leave)) return null
  const newLeaves = [...leaves, leave].sort()
  const from = today() > start ? today() : start
  const moved = topics.filter(t => !done.includes(t.id) && a[t.id] === leave).length
  return { leaves: newLeaves, assignments: schedulePending(topics, a, done, from, dailyMin, newLeaves), moved }
}
