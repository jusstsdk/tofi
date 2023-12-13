const name = document.querySelector(".avatar-container span")
name.innerHTML = JSON.parse(localStorage.getItem("loggedInUser")).first_name

async function fetchUserAccounts() {
    try {
        const userId = JSON.parse(localStorage.getItem("loggedInUser")).user_id
        const response = await fetch(`/account/${userId}`);
        const data = await response.json();
        console.log('Data from server:', data);
        return data

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function createAccountInfo(account) {
    const accountInfo = document.createElement("div")
    accountInfo.classList.add("account-container")

    const accountName = document.createElement("p")
    accountName.innerHTML = account.account_id

    const accountRight = document.createElement("div")
    accountRight.classList.add("account-right")

    const accountBalance = document.createElement("span")
    accountBalance.innerHTML = `Баланс: ${account.balance} BYN`
    const accountMoreInfo = document.createElement("img")
    accountMoreInfo.src = "/assets/ellipsis-vertical.svg"

    accountRight.appendChild(accountBalance)
    accountRight.appendChild(accountMoreInfo)

    accountInfo.appendChild(accountName)
    accountInfo.appendChild(accountRight)

    return accountInfo
}

async function displayAccounts() {
    const accountsContainer = document.querySelector(".debit-container");
    accountsContainer.innerHTML = ""
    try {
        const allAccounts = await fetchUserAccounts();
        allAccounts.forEach(account => {
            accountsContainer.appendChild(createAccountInfo(account));
        });
    } catch (error) {
        console.error('Error displaying accounts:', error);
    }
}

document.addEventListener('DOMContentLoaded', displayAccounts);

const currentUserId = JSON.parse(localStorage.getItem("loggedInUser")).user_id
const createAccountButton = document.querySelector(".create-account-button")
createAccountButton.addEventListener("click", async () => {
    const data = {
        user_id: currentUserId,
        type_id: 1
    }
    fetch('/account/create', {
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
    displayAccounts()
})
