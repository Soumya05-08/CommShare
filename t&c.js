const checkbox = document.getElementById('agree');
    const doneBtn = document.getElementById('doneBtn');

    // Enable button only when checkbox is checked
    checkbox.addEventListener('change', () => {
      doneBtn.disabled = !checkbox.checked;
    });

    // Redirect back to previous page when done
    doneBtn.addEventListener('click', () => {
      if (checkbox.checked) {
        window.history.back(); // takes user back to previous page
      }
    });