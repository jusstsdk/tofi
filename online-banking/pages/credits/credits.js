const name = document.querySelector(".avatar-container span")
name.innerHTML = JSON.parse(localStorage.getItem("loggedInUser")).first_name

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function createCreditInfo(credit) {
    const creditContainer = document.createElement("div")
    creditContainer.classList.add("credit-container")

    const creditAccount = document.createElement("div")
    creditAccount.classList.add("credit-account")
    const creditAccountP = document.createElement("p")
    creditAccountP.innerHTML = "Счет"
    const creditAccountSpan = document.createElement("span")
    creditAccountSpan.innerHTML = credit.account_id
    creditAccount.appendChild(creditAccountP)
    creditAccount.appendChild(creditAccountSpan)

    const creditSum = document.createElement("div")
    creditSum.classList.add("credit-sum")
    const creditSumP = document.createElement("p")
    creditSumP.innerHTML = "Сумма"
    const creditSumSpan = document.createElement("span")
    creditSumSpan.innerHTML = `${credit.sum} BYN`
    creditSum.appendChild(creditSumP)
    creditSum.appendChild(creditSumSpan)

    const creditDebt = document.createElement("div")
    creditDebt.classList.add("credit-debt")
    const creditDebtP = document.createElement("p")
    creditDebtP.innerHTML = "Основной долг"
    const creditDebtSpan = document.createElement("span")
    creditDebtSpan.innerHTML = `${credit.debt} BYN`
    creditDebt.appendChild(creditDebtP)
    creditDebt.appendChild(creditDebtSpan)

    const creditPercent = document.createElement("div")
    creditPercent.classList.add("credit-percent")
    const creditPercentP = document.createElement("p")
    creditPercentP.innerHTML = "Ставка"
    const creditPercentSpan = document.createElement("span")
    creditPercentSpan.innerHTML = `${credit.percent}%`
    creditPercent.appendChild(creditPercentP)
    creditPercent.appendChild(creditPercentSpan)

    const creditType = document.createElement("div")
    creditType.classList.add("credit-type")
    const creditTypeP = document.createElement("p")
    creditTypeP.innerHTML = "Тип"
    const creditTypeSpan = document.createElement("span")
    if (credit.type_id === 1) {
        creditTypeSpan.innerHTML = "Аннуитетный"
    }
    else {
        creditTypeSpan.innerHTML = "Дифференцированный"
    }
    creditType.appendChild(creditTypeP)
    creditType.appendChild(creditTypeSpan)

    const creditPeriod = document.createElement("div")
    creditPeriod.classList.add("credit-period")
    const creditPeriodP = document.createElement("p")
    creditPeriodP.innerHTML = "Срок"
    const creditPeriodSpan = document.createElement("span")
    if (credit.period === 1) {
        creditPeriodSpan.innerHTML = `${credit.period} год, до ${formatDateTime(credit.expiration_date)}`

    }
    else if (credit.period === 3) {
        creditPeriodSpan.innerHTML = `${credit.period} года, до ${formatDateTime(credit.expiration_date)}`
    }
    else {
        creditPeriodSpan.innerHTML = `${credit.period} лет, до ${formatDateTime(credit.expiration_date)}`
    }
    creditPeriod.appendChild(creditPeriodP)
    creditPeriod.appendChild(creditPeriodSpan)

    const payButton = document.createElement("a")
    payButton.classList.add("pay-credit")
    // payButton.href = "/credits/pay"
    payButton.textContent = 'Оплатить'

    payButton.addEventListener("click", () => {
        localStorage.setItem("selectedCredit", JSON.stringify(credit))
        window.location = '/credits/pay'
    })

    creditContainer.appendChild(creditAccount)
    creditContainer.appendChild(creditSum)
    creditContainer.appendChild(creditDebt)
    creditContainer.appendChild(creditPercent)
    creditContainer.appendChild(creditType)
    creditContainer.appendChild(creditPeriod)
    creditContainer.appendChild(payButton)

    return creditContainer
}

async function fetchUserCredits() {
    try {
        const userId = JSON.parse(localStorage.getItem("loggedInUser")).user_id
        const response = await fetch(`/credit/user/${userId}`);
        return await response.json()

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function displayCredits() {
    const creditsContainer = document.querySelector(".credits-wrapper");
    // creditsContainer.innerHTML = ""
    try {
        const allCredits = await fetchUserCredits();
        allCredits.forEach(credit => {
            creditsContainer.appendChild(createCreditInfo(credit));
        });
    } catch (error) {
        console.error('Error displaying accounts:', error);
    }
}

document.addEventListener('DOMContentLoaded', displayCredits);