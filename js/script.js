/* Page Resetter */
$(document).ready(function () {
  history.scrollRestoration = "manual";
  $(window).scrollTop(0);
  document.getElementById("content-wrapper").style.display = "block";
});


/* Navbar */
const toggleButton = document.getElementsByClassName("toggle-button")[0];
const navbarLinks = document.getElementsByClassName("navbar-links")[0];

toggleButton.addEventListener("click", () => {
  navbarLinks.classList.toggle("active");
});

/* Navbar Selection */
const navbarItems = document.getElementsByClassName("underline");
for (let item of navbarItems) {
  item.addEventListener("click", () => {
    if (navbarLinks.classList.contains("active")) {
      navbarLinks.classList.toggle("active");
    }
  });
}

/* Navbar On-Scroll Change */
const navbar = document.querySelector("nav");
const sectionOne = document.querySelector("#intro-section");
const sectionOneOptions = {
  rootMargin: "-60% 0px 0px 0px",
};

const sectionOneObserver = new IntersectionObserver(function (
  entries,
  sectionOneObserver
) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      navbar.classList.add("nav-scrolled");
    } else if (
      entry.isIntersecting &&
      navbar.classList.contains("nav-scrolled")
    ) {
      navbar.classList.remove("nav-scrolled");
    }
  });
},
sectionOneOptions);
sectionOneObserver.observe(sectionOne);

/* Intro/Resume Parallax */
const parallax = document.getElementById("intro-section");
const parallaxResume = document.getElementById("resume-section");
window.addEventListener("scroll", function() {
  let offset = window.pageYOffset;
  parallax.style.backgroundPositionY = offset * 0.7 + "px";
  parallaxResume.style.backgroundPositionY = offset * 0.7 + "px";
})

/* JavaScript Fade Effects */
const faders = document.querySelectorAll(".fade-in");
const appearOptions = {
  threshold: 0.3,
  rootMargin: "0px 0px 0px 0px",
};
const appearOnScroll = new IntersectionObserver(function (
  entries,
  appearOnScroll
) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    } else {
      entry.target.classList.add("appear");
      appearOnScroll.unobserve(entry.target);
    }
  });
},
appearOptions);
faders.forEach((fader) => {
  appearOnScroll.observe(fader);
});

/* Portfolio Popups */
const openModalButtons = document.querySelectorAll("[data-modal-target]");
const closeModalButtons = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("overlay");

openModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = document.querySelector(button.dataset.modalTarget);
    openModal(modal);
  });
});

overlay.addEventListener("click", () => {
  const modals = document.querySelectorAll(".modal.active");
  modals.forEach((modal) => {
    closeModal(modal);
  });
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");
    closeModal(modal);
  });
});

function openModal(modal) {
  if (modal == null) return;
  modal.classList.add("active");
  overlay.classList.add("active");
}

function closeModal(modal) {
  if (modal == null) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
}
