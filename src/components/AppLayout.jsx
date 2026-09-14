function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="app-header">
        <span className="app-name">Project 3</span>
        <span className="course-label">CSC 4330</span>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="app-footer">CSC 4330 · Group project</footer>
    </div>
  )
}

export default AppLayout
