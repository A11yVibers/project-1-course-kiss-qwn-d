import { useMemo, useState } from 'react'
import { courses, instructors } from '../data.js'
import {
  IconCalendar,
  IconChevronRight,
  IconClock,
  IconCompass,
  IconSearch,
  IconX,
} from '../icons.jsx'

const SORTS = [
  { id: 'title', label: 'Title A–Z' },
  { id: 'duration', label: 'Duration (shortest first)' },
  { id: 'classes', label: 'Most classes' },
]

function CourseCard({ course }) {
  return (
    <a
      className="course-card"
      href={`#/courses/${course.id}`}
      data-testid="course-card"
      data-course-id={course.id}
    >
      <div className="card-image-wrap">
        <img
          className="card-image"
          src={course.imageUrl}
          alt=""
          loading="lazy"
          data-testid="card-image"
        />
        <span className="card-code">{course.id}</span>
      </div>
      <div className="card-body">
        <h2 className="card-title">{course.name}</h2>
        <p className="card-text">{course.shortDescription}</p>
        <div className="card-meta">
          <span>
            <IconClock className="link-icon" /> {course.numberOfWeeks} weeks
          </span>
          <span>
            <IconCalendar className="link-icon" /> {course.numberOfClasses} classes
          </span>
        </div>
        {course.instructor && (
          <div className="card-instructor">
            <img src={course.instructor.photoUrl} alt="" loading="lazy" />
            <span>{course.instructor.name}</span>
          </div>
        )}
        <span className="card-cta">
          Open course <IconChevronRight className="link-icon" />
        </span>
      </div>
    </a>
  )
}

/** Course catalog: searchable, filterable grid of all history courses. */
export default function Catalog() {
  const [query, setQuery] = useState('')
  const [instructorId, setInstructorId] = useState('all')
  const [weeks, setWeeks] = useState('all')
  const [sort, setSort] = useState('title')

  const durationOptions = useMemo(
    () => [...new Set(courses.map((course) => course.numberOfWeeks))].sort((a, b) => a - b),
    [],
  )
  const totalClasses = useMemo(
    () => courses.reduce((sum, course) => sum + course.numberOfClasses, 0),
    [],
  )

  const visibleCourses = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = courses.filter((course) => {
      if (instructorId !== 'all' && (!course.instructor || course.instructor.id !== instructorId)) {
        return false
      }
      if (weeks !== 'all' && course.numberOfWeeks !== Number(weeks)) return false
      if (needle === '') return true
      const haystack =
        `${course.id} ${course.name} ${course.shortDescription} ` +
        `${course.longDescription} ${course.instructor ? course.instructor.name : ''}`
      return haystack.toLowerCase().includes(needle)
    })
    const sorted = [...filtered]
    if (sort === 'title') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'duration') {
      sorted.sort(
        (a, b) => a.numberOfWeeks - b.numberOfWeeks || a.name.localeCompare(b.name),
      )
    } else if (sort === 'classes') {
      sorted.sort(
        (a, b) => b.numberOfClasses - a.numberOfClasses || a.name.localeCompare(b.name),
      )
    }
    return sorted
  }, [query, instructorId, weeks, sort])

  const filtersActive = query.trim() !== '' || instructorId !== 'all' || weeks !== 'all'
  const resetFilters = () => {
    setQuery('')
    setInstructorId('all')
    setWeeks('all')
    setSort('title')
  }

  return (
    <div className="catalog-page">
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand" href="#/">
            <IconCompass className="brand-icon" />
            <span className="brand-name">Epoch</span>
            <span className="brand-tag">Digital history learning</span>
          </a>
          <p className="header-stats" data-testid="catalog-stats">
            {courses.length} courses · {instructors.length} instructors · {totalClasses} classes
          </p>
        </div>
      </header>

      <section className="catalog-hero">
        <p className="hero-kicker">An online school devoted entirely to history</p>
        <h1 className="hero-title">Trace the human story, one course at a time.</h1>
        <p className="hero-sub">
          Expert-led courses from the Nile to the Silk Roads, each with a full weekly
          syllabus. Lecture notes, videos, readings, and assignments open right inside
          the course page.
        </p>
        <div className="search-box">
          <IconSearch className="search-icon" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses, topics, or instructors…"
            aria-label="Search courses"
            data-testid="search-input"
          />
          {query !== '' && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              data-testid="search-clear"
            >
              <IconX className="link-icon" />
            </button>
          )}
        </div>
      </section>

      <div className="catalog-toolbar" role="group" aria-label="Course filters">
        <label className="toolbar-field">
          <span>Instructor</span>
          <select
            value={instructorId}
            onChange={(event) => setInstructorId(event.target.value)}
            data-testid="instructor-filter"
          >
            <option value="all">All instructors</option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.name}
              </option>
            ))}
          </select>
        </label>
        <label className="toolbar-field">
          <span>Duration</span>
          <select
            value={weeks}
            onChange={(event) => setWeeks(event.target.value)}
            data-testid="duration-filter"
          >
            <option value="all">Any duration</option>
            {durationOptions.map((option) => (
              <option key={option} value={option}>
                {option} weeks
              </option>
            ))}
          </select>
        </label>
        <label className="toolbar-field">
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            data-testid="sort-select"
          >
            {SORTS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {filtersActive && (
          <button type="button" className="reset-button" onClick={resetFilters} data-testid="reset-filters">
            Reset filters
          </button>
        )}
        <p className="result-count" data-testid="result-count">
          {visibleCourses.length} {visibleCourses.length === 1 ? 'course' : 'courses'}
        </p>
      </div>

      {visibleCourses.length === 0 ? (
        <main className="empty-state" data-testid="empty-state">
          <h2>No courses match your filters</h2>
          <p>Try a different search term, or reset the filters to browse all {courses.length} courses.</p>
          <button type="button" className="primary-button" onClick={resetFilters} data-testid="clear-filters">
            Clear filters
          </button>
        </main>
      ) : (
        <main className="course-grid" data-testid="course-grid">
          {visibleCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </main>
      )}

      <footer className="site-footer">
        <p>
          <span className="footer-brand">Epoch</span> · An online learning platform
          dedicated entirely to history.
        </p>
        <p className="footer-credit">
          Course imagery: Wikimedia Commons · Instructor portraits: randomuser.me
        </p>
      </footer>
    </div>
  )
}
