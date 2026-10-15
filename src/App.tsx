import { useEffect, useState } from 'react'
import { CURRICULUM, MODULES } from './data/curriculum'
import { applyLeave, deadlineOf, generate, groupByDate, lastDate, minDailyFor, schedulePending, today, totalMinutes } from './utils/scheduler'
import { load, save, Profile, State } from './utils/storage'

type View = 'home' | 'setup' | 'app'
type Sec = 'Dashboard' | 'My Learning Path' | 'Topics' | 'Timetable' | 'Progress' | 'Profile'
const SECS: Sec[] = ['Dashboard', 'My Learning Path', 'Topics', 'Timetable', 'Progress', 'Profile']
const hrs = (m: number) => `${(m / 60).toFixed(1)} h`
const fmt = (s: string) => new Date(s + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
const blank = (role: Profile['role']): Profile => role === 'Student'
  ? { name: '', role, level: 'Undergraduate Student', field: 'Computer Science / Information Technology', goal: 'Full Stack Web Development', dailyMin: 120, days: 60 }
  : { name: '', role, level: 'Beginner', field: 'Working Professional', goal: 'Full Stack Web Development', dailyMin: 90, days: 90 }

function Bar({ pct }: { pct: number }) {
  return <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${pct}%` }} /></div>
}

export default function App() {
  const [state, setState] = useState<State | null>(() => load())
  const [view, setView] = useState<View>('home')
  const [sec, setSec] = useState<Sec>('Dashboard')
  const [draft, setDraft] = useState<Profile | null>(null)
  const [msg, setMsg] = useState('')
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [leaveDate, setLeaveDate] = useState(today())
  const [leaveErr, setLeaveErr] = useState('')
  useEffect(() => save(state), [state])

  const start = () => (state ? setView('app') : (setDraft(null), setView('setup')))
  const nav = (
    <header className="nav">
      <button className="logo" onClick={() => setView('home')}><span className="mark">◢</span> CareerPath</button>
      <nav><button className={view === 'home' ? 'on' : ''} onClick={() => setView('home')}>Home</button>
        <button className={view === 'app' ? 'on' : ''} onClick={start}>Dashboard</button></nav>
      <button className="avatar" aria-label="Profile" onClick={() => { if (state) { setView('app'); setSec('Profile') } else start() }}>{(state?.profile.name || 'U')[0].toUpperCase()}</button>
    </header>)

  if (view === 'home') return <div>{nav}
    <main className="hero">
      <div><h1>Build Your Career, One Day at a Time.</h1>
        <p className="muted">CareerPath turns a career goal into a personalized learning path and a daily timetable that adapts when life gets in the way.</p>
        <button className="btn primary" onClick={start}>Build My Career Path</button>
        <ul className="feats"><li><b>Personalized Paths</b><span>Matched to your role and goal.</span></li><li><b>Daily Learning Plan</b><span>Tasks sized to your study time.</span></li><li><b>Smart Rescheduling</b><span>Take leave; the plan adjusts.</span></li></ul></div>
      <aside className="card preview" aria-label="Schedule preview"><h3>This week</h3>
        {[['Mon','Tags, Text and Links','90 min'],['Tue','Forms and Semantic HTML','90 min'],['Wed','Selectors and Box Model','120 min'],['Thu','Leave day','Rescheduled']].map(([d,t,m]) => <div className="row" key={d}><b>{d}</b><span>{t}</span><em>{m}</em></div>)}
        <Bar pct={35} /><small className="muted">Illustrative preview</small></aside>
    </main>
    <footer className="foot"><b>CareerPath</b> — a sample learning planner. Paths are sample career paths, not official recommendations.</footer></div>

  if (view === 'setup') {
    const p = draft
    const upd = (k: keyof Profile, v: string | number) => setDraft({ ...p!, [k]: v } as Profile)
    const submit = () => {
      if (!p) return
      const s = today()
      setState({ profile: p, start: s, assignments: generate(CURRICULUM, s, p.dailyMin, []), done: [], leaves: [] })
      setSec('Dashboard'); setView('app')
    }
    return <div>{nav}<main className="narrow">
      <h2>Choose your role</h2>
      <div className="grid2">{(['Student', 'Professional'] as const).map(r =>
        <button key={r} className={`card choice ${p?.role === r ? 'sel' : ''}`} aria-pressed={p?.role === r} onClick={() => setDraft(blank(r))}>
          <b>{r}</b><span className="muted">{r === 'Student' ? 'Studying and building skills for a first role.' : 'Working and upskilling or switching tracks.'}</span></button>)}</div>
      {!p && <p className="empty">Select a role to continue.</p>}
      {p && <form className="card form" onSubmit={e => { e.preventDefault(); submit() }}>
        <label>Name (optional)<input value={p.name} onChange={e => upd('name', e.target.value)} /></label>
        {p.role === 'Student' ? <>
          <label>Education level<select value={p.level} onChange={e => upd('level', e.target.value)}><option>Undergraduate Student</option><option>Postgraduate Student</option></select></label>
          <label>Field of study<select value={p.field} onChange={e => upd('field', e.target.value)}><option>Computer Science / Information Technology</option><option>Other Engineering</option></select></label></> : <>
          <label>Experience level<select value={p.field} onChange={e => upd('field', e.target.value)}><option>Working Professional</option></select></label>
          <label>Current skill level<select value={p.level} onChange={e => upd('level', e.target.value)}><option>Beginner</option><option>Intermediate</option></select></label></>}
        <label>Career goal<select value={p.goal} onChange={e => upd('goal', e.target.value)}><option>Full Stack Web Development</option></select></label>
        <label>Complete within<select value={p.days} onChange={e => upd('days', Number(e.target.value))}>{[30, 60, 90].map(d => <option key={d} value={d}>{d} days</option>)}</select></label>
        <label>Daily study time<select value={p.dailyMin} onChange={e => upd('dailyMin', Number(e.target.value))}>{[60, 90, 120, 180, 240].map(m => <option key={m} value={m}>{m} min</option>)}</select></label>
        <button className="btn primary" type="submit" disabled={!p.level || !p.goal || !p.days}>Generate My Learning Plan</button></form>}
      <button className="btn" onClick={() => setView('home')}>Back</button></main></div>
  }

  if (!state) { setView('home'); return null }
  const { profile, assignments, done, leaves } = state
  const total = CURRICULUM.length, nDone = done.length
  const pct = Math.round((nDone / total) * 100)
  const t0 = today()
  const overdue = CURRICULUM.filter(t => !done.includes(t.id) && assignments[t.id] < t0)
  const deadline = deadlineOf(state.start, profile.days)
  const projected = lastDate(assignments)
  const late = projected > deadline
  const need = minDailyFor(CURRICULUM, state.start, profile.days, leaves)
  const todays = CURRICULUM.filter(t => !done.includes(t.id) && assignments[t.id] === t0)
  const toggle = (id: string) => setState({ ...state, done: done.includes(id) ? done.filter(i => i !== id) : [...done, id] })
  const setProfile = (np: Profile) => setState({ ...state, profile: np })
  const regenerate = (daily = profile.dailyMin) => {
    const from = t0 > state.start ? t0 : state.start
    setState({ ...state, profile: { ...profile, dailyMin: daily }, assignments: schedulePending(CURRICULUM, assignments, done, from, daily, leaves) })
    setMsg(`Timetable regenerated at ${daily} min/day. Completed topics kept their dates.`)
  }
  const confirmLeave = () => {
    const r = applyLeave(CURRICULUM, assignments, done, leaves, leaveDate, state.start, profile.dailyMin)
    if (!r) { setLeaveErr('That date is already a leave day.'); return }
    setState({ ...state, leaves: r.leaves, assignments: r.assignments })
    const end = lastDate(r.assignments)
    setMsg(`Leave saved for ${fmt(leaveDate)}. ${r.moved} task(s) moved to later days, order preserved. New completion date: ${fmt(end)}${end > deadline ? ' — past your deadline. Increase daily study time or regenerate.' : '.'}`)
    setLeaveOpen(false); setLeaveErr('')
  }
  const reset = () => { if (window.confirm('Reset your learning plan? Profile, progress and leave days will be deleted.')) { setState(null); setMsg(''); setView('home') } }
  const openLeave = () => { setLeaveOpen(true); setLeaveErr('') }

  const TopicRow = ({ t }: { t: typeof CURRICULUM[number] }) => {
    const ok = done.includes(t.id), od = !ok && assignments[t.id] < t0
    return <li className={`topic ${ok ? 'done' : ''}`}>
      <label><input type="checkbox" checked={ok} onChange={() => toggle(t.id)} /><span><b>{t.title}</b><small className="muted">{t.module} · {t.description}</small></span></label>
      <span className="meta"><em>{t.minutes} min</em><span className={`tag ${ok ? 'ok' : od ? 'bad' : ''}`}>{ok ? 'Completed' : od ? 'Overdue' : fmt(assignments[t.id])}</span></span></li>
  }
  const Actions = <div className="actions"><button className="btn primary" onClick={openLeave}>Take a Leave</button><button className="btn" onClick={() => regenerate()}>Regenerate Timetable</button></div>

  return <div>{nav}<div className="shell">
    <aside className="side">{SECS.map(s => <button key={s} className={sec === s ? 'on' : ''} onClick={() => setSec(s)}>{s}</button>)}</aside>
    <main className="content">
      {msg && <div className="note" role="status">{msg}<button onClick={() => setMsg('')} aria-label="Dismiss">×</button></div>}
      {late && <div className="note warn">At {profile.dailyMin} min/day your plan ends {fmt(projected)}, after your {fmt(deadline)} deadline. <button className="btn small" onClick={() => regenerate(need)}>Use {need} min/day</button></div>}

      {sec === 'Dashboard' && <>
        <h2>Welcome{profile.name ? `, ${profile.name}` : ''}</h2>
        <p className="muted">{profile.role} · {profile.level} · Goal: {profile.goal}</p>
        <div className="stats">{[['Progress', pct + '%'], ['Completed', nDone], ['Pending', total - nDone], ['Overdue', overdue.length], ['Topics', total], ['Total time', hrs(totalMinutes(CURRICULUM))]].map(([k, v]) => <div className="card stat" key={String(k)}><small className="muted">{k}</small><b>{v}</b></div>)}</div>
        <Bar pct={pct} />
        <p className="muted">Start {fmt(state.start)} · Target {fmt(deadline)} ({profile.days} days) · Projected finish {fmt(projected)}</p>
        {Actions}
        <h3>Today's tasks</h3>{todays.length ? <ul className="list">{todays.map(t => <TopicRow key={t.id} t={t} />)}</ul> : <p className="empty">Nothing scheduled today. Check the timetable for your next study day.</p>}
        <h3>Upcoming</h3><ul className="list">{CURRICULUM.filter(t => !done.includes(t.id) && assignments[t.id] > t0).slice(0, 4).map(t => <TopicRow key={t.id} t={t} />)}</ul></>}

      {sec === 'My Learning Path' && <><h2>Full Stack Web Development</h2>
        <p className="muted">A sample career path (not an official recommendation) from HTML to a deployed portfolio project. The path is shared by students and professionals; pace comes from your daily study time.</p>
        {MODULES.map(m => { const ts = CURRICULUM.filter(t => t.module === m), d = ts.filter(t => done.includes(t.id)).length
          return <div className="card" key={m}><div className="dayhead"><b>{m}</b><em>{d}/{ts.length} topics · {hrs(totalMinutes(ts))}</em></div><Bar pct={Math.round(d / ts.length * 100)} /></div> })}</>}

      {sec === 'Topics' && <><h2>Topics</h2><ul className="list">{CURRICULUM.map(t => <TopicRow key={t.id} t={t} />)}</ul></>}

      {sec === 'Timetable' && <><h2>Timetable</h2>{Actions}
        {groupByDate(CURRICULUM, assignments).map(([d, ts]) => <div className="card" key={d}><div className="dayhead"><b>{fmt(d)}{d === t0 ? ' (today)' : ''}</b><em>{ts.reduce((s, t) => s + t.minutes, 0)} min</em></div><ul className="list">{ts.map(t => <TopicRow key={t.id} t={t} />)}</ul></div>)}
        {leaves.length > 0 && <p className="muted">Leave days: {leaves.map(fmt).join(', ')}</p>}</>}

      {sec === 'Progress' && <><h2>Progress</h2><p className="big">{pct}%</p><Bar pct={pct} /><p className="muted">{nDone} of {total} topics complete · {hrs(CURRICULUM.filter(t => done.includes(t.id)).reduce((s, t) => s + t.minutes, 0))} of {hrs(totalMinutes(CURRICULUM))} studied · {overdue.length} overdue</p></>}

      {sec === 'Profile' && <><h2>Profile</h2><div className="card form">
        <label>Name<input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></label>
        <label>Role<select value={profile.role} onChange={e => setProfile({ ...blank(e.target.value as Profile['role']), name: profile.name, dailyMin: profile.dailyMin, days: profile.days })}><option>Student</option><option>Professional</option></select></label>
        <label>{profile.role === 'Student' ? 'Education level' : 'Skill level'}<input value={profile.level} onChange={e => setProfile({ ...profile, level: e.target.value })} /></label>
        <label>Career goal<select value={profile.goal} onChange={e => setProfile({ ...profile, goal: e.target.value })}><option>Full Stack Web Development</option></select></label>
        <label>Target period<select value={profile.days} onChange={e => setProfile({ ...profile, days: Number(e.target.value) as Profile['days'] })}>{[30, 60, 90].map(d => <option key={d} value={d}>{d} days</option>)}</select></label>
        <label>Daily study time<select value={profile.dailyMin} onChange={e => regenerate(Number(e.target.value))}>{[60, 90, 120, 180, 240].map(m => <option key={m} value={m}>{m} min</option>)}</select></label>
        <button className="btn danger" onClick={reset}>Reset Learning Plan</button></div></>}
    </main></div>
    {leaveOpen && <div className="overlay" role="dialog" aria-modal="true" aria-label="Take a leave"><div className="card modal">
      <h3>Take a leave</h3><p className="muted">Tasks on this day move to the next study days, in the same order.</p>
      <label>Leave date<input type="date" min={state.start} value={leaveDate} onChange={e => setLeaveDate(e.target.value)} /></label>
      {leaveErr && <p className="err">{leaveErr}</p>}
      <div className="actions"><button className="btn" onClick={() => setLeaveOpen(false)}>Cancel</button><button className="btn primary" disabled={!leaveDate} onClick={confirmLeave}>Confirm leave</button></div></div></div>}
  </div>
}
