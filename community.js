(function () {
      const form = document.querySelector('form');
      if (!form) return console.warn('Form not found on page');

      // create status box
      const statusBox = document.createElement('div');
      statusBox.style.marginTop = '14px';
      statusBox.style.textAlign = 'center';
      statusBox.style.fontWeight = '700';
      form.appendChild(statusBox);

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusBox.textContent = '';
        statusBox.style.color = '#0b74da';

        // read fields (relies on form order)
        // Full Name -> first input
        // Email -> second input
        // Phone -> third input
        // Role -> select
        // About -> textarea
        const inputs = form.querySelectorAll('input');
        const textarea = form.querySelector('textarea');
        const select = form.querySelector('select');

        const name = (inputs[0] && inputs[0].value.trim()) || '';
        const email = (inputs[1] && inputs[1].value.trim()) || '';
        const phone = (inputs[2] && inputs[2].value.trim()) || '';
        const role = (select && select.value) || '';
        const about = (textarea && textarea.value.trim()) || '';

        // basic frontend validation
        if (!name || !email || !phone || !role) {
          statusBox.style.color = '#ff4d4f';
          statusBox.textContent = 'Please fill name, email, phone and choose a role.';
          return;
        }

        // disable submit
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; var oldText = btn.textContent; btn.textContent = 'Submitting...'; }

        try {
          // if you are serving the page from Live Server (different port), replace '' with backend origin:
          // const BASE = 'http://localhost:5000';
          const BASE = ''; // keep empty if you're opening page from backend (http://localhost:5000)
          const res = await fetch(`http://localhost:5000/api/community`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, role, about })
          });

          const data = await res.json().catch(() => ({}));

          if (res.ok) {
            statusBox.style.color = '#23c55e';
            statusBox.textContent = data.message || 'Submitted successfully!';
            form.reset();
          } else {
            statusBox.style.color = '#ff4d4f';
            statusBox.textContent = (data.error || `Submit failed (status ${res.status})`);
          }
        } catch (err) {
          console.error('Network error:', err);
          statusBox.style.color = '#ff4d4f';
          statusBox.textContent = 'Network error — check server.';
        } finally {
          if (btn) { btn.disabled = false; btn.textContent = oldText; }
        }
      });
    })();