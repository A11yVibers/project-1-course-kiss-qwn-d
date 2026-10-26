// Application data layer.
//
// Every course fact comes from the immutable CSV files in project-assets/.
// This module parses them at build time (Vite `?raw` imports), joins
// courses -> instructors -> classes -> materials by id, and resolves the
// material files in project-assets/materials/ through import.meta.glob so
// dev builds and the production bundle both work. Nothing in
// project-assets/ is ever modified.

import coursesCsv from '../project-assets/history_courses.csv?raw'
import classesCsv from '../project-assets/history_classes.csv?raw'
import instructorsCsv from '../project-assets/history_instructors.csv?raw'
import materialsCsv from '../project-assets/course_materials.csv?raw'

// Bundled URLs for every file in project-assets/materials (pdf, mp4, md, ...).
const materialUrls = import.meta.glob('../project-assets/materials/*', {
  eager: true,
  query: '?url',
  import: 'default',
})
// Raw text of Markdown materials, rendered inline by MarkdownDocument.
const materialTexts = import.meta.glob('../project-assets/materials/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

export const MATERIAL_TYPE_LABELS = {
  pdf: 'PDF',
  video: 'Video',
  youtube: 'YouTube',
  md: 'Markdown',
}

/**
 * Parse an RFC4180 CSV string (quoted fields, embedded commas, "" escapes)
 * into an array of objects keyed by the header row.
 */
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1
      row.push(field)
      field = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else {
      field += ch
    }
  }
  row.push(field)
  if (row.length > 1 || row[0] !== '') rows.push(row)

  const [header, ...body] = rows
  return body.map((cells) =>
    Object.fromEntries(header.map((key, j) => [key, cells[j] ?? ''])),
  )
}

function findByFilePath(table, filePath) {
  const suffix = `/${filePath}`
  return Object.keys(table).find((key) => key.endsWith(suffix))
}

// "https://youtu.be/<id>?si=..." or "https://www.youtube.com/watch?v=<id>"
// become a privacy-friendly embed URL; anything else is returned unchanged.
function youtubeEmbedUrl(file) {
  const match = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/.exec(file)
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : file
}

function buildMaterial(row) {
  const material = {
    id: row.material_id,
    courseId: row.course_id,
    classId: row.class_id,
    title: row.material_title,
    type: row.material_type,
    displayOrder: Number(row.display_order),
    src: '',
    text: null,
    fileName: '',
  }
  if (row.material_type === 'youtube') {
    material.src = youtubeEmbedUrl(row.file_path)
    return material
  }
  const urlKey = findByFilePath(materialUrls, row.file_path)
  if (urlKey) material.src = materialUrls[urlKey]
  const textKey = findByFilePath(materialTexts, row.file_path)
  if (textKey) material.text = materialTexts[textKey]
  material.fileName = row.file_path.split('/').pop()
  return material
}

export const instructors = parseCsv(instructorsCsv).map((row) => ({
  id: row.instructor_id,
  name: row.name,
  email: row.email,
  photoUrl: row.photo_url,
}))

const instructorById = new Map(instructors.map((i) => [i.id, i]))

const materialsByClassId = new Map()
for (const row of parseCsv(materialsCsv)) {
  const list = materialsByClassId.get(row.class_id) ?? []
  list.push(buildMaterial(row))
  materialsByClassId.set(row.class_id, list)
}
for (const list of materialsByClassId.values()) {
  list.sort((a, b) => a.displayOrder - b.displayOrder)
}

const classesByCourseId = new Map()
for (const row of parseCsv(classesCsv)) {
  const list = classesByCourseId.get(row.course_id) ?? []
  list.push({
    id: row.class_id,
    week: Number(row.week_number),
    date: row.date,
    name: row.class_name,
    materials: materialsByClassId.get(row.class_id) ?? [],
  })
  classesByCourseId.set(row.course_id, list)
}
for (const list of classesByCourseId.values()) {
  list.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
}

export const courses = parseCsv(coursesCsv).map((row) => ({
  id: row.course_id,
  name: row.name,
  shortDescription: row.short_description,
  longDescription: row.long_description,
  numberOfClasses: Number(row.number_of_classes),
  numberOfWeeks: Number(row.number_of_weeks),
  imageUrl: row.image_url,
  instructor: instructorById.get(row.instructor_id) ?? null,
  classes: classesByCourseId.get(row.course_id) ?? [],
}))

/** Look up one course by id (e.g. "HIST111"); returns null when unknown. */
export function findCourse(courseId) {
  return courses.find((course) => course.id === courseId) ?? null
}
