const name = document.querySelector(".avatar-container span")
name.innerHTML = JSON.parse(localStorage.getItem("loggedInUser")).first_name

const currentUserId = JSON.parse(localStorage.getItem("loggedInUser")).user_id

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

const senderSelect = document.querySelector(".account-wrapper select")
senderSelect.addEventListener("change", async (event) => {
    const balance = document.querySelector(".balance-wrapper span")
    const selectedAccountId = senderSelect.value
    console.log(selectedAccountId)

    const selectedAccount = await fetch(`/account/byId/${selectedAccountId}`)
    const selectedAccountData = await selectedAccount.json()

    balance.innerHTML = `${selectedAccountData.balance} BYN`

    const sumInput = document.querySelector(".sum-wrapper input")
    sumInput.max = selectedAccountData.balance
})

const createPaymentButton = document.querySelector(".bottom-buttons a:last-child")
createPaymentButton.addEventListener("click", async (event) => {
    event.preventDefault()
    const receiverAccount = document.querySelector(".account-receiver-wrapper input").value
    const senderAccount = document.querySelector(".account-wrapper select").value
    const sum = document.querySelector(".sum-wrapper input").value
    console.log(senderAccount)
    console.log(receiverAccount)
    console.log(sum)

    if (!receiverAccount) {
        alert("Введите счет получателя")
        return
    }

    if (!sum) {
        alert("Введите сумму перевода")
        return
    }

    const selectedAccount = await fetch(`/account/byId/${senderAccount}`)
    const selectedAccountData = await selectedAccount.json()

    if (sum > selectedAccountData.balance) {
        alert("На вашем счету недостаточно средств")
        return
    }

    const receiver = await fetch(`/account/byId/${receiverAccount}`);
    if (receiver.ok) {
        const receiverData = await receiver.json();
        const data = {
            sender_account_id: senderAccount,
            receiver_account_id: receiverAccount,
            transfer_amount: sum
        }

        fetch("/payment/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        window.location = '/payments'

    } else if (receiver.status === 404) {
        alert("Получатель с таким счетом не существует")
        console.log('Receiver not found');
    } else {
        console.error('Error:', receiver.status);
    }


})