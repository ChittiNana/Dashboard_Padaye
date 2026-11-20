import { useEffect, useState } from 'react';
import { homeSlides, homeSlideSeconds } from '../../config/homeBackground';

// Full-bleed photo slideshow for the home hero: cross-fades between photos, each with a slow zoom (Ken Burns).
// The photos are decorative (the headline carries the meaning), so they are hidden from assistive technology.
export default function HeroSlideshow() {
  const [active, setActive] = useState(0);
  // Highest slide index mounted so far: photos are only requested when the slideshow gets near them.
  const [reached, setReached] = useState(1);
  const count = homeSlides.length;

  useEffect(() => {
    if (count < 2) return undefined;
    const id = setInterval(() => setActive(prev => (prev + 1) % count), homeSlideSeconds * 1000);
    return () => clearInterval(id);
  }, [count, active]); // restarting on `active` gives a full interval after a manual dot click

  useEffect(() => {
    setReached(r => Math.max(r, Math.min(active + 2, count)));
  }, [active, count]);

  return (
    <div className="gh-slides">
      <div className="gh-slides-stack" aria-hidden="true">
        {homeSlides.map((slide, i) => (
          (i < reached || i === active) && (
            <div key={slide.src} className={`gh-slide${i === active ? ' is-active' : ''}${i % 2 ? ' gh-slide--alt' : ''}`}>
              <img src={slide.src} alt="" loading={i === 0 ? 'eager' : 'lazy'} draggable="false" />
            </div>
          )
        ))}
        <div className="gh-slides-overlay" />
      </div>
      {count > 1 && (
        <div className="gh-dots">
          {homeSlides.map((slide, i) => (
            <button key={slide.src} type="button" aria-label={`Show photo ${i + 1} of ${count}`}
              className={`gh-dot${i === active ? ' is-active' : ''}`} onClick={() => setActive(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
