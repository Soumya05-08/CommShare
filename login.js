// --- UI toggles (kept from your original) ---
  let wrapper = document.querySelector('.wrapper'),
      signUpLink = document.querySelector('.link .signup-link'),
      signInLink = document.querySelector('.link .signin-link');

  if (signUpLink) {
    signUpLink.addEventListener('click', (e) => {
      e.preventDefault();
      wrapper.classList.add('animated-signin');
      wrapper.classList.remove('animated-signup');
      focusFirstInput('.form-container.sign-up');
    });
  }
  if (signInLink) {
    signInLink.addEventListener('click', (e) => {
      e.preventDefault();
      wrapper.classList.add('animated-signup');
      wrapper.classList.remove('animated-signin');
      focusFirstInput('.form-container.sign-in');
    });
  }

  function focusFirstInput(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const input = container.querySelector('input');
    if (input) input.focus();
  }

  // login.js - auto backend routing (works if you open via Live Server or via backend)
document.addEventListener('DOMContentLoaded', () => {
  console.log('login.js loaded');

  // If your backend runs on different port, change this:
  const BACKEND_FULL_ORIGIN = 'http://localhost:5000'; // <-- set to your backend origin if not 5000

  // If the page is served from Live Server (port 5502) or any origin not equal to backend,
  // use BACKEND_FULL_ORIGIN, otherwise use relative path.
  const usingLiveServer = (location.hostname === '127.0.0.1' || location.hostname === 'localhost') && location.port === '5502';
  const API_BASE = usingLiveServer ? BACKEND_FULL_ORIGIN : '';

  console.log('API base:', API_BASE || '(same origin)');

  const signupForm = document.getElementById('signupForm') || document.forms['myForm2'];
  const loginForm = document.getElementById('loginForm') || document.forms['myForm1'];

  async function safeJson(res) {
    try { return await res.json(); }
    catch (e) {
      const txt = await res.text().catch(() => '');
      return { _rawText: txt, message: 'Invalid JSON response from server' };
    }
  }

  // SIGNUP
  if (signupForm) {
    console.log('signupForm found');
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const username = signupForm.querySelector('input[name="usernameUp"]').value.trim();
        const email = signupForm.querySelector('input[name="emailUp"]').value.trim();
        const password = signupForm.querySelector('input[name="passwordUp"]').value;
        const confirmPassword = signupForm.querySelector('input[name="confirmPassword"]').value;
        if (!username || !email || !password) return alert('All fields required');
        if (password !== confirmPassword) return alert('Passwords do not match');

        console.log('Sending signup:', { username, email });
        const res = await fetch(`${API_BASE}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });

        const data = await safeJson(res);
        console.log('signup response', res.status, data);

        if (res.ok) {
          alert(data.message || 'Signup successful — OTP sent');
          window.location.href = `${API_BASE}/otp.html?email=${encodeURIComponent(email)}`;
        } else {
          alert(data.message || `Signup failed (status ${res.status})`);
        }
      } catch (err) {
        console.error('Signup error:', err);
        alert('Network or parsing error (see console)');
      }
    });
  } else {
    console.log('signupForm NOT found');
  }

  // LOGIN
  if (loginForm) {
    console.log('loginForm found');
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const usernameOrEmail = loginForm.querySelector('input[name="usernameIn"]').value.trim();
        const password = loginForm.querySelector('input[name="passwordIn"]').value;
        if (!usernameOrEmail || !password) return alert('All fields required');

        console.log('Sending login for', usernameOrEmail);
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailOrUsername: usernameOrEmail, password })
        });

        const data = await safeJson(res);
        console.log('login response', res.status, data);

        if (res.ok) {
          localStorage.setItem('token', data.token);
          alert('Login successful');
          window.location.href = `${API_BASE}/index1.html`;
        } else {
          alert(data.message || `Login failed (status ${res.status})`);
        }
      } catch (err) {
        console.error('Login error:', err);
        alert('Network or parsing error (see console)');
      }
    });
  } else {
    console.log('loginForm NOT found');
  }
});
