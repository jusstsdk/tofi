const logoutButton = document.querySelector(".logout-button")
logoutButton.addEventListener("click", (event) => {
    localStorage.removeItem("loggedInUser")
    window.location = '/'
})

const currentUser = JSON.parse(localStorage.getItem("loggedInUser"))

function displayProfile() {
    const userInfoContainer = document.querySelector(".personalize-user-info")

    const userName = document.createElement("p")
    userName.innerHTML = `${currentUser.first_name} ${currentUser.last_name}`

    const userPhone = document.createElement("span")
    userPhone.innerHTML = currentUser.phone

    userInfoContainer.appendChild(userName)
    userInfoContainer.appendChild(userPhone)
}

displayProfile()
