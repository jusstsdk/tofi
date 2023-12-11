const name = document.querySelector(".avatar-container span")
name.innerHTML = JSON.parse(localStorage.getItem("loggedInUser")).first_name

const selectedCollecting = JSON.parse(localStorage.getItem("selectedCollecting"))
const selectedCollectingId = selectedCollecting.collecting_id

async function fetchSelectedCollecting() {
    try {
        const response = await fetch(`/collecting/details/${selectedCollectingId}`);
        const data = await response.json();
        console.log('Data from server:', data);
        return data

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

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
function displayAddedUsers(users) {
    const addedUsersContainer = document.querySelector(".members-container")
    users.forEach(user => {
        addedUsersContainer.appendChild(createAddedUserInfo(user))
    })
}

async function fetchUserById(user_id) {
    try {
        const response = await fetch(`/user/collecting/id/${user_id}`);
        if (!response.ok) {
            return 404
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


collectingUsers = []
async function createCollectingDetailsInfo() {
    const { collecting, users } = await fetchSelectedCollecting()
    const userIDs = users.map(user => user.user_id);

    for (const user_id of userIDs) {
        const foundUser = await fetchUserById(user_id)
        collectingUsers.push(foundUser)
    }
    displayAddedUsers(collectingUsers)

    const collectingName = document.querySelector("h1")
    collectingName.innerHTML = collecting[0].name

    const expirationDate = document.querySelector(".date-container span")
    expirationDate.innerHTML = formatDateTime(collecting[0].expiration_date)

    const totalSum = document.querySelector(".sum-total span")
    totalSum.innerHTML = `${(collecting[0].sum / collectingUsers.length).toFixed(2)} BYN`

    const account = document.querySelector(".account-container span")
    account.innerHTML = collecting[0].account
}

createCollectingDetailsInfo()

const backButton = document.querySelector(".back-button a")
backButton.addEventListener("click", () => {
    localStorage.removeItem("selectedCollecting")
})