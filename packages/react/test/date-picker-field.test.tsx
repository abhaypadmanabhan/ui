// @vitest-environment jsdom
import * as React from "react"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, expect, test } from "vitest"
import {
  CalendarGrid,
  DatePicker,
  DatePickerContent,
  DatePickerInput,
  DatePickerTrigger,
} from "../src/date-picker"
import { Field, FieldError, FieldLabel } from "../src/field"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
Element.prototype.getAnimations ??= () => []
Element.prototype.scrollIntoView ??= () => {}
HTMLElement.prototype.showPopover ??= function () {}
HTMLElement.prototype.hidePopover ??= function () {}
// jsdom has no top layer, and won't focus inside a popover it thinks is hidden.
document.head.insertAdjacentHTML(
  "beforeend",
  "<style>[popover][data-open] { display: block !important }</style>"
)

let root: Root | undefined
afterEach(async () => {
  await act(async () => root?.unmount())
  root = undefined
  document.body.replaceChildren()
})

const settle = () =>
  act(
    () =>
      new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)))
  )

test("choosing a day clears a required date's error in a Field", async () => {
  const container = document.body.appendChild(document.createElement("div"))
  root = createRoot(container)
  await act(async () =>
    root!.render(
      <form>
        <Field name="due">
          <FieldLabel>Due date</FieldLabel>
          <DatePicker required today="2026-01-10">
            <DatePickerInput />
            <DatePickerTrigger />
            <DatePickerContent>
              <CalendarGrid />
            </DatePickerContent>
          </DatePicker>
          <FieldError match="valueMissing">Choose a due date.</FieldError>
        </Field>
      </form>
    )
  )
  await settle()
  const input = container.querySelector<HTMLInputElement>(
    "[data-slot=date-picker-input]"
  )!
  await act(async () => {
    input.dispatchEvent(new Event("invalid", { cancelable: true }))
  })
  await settle()
  const errors = () =>
    container.querySelectorAll('[data-slot="field-error"]').length
  expect(errors()).toBe(1)

  const trigger = container.querySelector<HTMLElement>(
    "[data-slot=date-picker-trigger]"
  )!
  await act(async () => {
    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }))
  })
  await settle()
  const day = document.querySelector<HTMLElement>(
    '[data-slot="calendar-day"][data-value="2026-01-15"]'
  )!
  await act(async () => {
    day.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }))
  })
  await settle()
  expect(
    container.querySelector<HTMLInputElement>("input[name=due]")!.value
  ).toBe("2026-01-15")
  expect(errors()).toBe(0)
  expect(input.getAttribute("aria-invalid")).toBe(null)
})
