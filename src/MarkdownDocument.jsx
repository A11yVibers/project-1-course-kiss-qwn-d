// Minimal Markdown renderer for the trusted, immutable assignment files in
// project-assets/materials. Builds React elements directly (never
// dangerouslySetInnerHTML). Supported: # headings, paragraphs, **bold**,
// *italic*, `code`, - / * and 1. lists, and pipe tables with :---: alignment.

function parseInline(text, keyPrefix) {
  const nodes = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let last = 0
  let match
  let i = 0
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    const token = match[0]
    const key = `${keyPrefix}-in${i}`
    if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('`')) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>)
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>)
    }
    last = match.index + token.length
    i += 1
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function isTableSeparator(line) {
  const trimmed = line.trim()
  if (!trimmed.startsWith('|')) return false
  const cells = splitTableRow(trimmed)
  return cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell))
}

function parseBlocks(text) {
  const lines = text.split('\n')
  const blocks = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (trimmed === '') {
      i += 1
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed)
    if (heading) {
      const Tag = `h${heading[1].length}`
      blocks.push(<Tag key={`b${key}`}>{parseInline(heading[2], `b${key}`)}</Tag>)
      key += 1
      i += 1
      continue
    }

    if (trimmed.startsWith('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = splitTableRow(trimmed)
      const aligns = splitTableRow(lines[i + 1]).map((cell) =>
        cell.endsWith(':') ? 'right' : 'left',
      )
      i += 2
      const rows = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitTableRow(lines[i].trim()))
        i += 1
      }
      blocks.push(
        <table key={`b${key}`} className="md-table">
          <thead>
            <tr>
              {header.map((cell, j) => (
                <th key={j} style={{ textAlign: aligns[j] }}>
                  {parseInline(cell, `b${key}-h${j}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells, r) => (
              <tr key={r}>
                {cells.map((cell, c) => (
                  <td key={c} style={{ textAlign: aligns[c] }}>
                    {parseInline(cell, `b${key}-r${r}c${c}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      )
      key += 1
      continue
    }

    const bullet = /^[-*]\s+(.*)$/.exec(trimmed)
    if (bullet) {
      const items = []
      while (i < lines.length) {
        const item = /^[-*]\s+(.*)$/.exec(lines[i].trim())
        if (!item) break
        items.push(<li key={`b${key}-li${items.length}`}>{parseInline(item[1], `b${key}-li${items.length}`)}</li>)
        i += 1
      }
      blocks.push(<ul key={`b${key}`}>{items}</ul>)
      key += 1
      continue
    }

    const numbered = /^\d+[.)]\s+(.*)$/.exec(trimmed)
    if (numbered) {
      const items = []
      while (i < lines.length) {
        const item = /^\d+[.)]\s+(.*)$/.exec(lines[i].trim())
        if (!item) break
        items.push(<li key={`b${key}-li${items.length}`}>{parseInline(item[1], `b${key}-li${items.length}`)}</li>)
        i += 1
      }
      blocks.push(<ol key={`b${key}`}>{items}</ol>)
      key += 1
      continue
    }

    // Paragraph: merge consecutive plain-text lines.
    const paragraph = [trimmed]
    i += 1
    while (i < lines.length) {
      const next = lines[i].trim()
      if (
        next === '' ||
        next.startsWith('#') ||
        next.startsWith('|') ||
        /^[-*]\s+/.test(next) ||
        /^\d+[.)]\s+/.test(next)
      ) {
        break
      }
      paragraph.push(next)
      i += 1
    }
    blocks.push(<p key={`b${key}`}>{parseInline(paragraph.join(' '), `b${key}`)}</p>)
    key += 1
  }

  return blocks
}

/** Render a Markdown string as React elements. */
export default function MarkdownDocument({ text }) {
  return <div className="markdown-body">{parseBlocks(text ?? '')}</div>
}
