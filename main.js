/* ==========================================================================
   PYTYVÕ MOTION — MASTER APPLE BRUTALISM INTERACTIVE ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollSpy();
  initSimulator();
  init3DViewer();
  initLightboxKeyboard();
  initScrollTopBtn();
});

/* ==========================================================================
   1. NAVBAR & SCROLLSPY (PERFORMANCE THROTTLED)
   ========================================================================== */
function initNavbar() {
  const hamburger = document.getElementById('abHamburger');
  const navList = document.getElementById('abNavList');
  const navPill = document.getElementById('navPill');

  if (hamburger && navList) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      navList.classList.toggle('active');
    });

    navList.querySelectorAll('.ab-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navList.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (navList.classList.contains('active') && !hamburger.contains(e.target) && !navList.contains(e.target)) {
        navList.classList.remove('active');
      }
    });
  }

  // Hide on scroll down / show on scroll up (~100px acumulados ≈ 7cm)
  const navOuter = document.querySelector('.ab-navbar-outer');
  let lastScrollY = window.scrollY;
  let accumulatedUp = 0;   // px subidos acumulados desde el último cambio de dirección
  const HIDE_AFTER = 80;  // px bajados para ocultar
  const SHOW_AFTER = 100; // px subidos acumulados para volver a mostrar

  let navTicking = false;
  window.addEventListener('scroll', () => {
    if (!navTicking) {
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;

        // Sombra del pill
        if (navPill) {
          navPill.style.boxShadow = currentY > 30
            ? '10px 10px 0px 0px #000000'
            : '8px 8px 0px 0px #000000';
        }

        if (navOuter) {
          if (navList && navList.classList.contains('active')) {
            navOuter.classList.remove('navbar-hidden');
          } else if (delta > 0) {
            accumulatedUp = 0;
            if (currentY > HIDE_AFTER) {
              navOuter.classList.add('navbar-hidden');
            }
          } else if (delta < 0) {
            accumulatedUp += Math.abs(delta);
            if (accumulatedUp >= SHOW_AFTER || currentY < HIDE_AFTER) {
              navOuter.classList.remove('navbar-hidden');
            }
          }
        }

        lastScrollY = currentY;
        navTicking = false;
      });
      navTicking = true;
    }
  }, { passive: true });
}

