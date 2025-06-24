import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyDP8zx2Tn9fbaGTNm8OcxpaPhqW3dTfRTA",
    authDomain: "hepta-44dfa.firebaseapp.com",
    projectId: "hepta-44dfa",
    storageBucket: "hepta-44dfa.firebasestorage.app",
    databaseURL: "https://hepta-44dfa-default-rtdb.firebaseio.com",
    messagingSenderId: "968614248704",
    appId: "1:968614248704:web:62d89aed72cc8399cff3e5"
};

async function initializeTeams() {
    const teams = ['7up', 'zing', '7star'];
    for (const team of teams) {
      await set(ref(database, `teams/${team}`), {
        score: 0,
        battery: 0
      });
    }
    console.log('Teams initialized');
  }
  
  initializeTeams().catch(error => console.error('Error:', error));