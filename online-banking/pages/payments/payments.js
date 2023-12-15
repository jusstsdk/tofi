const name = document.querySelector(".avatar-container span")
name.innerHTML = JSON.parse(localStorage.getItem("loggedInUser")).first_name

async function fetchUserPayments() {
    try {
        const userId = JSON.parse(localStorage.getItem("loggedInUser")).user_id
        // console.log(userId)
        const response = await fetch(`/payment/user/${userId}`);
        const data = await response.json();
        // console.log('Data from server:', data);
        return data

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function formatDateTime(dateString) {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Europe/Moscow'
    };

    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', options);
}

function createPaymentInfo(payment) {
    const paymentInfo = document.createElement("div")
    paymentInfo.classList.add("payment-container")

    const receiver = document.createElement("p")
    receiver.innerHTML = "Получатель"

    const receiverAccountId = document.createElement("span")
    receiverAccountId.innerHTML = payment.receiver_account_id

    const sum = document.createElement("span")
    sum.innerHTML = `${payment.transfer_amount} BYN`

    const date = document.createElement("span")
    date.innerHTML = formatDateTime(payment.transaction_date)

    paymentInfo.appendChild(receiver)
    paymentInfo.appendChild(receiverAccountId)
    paymentInfo.appendChild(sum)
    paymentInfo.appendChild(date)

    return paymentInfo
}

async function displayPayments() {
    const paymentsContainer = document.querySelector(".payments-container");
    paymentsContainer.innerHTML = ""
    try {
        const allPayments = await fetchUserPayments();
        allPayments.forEach(payment => {
            paymentsContainer.appendChild(createPaymentInfo(payment));
        });
    } catch (error) {
        console.error('Error displaying accounts:', error);
    }
}

document.addEventListener('DOMContentLoaded', displayPayments);