function initScrollSpy() {
  const sectionElements = Array.from(document.querySelectorAll('section[id], header[id]'));
  const navLinks = Array.from(document.querySelectorAll('.ab-nav-link'));

  let cachedOffsets = [];
  function updateSectionOffsets() {
    cachedOffsets = sectionElements.map(sec => ({
      id: sec.getAttribute('id'),
      top: sec.offsetTop,
      bottom: sec.offsetTop + sec.offsetHeight
    }));
  }
  updateSectionOffsets();
  window.addEventListener('resize', updateSectionOffsets, { passive: true });

  let spyTicking = false;
  let activeId = '';

  window.addEventListener('scroll', () => {
    if (!spyTicking) {
      window.requestAnimationFrame(() => {
        const scrollPos = window.scrollY + 160;
        let current = '';

        for (let i = 0; i < cachedOffsets.length; i++) {
          const s = cachedOffsets[i];
          if (scrollPos >= s.top && scrollPos < s.bottom) {
            current = s.id;
            break;
          }
        }

        if (current && current !== activeId) {
          activeId = current;
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${current}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
        spyTicking = false;
      });
      spyTicking = true;
    }
  }, { passive: true });
}

/* ==========================================================================
   2. HERO VISUALIZER PRESETS
   ========================================================================== */
function setQuickHeroPose(pose) {
  playBrutalistClick();
  if (pose === 'open') {
    animateSvgFinger('fingerThumbGroup', 0, 'thumb');
    animateSvgFinger('fingerIndexGroup', 0, 'vertical');
    animateSvgFinger('fingerMiddleGroup', 0, 'vertical');
    animateSvgFinger('fingerRingGroup', 0, 'vertical');
    animateSvgFinger('fingerPinkyGroup', 0, 'vertical');
  } else if (pose === 'grip') {
    animateSvgFinger('fingerThumbGroup', 65, 'thumb');
    animateSvgFinger('fingerIndexGroup', 75, 'vertical');
    animateSvgFinger('fingerMiddleGroup', 80, 'vertical');
    animateSvgFinger('fingerRingGroup', 75, 'vertical');
    animateSvgFinger('fingerPinkyGroup', 70, 'vertical');
  } else if (pose === 'pinch') {
    animateSvgFinger('fingerThumbGroup', 70, 'thumb');
    animateSvgFinger('fingerIndexGroup', 75, 'vertical');
    animateSvgFinger('fingerMiddleGroup', 20, 'vertical');
    animateSvgFinger('fingerRingGroup', 15, 'vertical');
    animateSvgFinger('fingerPinkyGroup', 10, 'vertical');
  }
}

function animateSvgFinger(groupId, angle, type) {
  const el = document.getElementById(groupId);
  if (!el) return;

  if (type === 'thumb') {
    const shiftX = (angle / 90) * 16;
    const shiftY = (angle / 90) * 8;
    el.setAttribute('transform', `translate(${shiftX}, ${shiftY})`);
  } else {
    const shiftY = (angle / 90) * 22;
    el.setAttribute('transform', `translate(0, ${shiftY})`);
  }
}

/* ==========================================================================
   3. SIMULATOR LOGIC (HAND LAB)
   ========================================================================== */
const currentAngles = {
  thumb: 0,
  index: 0,
  middle: 0,
  ring: 0,
  pinky: 0
};

function initSimulator() {
  const btnPlaySound = document.getElementById('btnPlaySound');
  if (btnPlaySound) {
    btnPlaySound.addEventListener('click', () => {
      speakAudioPrompt();
    });
  }
}

function updateFingerAngle(finger, value) {
  const angle = parseInt(value, 10);
  currentAngles[finger] = angle;

  // Update badge
  const degEl = document.getElementById(`deg${capitalize(finger)}`);
  if (degEl) degEl.innerText = `${angle}°`;

  // Update slider position if called programmatically
  const slider = document.getElementById(`slider${capitalize(finger)}`);
  if (slider && slider.value != angle) {
    slider.value = angle;
  }

  // Animate SVG Node
  const nodeEl = document.getElementById(`sim${capitalize(finger)}Node`);
  if (nodeEl) {
    if (finger === 'thumb') {
      const shiftX = (angle / 90) * 18;
      const shiftY = (angle / 90) * 10;
      nodeEl.setAttribute('transform', `translate(${shiftX}, ${shiftY})`);
    } else {
      const shiftY = (angle / 90) * 26;
      nodeEl.setAttribute('transform', `translate(0, ${shiftY})`);
    }
  }

  // Cable Tension Stroke
  const tendonEl = document.getElementById(`simTendon${capitalize(finger)}`);
  if (tendonEl) {
    if (angle > 60) {
      tendonEl.setAttribute('stroke', '#6BA539');
      tendonEl.setAttribute('stroke-width', '5.5');
    } else if (angle > 20) {
      tendonEl.setAttribute('stroke', '#6BA539');
      tendonEl.setAttribute('stroke-width', '4.5');
    } else {
      tendonEl.setAttribute('stroke', '#0B1910');
      tendonEl.setAttribute('stroke-width', '3.5');
    }
  }
}

function applyTherapyRoutine(type) {
  playBrutalistClick();
  let voiceGuar = "";
  let voiceEs = "";

  if (type === 'open') {
    setAllFingers(0, 0, 0, 0, 0);
    voiceGuar = '"Emyasãi mbeguekatu nde po..."';
    voiceEs = "Comando: Extensión y relajación total de los dedos (0°)";
  } else if (type === 'fist') {
    setAllFingers(85, 85, 85, 85, 85);
    voiceGuar = '"Eñapytĩ nde po mbeguekatu..."';
    voiceEs = "Comando: Flexión coordinada en puño pasivo (85°)";
  } else if (type === 'pinch') {
    setAllFingers(75, 75, 20, 15, 10);
    voiceGuar = '"Eipuru nde kuã tenondegua..."';
    voiceEs = "Comando: Pinza fina (pulgar + índice) para abotonar o pinzar";
  } else if (type === 'grip') {
    setAllFingers(55, 65, 70, 65, 60);
    voiceGuar = '"Ejapyhy mbarete porã..."';
    voiceEs = "Comando: Agarre cilíndrico funcional (sostener cuchara o vaso)";
  }

  const elGuar = document.getElementById('voiceGuar');
  const elEs = document.getElementById('voiceEs');
  if (elGuar) elGuar.innerText = voiceGuar;
  if (elEs) elEs.innerText = voiceEs;

  speakAudioPrompt(voiceEs);
}

function setAllFingers(thumb, index, middle, ring, pinky) {
  smoothFingerMove('thumb', thumb);
  smoothFingerMove('index', index);
  smoothFingerMove('middle', middle);
  smoothFingerMove('ring', ring);
  smoothFingerMove('pinky', pinky);
}

function smoothFingerMove(finger, targetAngle) {
  const current = currentAngles[finger];
  const step = targetAngle > current ? 3 : -3;

  const interval = setInterval(() => {
    if (Math.abs(currentAngles[finger] - targetAngle) <= 3) {
      updateFingerAngle(finger, targetAngle);
      clearInterval(interval);
    } else {
      updateFingerAngle(finger, currentAngles[finger] + step);
    }
  }, 15);
}

function triggerLabEmergency() {
  playAlertSound();
  setAllFingers(0, 0, 0, 0, 0);

  const elGuar = document.getElementById('voiceGuar');
  const elEs = document.getElementById('voiceEs');
  if (elGuar) elGuar.innerText = '"¡PARADA DE EMERGENCIA ACTIVADA!"';
  if (elEs) elEs.innerText = 'Corte físico por hardware activado. Servos liberados.';

  const btn = document.getElementById('btnLabEmergency');
  if (btn) {
    btn.style.background = '#000000';
    btn.style.color = '#FFFFFF';
    setTimeout(() => {
      btn.style.background = '#EF4444';
      btn.style.color = '#FFFFFF';
    }, 1800);
  }
}

function speakAudioPrompt(customText) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const text = customText || document.getElementById('voiceEs')?.innerText || "Comando terapéutico activado";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }
}

function playBrutalistClick() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) { }
}

function playAlertSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) { }
}

