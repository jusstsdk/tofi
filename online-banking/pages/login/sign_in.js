loginForm = document.getElementById("login-form")

loginForm.addEventListener("submit", (event) => {
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
            }
            else if (response.status === 201) {
                return response.json()
            }
            else {
                alert("Error")
            }
        })
        .then((user) => {
            // console.log(user)
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            window.location = '/profile'
        })
        .catch(error => {
            console.error(error);
        });
})