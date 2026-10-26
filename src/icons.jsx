// Inline SVG line icons. The app never uses image files for its own chrome;
// every icon inherits `currentColor` and is drawn with strokes.

function iconProps(className) {
  return {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
    focusable: 'false',
  }
}

export function IconCompass({ className = '' }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.4 8.6-2 4.8-4.8 2 2-4.8z" />
    </svg>
  )
}

export function IconSearch({ className = '' }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.4-3.4" />
    </svg>
  )
}

export function IconX({ className = '' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function IconChevronLeft({ className = '' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export function IconChevronRight({ className = '' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function IconPanelLeft({ className = '' }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  )
}

export function IconCalendar({ className = '' }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </svg>
  )
}

export function IconClock({ className = '' }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

export function IconMail({ className = '' }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  )
}

export function IconDoc({ className = '' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z" />
      <path d="M14 3v4h4M9 13h6M9 17h6" />
    </svg>
  )
}

export function IconVideo({ className = '' }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10.5 5-3v9l-5-3z" />
    </svg>
  )
}

export function IconPlayCircle({ className = '' }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8.5 6 3.5-6 3.5z" />
    </svg>
  )
}

export function IconMarkdown({ className = '' }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 15V9l2.5 3L12 9v6M16 9v4.5" />
      <path d="m14.3 12.6 1.7 2.2 1.7-2.2" />
    </svg>
  )
}

export function IconExternal({ className = '' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M14 4h6v6M20 4l-8.5 8.5" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  )
}

/** Icon for a material type from course_materials.csv. */
export function MaterialTypeIcon({ type, className = '' }) {
  if (type === 'pdf') return <IconDoc className={className} />
  if (type === 'video') return <IconVideo className={className} />
  if (type === 'youtube') return <IconPlayCircle className={className} />
  return <IconMarkdown className={className} />
}