/* ==========================================================================
   4. PHOTO LIGHTBOX MODAL & GALLERY
   ========================================================================== */
const galleryPhotos = [
  {
    src: 'WhatsApp Image 2026-09-02 at 23.17.50 (1).jpeg',
    category: 'render',
    tag: 'Render 3D & Concepto',
    title: 'Exoesqueleto Completo 3D',
    caption: 'Render conceptual de alta fidelidad: estructura alveolar Honeycomb transpirable, arnés ergonómico de hombro, módulo con pantalla LCD y mano robótica articulada.'
  },
  {
    src: 'foto del grupo.jpeg',
    category: 'id',
    tag: 'Equipo Oficial BTI',
    title: 'Equipo Pytyvõ Motion & Mentora',
    caption: 'Los 5 estudiantes del Bachillerato Técnico en Informática (BTI) del Centro Regional de Educación de Ciudad del Este (CRECE) junto a su docente mentora.'
  },
  {
    src: 'WhatsApp Image 2026-09-04 at 14.46.30.jpeg',
    category: 'biomecanica',
    tag: 'Bocetos & Biomecánica',
    title: 'Pizarra 1: Anatomía Muscular y Control',
    caption: 'Esquema de grupos musculares del brazo (bíceps, tríceps, braquial, flexores), arquitectura de control Arduino con pantalla LCD y pilares Ligero/Protegido/Transpirable.'
  },
  {
    src: 'WhatsApp Image 2026-09-04 at 14.46.31.jpeg',
    category: 'biomecanica',
    tag: 'Bocetos & Biomecánica',
    title: 'Pizarra 2: Cinemática Ósea y Tendones',
    caption: 'Estudio óseo de falanges y carpo, diseño del mecanismo retráctil de poleas/servomotores y placas dorsales con guías de baja fricción.'
  },
  {
    src: 'WhatsApp Image 2026-09-04 at 10.40.54.jpeg',
    category: 'id',
    tag: 'I+D & Equipo BTI',
    title: 'I+D: Módulo de Control y Display LCD',
    caption: 'Diseño del panel frontal de usuario: ubicación de la pantalla LCD para monitoreo de impulsos/grados de flexión y botones de calibración.'
  },
  {
    src: 'WhatsApp Image 2026-09-04 at 14.46.36 (1).jpeg',
    category: 'id',
    tag: 'I+D & Equipo BTI',
    title: 'Cuaderno de Bocetos: Falanges y Guante',
    caption: 'Registro gráfico en libreta de campo de las piezas articuladas de los dedos y los canales de fijación de los tendones tensores.'
  },
  {
    src: 'WhatsApp Image 2026-08-27 at 20.45.19.jpeg',
    category: 'taller',
    tag: 'Taller & Prototipado',
    title: 'Ensamble de Falanges y Anillos',
    caption: 'Ensamble inicial de la estructura de falanges impresas en 3D y su articulación mediante líneas tensoras flexibles.'
  },
  {
    src: 'WhatsApp Image 2026-08-27 at 21.01.42.jpeg',
    category: 'taller',
    tag: 'Taller & Prototipado',
    title: 'Banco de Actuadores y Servomotores',
    caption: 'Montaje del banco de pruebas con servomotores individuales, cableado y distribución de líneas de tracción mecánica.'
  },
  {
    src: 'WhatsApp Image 2026-08-27 at 21.01.42 (1).jpeg',
    category: 'taller',
    tag: 'Taller & Prototipado',
    title: 'Guías de Tendón y Canales de Baja Fricción',
    caption: 'Detalle microscópico del enrutamiento de hilos de alta resistencia a lo largo de las guías dorsales de los dedos.'
  },
  {
    src: 'WhatsApp Image 2026-08-27 at 21.02.46.jpeg',
    category: 'taller',
    tag: 'Taller & Prototipado',
    title: 'Fijaciones Ergonómicas Textiles',
    caption: 'Pruebas de ajuste anatómico en palma y muñeca con materiales textiles y elásticos para máxima comodidad del paciente.'
  }
];

let currentPhotoIndex = 0;
let currentFilter = 'all';

function filterGallery(category, btnElement) {
  currentFilter = category;

  // Actualizar clases de botones
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  filterBtns.forEach(btn => btn.classList.remove('active'));
  if (btnElement) {
    btnElement.classList.add('active');
  }

  // Filtrar tarjetas
  const cards = document.querySelectorAll('.gallery-bento-card-ab');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (category === 'all' || cardCat === category) {
      card.style.display = 'flex';
      card.classList.add('fade-in-card');
    } else {
      card.style.display = 'none';
      card.classList.remove('fade-in-card');
    }
  });
}

