const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('navMenu');
const navToggle = document.getElementById('navToggle');
const menuOverlay = document.getElementById('menuOverlay');
const scrollTopBtn = document.getElementById('scrollTop');
const cursorGlow = document.getElementById('cursorGlow');
const navLinks = document.querySelectorAll('.navbar__link');

let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  if (currentScroll > 500) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }

  lastScroll = currentScroll;
});

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  menuOverlay.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';

  const lines = navToggle.querySelectorAll('line');
  if (navMenu.classList.contains('open')) {
    lines[0].setAttribute('x1', '6'); lines[0].setAttribute('y1', '6');
    lines[0].setAttribute('x2', '18'); lines[0].setAttribute('y2', '18');
    lines[1].style.opacity = '0';
    lines[2].setAttribute('x1', '6'); lines[2].setAttribute('y1', '18');
    lines[2].setAttribute('x2', '18'); lines[2].setAttribute('y2', '6');
  } else {
    lines[0].setAttribute('x1', '3'); lines[0].setAttribute('y1', '6');
    lines[0].setAttribute('x2', '21'); lines[0].setAttribute('y2', '6');
    lines[1].style.opacity = '1';
    lines[2].setAttribute('x1', '3'); lines[2].setAttribute('y1', '18');
    lines[2].setAttribute('x2', '21'); lines[2].setAttribute('y2', '18');
  }
});

menuOverlay.addEventListener('click', () => {
  navMenu.classList.remove('open');
  menuOverlay.classList.remove('active');
  document.body.style.overflow = '';

  const lines = navToggle.querySelectorAll('line');
  lines[0].setAttribute('x1', '3'); lines[0].setAttribute('y1', '6');
  lines[0].setAttribute('x2', '21'); lines[0].setAttribute('y2', '6');
  lines[1].style.opacity = '1';
  lines[2].setAttribute('x1', '3'); lines[2].setAttribute('y1', '18');
  lines[2].setAttribute('x2', '21'); lines[2].setAttribute('y2', '18');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';

    const lines = navToggle.querySelectorAll('line');
    lines[0].setAttribute('x1', '3'); lines[0].setAttribute('y1', '6');
    lines[0].setAttribute('x2', '21'); lines[0].setAttribute('y2', '6');
    lines[1].style.opacity = '1';
    lines[2].setAttribute('x1', '3'); lines[2].setAttribute('y1', '18');
    lines[2].setAttribute('x2', '21'); lines[2].setAttribute('y2', '18');
  });
});

const sections = document.querySelectorAll('section[id]');

function highlightNavLink() {
  const scrollY = window.pageYOffset + 200;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', highlightNavLink);

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function revealOnScroll() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  reveals.forEach(el => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;
    const revealPoint = 120;

    if (elementTop < windowHeight - revealPoint) {
      el.classList.add('active');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

function animateCounters() {
  const counters = document.querySelectorAll('.about__stat-number');

  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-count'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current) + '+';
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target + '+';
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateCounter();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(counter);
  });
}

animateCounters();

if (window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    e.preventDefault();
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      const offset = 80;
      const targetPosition = targetEl.offsetTop - offset;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  });
});

function typeWriter(element, text, speed = 60) {
  element.textContent = '';
  let i = 0;

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

window.addEventListener('load', () => {
  const greeting = document.querySelector('.hero__greeting');
  if (greeting) {
    const text = greeting.textContent;
    setTimeout(() => typeWriter(greeting, text), 500);
  }
});

const skillCategories = document.querySelectorAll('.skills__category');

skillCategories.forEach(category => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const tags = entry.target.querySelectorAll('.skills__tag');
        tags.forEach((tag, index) => {
          tag.style.opacity = '0';
          tag.style.transform = 'translateY(10px)';
          setTimeout(() => {
            tag.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
          }, index * 60);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(category);
});

const floatingIcons = document.querySelectorAll('.hero__floating');

window.addEventListener('scroll', () => {
  const scrollY = window.pageYOffset;

  floatingIcons.forEach((icon, index) => {
    const speed = 0.05 * (index + 1);
    icon.style.transform = `translateY(${Math.sin(scrollY * speed + index) * 8}px)`;
  });
});

const hamburgerLines = navToggle.querySelectorAll('line');
hamburgerLines.forEach(line => {
  line.style.transition = 'all 0.3s ease';
});

const contactForm = document.getElementById('contactForm');
const formToast = document.getElementById('formToast');
const formSubmitBtn = document.getElementById('form-submit');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const subject = document.getElementById('form-subject').value.trim();
    const message = document.getElementById('form-message').value.trim();

    if (!name || !email || !message) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    const originalContent = formSubmitBtn.innerHTML;
    formSubmitBtn.disabled = true;
    formSubmitBtn.innerHTML = '<span class="spinner"></span> Enviando...';
    
    let sent = false;
    try {
      const response = await fetch('https://formsubmit.co/ajax/hanrry.jsantos@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          _subject: subject || 'Contato pelo Portfólio',
          message: message,
          _captcha: 'false'
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        sent = true;
        showToast('✅ Mensagem enviada com sucesso! Obrigado pelo contato.', 'success');
        contactForm.reset();
      }
    } catch (error) {
    }

    if (!sent) {
      const mailSubject = encodeURIComponent(subject || 'Contato pelo Portfólio');
      const mailBody = encodeURIComponent(
        `Olá Hanrry!\n\nNome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`
      );
      const mailtoLink = `mailto:hanrry.jsantos@gmail.com?subject=${mailSubject}&body=${mailBody}`;

      window.open(mailtoLink, '_self');
      showToast('📧 Abrindo seu app de e-mail... Se não abrir, envie para hanrry.jsantos@gmail.com', 'success');
      contactForm.reset();
    }

    formSubmitBtn.disabled = false;
    formSubmitBtn.innerHTML = originalContent;
  });
}

function showToast(message, type) {
  formToast.textContent = message;
  formToast.className = 'contact__form-toast show ' + type;

  setTimeout(() => {
    formToast.classList.remove('show');
  }, 6000);
}

