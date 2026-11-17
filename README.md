# zularoot.com

Zula Root's personal site. One static page: no framework, no build step.

```
index.html             the home page (all its words live here)
projects/              one page per project: pictures, steps, who did what
styles.css             the look
script.js              theme toggle, nav state, fade-in, the light, picture strip
img/                   pictures for each project
Zula-Root-Resume.pdf   the resume; img/resume.png is a picture of its page, shown on the site
favicon.svg
```

## Editing

Open `index.html` and change the text. Each experience, club and project is
one `<li>` block; copy one to add another. There are no footnotes: where a
name can explain itself with a link, it is a link.

## Project pages

Each file in `projects/` has the same four parts: the pictures, what it is,
what was done, and who did what.

- **Pictures.** Each `<figure class="shot">` is one slide. Copy one to add
  another. Pictures are 1600 by 1000 and live in `img/`.
- **Steps.** Each `<li>` in `<ol class="steps">` is one step: a short name in
  `<b>` and one sentence in `<span>`. The numbers are drawn by the list.
- **Who did what.** Each `<dt>` is a part of the work, or a person. The `<dd>`
  after it says who did it, or what they did.
- **Placeholders.** Anything in `<span class="tk">` is still to be written, and
  shows highlighted so it cannot be missed. Search for `class="tk"` before
  publishing. The Kinelo page is all placeholders, and is marked `noindex`
  until it is filled in.

## Resume

The Resume section shows a picture of the PDF's one page, so it looks the
same in every browser and on every phone. The buttons and the picture all
lead to the PDF itself. When the resume changes, replace both files:
`Zula-Root-Resume.pdf`, and `img/resume.png`, which is page one of the PDF
at 1700 by 2200 pixels (200 dots per inch).

## The light

The faint colour at the top of every page follows the reader's own time of
day: warm at sunrise and dusk, clear through the day, violet at night. The
colours are the `LIGHT` table in `script.js`, and the strength is
`--glow-alpha` in `styles.css`. Add `?hour=6.5` to any address to see
another time of day. To go without it, delete the two blocks named
Daylight, one in each file.

## Preview

```
python3 -m http.server 4321
```

Then open http://localhost:4321.

## Deploy

**Vercel:** import the repo, framework preset "Other", leave build command
and output directory empty. **Cloudflare Pages:** connect the repo, no build
command, output directory `/`. Both serve `index.html` from the root as is.

Once the domain is live, set the `og:url` and canonical tags in the
`<head>` of `index.html`.