function openPhotoModal(src, caption, title) {
  const modal = document.getElementById('photoModal');
  const modalImg = document.getElementById('modalImg');
  const modalCaption = document.getElementById('modalCaption');
  const modalTitle = document.getElementById('modalTitle');

  const foundIndex = galleryPhotos.findIndex(p => p.src === src);
  if (foundIndex !== -1) {
    currentPhotoIndex = foundIndex;
  }

  if (modal && modalImg && modalCaption) {
    modalImg.src = src;
    modalCaption.innerText = caption;
    if (modalTitle) {
      modalTitle.innerText = title || (galleryPhotos[currentPhotoIndex] ? galleryPhotos[currentPhotoIndex].title : 'Detalle de Prototipo');
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closePhotoModal() {
  const modal = document.getElementById('photoModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function nextPhoto(e) {
  if (e) e.stopPropagation();
  const visiblePhotos = currentFilter === 'all'
    ? galleryPhotos
    : galleryPhotos.filter(p => p.category === currentFilter);

  const currentPhoto = galleryPhotos[currentPhotoIndex];
  let visibleIdx = visiblePhotos.findIndex(p => p.src === currentPhoto.src);
  if (visibleIdx === -1) visibleIdx = 0;

  const nextVisibleIdx = (visibleIdx + 1) % visiblePhotos.length;
  const nextPhotoItem = visiblePhotos[nextVisibleIdx];
  openPhotoModal(nextPhotoItem.src, nextPhotoItem.caption, nextPhotoItem.title);
}

function prevPhoto(e) {
  if (e) e.stopPropagation();
  const visiblePhotos = currentFilter === 'all'
    ? galleryPhotos
    : galleryPhotos.filter(p => p.category === currentFilter);

  const currentPhoto = galleryPhotos[currentPhotoIndex];
  let visibleIdx = visiblePhotos.findIndex(p => p.src === currentPhoto.src);
  if (visibleIdx === -1) visibleIdx = 0;

  const prevVisibleIdx = (visibleIdx - 1 + visiblePhotos.length) % visiblePhotos.length;
  const prevPhotoItem = visiblePhotos[prevVisibleIdx];
  openPhotoModal(prevPhotoItem.src, prevPhotoItem.caption, prevPhotoItem.title);
}

function initLightboxKeyboard() {
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('photoModal');
    if (modal && modal.classList.contains('active')) {
      if (e.key === 'Escape') closePhotoModal();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    }
  });
}

/* ==========================================================================
   5. CONTACT FORM HANDLER
   ========================================================================== */
function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btnSubmit');
  const feedback = document.getElementById('formFeedback');

  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
    btn.disabled = true;
  }

  setTimeout(() => {
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.background = 'var(--brand-green-pastel)';
      feedback.style.border = 'var(--border-thick)';
      feedback.style.color = '#065F46';
      feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> ¡Mensaje enviado con éxito! El equipo de Pytyvõ Motion se comunicará a la brevedad.';
    }
    if (btn) {
      btn.innerHTML = '<span>Mensaje Enviado</span> <i class="fa-solid fa-check"></i>';
    }
    e.target.reset();
  }, 1000);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ==========================================================================
   SCROLL TO TOP BUTTON
   ========================================================================== */
function initScrollTopBtn() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
}

/* ==========================================================================
   6. 3D HAND LAB & INTERACTIVE WEBGL VIEWER (THREE.JS — ULTRA-PERFORMANCE)
   ========================================================================== */
let scene3D, camera3D, renderer3D, controls3D;
let bionicHandGroup = null;
let customLoadedModel = null;
let fingerJoints = {
  thumb: [],
  index: [],
  middle: [],
  ring: [],
  pinky: []
};
let current3DMaterialMode = 'cyber';
let is3DAutoRotate = true;
let isWaveMotionActive = false;
let waveTime = 0;
let defaultMaterials = {};
let isViewer3DVisible = false;
let animationFrameId3D = null;
let isCadLoading = false;

// DOM Cache for 3D Sliders & Badges (Avoids layout thrashing in 60 FPS animation loop)
const sliderDomCache = {};
const valDomCache = {};
function getSliderDom(finger) {
  if (!sliderDomCache[finger]) {
    sliderDomCache[finger] = document.getElementById(`slider${capitalize(finger)}`);
  }
  return sliderDomCache[finger];
}
function getValDom(finger) {
  if (!valDomCache[finger]) {
    valDomCache[finger] = document.getElementById(`val${capitalize(finger)}`);
  }
  return valDomCache[finger];
}

function init3DViewer() {
  const container = document.getElementById('threejs-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 600;
  const height = container.clientHeight || 500;

  // Scene — Dark Brutalist Hardware Studio
  scene3D = new THREE.Scene();
  scene3D.background = new THREE.Color(0x0A1C12);

  // Camera
  camera3D = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
  camera3D.position.set(0, 4, 34);

  // High-Performance WebGL Renderer (sRGB Encoding + 60 FPS capped pixel ratio)
  renderer3D = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    precision: 'mediump'
  });
  renderer3D.outputEncoding = THREE.sRGBEncoding;
  renderer3D.setSize(width, height);
  renderer3D.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer3D.shadowMap.enabled = false; // Zero shadow map overhead, ultra-fluid response
  container.appendChild(renderer3D.domElement);

  // OrbitControls
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls3D = new THREE.OrbitControls(camera3D, renderer3D.domElement);
    controls3D.enableDamping = true;
    controls3D.dampingFactor = 0.08;
    controls3D.rotateSpeed = 0.85;
    controls3D.minDistance = 10;
    controls3D.maxDistance = 80;
    controls3D.maxPolarAngle = Math.PI / 1.05;
    controls3D.enablePan = false;
    controls3D.autoRotate = is3DAutoRotate;
    controls3D.autoRotateSpeed = 2.0;
  }

  // Ensure Auto-Giro button reflects active state
  const btnAutoRotate = document.getElementById('btnAutoRotate');
  if (btnAutoRotate && is3DAutoRotate) {
    btnAutoRotate.classList.add('active');
  }

  // Lighting & Materials
  setup3DLights();
  setup3DMaterials();

  // Build fallback Bionic Hand Model
  buildProceduralBionicHand();

  // Auto-load user's project 3D CAD model (proyecto.glb)
  checkAndAutoLoadLocalModel();

  // Drag & drop listener on canvas
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    container.classList.add('drag-over-active');
  });
  container.addEventListener('dragleave', () => {
    container.classList.remove('drag-over-active');
  });
  container.addEventListener('drop', (e) => {
    e.preventDefault();
    container.classList.remove('drag-over-active');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUser3DFile({ target: { files: e.dataTransfer.files } });
    }
  });

  // Resize Listener
  window.addEventListener('resize', on3DWindowResize, { passive: true });

  // Viewport IntersectionObserver: Pause rendering when offscreen to save 100% GPU/CPU
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isViewer3DVisible = entry.isIntersecting;
        if (isViewer3DVisible && !animationFrameId3D) {
          animate3DScene();
        }
      });
    }, { threshold: 0.05 });
    observer.observe(container);
  } else {
    isViewer3DVisible = true;
    animate3DScene();
  }
}

