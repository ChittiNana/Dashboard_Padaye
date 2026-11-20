// Media shown scrolling behind the login screen. Edit this file to change what plays - no component changes needed.
//
// To use your own pictures/videos: copy the files into `public/login-bg/` and list them below, e.g.
//   { type: 'image', src: `${base}/campus.jpg` }
//   { type: 'video', src: `${base}/assembly.mp4`, poster: `${base}/assembly.jpg` }
// Videos are played muted, looping and inline (browsers only autoplay muted video). Keep clips short and small
// (a few MB, 720p or less): each tile is repeated to fill the screen, so heavy files cost bandwidth and CPU.
//
// Each row scrolls on its own: `direction` is 'left' or 'right', `durationSeconds` is one full loop (bigger = slower).
const base = `${process.env.PUBLIC_URL || ''}/login-bg`;

export const loginBackgroundRows = [
  {
    direction: 'left',
    durationSeconds: 70,
    items: [
      { type: 'image', src: `${base}/classroom.svg` },
      { type: 'image', src: `${base}/books.svg` },
      { type: 'image', src: `${base}/science.svg` },
    ],
  },
  {
    direction: 'right',
    durationSeconds: 85,
    items: [
      { type: 'image', src: `${base}/sports.svg` },
      { type: 'image', src: `${base}/art.svg` },
      { type: 'image', src: `${base}/library.svg` },
    ],
  },
  {
    direction: 'left',
    durationSeconds: 100,
    items: [
      { type: 'image', src: `${base}/library.svg` },
      { type: 'image', src: `${base}/classroom.svg` },
      { type: 'image', src: `${base}/sports.svg` },
    ],
  },
];
