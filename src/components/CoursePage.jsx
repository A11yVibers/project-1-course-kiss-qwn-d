import { useState } from 'react'
import Syllabus from './Syllabus.jsx'
import MaterialViewer from './MaterialViewer.jsx'
import {
  IconCalendar,
  IconChevronLeft,
  IconClock,
  IconCompass,
  IconMail,
  IconPanelLeft,
} from '../icons.jsx'

/**
 * Course page: a collapsible left pane (course information + syllabus) beside
 * a persistent right pane (MaterialViewer) that keeps its state while the
 * left pane is scrolled or collapsed.
 */
export default function CoursePage({ course }) {
  const [collapsed, setCollapsed] = useState(false)
  const [material, setMaterial] = useState(null)

  return (
    <div className="course-page">
      <header className="course-topbar">
        <a className="back-link" href="#/" data-testid="back-to-catalog">
          <IconChevronLeft className="link-icon" /> All courses
        </a>
        <a className="topbar-brand" href="#/">
          <IconCompass className="topbar-brand-icon" />
          <span className="topbar-brand-name">Epoch</span>
        </a>
        <span className="topbar-course">
          <span className="topbar-code">{course.id}</span>
          <span className="topbar-title">{course.name}</span>
        </span>
      </header>

      <div className="course-layout" data-collapsed={collapsed ? 'true' : 'false'}>
        <aside className="course-pane" aria-label="Course information and syllabus">
          <button
            type="button"
            className="collapse-toggle"
            onClick={() => setCollapsed((value) => !value)}
            aria-expanded={!collapsed}
            aria-controls="course-pane-content"
            data-testid="collapse-toggle"
            title={collapsed ? 'Expand the course panel' : 'Collapse the course panel'}
          >
            <IconPanelLeft className="link-icon" />
            <span className="collapse-label">{collapsed ? 'Course info and syllabus' : 'Hide panel'}</span>
          </button>

          <div
            id="course-pane-content"
            className="course-pane-content"
            hidden={collapsed}
            aria-hidden={collapsed ? 'true' : undefined}
          >
            <div className="course-intro">
              <p className="course-code" data-testid="course-code">{course.id}</p>
              <h1 className="course-title" data-testid="course-title">{course.name}</h1>
              <div className="course-meta">
                <span className="meta-chip">
                  <IconClock className="link-icon" /> {course.numberOfWeeks} weeks
                </span>
                <span className="meta-chip">
                  <IconCalendar className="link-icon" /> {course.numberOfClasses} classes
                </span>
              </div>
              <p className="course-description" data-testid="course-description">
                {course.longDescription}
              </p>
              {course.instructor && (
                <div className="instructor-card" data-testid="instructor-card">
                  <img
                    className="instructor-photo"
                    src={course.instructor.photoUrl}
                    alt={course.instructor.name}
                    loading="lazy"
                  />
                  <div className="instructor-info">
                    <p className="instructor-role">Course instructor</p>
                    <p className="instructor-name">{course.instructor.name}</p>
                    <a className="instructor-email" href={`mailto:${course.instructor.email}`}>
                      <IconMail className="link-icon" /> {course.instructor.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <section className="syllabus-section" aria-label="Syllabus">
              <h2 className="pane-heading">
                Syllabus <span className="pane-heading-count">{course.classes.length} classes</span>
              </h2>
              <Syllabus
                classes={course.classes}
                selectedMaterialId={material ? material.id : null}
                onSelectMaterial={setMaterial}
              />
            </section>
          </div>
        </aside>

        <MaterialViewer course={course} material={material} onBack={() => setMaterial(null)} />
      </div>
    </div>
  )
}
