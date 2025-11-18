const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) document.getElementById('email').value = emailParam;

      const form = document.getElementById('otpForm');
      const msg = document.getElementById('msg');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const otp = document.getElementById('otp').value;
        try {
          const res = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
          });
          const data = await res.json();
          if (res.ok) {
            msg.textContent = data.message;
            msg.style.color = "green";
            // Redirect to login
            setTimeout(() => window.location.href = '/index1.html', 1500);
          } else {
            msg.textContent = data.message || 'Error';
            msg.style.color = "red";
          }
        } catch (err) {
          msg.textContent = 'Network error';
          msg.style.color = "red";
        }
      });

      document.getElementById('resend').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        if (!email) return alert('Enter email to resend OTP');
        const res = await fetch('/api/auth/resend-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        alert(data.message || 'Check console');
      });