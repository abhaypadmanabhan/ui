---
"@ui-sdk/core": patch
---

Stop a Pagination from logging a development warning that its page link's slot needs `focus`. The link slot now declares `focus: "native"`, as the previous, next, first and last slots already did.
