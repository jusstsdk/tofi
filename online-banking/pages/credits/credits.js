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
            return 15.25
        case '3':
            return 15.23
        case '5':
            return 15.21
        default:
            return 0
    }
}

const showPercentResult = () => {
    const resContainer = document.querySelector('.percent-result span')

    resContainer.innerHTML = `${getCreditPercent()}%`
}

const showMonthlyPayment = () => {
    const monthly = document.querySelector(".monthly-payment span")

    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    let daysInYear = new Date(currentDate.getFullYear() + 1, 0, 1).getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime();
    daysInYear = daysInYear / (1000 * 3600 * 24);

    const period = dateSelect.value
    const sum = document.querySelector(".sum-wrapper input").value
    const percent = getCreditPercent()
    console.log(sum)
    console.log(period)
    console.log(percent)

    const payment = (sum / (period * 12)) + ((sum * (percent / 100)) * daysInMonth) / daysInYear

    monthly.innerHTML = `${payment.toFixed(2)}`
}

dateSelect.addEventListener('change', () => {
    showPercentResult()
    const period = document.querySelector('.date-wrapper select').value
    showMonthlyPayment(event.target.value, period, getCreditPercent())
})

// let sumInputPrevValue = 0

sumInput.addEventListener('input', (event) => {
    const maxValue = getMaxSumValue()
    if (event.target.value > maxValue) {
        alert(`Максимальная сумма кредита ${maxValue} BYN`)
        event.target.value = maxValue
        return
    }

    showPercentResult()

    const period = document.querySelector('.date-wrapper select').value
    if (event.target.value) {
        showMonthlyPayment(event.target.value, getCreditPercent())

    }
})