import { useEffect, useState } from 'react'
import Catalog from './components/Catalog.jsx'
import CoursePage from './components/CoursePage.jsx'
import { findCourse } from './data.js'
import { IconCompass } from './icons.jsx'

// Hash router: "#/" is the catalog, "#/courses/:id" is a course page.
// No history library is needed; the hash survives static hosting (gh-pages).
function parseRoute(hash) {
  const path = hash.replace(/^#/, '') || '/'
  const courseMatch = /^\/courses\/([^/]+)$/.exec(path)
  if (courseMatch) return { name: 'course', courseId: decodeURIComponent(courseMatch[1]) }
  if (path === '/') return { name: 'catalog' }
  return { name: 'notfound', path }
}

function NotFound({ message }) {
  return (
    <main className="notfound" data-testid="notfound">
      <IconCompass className="notfound-icon" />
      <h1>This page is lost to history</h1>
      <p>{message}</p>
      <a className="primary-button" href="#/">
        Back to the course catalog
      </a>
    </main>
  )
}

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (route.name === 'catalog') return <Catalog />

  if (route.name === 'course') {
    const course = findCourse(route.courseId)
    if (!course) {
      return <NotFound message={`No course with the code “${route.courseId}” exists in the catalog.`} />
    }
    // key: remount when navigating between two course pages so viewer state
    // never leaks from one course into another.
    return <CoursePage key={course.id} course={course} />
  }

  return <NotFound message={`Nothing is published at “${route.path}” yet.`} />
}
