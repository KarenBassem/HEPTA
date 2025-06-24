import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyDP8zx2Tn9fbaGTNm8OcxpaPhqW3dTfRTA",
    authDomain: "hepta-44dfa.firebaseapp.com",
    projectId: "hepta-44dfa",
    storageBucket: "hepta-44dfa.firebasestorage.app",
    databaseURL: "https://hepta-44dfa-default-rtdb.firebaseio.com",
    messagingSenderId: "968614248704",
    appId: "1:968614248704:web:62d89aed72cc8399cff3e5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle form submission
const loginForm = document.getElementById('loginForm');
if (!loginForm) {
    console.error('loginForm not found');
    document.body.innerHTML += '<div style="color: red;">خطأ: نموذج تسجيل الدخول غير موجود</div>';
} else {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorMsg = document.getElementById('errorMsg');
        const allowedTeams = ['7up', 'zing', '7star'];

        try {
            // Sign in with Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('Logged in user:', user.email);

            // Redirect based on email
            if (user.email === 'peterbassem@gmail.com') {
                window.location.href = 'admin.html';
            } else if (user.email === '7up@gmail.com') {
                window.location.href = 'team.html?team=7up';
            } else if (user.email === '7star@gmail.com') {
                window.location.href = 'team.html?team=7star';
            } else if (user.email === 'zing@gmail.com') {
                window.location.href = 'team.html?team=zing';
            } else {
                errorMsg.textContent = 'يرجى اختيار فريق صحيح';
            }
        } catch (error) {
            errorMsg.textContent = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
            console.error('Login error:', error.message);
        }
    });
}