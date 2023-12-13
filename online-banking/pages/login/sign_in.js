const sendCodeButton = document.getElementById("send-code")
const loginButton = document.getElementById("login-button")
const verifyContainer = document.querySelector(".verify-container")


sendCodeButton.addEventListener("click", (event) => {
    event.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    const user = {
        email: email,
        password: password
    }

    fetch('/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => {
            if (!response.ok) {
                alert("Неверный email или пароль")
                throw new Error('Network response was not ok');
            } else if (response.status === 201) {
                return response.json()
            } else {
                alert("Error")
            }
        })
        .then((user) => {
            verifyContainer.classList.toggle("verify-container")
            document.querySelector(".button-wrapper button").innerHTML = "Войти"

            sendCodeButton.classList.toggle("send-code")
            sendCodeButton.classList.toggle("show-send-code")
            loginButton.classList.toggle("login-button")
            loginButton.classList.toggle("show-login-button")


            document.getElementById("email").setAttribute('disabled', 'disabled')
            document.getElementById("password").setAttribute('disabled', 'disabled')

            fetch(`/user/send-code/${email}`)
                .then(response => {
                    if (response.status === 500) {
                        alert("Произошла ошибка")
                        return
                    }
                    return response.json()
                })
                .then(data => {
                    loginButton.addEventListener("click", () => {
                        event.preventDefault()
                        const authCodeInput = document.getElementById("verify-code").value
                        console.log(authCodeInput)
                        console.log(data.authCode)
                        if (authCodeInput && (authCodeInput == data.authCode)) {
                            alert("a")
                            localStorage.setItem('loggedInUser', JSON.stringify(user));
                            window.location = '/profile'
                        }
                        else {
                            alert("Неверный код подтверждения")
                        }
                    })
                })
        })
        .catch(error => {
            console.error(error);
        });
})