function setup3DLights() {
  // Natural Skylight + Ground Bounce
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1A3824, 2.2);
  scene3D.add(hemiLight);

  // Key Main Light (Front-Right Top)
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
  keyLight.position.set(15, 25, 25);
  scene3D.add(keyLight);

  // Front-Left Fill Light
  const fillLight = new THREE.DirectionalLight(0xE2F5E6, 1.3);
  fillLight.position.set(-18, 15, 20);
  scene3D.add(fillLight);

  // Cyber Green Rim Light (Back-Left)
  const rimLight = new THREE.DirectionalLight(0x7FC243, 2.0);
  rimLight.position.set(-20, 10, -20);
  scene3D.add(rimLight);

  // Back-Right Accent Light
  const backLight = new THREE.DirectionalLight(0x38BDF8, 1.0);
  backLight.position.set(20, -10, -15);
  scene3D.add(backLight);

  // Ground Grid (Cybernetic platform)
  const gridHelper = new THREE.GridHelper(40, 24, 0x245C33, 0x122E1B);
  gridHelper.position.y = -12;
  scene3D.add(gridHelper);

  // Soft Contact Shadow Plane (0 GPU cost, gorgeous Apple-style soft grounding)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(11, 25, 16, 0.42)');
  grad.addColorStop(0.5, 'rgba(11, 25, 16, 0.15)');
  grad.addColorStop(1, 'rgba(11, 25, 16, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = -11.95;
  scene3D.add(contactShadow);
}

function setup3DMaterials() {
  defaultMaterials = {
    chassis: new THREE.MeshStandardMaterial({
      color: 0x144A29,
      metalness: 0.7,
      roughness: 0.3
    }),
    shellWhite: new THREE.MeshStandardMaterial({
      color: 0xF7FAF8,
      metalness: 0.15,
      roughness: 0.25
    }),
    jointGreen: new THREE.MeshStandardMaterial({
      color: 0x6BA539,
      metalness: 0.55,
      roughness: 0.25,
      emissive: 0x1A4010,
      emissiveIntensity: 0.2
    }),
    metal: new THREE.MeshStandardMaterial({
      color: 0x9CB0A2,
      metalness: 0.92,
      roughness: 0.18
    }),
    lcdScreen: new THREE.MeshBasicMaterial({
      color: 0x051F10
    }),
    ledGlow: new THREE.MeshBasicMaterial({
      color: 0x7FC243
    }),
    tendon: new THREE.LineBasicMaterial({
      color: 0xFEF08A,
      linewidth: 3
    })
  };
}

