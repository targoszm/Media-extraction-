const teamMembers = [
  {
    name: "Jennifer Walsh",
    role: "L&D Director",
    permissions: "Admin",
    courses_created: 8,
    last_active: "2025-08-14",
    initials: "JW",
  },
  {
    name: "David Chen",
    role: "Training Coordinator",
    permissions: "Creator",
    courses_created: 4,
    last_active: "2025-08-13",
    initials: "DC",
  },
]

export function TeamView() {
  return (
    <div className="view active">
      <div className="container">
        <div className="team-header">
          <h1 className="text-4xl font-semibold text-slate-900">Team Management</h1>
          <button className="btn btn--primary">Invite Team Members </button>
        </div>

        <div className="team-grid">
          {teamMembers.map((member, index) => {
            const permissionColor = member.permissions === "Admin" ? "status--warning" : "status--info"

            return (
              <div key={index} className="team-card">
                <div className="team-member">
                  <div className="member-avatar">{member.initials}</div>
                  <div className="member-info">
                    <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                    <div className="member-role text-slate-500">{member.role}</div>
                  </div>
                </div>
                <div className="course-meta mb-4">
                  <span className={`status ${permissionColor}`}>{member.permissions}</span>
                  <span className="text-slate-500">Last active: {member.last_active}</span>
                </div>
                <div className="member-stats">
                  <div className="stat">
                    <span className="stat-number">{member.courses_created}</span>
                    <span className="stat-label">Courses Created</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{member.permissions === "Admin" ? "12" : "4"}</span>
                    <span className="stat-label">Total Access</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="team-permissions">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Permission Levels</h2>
          <div className="permissions-grid">
            <div className="permission-card">
              <h3 className="text-lg font-semibold text-slate-900 text-left">
                <div className="permission-icon crown-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6 9H4.5a2.5 2.5 0 0 1 0-5C6 4 6 6 6 6s0-2 2.5-2S11 4 11 4s0-2 2.5-2S16 4 16 4s0-2 2.5-2a2.5 2.5 0 0 1 0 5H18l-1.26 7.27A2 2 0 0 1 14.74 19H9.26a2 2 0 0 1-1.99-1.73L6 9z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                Admin
              </h3>
              <p className="text-slate-500 text-left">Full access to all features, team management, and billing</p>
            </div>
            <div className="permission-card">
              <h3 className="text-lg font-semibold text-slate-900 text-left">
                <div className="permission-icon edit-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                Creator
              </h3>
              <p className="text-slate-500 text-left">Create and edit courses, access analytics for owned content</p>
            </div>
            <div className="permission-card">
              <h3 className="text-lg font-semibold text-slate-900 text-left">
                <div className="permission-icon eye-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                Viewer
              </h3>
              <p className="text-slate-500 text-left">View courses and basic analytics, no editing privileges</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
