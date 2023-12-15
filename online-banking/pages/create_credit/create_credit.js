const name = document.querySelector(".avatar-container span")
name.innerHTML = JSON.parse(localStorage.getItem("loggedInUser")).first_name

const dateSelect = document.querySelector('.date-wrapper select')
const sumInput = document.querySelector('.sum-wrapper input')

const getMaxSumValue = () => {
    switch (dateSelect.value) {
        case '1':
            return 5000
        case '3':
        case '5':
            return 10000
        default:
            return 0
    }
}

const getCreditPercent = () => {
    switch (dateSelect.value) {
        case '1':
            return 15.21
        case '3':
            return 15.23
        case '5':
            return 15.25
        default:
            return 0
    }
}

const showPercentResult = () => {
    const resContainer = document.querySelector('.percent-result span')

    resContainer.innerHTML = `${getCreditPercent()}%`
}

showPercentResult()

dateSelect.addEventListener('change', () => {
    showPercentResult()
    const period = document.querySelector('.date-wrapper select').value
    // showMonthlyPayment(event.target.value, period, getCreditPercent())

    const selectedCreditType = document.querySelector(".credit-types input[name='credit-type']:checked").value
    if (selectedCreditType === '1') {
        fillAnnuitySchedule(dateSelect.value)
    } else {
        fillDifferentiatedSchedule(dateSelect.value)
    }
})

sumInput.addEventListener('input', (event) => {
    const maxValue = getMaxSumValue()
    if (event.target.value > maxValue) {
        alert(`Максимальная сумма кредита ${maxValue} BYN`)
        event.target.value = maxValue
        return
    }

    showPercentResult()

    const selectedCreditType = document.querySelector(".credit-types input[name='credit-type']:checked").value
    if (selectedCreditType === '1') {
        fillAnnuitySchedule(dateSelect.value)
    } else {
        fillDifferentiatedSchedule(dateSelect.value)
    }
})

const creditTypeRadios = document.querySelectorAll('input[name="credit-type"]');

creditTypeRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        const selectedCreditType = event.target.value;
        if (selectedCreditType === '1') {
            fillAnnuitySchedule(dateSelect.value)
        } else {
            fillDifferentiatedSchedule(dateSelect.value)
        }
    });
});

createCreditButton = document.querySelector(".bottom-buttons a")
createCreditButton.addEventListener("click",  (event) => {
    event.preventDefault()

    const userId = JSON.parse(localStorage.getItem("loggedInUser")).user_id
    const creditType = document.querySelector(".credit-types input[name='credit-type']:checked").value // тип платежа
    const period = dateSelect.value
    const sum = sumInput.value

    const data = {
        user_id: userId,
        credit_type: +creditType,
        sum: +sum,
        period: +period,
        percent: getCreditPercent()
    }

    if (userId && creditType && sum && period) {
        fetch("/credit/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => {
            console.log(res)
            alert("Вы успешно оформили кредит")
            window.location = '/credits'
        })


    } else {
        alert("Заполните все поля")
    }
})

function fillAnnuitySchedule(numberOfYears) {
    const scheduleTable = document.querySelector("table");
    scheduleTable.innerHTML = "";

    const headers = ['Дата', 'Платеж', 'Проценты', 'Тело кредита', 'Остаток'];
    const headerRow = scheduleTable.insertRow();
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    let sum = parseFloat(sumInput.value);
    if (isNaN(sum)) {
        sum = 0;
    }

    const percent = parseFloat(getCreditPercent());
    const ps = percent / (100 * 12);
    const monthPayment = sum * (ps / (1 - Math.pow((1 + ps), -(numberOfYears * 12))));

    let remainingBalance = sum;
    let totalInterestPaid = 0;
    const currentDate = new Date();

    for (let i = 0; i < numberOfYears * 12 + 1; i++) {
        const newRow = scheduleTable.insertRow();
        const dateCell = newRow.insertCell(0);
        const paymentCell = newRow.insertCell(1);
        const interestCell = newRow.insertCell(2);
        const principalCell = newRow.insertCell(3);
        const remainingCell = newRow.insertCell(4);

        const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, currentDate.getDate());
        dateCell.textContent = formatDate(nextDate);

        if (i === 0) {
            paymentCell.textContent = '0.00';
            interestCell.textContent = '0.00';
            principalCell.textContent = '0.00';
            remainingCell.textContent = sum.toFixed(2);
        } else {
            const interestAmount = remainingBalance * ps;
            interestCell.textContent = interestAmount.toFixed(2);

            const principalAmount = monthPayment - interestAmount;
            principalCell.textContent = principalAmount.toFixed(2);

            paymentCell.textContent = monthPayment.toFixed(2);
            remainingCell.textContent = Math.max(remainingBalance - principalAmount, 0).toFixed(2);

            totalInterestPaid += interestAmount;
            remainingBalance -= principalAmount;
        }
    }

    document.querySelector(".overpayment span").innerHTML = totalInterestPaid.toFixed(2)
}

function fillDifferentiatedSchedule(numberOfYears) {
    const scheduleTable = document.querySelector("table");
    scheduleTable.innerHTML = "";

    const headers = ['Дата', 'Платеж', 'Проценты', 'Тело кредита', 'Остаток'];
    const headerRow = scheduleTable.insertRow();
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    let sum = parseFloat(sumInput.value);
    if (isNaN(sum)) {
        sum = 0;
    }

    const percent = parseFloat(getCreditPercent());
    const ps = percent / (100 * 12);
    const principalPayment = sum / (numberOfYears * 12);

    let remainingBalance = sum;
    let totalInterestPaid = 0;
    const currentDate = new Date();

    for (let i = 0; i < numberOfYears * 12 + 1; i++) {
        const newRow = scheduleTable.insertRow();
        const dateCell = newRow.insertCell(0);
        const paymentCell = newRow.insertCell(1);
        const interestCell = newRow.insertCell(2);
        const principalCell = newRow.insertCell(3);
        const remainingCell = newRow.insertCell(4);

        const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, currentDate.getDate());
        dateCell.textContent = formatDate(nextDate);

        if (i === 0) {
            paymentCell.textContent = '0.00';
            interestCell.textContent = '0.00';
            principalCell.textContent = '0.00';
            remainingCell.textContent = sum.toFixed(2);
        } else {
            const interestAmount = remainingBalance * ps;
            interestCell.textContent = interestAmount.toFixed(2);

            const principalAmount = principalPayment;
            principalCell.textContent = principalAmount.toFixed(2);

            paymentCell.textContent = (interestAmount + principalAmount).toFixed(2);
            remainingCell.textContent = Math.max(remainingBalance - principalAmount, 0).toFixed(2);

            totalInterestPaid += interestAmount;
            remainingBalance -= principalAmount;
        }
    }

    document.querySelector(".overpayment span").innerHTML = totalInterestPaid.toFixed(2);
}

function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year}`;
}

fillAnnuitySchedule(dateSelect.value)

