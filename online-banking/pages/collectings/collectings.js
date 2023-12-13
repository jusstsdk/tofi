const name = document.querySelector(".avatar-container span")
name.innerHTML = JSON.parse(localStorage.getItem("loggedInUser")).first_name

async function fetchData() {
    try {
        const user_id = JSON.parse(localStorage.getItem("loggedInUser")).user_id
        const response = await fetch(`/collecting/${user_id}`);
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

function getMembersCountLabel(count) {
    const cases = [2, 0, 1, 1, 1, 2];
    const labels = ['участник', 'участника', 'участников'];
    return labels[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]];
}

function createCollectingInfo(collecting) {
    const collectingInfo = document.createElement("div")
    collectingInfo.classList.add("collecting-container")

    const collectingLeft = document.createElement("div")
    collectingLeft.classList.add("collecting-left")
    const collectingName = document.createElement("span")
    collectingName.innerHTML = collecting.name
    const collectingProgress = document.createElement("span")
    // collectingProgress.innerHTML = `???%`
    collectingLeft.appendChild(collectingName)
    collectingLeft.appendChild(collectingProgress)

    const collectingRight = document.createElement("div")
    collectingRight.classList.add("collecting-right")
    const collectingMembers = document.createElement("span")
    collectingMembers.innerHTML = `${collecting.members_count} ${getMembersCountLabel(collecting.members_count)}, до ${formatDateTime(collecting.expiration_date)}`
    const collectingLink = document.createElement("a")
    collectingLink.href = "/collecting-details"
    const linkImage = document.createElement("img")
    linkImage.src = "/assets/ellipsis-vertical.svg"
    collectingLink.appendChild(linkImage)
    collectingRight.appendChild(collectingMembers)
    collectingRight.appendChild(collectingLink)

    collectingInfo.appendChild(collectingLeft)
    collectingInfo.appendChild(collectingRight)

    collectingLink.addEventListener("click", () => {
        localStorage.setItem("selectedCollecting", JSON.stringify(collecting))
        window.location = '/collecting-details'
    })

    return collectingInfo
}

async function displayCollectings() {
    const collectingContainer = document.querySelector(".collectings")
    try {
        const allCollectings = await fetchData();
        allCollectings.forEach(collecting => {
            collectingContainer.appendChild(createCollectingInfo(collecting));
        });
    } catch (error) {
        console.error('Error displaying collectings:', error);
    }
}

document.addEventListener('DOMContentLoaded', displayCollectings);