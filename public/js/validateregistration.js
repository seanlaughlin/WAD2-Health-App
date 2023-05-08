
const validateForm = (e) => {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Compare password and confirm password
    if (password !== confirmPassword) {
        // Display error
        document.getElementById("message").innerText = "Passwords don't match. Try again.";

        return false;
    }
    else{
        return true;
    }
}