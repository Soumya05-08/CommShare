(function () {
    const form = document.querySelector('form');
    const button = form.querySelector('button[type="submit"]');

    // Create message box below form
    const msgBox = document.createElement('div');
    msgBox.style.marginTop = '15px';
    msgBox.style.textAlign = 'center';
    msgBox.style.fontWeight = '600';
    msgBox.style.fontSize = '0.95rem';
    msgBox.style.transition = '0.3s ease';
    form.appendChild(msgBox);

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        // Validation
        if (!name || !email || !message) {
            msgBox.textContent = 'Please fill all fields.';
            msgBox.style.color = '#ff7070';
            return;
        }

        // Disable button while sending
        const original = button.textContent;
        button.disabled = true;
        button.textContent = 'Sending...';

        msgBox.textContent = ''; // clear old messages

        try {
            const res = await fetch('http://localhost:5000/api/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, message })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                msgBox.style.color = '#7dffb0';
                msgBox.textContent = data.message || 'Message sent successfully!';

                form.reset(); // clear fields
            } else {
                msgBox.style.color = '#ff6b6b';
                msgBox.textContent = data.error || 'Failed to send message.';
            }

        } catch (err) {
            console.error(err);
            msgBox.style.color = '#ff6b6b';
            msgBox.textContent = 'Server unreachable. Check backend.';
        }

        // Restore button
        button.disabled = false;
        button.textContent = original;
    });
})();