function buildProceduralBionicHand() {
  bionicHandGroup = new THREE.Group();
  bionicHandGroup.position.y = -3;
  scene3D.add(bionicHandGroup);

  // 1. Forearm Sleeve (Honeycomb Bio-Chassis)
  const forearmGeo = new THREE.CylinderGeometry(2.4, 2.0, 9, 16);
  const forearmMesh = new THREE.Mesh(forearmGeo, defaultMaterials.chassis);
  forearmMesh.position.y = -6.5;
  bionicHandGroup.add(forearmMesh);

  // Forearm LCD Panel
  const lcdGeo = new THREE.BoxGeometry(1.6, 2.5, 0.4);
  const lcdMesh = new THREE.Mesh(lcdGeo, defaultMaterials.lcdScreen);
  lcdMesh.position.set(0, -6, 2.2);
  bionicHandGroup.add(lcdMesh);

  // LED Status Bar
  const ledGeo = new THREE.BoxGeometry(1.2, 0.2, 0.45);
  const ledMesh = new THREE.Mesh(ledGeo, defaultMaterials.ledGlow);
  ledMesh.position.set(0, -4.5, 2.22);
  bionicHandGroup.add(ledMesh);

  // 2. Wrist Joint (Rotational Disc)
  const wristGeo = new THREE.CylinderGeometry(2.1, 2.1, 1.2, 20);
  const wristMesh = new THREE.Mesh(wristGeo, defaultMaterials.jointGreen);
  wristMesh.rotation.z = Math.PI / 2;
  wristMesh.position.y = -1.5;
  bionicHandGroup.add(wristMesh);

  // 3. Palm Chassis
  const palmGeo = new THREE.BoxGeometry(4.8, 3.8, 1.4);
  const palmMesh = new THREE.Mesh(palmGeo, defaultMaterials.chassis);
  palmMesh.position.set(0, 1.2, 0);
  bionicHandGroup.add(palmMesh);

  // Dorsal Plate Accent
  const dorsalGeo = new THREE.BoxGeometry(4.2, 3.2, 0.3);
  const dorsalMesh = new THREE.Mesh(dorsalGeo, defaultMaterials.shellWhite);
  dorsalMesh.position.set(0, 1.2, 0.75);
  bionicHandGroup.add(dorsalMesh);

  // 4. Build 5 Articulated Fingers
  const fingerConfigs = [
    { name: 'thumb', x: -2.6, y: 0.6, len: 1.3, isThumb: true },
    { name: 'index', x: -1.6, y: 3.1, len: 1.5, isThumb: false },
    { name: 'middle', x: -0.5, y: 3.3, len: 1.7, isThumb: false },
    { name: 'ring', x: 0.6, y: 3.1, len: 1.5, isThumb: false },
    { name: 'pinky', x: 1.7, y: 2.7, len: 1.2, isThumb: false }
  ];

  fingerJoints = { thumb: [], index: [], middle: [], ring: [], pinky: [] };

  fingerConfigs.forEach(cfg => {
    const fingerRoot = new THREE.Group();
    fingerRoot.position.set(cfg.x, cfg.y, 0);

    if (cfg.isThumb) {
      fingerRoot.rotation.z = Math.PI / 4.5;
      fingerRoot.rotation.y = Math.PI / 6;
    }

    bionicHandGroup.add(fingerRoot);

    // Phalanx 1 (Proximal)
    const p1Group = new THREE.Group();
    const p1Mesh = createPhalanxMesh(cfg.len, 0.45, defaultMaterials.shellWhite);
    p1Group.add(p1Mesh);
    fingerRoot.add(p1Group);

    // Phalanx 2 (Intermediate)
    const p2Group = new THREE.Group();
    p2Group.position.y = cfg.len;
    const p2Mesh = createPhalanxMesh(cfg.len * 0.85, 0.4, defaultMaterials.chassis);
    p2Group.add(p2Mesh);
    p1Group.add(p2Group);

    // Phalanx 3 (Distal Tip)
    const p3Group = new THREE.Group();
    p3Group.position.y = cfg.len * 0.85;
    const p3Mesh = createPhalanxMesh(cfg.len * 0.7, 0.35, defaultMaterials.jointGreen);
    p3Group.add(p3Mesh);
    p2Group.add(p3Group);

    fingerJoints[cfg.name] = [p1Group, p2Group, p3Group];
  });
}

function createPhalanxMesh(length, radius, material) {
  const phalanx = new THREE.Group();

  // Cylinder body
  const bodyGeo = new THREE.CylinderGeometry(radius * 0.85, radius, length, 12);
  const bodyMesh = new THREE.Mesh(bodyGeo, material);
  bodyMesh.position.y = length / 2;
  phalanx.add(bodyMesh);

  // Knuckle sphere
  const knuckleGeo = new THREE.SphereGeometry(radius * 1.05, 10, 10);
  const knuckleMesh = new THREE.Mesh(knuckleGeo, defaultMaterials.metal);
  phalanx.add(knuckleMesh);

  return phalanx;
}

/* Update Finger Flexion from Slider / Presets */
function update3DFinger(fingerName, angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const joints = fingerJoints[fingerName];

  // Update label with cached DOM reference
  const valSpan = getValDom(fingerName);
  const labelText = `${angleDeg}°`;
  if (valSpan && valSpan.textContent !== labelText) {
    valSpan.textContent = labelText;
  }

  if (!joints || joints.length < 3) return;

  if (fingerName === 'thumb') {
    joints[0].rotation.z = angleRad * 0.6;
    joints[0].rotation.x = angleRad * 0.4;
    joints[1].rotation.z = angleRad * 0.7;
    joints[2].rotation.z = angleRad * 0.8;
  } else {
    joints[0].rotation.x = angleRad * 0.55;
    joints[1].rotation.x = angleRad * 0.75;
    joints[2].rotation.x = angleRad * 0.85;
  }
}

/* Preset Application */
function apply3DPreset(presetName) {
  isWaveMotionActive = false;
  const waveBtn = document.getElementById('btnWaveMotion');
  if (waveBtn) waveBtn.classList.remove('active');

  const presets = {
    powerGrip: { thumb: 85, index: 85, middle: 88, ring: 88, pinky: 85 },
    pinch: { thumb: 70, index: 75, middle: 10, ring: 10, pinky: 10 },
    open: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 }
  };

  const target = presets[presetName] || presets.open;
  Object.keys(target).forEach(finger => {
    const slider = getSliderDom(finger);
    if (slider) slider.value = target[finger];
    update3DFinger(finger, target[finger]);
  });
}

