// Photos for the home page hero slideshow (cross-fade with a slow zoom). Edit this list to change them.
// Files live in `public/home-bg/` (credits in CREDITS.md there). To use your own school photos, copy them into that
// folder (landscape, ~1920x1080, under ~400 KB each) and list them below; the first one loads immediately, the rest
// load as the slideshow reaches them.
const base = `${process.env.PUBLIC_URL || ''}/home-bg`;

export const homeSlides = [
  { src: `${base}/classroom-students.jpg`, alt: 'Students listening to their teacher in class' },
  { src: `${base}/library-books.jpg`, alt: 'An open book floating between library shelves' },
  { src: `${base}/students-smartboard.jpg`, alt: 'Students watching a lesson on a smart board' },
  { src: `${base}/graduation.jpg`, alt: 'A graduate in a cap and gown facing the ceremony' },
  { src: `${base}/bookshelf.jpg`, alt: 'A curved library shelf full of books' },
  { src: `${base}/students-learning.jpg`, alt: 'Children learning at their desks' },
  { src: `${base}/classroom-chalkboard.jpg`, alt: 'A classroom with desks and a chalkboard' },
  { src: `${base}/books-focus.jpg`, alt: 'A stack of colourful books' },
];

export const homeSlideSeconds = 7; // time each photo stays before cross-fading to the next
