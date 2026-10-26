import MarkdownDocument from '../MarkdownDocument.jsx'
import { MATERIAL_TYPE_LABELS } from '../data.js'
import { IconChevronLeft, IconExternal, MaterialTypeIcon } from '../icons.jsx'

const TYPE_DESCRIPTIONS = {
  pdf: 'PDF reading',
  video: 'Video lecture',
  youtube: 'YouTube video',
  md: 'Markdown document',
}

function MaterialBody({ material }) {
  if (material.type === 'pdf' && material.src) {
    return (
      <iframe
        className="viewer-frame"
        src={material.src}
        title={material.title}
        data-testid="viewer-pdf"
      />
    )
  }
  if (material.type === 'video' && material.src) {
    return (
      <video
        className="viewer-video"
        src={material.src}
        controls
        preload="metadata"
        data-testid="viewer-video"
      >
        Your browser cannot play this video.
      </video>
    )
  }
  if (material.type === 'youtube' && material.src) {
    return (
      <iframe
        className="viewer-frame"
        src={material.src}
        title={material.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        data-testid="viewer-youtube"
      />
    )
  }
  if (material.type === 'md' && material.text !== null) {
    return (
      <div className="viewer-doc" data-testid="viewer-markdown">
        <MarkdownDocument text={material.text} />
      </div>
    )
  }
  // Unreachable with the supplied data: every material row resolves to a
  // bundled file, an embed URL, or inline Markdown text.
  return <p className="viewer-missing">This material cannot be previewed in the browser.</p>
}

/**
 * Persistent right-hand viewing area of a course page. With no material
 * selected it shows the course's main image; selecting a syllabus material
 * swaps in its viewer without any navigation.
 */
export default function MaterialViewer({ course, material, onBack }) {
  if (!material) {
    return (
      <section className="material-pane" aria-label="Material viewer" data-testid="viewer-panel">
        <div className="viewer-default" data-testid="viewer-default">
          <div className="viewer-default-stage">
            <img
              className="viewer-default-image"
              src={course.imageUrl}
              alt={`Course image for ${course.name}`}
              data-testid="viewer-default-image"
            />
          </div>
          <div className="viewer-default-caption">
            <p className="viewer-default-title">{course.name}</p>
            <p className="viewer-default-hint">
              Choose any material in the syllabus — lecture notes, videos, readings, or
              assignments — and it opens right here while you stay on this page.
            </p>
            <p className="viewer-default-credit">Course image: Wikimedia Commons</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="material-pane" aria-label="Material viewer" data-testid="viewer-panel">
      <header className="viewer-header">
        <span className="viewer-header-icon">
          <MaterialTypeIcon type={material.type} />
        </span>
        <div className="viewer-header-text">
          <h2 data-testid="viewer-title">{material.title}</h2>
          <p className="viewer-header-sub">
            {TYPE_DESCRIPTIONS[material.type] ?? MATERIAL_TYPE_LABELS[material.type] ?? 'Material'}
            {' · '}
            {course.id}
          </p>
        </div>
        <div className="viewer-header-actions">
          {material.type === 'md' && material.src ? (
            // Markdown files are inlined into the bundle as data: URLs, which
            // browsers refuse to open in a new tab — offer a download instead.
            <a
              className="viewer-open-link"
              href={material.src}
              download={material.fileName || undefined}
              data-testid="viewer-download-link"
            >
              Download file <IconExternal className="link-icon" />
            </a>
          ) : null}
          {material.type !== 'md' && material.src ? (
            <a
              className="viewer-open-link"
              href={material.src}
              target="_blank"
              rel="noreferrer"
              data-testid="viewer-open-link"
            >
              Open original <IconExternal className="link-icon" />
            </a>
          ) : null}
          <button type="button" className="viewer-back" onClick={onBack} data-testid="back-to-image">
            <IconChevronLeft className="link-icon" /> Back to course image
          </button>
        </div>
      </header>
      <div className="viewer-body" data-material-type={material.type}>
        <MaterialBody material={material} />
      </div>
    </section>
  )
}