/* Wave Motion Loop */
function toggle3DWaveMotion() {
  isWaveMotionActive = !isWaveMotionActive;
  const waveBtn = document.getElementById('btnWaveMotion');
  if (waveBtn) {
    if (isWaveMotionActive) {
      waveBtn.classList.add('active');
    } else {
      waveBtn.classList.remove('active');
    }
  }
}

/* Visual Materials & Shader Modes */
function set3DMaterial(mode) {
  current3DMaterialMode = mode;

  ['btnMatCyber', 'btnMatWhite', 'btnMatWire'].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.classList.remove('active');
  });

  if (mode === 'cyber') document.getElementById('btnMatCyber')?.classList.add('active');
  if (mode === 'white') document.getElementById('btnMatWhite')?.classList.add('active');
  if (mode === 'wireframe') document.getElementById('btnMatWire')?.classList.add('active');

  const isWire = mode === 'wireframe';

  if (bionicHandGroup) {
    bionicHandGroup.traverse(child => {
      if (child.isMesh && child.material) {
        child.material.wireframe = isWire;
        if (mode === 'white') {
          child.material.color.setHex(0xF1F5F9);
          child.material.metalness = 0.1;
        } else if (mode === 'cyber') {
          child.material.wireframe = false;
        }
      }
    });
  }

  if (customLoadedModel) {
    customLoadedModel.traverse(child => {
      if (child.isMesh && child.material) {
        child.material.wireframe = isWire;
      }
    });
  }
}

/* Camera Views */
function set3DCameraPreset(preset) {
  if (!camera3D || !controls3D) return;
  if (preset === 'front') {
    camera3D.position.set(0, 4, 34);
  } else if (preset === 'side') {
    camera3D.position.set(34, 4, 0);
  } else if (preset === 'top') {
    camera3D.position.set(0, 36, 4);
  }
  controls3D.target.set(0, 0, 0);
  controls3D.update();
}

function reset3DCamera() {
  set3DCameraPreset('front');
}

function toggle3DAutoRotate() {
  is3DAutoRotate = !is3DAutoRotate;
  const btn = document.getElementById('btnAutoRotate');
  if (btn) {
    if (is3DAutoRotate) btn.classList.add('active');
    else btn.classList.remove('active');
  }
}

/* Toggle Wireframe Mode for CAD & Procedural Models */
let isWireframeActive = false;
function toggleWireframeMode() {
  isWireframeActive = !isWireframeActive;
  const btn = document.getElementById('btnToggleWireframe');
  if (btn) {
    if (isWireframeActive) btn.classList.add('active');
    else btn.classList.remove('active');
  }

  const applyWire = (obj) => {
    if (!obj) return;
    obj.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => { m.wireframe = isWireframeActive; });
        } else {
          child.material.wireframe = isWireframeActive;
        }
      }
    });
  };

  applyWire(customLoadedModel);
  applyWire(bionicHandGroup);
}

/* Auto-load Project 3D Model (proyecto.glb / proeycto.glb) */
function checkAndAutoLoadLocalModel() {
  const possibleNames = ['proyecto.glb', 'proeycto.glb'];
  if (typeof THREE.GLTFLoader === 'undefined') {
    const loaderEl = document.getElementById('viewer3d-loader');
    if (loaderEl) loaderEl.style.display = 'none';
    return;
  }

  const loader = new THREE.GLTFLoader();
  const loaderEl = document.getElementById('viewer3d-loader');
  const badge = document.getElementById('modelLoadedName');

  if (loaderEl) {
    loaderEl.style.display = 'flex';
    const span = loaderEl.querySelector('span');
    if (span) span.innerText = 'Cargando modelo 3D Pytyvõ Motion...';
  }
  if (badge) badge.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Cargando modelo 3D...`;

  function tryLoadNext(index) {
    if (index >= possibleNames.length) {
      if (loaderEl) loaderEl.style.display = 'none';
      if (badge) {
        badge.innerHTML = `<i class="fa-solid fa-cube text-green-brand"></i> Modelo 3D (Arrastra 'proyecto.glb' aquí)`;
      }
      return;
    }

    const name = possibleNames[index];
    loader.load(
      name,
      (gltf) => {
        if (loaderEl) loaderEl.style.display = 'none';

        // Optimize meshes so it runs at silky smooth 60 FPS while preserving vivid texture details
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
            if (child.material) {
              child.material.side = THREE.DoubleSide;
              // Balance metalness and roughness so diffuse textures & relief pop in studio lighting
              if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
                if (child.material.metalness > 0.35) {
                  child.material.metalness = 0.15;
                }
                if (child.material.roughness < 0.25) {
                  child.material.roughness = 0.55;
                }
                child.material.needsUpdate = true;
              }
            }
          }
        });

        displayLoadedModel(gltf.scene, 'Pytyvõ Motion (CAD)');
      },
      (xhr) => {
        if (xhr.lengthComputable && loaderEl) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          const span = loaderEl.querySelector('span');
          if (span) span.innerText = `Cargando modelo 3D (${percent}%)...`;
          if (badge) badge.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Cargando: ${percent}%`;
        }
      },
      (err) => {
        tryLoadNext(index + 1);
      }
    );
  }

  tryLoadNext(0);
}

