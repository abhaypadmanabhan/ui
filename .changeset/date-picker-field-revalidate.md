---
"@ui-sdk/core": patch
---

Choosing a day or a preset in a Date Picker now sends `input` and `change` from its input, as Select and Combobox do, so a Field shows or clears its error for the new date. A required date's "value missing" error used to stay after a day was picked from the calendar.
