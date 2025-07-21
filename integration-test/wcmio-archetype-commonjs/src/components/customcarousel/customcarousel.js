import { Carousel } from "bootstrap";

export default () => {
  // Initialize all carousels on the page
  document.querySelectorAll('.carousel').forEach(carouselEl => {
    new Carousel(carouselEl);
  });
};
