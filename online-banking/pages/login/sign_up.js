registerForm = document.getElementById("registration-form")

registerForm.addEventListener("submit", (event) => {
    event.preventDefault()

    const name = document.getElementById("name").value
    const surname = document.getElementById("surname").value
    const patronymic = document.getElementById("patronymic").value
    const passport = document.getElementById("passport").value
    const phone = document.getElementById("phone").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const confirm_password = document.getElementById("confirm-password").value

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Неверный формат электронной почты")
        return false
    }

    if (password !== confirm_password) {
        alert("Пароли не совпадают")
        return false;
    }

    const user = {
        first_name: name,
        last_name: surname,
        patronymic: patronymic,
        passport_number: passport,
        phone: phone,
        email: email,
        password: password
    }

    console.log(user)

    fetch('/user/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => {
            if (response.status === 201) {
                alert('Вы успешно зарегистрированы');
                window.location = '/login/'
            } else if (response.status === 400) {
                alert("Проверьте введенные данные")
                return response.json();
            } else {
                throw new Error('Unexpected server error');
            }
        })
        .then(data => {
            if (data && data.message === 'User with this email already exists') {
                alert('Пользователь с таким email уже существует');
            } else {
                console.error('Ошибка регистрации:', data ? data.message : 'Unexpected server error');
            }
        })
        .catch(error => {
            alert("Проверьте введенные данные")
            console.error('Ошибка регистрации:', error.message);
        });


    // alert("Вы успешно зарегистрированы")
    // window.location = '/login/'
})