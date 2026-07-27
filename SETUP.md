# Where these two files go

1. `CLAUDE.md` → place at your repo ROOT (the top level containing both
   `education_extension/` and `staff-portal/`). Claude Code auto-reads
   this at the start of every session in that directory.

2. `scripts/check_fields.py` → place at `staff-portal/scripts/check_fields.py`
   (or anywhere convenient — just update the path in your prompts to Claude Code).

## How to actually use this going forward

When you want a new module (e.g. Settings' child doctypes), give Claude Code
a prompt like:

    Read CLAUDE.md first. Then build the [Grading Scale] module following
    those exact conventions. The doctype JSON and controller are at:
    apps/education/education/education/doctype/grading_scale/

    After generating the pages, run:
    python3 staff-portal/scripts/check_fields.py \
      apps/education/education/education/doctype/grading_scale/grading_scale.json \
      staff-portal/src/pages/admin/grading-scale/*.jsx \
      staff-portal/src/pages/admin/grading-scale/components/*.jsx

    Show me the output before you consider it done. Also run through the
    verification checklist in section 10 of CLAUDE.md and show me those
    results too.

This forces it to (a) follow your established patterns instead of
inventing new ones, and (b) prove — with a script's output, not just its
own claim — that no doctype field was silently dropped.

## A note on limits

check_fields.py is a heuristic text search, not a real parser of your
JSX. It will tell you a fieldname string appears *somewhere* in the given
files — it can't tell you it's wired up correctly, displayed with the
right input type, or actually gets saved on submit. Treat a clean report
as "nothing was mechanically skipped," not "this page is finished and
correct." Still open the page in the browser and click through
create/edit/view/delete once per module.
