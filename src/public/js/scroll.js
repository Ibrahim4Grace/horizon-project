window.onload = (event) => {
  $('body').css('overflow-y', 'auto');
  setTimeout(() => {
    gsap.to('.preloader', {
      opacity: 0,
    });
  }, 1000);
  setTimeout(() => {
    gsap.to('.preloader', {
      display: 'none',
    });
    anime.timeline().add({
      targets: 'nav',
      translateY: [-100, 0],
      translateZ: 0,
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 900,
      delay: (el, i) => 300 + 50 * i,
    });

    anime.timeline().add({
      targets: '#hd',
      translateY: [100, 0],
      translateZ: 0,
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 900,
      delay: (el, i) => 300 + 50 * i,
    });
  }, 1200);
};

function scrollto(name) {
  gsap.to(window, { duration: 1, scrollTo: `.${name}` });
}

var lastScrollTop = 0,
  delta = 5;

$(window).scroll(function () {
  var nowScrollTop = $(this).scrollTop();
  if (Math.abs(lastScrollTop - nowScrollTop) >= delta) {
    console.log(nowScrollTop);
    if (nowScrollTop < 700 || nowScrollTop > lastScrollTop) {
      $('nav').removeClass('stickynav');
    } else {
      $('nav').addClass('stickynav');
    }
    lastScrollTop = nowScrollTop;
  }
});

ScrollTrigger.create({
  trigger: '.about',

  onEnter: () => {
    anime.timeline().add({
      targets: '#ab',
      translateY: [100, 0],
      translateZ: 0,
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 900,
      delay: (el, i) => 300 + 30 * i,
    });
  },
  onLeaveBack: (self) => self.disable(),
});

ScrollTrigger.create({
  trigger: '.offer',

  onEnter: () => {
    anime.timeline().add({
      targets: '#of',
      translateY: [100, 0],
      translateZ: 0,
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 900,
      delay: (el, i) => 300 + 30 * i,
    });
  },
  onLeaveBack: (self) => self.disable(),
});

ScrollTrigger.create({
  trigger: '.gallery',

  onEnter: () => {
    anime.timeline().add({
      targets: '#gl',
      translateY: [100, 0],
      translateZ: 0,
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 900,
      delay: (el, i) => 300 + 30 * i,
    });
  },
  onLeaveBack: (self) => self.disable(),
});

ScrollTrigger.create({
  trigger: '.recommended',

  onEnter: () => {
    anime.timeline().add({
      targets: '#rd',
      translateY: [100, 0],
      translateZ: 0,
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 900,
      delay: (el, i) => 300 + 30 * i,
    });
  },
  onLeaveBack: (self) => self.disable(),
});

ScrollTrigger.create({
  trigger: '.stories',

  onEnter: () => {
    anime.timeline().add({
      targets: '#st',
      translateY: [100, 0],
      translateZ: 0,
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 900,
      delay: (el, i) => 300 + 30 * i,
    });
  },
  onLeaveBack: (self) => self.disable(),
});

ScrollTrigger.create({
  trigger: '.journey',

  onEnter: () => {
    anime.timeline().add({
      targets: '#jo',
      translateY: [100, 0],
      translateZ: 0,
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 900,
      delay: (el, i) => 300 + 30 * i,
    });
  },
  onLeaveBack: (self) => self.disable(),
});

ScrollTrigger.create({
  trigger: 'footer',

  onEnter: () => {
    anime.timeline().add({
      targets: '#ft',
      translateY: [100, 0],
      translateZ: 0,
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 900,
      delay: (el, i) => 30 * i,
    });
  },
  onLeaveBack: (self) => self.disable(),
});

$('.modal').click(() => {
  $('.modal').toggleClass('modalopen');
});
