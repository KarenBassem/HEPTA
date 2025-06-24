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

  const teamName = new URLSearchParams(window.location.search).get('team');
  const allowedTeams = ['7up', 'zing', '7star'];

  if (!allowedTeams.includes(teamName)) {
    document.body.innerHTML = '<h2>بيانات غير صحيحة</h2>';
    console.error(`Invalid team: ${teamName}`);
    throw new Error('فريق غير موجود');
  }

  const teamNameElement = document.getElementById('teamName');
  const scoreSpan = document.getElementById('score');
  const segments = document.querySelectorAll('.battery-segment');
  const chargeBtn = document.getElementById('chargeBtn');
  const errorElement = document.createElement('div');
  errorElement.className = 'error';
  errorElement.id = 'error';
  document.body.appendChild(errorElement);

  if (!teamNameElement || !scoreSpan || !chargeBtn) {
    console.error('Missing DOM elements:', {
      teamName: !!teamNameElement,
      score: !!scoreSpan,
      chargeBtn: !!chargeBtn
    });
    errorElement.textContent = 'خطأ: عناصر الصفحة مفقودة';
    throw new Error('عناصر DOM مفقودة');
  }

  teamNameElement.textContent = teamName;
  const thresholds = [100, 200, 300, 400, 500, 600];

  function updateTeamData(score, batteryCharge) {
    console.log(`Updating data for team ${teamName}: score=${score}, battery=${batteryCharge}`);
    scoreSpan.textContent = score;
    segments.forEach((segment, index) => {
      segment.classList.remove('filled-red', 'filled-yellow', 'filled-green');
      if (index < batteryCharge) {
        if (index < 2) {
          segment.classList.add('filled-red');
        } else if (index < 4) {
          segment.classList.add('filled-yellow');
        } else {
          segment.classList.add('filled-green');
        }
      }
    });
    const canCharge = batteryCharge < 6 && score >= thresholds[batteryCharge];
    chargeBtn.style.display = canCharge ? 'inline-block' : 'none';
    console.log(`Charge button display: ${chargeBtn.style.display}, canCharge: ${canCharge}`);
  }

  function initializeTeamData() {
    console.log(`Initializing data for ${teamName}`);
    const scoreRef = ref(database, `teams/${teamName}/score`);
    const batteryRef = ref(database, `teams/${teamName}/battery`);

    get(scoreRef).then((scoreSnapshot) => {
      const score = scoreSnapshot.exists() ? scoreSnapshot.val() : 0;
      get(batteryRef).then((batterySnapshot) => {
        const batteryCharge = batterySnapshot.exists() ? batterySnapshot.val() : 0;
        console.log(`Initial fetch: score=${score}, battery=${batteryCharge}`);
        updateTeamData(score, batteryCharge);
      }).catch((error) => {
        console.error(`Error fetching battery for ${teamName}:`, error.message);
        errorElement.textContent = `خطأ في جلب بيانات البطارية: ${error.message}`;
      });
    }).catch((error) => {
      console.error(`Error fetching score for ${teamName}:`, error.message);
      errorElement.textContent = `خطأ في جلب النقاط: ${error.message}`;
    });

    onValue(scoreRef, (snapshot) => {
      console.log(`onValue triggered for score ${teamName}: ${snapshot.val()}`);
      const score = snapshot.exists() ? snapshot.val() : 0;
      get(batteryRef).then((batterySnapshot) => {
        const batteryCharge = batterySnapshot.exists() ? batterySnapshot.val() : 0;
        updateTeamData(score, batteryCharge);
      }).catch((error) => {
        console.error(`Error fetching battery for ${teamName}:`, error.message);
        errorElement.textContent = `خطأ في جلب بيانات البطارية: ${error.message}`;
      });
    }, (error) => {
      console.error(`Error listening to score for ${teamName}:`, error.message);
      errorElement.textContent = `خطأ في تتبع النقاط: ${error.message}`;
    });

    onValue(batteryRef, (snapshot) => {
      console.log(`onValue triggered for battery ${teamName}: ${snapshot.val()}`);
      const batteryCharge = snapshot.exists() ? snapshot.val() : 0;
      get(scoreRef).then((scoreSnapshot) => {
        const score = scoreSnapshot.exists() ? scoreSnapshot.val() : 0;
        updateTeamData(score, batteryCharge);
      }).catch((error) => {
        console.error(`Error fetching score for ${teamName}:`, error.message);
        errorElement.textContent = `خطأ في جلب النقاط: ${error.message}`;
      });
    }, (error) => {
      console.error(`Error listening to battery for ${teamName}:`, error.message);
      errorElement.textContent = `خطأ في تتبع البطارية: ${error.message}`;
    });
  }

  chargeBtn.addEventListener('click', async () => {
    console.log(`Charge button clicked for ${teamName}`);
    const scoreRef = ref(database, `teams/${teamName}/score`);
    const batteryRef = ref(database, `teams/${teamName}/battery`);
    try {
      const scoreSnapshot = await get(scoreRef);
      const batterySnapshot = await get(batteryRef);
      const score = scoreSnapshot.exists() ? scoreSnapshot.val() : 0;
      const batteryCharge = batterySnapshot.exists() ? batterySnapshot.val() : 0;

      if (batteryCharge < 6 && score >= thresholds[batteryCharge]) {
        console.log(`Charging battery: ${score} - ${thresholds[batteryCharge]} = ${score - thresholds[batteryCharge]}`);
        await set(scoreRef, score - thresholds[batteryCharge]);
        await set(batteryRef, batteryCharge + 1);
      } else {
        console.warn(`Cannot charge: battery=${batteryCharge}, score=${score}, threshold=${thresholds[batteryCharge]}`);
        errorElement.textContent = 'لا توجد نقاط كافية لشحن البطارية';
      }
    } catch (error) {
      console.error(`Error charging battery for ${teamName}:`, error.message);
      errorElement.textContent = error.message.includes('PERMISSION_DENIED') 
        ? 'ليس لديك إذن لشحن البطارية. تواصل مع المسؤول.'
        : `خطأ في شحن البطارية: ${error.message}`;
    }
  });

  onAuthStateChanged(auth, async (user) => {
    console.log('Auth state changed:', user ? user.email : 'No user');
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    initializeTeamData();
  });
} catch (error) {
  console.error('Initialization error:', error.message);
  errorElement.textContent = `خطأ في تحميل الموارد: ${error.message}`;
}