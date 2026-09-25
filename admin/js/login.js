document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#login-form');
    const username = document.querySelector('#username');
    const password = document.querySelector('#password');
    const errorMessage = document.querySelector('#error-message');
    const submitBtn = document.querySelector('#submit');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username.value,
                    password: password.value
                })
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || 'Login failed');
            }

            window.location.href = '/admin/dashboard';
        } catch (err) {
            errorMessage.textContent = err.message;
            errorMessage.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    });
});
