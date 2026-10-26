"""The white/black scroll (owner, 22 Oct, like elokeglobal.com; 25 Oct: "in every page, the first should be black color
and then white"): every page OPENS BLACK after the logo intro, then turns WHITE, BLACK, WHITE ... as you scroll, on every
page. The page builders mark the chapters on their real sections with chapter() below; src/js/96-tone.js reads the
marks and fades the whole page between the two tones (src/css/96-tone.css). check.py (the tone block) guards the marks.

A mark = the FIRST element of a chapter; the chapter runs until the next mark. Rules the marks keep (check.py):
- the first mark of every page is dark (the page opens black; the controller also treats anything above it as black);
- marks alternate dark / light at every width (a mark with mq= only counts where its media query matches);
- every page has at least one light mark (the controller drops a chapter the page is too short to scroll into);
- the footer carries the closing mark (dark: it joins the last black chapter; the 404 is too short for three chapters,
  there the page turns white as the always-black footer panel rises).

data-chapter-at = the chapter's switch line as a fraction of the screen from the top (default .5, the centre line, the
reference's ScrollTrigger start 'top center'; a negative value: the chapter starts once its first element has scrolled
that far past the top of the screen). It may be a list like the sizes attribute: "(max-width:799.98px) -.15, .2".
"""
from lib import E

DARK, LIGHT = 'dark', 'light'
PHONE = '(max-width:799.98px)'          # the phone layout (00-tokens.css breakpoints)
STEPS = '(max-width:1199.98px)'         # Our Approach: the step timeline (phones, tablets); the artboard from 1200 px
ARTBOARD = '(min-width:1200px)'


def chapter(tone, at=None, mq=None):
    """The chapter mark attributes for a section's opening tag: ' data-chapter="dark"' (+ data-chapter-at / -mq)."""
    if tone not in (DARK, LIGHT):
        raise ValueError(f'chapter tone must be "{DARK}" or "{LIGHT}", not {tone!r}')
    out = f' data-chapter="{tone}"'
    if at is not None:
        out += f' data-chapter-at="{E(str(at))}"'
    if mq:
        out += f' data-chapter-mq="{E(mq)}"'
    return out


def footer_tone(page):
    """The footer's closing mark per page (chrome_footer.py): dark everywhere, light on the 404 (see above)."""
    return LIGHT if page == 'notfound' else DARK
