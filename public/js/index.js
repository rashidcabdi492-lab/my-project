document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#registration-form");

    const username = document.querySelector("#username");
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    const cpass = document.querySelector("#cpass");

    // Each input's error message is the <small> right after it
    const usernameError = username.nextElementSibling;
    const emailError = email.nextElementSibling;
    const passwordError = password.nextElementSibling;
    const cpassError = cpass.nextElementSibling;

    // Create a success message element (hidden until registration succeeds)
    const successMsg = document.createElement("p");
    successMsg.id = "success-message";
    successMsg.style.color = "green";
    successMsg.style.display = "none";
    successMsg.innerText = "Registration successful!";
    form.appendChild(successMsg);

    const showError = (input, errorEl, message) => {
        errorEl.innerText = message;
        errorEl.style.color = "red";
        errorEl.style.display = "block";
        input.classList.add("error-input");
    };

    const clearError = (input, errorEl) => {
        errorEl.style.display = "none";
        input.classList.remove("error-input");
    };

    const isValidEmail = (value) => {
        // Basic email pattern: something@something.something
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    const validateUsername = () => {
        const value = username.value.trim();
        if (!value) {
            showError(username, usernameError, "Username is required");
            return false;
        }
        if (value.length < 3) {
            showError(username, usernameError, "Username must be at least 3 characters");
            return false;
        }
        clearError(username, usernameError);
        return true;
    };

    const validateEmail = () => {
        const value = email.value.trim();
        if (!value) {
            showError(email, emailError, "Email is required");
            return false;
        }
        if (!isValidEmail(value)) {
            showError(email, emailError, "Enter a valid email address");
            return false;
        }
        clearError(email, emailError);
        return true;
    };

    const validatePassword = () => {
        const value = password.value;
        if (!value) {
            showError(password, passwordError, "Password is required");
            return false;
        }
        if (value.length < 6) {
            showError(password, passwordError, "Password must be at least 6 characters");
            return false;
        }
        clearError(password, passwordError);
        return true;
    };

    const validateConfirmPassword = () => {
        const value = cpass.value;
        if (!value) {
            showError(cpass, cpassError, "Please confirm your password");
            return false;
        }
        if (value !== password.value) {
            showError(cpass, cpassError, "Passwords do not match");
            return false;
        }
        clearError(cpass, cpassError);
        return true;
    };

    // Live validation as the user types/leaves a field
    username.addEventListener("blur", validateUsername);
    email.addEventListener("blur", validateEmail);
    password.addEventListener("blur", validatePassword);
    cpass.addEventListener("blur", validateConfirmPassword);

    username.addEventListener("input", () => clearError(username, usernameError));
    email.addEventListener("input", () => clearError(email, emailError));
    password.addEventListener("input", () => clearError(password, passwordError));
    cpass.addEventListener("input", () => clearError(cpass, cpassError));

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        successMsg.style.display = "none";

        const isUsernameValid = validateUsername();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmValid = validateConfirmPassword();

        const allValid = isUsernameValid && isEmailValid && isPasswordValid && isConfirmValid;

        if (allValid) {
            successMsg.style.display = "block";
            form.reset();

            // Give the user a moment to see the success message, then redirect
            setTimeout(() => {
                window.location.href = "overview.html";
            }, 1500);
        }
    });
});