/* Custom 3D File Upload Handler */
function handleUser3DFile(event) {
  const file = (event.target && event.target.files) ? event.target.files[0] : null;
  if (!file) return;

  const fileName = file.name.toLowerCase();
  const reader = new FileReader();

  const badge = document.getElementById('modelLoadedName');
  const loaderEl = document.getElementById('viewer3d-loader');
  if (loaderEl) {
    loaderEl.style.display = 'flex';
    loaderEl.querySelector('span').innerText = `Procesando ${file.name}...`;
  }
  if (badge) badge.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Cargando: ${file.name}`;

  reader.onprogress = function (e) {
    if (e.lengthComputable && loaderEl) {
      const pct = Math.round((e.loaded / e.total) * 100);
      loaderEl.querySelector('span').innerText = `Leyendo ${file.name}: ${pct}%`;
    }
  };

  if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
    reader.readAsArrayBuffer(file);
    reader.onload = function (e) {
      if (typeof THREE.GLTFLoader === 'undefined') return;
      const loader = new THREE.GLTFLoader();
      loader.parse(e.target.result, '', function (gltf) {
        if (loaderEl) loaderEl.style.display = 'none';

        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
            if (child.material) {
              child.material.side = THREE.DoubleSide;
              if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
                if (child.material.metalness > 0.35) child.material.metalness = 0.15;
                if (child.material.roughness < 0.25) child.material.roughness = 0.55;
                child.material.needsUpdate = true;
              }
            }
          }
        });

        displayLoadedModel(gltf.scene, file.name);
      }, function (err) {
        if (loaderEl) loaderEl.style.display = 'none';
        alert('Error al procesar el archivo GLB/GLTF.');
      });
    };
  } else if (fileName.endsWith('.stl')) {
    reader.readAsArrayBuffer(file);
    reader.onload = function (e) {
      if (typeof THREE.STLLoader === 'undefined') return;
      const loader = new THREE.STLLoader();
      const geometry = loader.parse(e.target.result);
      const material = new THREE.MeshStandardMaterial({ color: 0x6BA539, metalness: 0.3, roughness: 0.5 });
      const mesh = new THREE.Mesh(geometry, material);
      const group = new THREE.Group();
      group.add(mesh);
      if (loaderEl) loaderEl.style.display = 'none';
      displayLoadedModel(group, file.name);
    };
  } else if (fileName.endsWith('.obj')) {
    reader.readAsText(file);
    reader.onload = function (e) {
      if (typeof THREE.OBJLoader === 'undefined') return;
      const loader = new THREE.OBJLoader();
      const obj = loader.parse(e.target.result);
      if (loaderEl) loaderEl.style.display = 'none';
      displayLoadedModel(obj, file.name);
    };
  }
}

function displayLoadedModel(object3D, name, isOfficial = false) {
  if (!scene3D) return;

  // Hide procedural model
  if (bionicHandGroup) bionicHandGroup.visible = false;
  if (customLoadedModel) scene3D.remove(customLoadedModel);

  // Wrapper group to center pivot perfectly
  const wrapper = new THREE.Group();
  wrapper.userData = { isOfficialCAD: isOfficial };
  wrapper.add(object3D);

  // Normalize size and center
  const box = new THREE.Box3().setFromObject(object3D);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxAxis = Math.max(size.x, size.y, size.z);
  if (maxAxis > 0) {
    const scale = 22 / maxAxis;
    object3D.scale.set(scale, scale, scale);
    object3D.position.x = -center.x * scale;
    object3D.position.y = -center.y * scale;
    object3D.position.z = -center.z * scale;
  }

  customLoadedModel = wrapper;
  scene3D.add(wrapper);

  if (controls3D) {
    controls3D.target.set(0, 0, 0);
    controls3D.update();
  }

  const badge = document.getElementById('modelLoadedName');
  if (badge) badge.innerHTML = `<i class="fa-solid fa-check text-green-brand"></i> Modelo: ${name}`;
}

function on3DWindowResize() {
  const container = document.getElementById('threejs-canvas-container');
  if (!container || !renderer3D || !camera3D) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  camera3D.aspect = width / height;
  camera3D.updateProjectionMatrix();
  renderer3D.setSize(width, height);
}

function animate3DScene() {
  // If offscreen, pause animation loop entirely to free 100% GPU/CPU
  if (!isViewer3DVisible) {
    animationFrameId3D = null;
    return;
  }

  animationFrameId3D = requestAnimationFrame(animate3DScene);

  // Auto-Rotation
  if (controls3D) {
    controls3D.autoRotate = is3DAutoRotate;
    controls3D.autoRotateSpeed = 2.0;
    controls3D.update();
  }

  // Wave Motion Simulation
  if (isWaveMotionActive) {
    waveTime += 0.04;
    const fingers = ['thumb', 'index', 'middle', 'ring', 'pinky'];
    for (let i = 0; i < 5; i++) {
      const finger = fingers[i];
      const angle = Math.round((Math.sin(waveTime + i * 0.6) * 0.5 + 0.5) * 85);
      const slider = getSliderDom(finger);
      if (slider && Number(slider.value) !== angle) {
        slider.value = angle;
      }
      update3DFinger(finger, angle);
    }
  }

  if (renderer3D && scene3D && camera3D) {
    renderer3D.render(scene3D, camera3D);
  }
}
