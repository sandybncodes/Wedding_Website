const targetDate = new Date('2027-06-06T16:30:00');

function updateCountdown() {
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealItems.forEach((item) => revealObserver.observe(item));

const musicToggle = document.getElementById('musicToggle');
const weddingAudio = document.getElementById('weddingAudio');
const musicSources = [
  'music/All%20of%20Me%20-%20John%20Legend%20-%20Violin%20and%20Guitar%20Cover%20-%20Daniel%20Jang.mp3'
];
let activeMusicIndex = 0;

const setMusicSource = (index) => {
  activeMusicIndex = index;
  weddingAudio.src = musicSources[index];
  weddingAudio.load();
};

musicToggle?.addEventListener('click', async () => {
  const isPaused = weddingAudio.paused;

  try {
    if (isPaused) {
      if (!weddingAudio.src || weddingAudio.currentSrc === '') {
        setMusicSource(activeMusicIndex);
      }
      await weddingAudio.play();
      musicToggle.classList.add('is-playing');
      musicToggle.querySelector('.music-label').textContent = 'Pause';
    } else {
      weddingAudio.pause();
      musicToggle.classList.remove('is-playing');
      musicToggle.querySelector('.music-label').textContent = 'Music';
    }
  } catch (error) {
    console.warn('Audio playback was blocked or the local file could not be loaded.', error);
  }
});

document.getElementById('rsvpForm')?.addEventListener('submit', async function (event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const guests = document.getElementById('guests').value;
  const attendance = document.getElementById('attendance').value;

  if (!name || !guests || !attendance) {
    alert('Vă rugăm să completați toate câmpurile.');
    return;
  }

  const statusText = attendance === 'da'
    ? 'Voi fi prezent/ă'
    : 'Nu pot participa';

  const statusMessage = attendance === 'da'
    ? `Mulțumim, ${name}! Vă așteptăm cu ${guests} invitați la nunta noastră.`
    : `Mulțumim, ${name}! Vă apreciem dragostea și vă dorim multe bucurii.`;

  alert(statusMessage);

  try {
    const resp = await fetch('https://formspree.io/f/xvkojkny', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name,
        guests,
        attendance,
        _subject: 'Confirmare prezență la nunta Sandu & Olguta'
      })
    });

    if (resp.ok) {
      alert('Răspuns trimis cu succes. Vă mulțumim!');
    } else {
      console.error('Formspree error', resp.status);
      alert('Eroare la trimiterea răspunsului. Vă rugăm încercați din nou mai târziu.');
    }
  } catch (err) {
    console.error('Request error', err);
    alert('Eroare la trimiterea răspunsului. Verificați conexiunea la internet.');
  }

  this.reset();
  document.getElementById('guests').value = '2';
});

// If a Google Form embed URL is added to the iframe, set the open link to the non-embedded form URL
(() => {
  const googleFormEmbed = document.getElementById('googleFormEmbed');
  const googleFormOpen = document.getElementById('googleFormOpen');
  if (!googleFormEmbed || !googleFormOpen) return;

  const embedSrc = googleFormEmbed.getAttribute('src') || '';
  if (!embedSrc || embedSrc === 'PASTE_YOUR_GOOGLE_FORM_EMBED_URL_HERE') {
    googleFormOpen.href = '#';
    return;
  }

  // Typical Google Forms embed uses '/viewform?embedded=true' — convert to '/viewform'
  try {
    let openUrl = embedSrc.replace('/viewform?embedded=true', '/viewform');
    // If embed URL already points to the 'forms' path, ensure it opens correctly
    googleFormOpen.href = openUrl;
  } catch (e) {
    googleFormOpen.href = embedSrc;
  }
})();
