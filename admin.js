import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getDatabase, ref, get, set, onValue } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDP8zx2Tn9fbaGTNm8OcxpaPhqW3dTfRTA",
  authDomain: "hepta-44dfa.firebaseapp.com",
  projectId: "hepta-44dfa",
  storageBucket: "hepta-44dfa.firebasestorage.app",
  databaseURL: "https://hepta-44dfa-default-rtdb.firebaseio.com",
  messagingSenderId: "968614248704",
  appId: "1:968614248704:web:62d89aed72cc8399cff3e5"
};

try {
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth(app);

  const teams = ['7up', 'zing', '7star'];

  function createTeamBox(team) {
    console.log(`Creating team box for ${team}`);
    const box = document.createElement('div');
    box.className = 'team-box';
    box.innerHTML = `
      <h3>${team.toUpperCase()}</h3>
      <div class="score" id="${team}-score">الدرجات الحالية: <span>0</span></div>
      <input type="number" id="${team}-input" placeholder="أدخل الدرجة">
      <div class="error" id="${team}-error"></div>
      <br>
      <button class="add-btn" data-team="${team}">ADD</button>
      <button class="remove-btn" data-team="${team}">DELETE</button>
    `;
    const addButton = box.querySelector(`button[data-team="${team}"].add-btn`);
    const removeButton = box.querySelector(`button[data-team="${team}"].remove-btn`);
    if (addButton) {
      addButton.addEventListener('click', () => {
        console.log(`ADD button clicked for ${team}`);
        addScore(team);
      });
    } else {
      console.error(`Add button for ${team} not found`);
    }
    if (removeButton) {
      removeButton.addEventListener('click', () => {
        console.log(`DELETE button clicked for ${team}`);
        removeScore(team);
      });
    } else {
      console.error(`Remove button for ${team} not found`);
    }
    return box;
  }

  function updateScoreDisplay(team, score) {
    console.log(`Updating score display for ${team}: ${score}`);
    const scoreElement = document.getElementById(`${team}-score`);
    const errorElement = document.getElementById(`${team}-error`);
    if (scoreElement) {
      scoreElement.innerHTML = `الدرجات الحالية: ${score}`;
      scoreElement.dataset.score = score;
      console.log(`Score element updated: ${scoreElement.innerHTML}`);
    } else {
      console.error(`Score element ${team}-score not found`);
      if (errorElement) errorElement.textContent = `خطأ: عنصر العرض ${team}-score غير موجود`;
    }
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  async function addScore(team) {
    console.log(`addScore called for ${team}`);
    const input = document.getElementById(`${team}-input`);
    const errorElement = document.getElementById(`${team}-error`);
    if (!input) {
      console.error(`Input element ${team}-input not found`);
      if (errorElement) errorElement.textContent = 'خطأ: حقل الإدخال غير موجود';
      return;
    }
    const value = parseInt(input.value) || 0;
    if (isNaN(value)) {
      console.warn(`Invalid input for ${team}: ${input.value}`);
      if (errorElement) errorElement.textContent = 'يرجى إدخال رقم صحيح';
      return;
    }

    const scoreRef = ref(database, `teams/${team}/score`);
    try {
      const snapshot = await get(scoreRef);
      const currentScore = snapshot.exists() ? snapshot.val() : 0;
      console.log(`Current score for ${team}: ${currentScore}, Adding: ${value}`);
      const newScore = currentScore + value;
      await set(scoreRef, newScore);
      console.log(`Score updated for ${team} to ${newScore}`);
      updateScoreDisplay(team, newScore);
      input.value = '';
      if (errorElement) errorElement.textContent = '';
    } catch (error) {
      console.error(`Error updating score for ${team}:`, error.message);
      if (errorElement) errorElement.textContent = `خطأ: ${error.message}`;
    }
  }

  async function removeScore(team) {
    console.log(`removeScore called for ${team}`);
    const input = document.getElementById(`${team}-input`);
    const errorElement = document.getElementById(`${team}-error`);
    if (!input) {
      console.error(`Input element ${team}-input not found`);
      if (errorElement) errorElement.textContent = 'خطأ: حقل الإدخال غير موجود';
      return;
    }
    const value = parseInt(input.value) || 0;
    if (isNaN(value)) {
      console.warn(`Invalid input for ${team}: ${input.value}`);
      if (errorElement) errorElement.textContent = 'يرجى إدخال رقم صحيح';
      return;
    }

    const scoreRef = ref(database, `teams/${team}/score`);
    try {
      const snapshot = await get(scoreRef);
      const currentScore = snapshot.exists() ? snapshot.val() : 0;
      const newScore = Math.max(0, currentScore - value);
      console.log(`Current score for ${team}: ${currentScore}, Removing: ${value}, New score: ${newScore}`);
      await set(scoreRef, newScore);
      console.log(`Score updated for ${team} to ${newScore}`);
      updateScoreDisplay(team, newScore);
      if (newScore === 0) {
        await set(ref(database, `teams/${team}/battery`), 0);
        console.log(`Battery reset for ${team}`);
      }
      input.value = '';
      if (errorElement) errorElement.textContent = '';
    } catch (error) {
      console.error(`Error removing score for ${team}:`, error.message);
      if (errorElement) errorElement.textContent = `خطأ: ${error.message}`;
    }
  }

  function initializeTeams() {
    console.log('Initializing teams');
    const container = document.getElementById('teamsContainer');
    const loading = document.getElementById('loading');
    if (!container) {
      console.error('teamsContainer not found');
      document.body.innerHTML += '<div style="color: red;">خطأ: حاوية الفرق غير موجودة</div>';
      return;
    }
    if (loading) {
      loading.style.display = 'none';
    }
    teams.forEach(team => {
      console.log(`Appending team box for ${team}`);
      try {
        const box = createTeamBox(team);
        container.appendChild(box);
        const scoreRef = ref(database, `teams/${team}/score`);
        get(scoreRef).then((snapshot) => {
          const score = snapshot.exists() ? snapshot.val() : 0;
          console.log(`Initial fetch for ${team}: score=${score}`);
          updateScoreDisplay(team, score);
        }).catch((error) => {
          console.error(`Error fetching initial score for ${team}:`, error.message);
          const errorElement = document.getElementById(`${team}-error`);
          if (errorElement) errorElement.textContent = `خطأ: ${error.message}`;
        });
        onValue(scoreRef, (snapshot) => {
          console.log(`onValue triggered for ${team}, snapshot: ${JSON.stringify(snapshot.val())}`);
          const score = snapshot.exists() ? snapshot.val() : 0;
          updateScoreDisplay(team, score);
        }, (error) => {
          console.error(`Error listening to score for ${team}:`, error.message);
          const errorElement = document.getElementById(`${team}-error`);
          if (errorElement) errorElement.textContent = `خطأ: ${error.message}`;
        });
      } catch (error) {
        console.error(`Error initializing team ${team}:`, error.message);
      }
    });
  }

  onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user ? user.email : 'No user');
    if (!user || user.email !== 'peterbassem@gmail.com') {
      console.warn('Unauthorized access, redirecting to index.html');
      window.location.href = 'index.html';
    } else {
      console.log('Admin authenticated, initializing teams');
      console.log('Exact email:', JSON.stringify(auth.currentUser.email));
      initializeTeams();
    }
  });
} catch (error) {
  console.error('Initialization error:', error.message);
  document.body.innerHTML += `<div style="color: red;">خطأ في تحميل الموارد: ${error.message}</div>`;
}