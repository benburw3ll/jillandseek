import { TOWNS, townKey } from '@jillandseek/core'
import { type KeyboardEvent, useId, useMemo, useState } from 'react'

// The town field (#62): a text field with its own list of matching Minnesota towns under it, in
// place of the browser's datalist, which can't be styled. It follows the ARIA combobox pattern:
// the field keeps the focus, the arrow keys move through the list, Enter picks, Escape closes.
// The towns come from the local table, so nothing is looked up anywhere.

const MOST = 8
const KEYED = TOWNS.map((t) => ({ name: t.name, key: townKey(t.name) }))

/** The towns that start with what was typed, then the ones that hold it, at most eight. */
export function matchTowns(typed: string): string[] {
  const key = townKey(typed)
  if (key === '') return []
  const starts = KEYED.filter((t) => t.key.startsWith(key))
  const holds = starts.length >= MOST ? [] : KEYED.filter((t) => !t.key.startsWith(key) && t.key.includes(key))
  return [...starts, ...holds].slice(0, MOST).map((t) => t.name)
}

export function TownPicker({
  id,
  value,
  onChange,
  invalid,
  describedBy,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  describedBy?: string
}) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const matches = useMemo(() => matchTowns(value), [value])
  // A list of the one town already typed in full says nothing new.
  const exact = matches.length === 1 && matches[0] === value
  const showing = open && matches.length > 0 && !exact

  const pick = (name: string) => {
    onChange(name)
    setOpen(false)
    setActive(-1)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (matches.length === 0) return
      e.preventDefault()
      setOpen(true)
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive((i) => (showing ? (i + step + matches.length) % matches.length : step === 1 ? 0 : matches.length - 1))
    } else if (e.key === 'Enter' && showing && active >= 0) {
      // Enter picks the town; it does not send the form while the list is open.
      e.preventDefault()
      pick(matches[active] ?? value)
    } else if (e.key === 'Escape' && showing) {
      e.preventDefault()
      setOpen(false)
      setActive(-1)
    }
  }

  return (
    <div className="town">
      <input
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showing}
        aria-controls={listId}
        aria-activedescendant={showing && active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setActive(-1)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false)
          setActive(-1)
        }}
        onKeyDown={onKeyDown}
        required
        autoComplete="off"
        spellCheck={false}
        placeholder="Start typing a town"
      />
      <div id={listId} className="town__list" role="listbox" aria-label="Matching towns" hidden={!showing}>
        {showing &&
          matches.map((name, i) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: the field keeps the focus and handles the keys for the list.
            <div
              key={name}
              id={`${listId}-${i}`}
              role="option"
              tabIndex={-1}
              aria-selected={i === active}
              className={i === active ? 'town__option town__option--active' : 'town__option'}
              // The press must not take the focus from the field before the click lands.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(name)}
            >
              {name}
            </div>
          ))}
      </div>
    </div>
  )
}
