const BASE_URL = 'https://user-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/users/'


const users = JSON.parse(localStorage.getItem('favoriteUsers')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

function renderUserList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${item.avatar}" class="card-img-top btn-show-user" alt="User" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">
            <div class="card-body">
              <h5 class="card-title">${item.name} ${item.surname}</h5>
            </div>
            <div class="card-footer">
              <button type="button" class="btn btn-gender ${item.gender === 'male' ? 'btn-success' : 'btn-danger'}" data-gender="${item.gender}">
              <i class="${item.gender === 'male' ? 'bi bi-gender-male' : 'bi bi-gender-female'}"></i>
              </button>
              <button class="btn btn-primary btn-show-user" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-add-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function showUserModal(id) {
  const modalTitle = document.querySelector('#users-modal-title')
  const modalEmail = document.querySelector('#users-modal-email')
  const modalGender = document.querySelector('#users-modal-gender')
  const modalAge = document.querySelector('#users-modal-age')
  const modalRegion = document.querySelector('#users-modal-region')
  const modalBirthday = document.querySelector('#users-modal-birthday')
  const modalAvatar = document.querySelector('#users-modal-avatar')
  axios
    .get(INDEX_URL + id)
    .then(response => {
      // response.data.results
      const data = response.data
      modalTitle.innerText = `${data.name} ${data.surname}`
      modalEmail.innerText = 'Email: ' + data.email
      modalGender.innerText = 'Gender: ' + data.gender
      modalAge.innerText = 'Age: ' + data.age
      modalRegion.innerText = 'Region: ' + data.region
      modalBirthday.innerText = 'Birthday: ' + data.birthday
      modalAvatar.innerHTML = `<img src="${data.avatar}" alt="users-avatar" class="img-fluid">`
    })
}

function removeFromFavorite(id) {
  // 這段程式碼的目的是在檢查 users 變數，如果它是空或者是一個空陣列，就立即返回，不再執行後續的程式碼。
  if (!users || !users.length) return

  // 用findIndex將使用者一個一個丟進函式判斷, 如果user.id = id, 就是我們要的(只會回傳第一個滿足的index), 若沒能找到符合的項目，則會回傳 -1
  const userIndex = users.findIndex((user) => user.id === id)

  // 如果userIndex不存在，就立即返回，不再執行後續的程式碼。
  if (userIndex === -1) return

  //刪除該筆使用者
  users.splice(userIndex, 1)

  // 將用JSON.stringify轉換成字串的users放入localStorage
  localStorage.setItem('favoriteUsers', JSON.stringify(users))

  //更新頁面
  renderUserList(users)
}

// function給個名字會比較好debug
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-user')) {
    // 在按鈕上加上data-id後,可以在event.target.dataset找到所按的id(是字串)
    // console.log(event.target.dataset)
    showUserModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderUserList(users)