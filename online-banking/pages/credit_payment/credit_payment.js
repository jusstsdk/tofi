const name = document.querySelector(".avatar-container span")
name.innerHTML = JSON.parse(localStorage.getItem("loggedInUser")).first_name

const currentUserId = JSON.parse(localStorage.getItem("loggedInUser")).user_id
const creditInfo = JSON.parse(localStorage.getItem("selectedCredit"))

const payButton = document.querySelector(".bottom-buttons a:last-child")

const senderSelect = document.querySelector(".credit-wrapper select")


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

    const sumInput = document.querySelector(".sum-wrapper span")
    if (isPaid()) {
        sumInput.innerHTML = 'Вы уже совершали платеж в этом месяце'
        payButton.addEventListener('click', function(event) {
            event.preventDefault();
        });
        payButton.setAttribute('disabled', 'disabled');
    }
    else if (creditInfo.type_id === 1){
        const { totalPayment, principalPayment } = calculateAnnuityPayment(creditInfo.creation_date, creditInfo.period, creditInfo.sum, creditInfo.percent)
        if (totalPayment == 0) {
            sumInput.innerHTML = `${totalPayment} BYN`
            payButton.addEventListener('click', function(event) {
                event.preventDefault();
            });
            payButton.setAttribute('disabled', 'disabled');
        }
        else {
            sumInput.innerHTML = `${totalPayment} BYN`

            sumInput.innerHTML = `${totalPayment} BYN`

            payButton.addEventListener("click", (event) => {
                event.preventDefault()
                const senderAccount = senderSelect.value
                const data = {
                    credit_account_id: creditInfo.account_id,
                    principal_payment: principalPayment,
                    total_payment: totalPayment,
                    sender_account_id: senderAccount
                }

                const paymentResponse = fetch('/credit/pay', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })

                window.location = '/credits';
            })
        }
    }
    else {
        const { totalPayment, principalPayment } = calculateDifferentiatedPayment(creditInfo.creation_date, creditInfo.period, creditInfo.sum, creditInfo.percent)
        if (totalPayment == 0) {
            sumInput.innerHTML = `${totalPayment} BYN`
            payButton.addEventListener('click', function(event) {
                event.preventDefault();
            });
            payButton.setAttribute('disabled', 'disabled');
        }
        else {
            sumInput.innerHTML = `${totalPayment} BYN`

            payButton.addEventListener("click", (event) => {
                event.preventDefault()
                const senderAccount = senderSelect.value
                const data = {
                    credit_account_id: creditInfo.account_id,
                    principal_payment: principalPayment,
                    total_payment: totalPayment,
                    sender_account_id: senderAccount
                }

                const paymentResponse = fetch('/credit/pay', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })

                window.location = '/credits';
            })
        }
    }
}

displayUserAccounts()

senderSelect.addEventListener("change", async (event) => {
    const balance = document.querySelector(".balance-wrapper span")
    const selectedAccountId = senderSelect.value

    const selectedAccount = await fetch(`/account/byId/${selectedAccountId}`)
    const selectedAccountData = await selectedAccount.json()

    balance.innerHTML = `${selectedAccountData.balance} BYN`
})

function isPaid() {
    const timestampString = creditInfo.creation_date;
    const date = new Date(timestampString);
    const dayOfMonth = date.getDate();
    const periodEnd = new Date();
    periodEnd.setDate(dayOfMonth);
    const periodStart = new Date(periodEnd);
    periodStart.setMonth(periodEnd.getMonth() - 1);
    periodStart.setDate(dayOfMonth);

    const lastPaymentTimestamp = creditInfo.last_payment;
    const lastPaymentDate = new Date(lastPaymentTimestamp);
    return lastPaymentDate >= periodStart && lastPaymentDate <= periodEnd
}

function calculateAnnuityPayment(creationDate, period, sum, percent) {
    const currentDate = new Date();
    const creationDateObj = new Date(creationDate);
    const totalPayments = period * 12;
    const monthlyRate = percent / (12 * 100);

    if (currentDate < creationDateObj) {
        // Кредит еще не начался
        return { totalPayment: 0, principalPayment: 0 };
    }

    const monthsPassed = (currentDate.getFullYear() - creationDateObj.getFullYear()) * 12 + currentDate.getMonth() - creationDateObj.getMonth();

    if (monthsPassed >= totalPayments) {
        // Весь период кредита прошел
        return { totalPayment: 0, principalPayment: 0 };
    }

    // Рассчитываем первый месяц
    let totalPayment = 0;
    let principalPayment = 0;
    if (monthsPassed === 0) {
        // В первом месяце платеж равен 0
        totalPayment = 0;
        principalPayment = 0;
    } else {
        // В остальных месяцах рассчитываем аннуитетный платеж
        totalPayment = (sum * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments));
        principalPayment = totalPayment - sum * monthlyRate;
    }

    return { totalPayment: totalPayment.toFixed(2), principalPayment: principalPayment.toFixed(2) };
}

function calculateDifferentiatedPayment(creationDate, period, sum, percent) {
    const currentDate = new Date();
    const creationDateObj = new Date(creationDate);
    const totalPayments = period * 12;
    const monthlyRate = percent / (12 * 100);

    if (currentDate < creationDateObj) {
        // Кредит еще не начался
        return { totalPayment: 0, principalPayment: 0 };
    }

    const monthsPassed = (currentDate.getFullYear() - creationDateObj.getFullYear()) * 12 + currentDate.getMonth() - creationDateObj.getMonth();

    if (monthsPassed >= totalPayments) {
        // Весь период кредита прошел
        return { totalPayment: 0, principalPayment: 0 };
    }

    if (monthsPassed === 0) {
        // Первый месяц
        return { totalPayment: 0, principalPayment: 0 };
    }

    // Рассчитываем дифференцированный платеж
    const principalPayment = sum / totalPayments;
    const totalPayment = principalPayment + sum * monthlyRate;

    return { totalPayment: totalPayment.toFixed(2), principalPayment: principalPayment.toFixed(2) };
}
