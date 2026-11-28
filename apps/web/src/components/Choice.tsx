// A short choice as a row of buttons (#62), in place of a drop-down: size, sex and age. It is a
// group of real radio buttons, restyled, so one Tab stop reaches it, the arrow keys move through
// it, and a screen reader says the group's name and each option's.
import type { ReactNode } from 'react'

export function Choice<T extends string>({
  id,
  label,
  value,
  options,
  words,
  onChange,
  describedBy,
  tag,
}: {
  id: string
  label: string
  value: T
  options: readonly T[]
  words: Record<T, string>
  onChange: (value: T) => void
  describedBy?: string
  /** Shown beside the label: where the value came from. */
  tag?: ReactNode
}) {
  return (
    <div className="field">
      <div className="field__head">
        <span className="field__label" id={`${id}-label`}>
          {label}
        </span>
        {tag}
      </div>
      <div className="choice" role="radiogroup" id={id} aria-labelledby={`${id}-label`} aria-describedby={describedBy}>
        {options.map((option) => (
          <label key={option} className="choice__option">
            <input
              type="radio"
              className="choice__input"
              name={id}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span className="choice__text">{words[option]}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
