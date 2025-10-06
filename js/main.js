import './supabaseClient.js';

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear().toString();
}

const carousel = document.querySelector('[data-carousel]');
if (carousel) {
  const track = carousel.querySelector('.testimonial-track');
  const slides = Array.from(track.children);
  const prevButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  let index = 0;

  const updateSlide = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      index = (index - 1 + slides.length) % slides.length;
      updateSlide();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      index = (index + 1) % slides.length;
      updateSlide();
    });
  }

  setInterval(() => {
    index = (index + 1) % slides.length;
    updateSlide();
  }, 8000);
}
