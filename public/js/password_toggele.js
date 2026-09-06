const password_fields = document.querySelectorAll('input[type="password"]');
const password_toggler = document.querySelector(".password_toggler");


password_toggler.addEventListener("click", () => {

    if (password_toggler.classList.contains("hide-password")) {
        password_toggler.classList.remove("hide-password");
        password_toggler.classList.add("show-password");
        password_toggler.textContent = "Hide Password"
        for (let i = 0; i < password_fields.length; i++) {
            password_fields[i].type = "text";
        }
    } else {
        password_toggler.classList.add("hide-password");
        password_toggler.classList.remove("show-password");
        password_toggler.textContent = "Show Password"
        for (let i = 0; i < password_fields.length; i++) {
            password_fields[i].type = "password";
        }
    }
});
