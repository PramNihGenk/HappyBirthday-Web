import { PEOPLE, isBirthdayToday, getBirthdayString, getAge } from '../data/people'

export default function DashboardSidebarLeft({
  selectedPerson,
  onSelectPerson,
  onHighlightPerson,
  mockDate,
}) {
  const targetDate = mockDate ? new Date(mockDate) : new Date()

  // Find celebrant(s) today
  const todayCelebrants = PEOPLE.filter((p) => isBirthdayToday(p, mockDate))

  // Calculate days remaining until next birthday for each person
  const peopleWithCountdown = PEOPLE.map((person) => {
    const isToday = isBirthdayToday(person, mockDate)
    const thisYear = targetDate.getFullYear()
    let nextBday = new Date(thisYear, person.birthday.month - 1, person.birthday.day)

    // If birthday already passed this year, next is next year
    if (nextBday < targetDate && !isToday) {
      nextBday = new Date(thisYear + 1, person.birthday.month - 1, person.birthday.day)
    }

    const diffTime = nextBday - targetDate
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      ...person,
      isToday,
      diffDays: isToday ? 0 : diffDays,
      age: getAge(person, mockDate),
      formattedBday: getBirthdayString(person),
    }
  }).sort((a, b) => {
    // Put today's celebrants first, then by closest diffDays
    if (a.isToday && !b.isToday) return -1
    if (!a.isToday && b.isToday) return 1
    return a.diffDays - b.diffDays
  })

  return (
    <aside className="dashboard-sidebar sidebar-left">
      {/* Widget 1: Today's Spotlight / Alert */}
      {todayCelebrants.length > 0 ? (
        <div className="dash-card celebrant-spotlight-card">
          <div className="spotlight-badge">
            <span className="pulse-icon">🎉</span>
            <span>HARI SPESIAL HARI INI!</span>
          </div>
          {todayCelebrants.map((p) => (
            <div key={p.id} className="spotlight-content">
              <div className="spotlight-avatar">{p.emoji}</div>
              <div className="spotlight-info">
                <h4 className="spotlight-name">{p.name}</h4>
                <p className="spotlight-sub">
                  Ulang tahun ke-{getAge(p, mockDate)} • {getBirthdayString(p)}
                </p>
              </div>
              <button
                type="button"
                className="btn-spotlight-action"
                onClick={() => onSelectPerson(p)}
              >
                <span>Buka Kejutan 🎁</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="dash-card countdown-next-card">
          <div className="card-mini-header">
            <span className="mini-icon">📅</span>
            <span className="mini-title">Ulang Tahun Terdekat</span>
          </div>
          {peopleWithCountdown.length > 0 && (
            <div className="next-celebrant-row">
              <div className="next-avatar">{peopleWithCountdown[0].emoji}</div>
              <div className="next-info">
                <strong>{peopleWithCountdown[0].name}</strong>
                <span>{peopleWithCountdown[0].formattedBday}</span>
              </div>
              <span className="countdown-pill">
                {peopleWithCountdown[0].diffDays} hari lagi
              </span>
            </div>
          )}
        </div>
      )}

      {/* Widget 2: Circle Sahabat Timeline */}
      <div className="dash-card circle-roster-card">
        <div className="card-mini-header">
          <span className="mini-icon">👥</span>
          <span className="mini-title">FEYEPE AREA (12)</span>
          <span className="roster-count-badge">Terverifikasi</span>
        </div>

        <p className="card-hint-text">
          Daftar tanggal lahir & status unlock:
        </p>

        <div className="roster-list">
          {peopleWithCountdown.map((person) => {
            const isSelected = selectedPerson?.id === person.id
            return (
              <div
                key={person.id}
                className={`roster-item ${person.isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onHighlightPerson ? onHighlightPerson(person) : undefined}
                role="button"
                tabIndex={0}
                title={`Info ${person.name}`}
              >
                <div className="roster-avatar-box">
                  <span className="roster-emoji">{person.emoji}</span>
                  {person.isToday && <span className="roster-sparkle">✨</span>}
                </div>
                <div className="roster-details">
                  <span className="roster-name">{person.name}</span>
                  <span className="roster-bday">{person.formattedBday}</span>
                </div>
                <div className="roster-status">
                  {person.isToday ? (
                    <span className="status-tag tag-today">🎂 Hari Ini!</span>
                  ) : (
                    <span className="status-tag tag-countdown">
                      {person.diffDays}h lagi
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Widget 3: Circle Metrics */}
      <div className="dash-card circle-stats-card">
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-num">12</span>
            <span className="stat-label">People</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">2</span>
            <span className="stat-label">Varian Rasa 🍰</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">5</span>
            <span className="stat-label">Milestone</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
