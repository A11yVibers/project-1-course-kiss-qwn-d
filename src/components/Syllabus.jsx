import { MATERIAL_TYPE_LABELS } from '../data.js'
import { MaterialTypeIcon } from '../icons.jsx'

// Pinned locale: the default ICU locale differs between machines and test
// runners, so dates must not depend on it.
export function formatDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Group the ordered class list into consecutive runs of the same week so the
// Week cell can span them with rowSpan.
function weekGroups(classes) {
  const groups = []
  for (const klass of classes) {
    const last = groups[groups.length - 1]
    if (last && last.week === klass.week) last.classes.push(klass)
    else groups.push({ week: klass.week, classes: [klass] })
  }
  return groups
}

/**
 * Syllabus table: Week | Date | Class content. The class-content cell holds
 * the class title plus a chip for every material available for that class.
 */
export default function Syllabus({ classes, selectedMaterialId, onSelectMaterial }) {
  return (
    <div className="syllabus-scroll">
      <table className="syllabus-table" data-testid="syllabus-table">
        <thead>
          <tr>
            <th scope="col">Week</th>
            <th scope="col">Date</th>
            <th scope="col">Class content</th>
          </tr>
        </thead>
        <tbody>
          {weekGroups(classes).map((group) =>
            group.classes.map((klass, indexInWeek) => (
              <tr key={klass.id} data-testid="syllabus-row">
                {indexInWeek === 0 && (
                  <th
                    scope="rowgroup"
                    className="week-cell"
                    rowSpan={group.classes.length}
                    data-testid="week-cell"
                  >
                    <span className="week-number">Week {group.week}</span>
                  </th>
                )}
                <td className="date-cell">
                  <time dateTime={klass.date}>{formatDate(klass.date)}</time>
                </td>
                <td className="content-cell">
                  <p className="class-title" data-testid="class-title">
                    {klass.name}
                  </p>
                  {klass.materials.length > 0 ? (
                    <ul className="material-list">
                      {klass.materials.map((material) => {
                        const active = selectedMaterialId === material.id
                        return (
                          <li key={material.id}>
                            <button
                              type="button"
                              className={
                                active
                                  ? 'material-chip material-chip--active'
                                  : 'material-chip'
                              }
                              aria-pressed={active}
                              data-testid="material-chip"
                              data-material-id={material.id}
                              onClick={() => onSelectMaterial(material)}
                            >
                              <MaterialTypeIcon type={material.type} className="chip-icon" />
                              <span className="chip-title">{material.title}</span>
                              <span className="chip-type">
                                {MATERIAL_TYPE_LABELS[material.type] ?? material.type}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="no-materials">No materials posted yet.</p>
                  )}
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  )
}
