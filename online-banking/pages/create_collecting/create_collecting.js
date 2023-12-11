const currentUserId = JSON.parse(localStorage.getItem("loggedInUser")).user_id
const name = document.querySelector(".avatar-container span")
name.innerHTML = JSON.parse(localStorage.getItem("loggedInUser")).first_name
async function fetchUserAccounts(user_id) {
    try {
        const response = await fetch(`/account/${user_id}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function createUserAccountInfo(account) {
    const accountsSelect = document.getElementById("accounts")

    const accountOption = document.createElement("option")
    accountOption.text = account.account_id
    accountOption.value = account.account_id

    accountsSelect.appendChild(accountOption)
}

async function displayUserAccounts() {
    const userAccounts = await fetchUserAccounts(currentUserId)
    userAccounts.forEach(account => {
        createUserAccountInfo(account)
    })
}

displayUserAccounts()

const addUserButton = document.querySelector(".members-header > button")
const addUserDiv = document.querySelector(".user-adder")

addUserButton.addEventListener("click", () => {
    addUserDiv.classList.toggle("show-adder")

    if (addUserDiv.classList.contains("show-adder")) {
        document.querySelector(".members-header > button > img").src = "/assets/cross-button.svg"
    }
    else {
        document.querySelector(".members-header > button > img").src = "/assets/plus-button.svg"
    }
})

function createAddedUserInfo(user) {
    const userContainer = document.createElement("div")
    userContainer.classList.add("member")

    const userName = document.createElement("span")
    userName.innerHTML = `${user.first_name} ${user.last_name}`
    const userPhone = document.createElement("span")
    userPhone.innerHTML = user.phone

    userContainer.appendChild(userName)
    userContainer.appendChild(userPhone)

    return userContainer
}

// function createPartSum(value) {
//     const sumContainer = document.querySelector(".part-sum")
//     const partSum = document.createElement("span")
//     partSum.innerHTML = value
//     sumContainer.appendChild(partSum)
// }

function displayAddedUsers(users) {
    const addedUsersContainer = document.querySelector(".members-container")
    addedUsersContainer.innerHTML = ""

    users.forEach(user => {
        addedUsersContainer.appendChild(createAddedUserInfo(user))
    })
}

async function fetchUserByPhone(phone) {
    try {
        const response = await fetch(`/user/collecting/${phone}`);
        if (!response.ok) {
            return 404
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

const currentUser = JSON.parse(localStorage.getItem("loggedInUser"))

addedUsers = [currentUser]
displayAddedUsers(addedUsers)
addUserInput = document.querySelector(".user-adder input")

addUserInput.addEventListener("keyup", async function (event) {
    if (event.key === 'Enter' && addUserInput.value) {

        const phoneRegex = /^\+\d{12}$/;
        if (!phoneRegex.test(addUserInput.value)) {
            alert('Неверный формат номера')
            return
        }

        const userExists = addedUsers.some(user => user.phone === addUserInput.value);
        if (userExists) {
            alert("Пользователь уже добавлен")
            return
        }
        const foundUser = await fetchUserByPhone(addUserInput.value)
        if (foundUser === 404) {
            alert("Пользователь с таким номером не найден")
        }
        else {
            addedUsers.push(foundUser)
            displayAddedUsers(addedUsers)

            const sum = document.querySelector(".sum-wrapper input").value
            if (sum) {
                // createPartSum(sum / addedUsers.length)
                document.querySelector(".part-sum span").innerHTML = (sum / addedUsers.length).toFixed(2);
            }
        }
    }
})

const submitButton = document.querySelector(".bottom-buttons a:last-child")
submitButton.addEventListener("click", async (event) => {
    const collectingName = document.querySelector(".collecting-name input").value
    const collectingSum = document.querySelector(".sum-wrapper input").value
    const expirationDate = document.querySelector(".date-wrapper input").value
    const selectedAccount = document.querySelector(".account-wrapper select").value

    const data = {
        name: collectingName,
        members: addedUsers,
        sum: collectingSum,
        expiration_date: expirationDate,
        account: selectedAccount,
        author_id: currentUser.user_id
    }

    fetch('/collecting/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error(error);
        });
})

const sumInput = document.querySelector(".sum-wrapper input")
sumInput.addEventListener('input', function(event) {
    const value = sumInput.value
    if (!value) {
        document.querySelector(".part-sum span").innerHTML = "0.00"
    }
    else if (value && addedUsers.length) {
        document.querySelector(".part-sum span").innerHTML = (value / addedUsers.length).toFixed(2);
    }
    else {
        document.querySelector(".part-sum span").innerHTML = ""
    }
});

function validateNumber(input) {
    let value = input.value;
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');

    if (parts[1] && parts[1].length > 2) {
        parts[1] = parts[1].slice(0, 2);
    }

    value = parts.join('.');
    input.value = value;
}