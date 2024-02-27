const BASE_URL = 'https://user-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USERS_PER_PAGE = 12

const users = []
let filteredUsers = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getUsersByPage(page) {
  // 如果filteredUsers有東西, 給我filteredUsers, 沒東西的話給users
  const data = filteredUsers.length ? filteredUsers : users
  // 計算起始 index
  const starIndex = (page - 1) * USERS_PER_PAGE
  // 回傳切割後的新陣列
  return data.slice(starIndex, starIndex + USERS_PER_PAGE)
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

function addToFavorite(id) {
  // 從localStorage提取favoriteUsers列表(用JSON.parse將字串轉換成陣列), 如果沒有的話(or)就用空陣列
  // OR 的符號是 || (pipe ， 通常為於 enter 鍵上方) ，它會判斷左右兩邊的式子是 true 還是 false ，然後回傳是 true 的那個邊。如果兩邊都是 true ，以左邊為優先。null 值會被 OR 判斷為 false
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []

  // 用find將使用者一個一個丟進函式判斷, 如果user.id = id, 就是他要的(只會回傳第一個滿足的值)
  const user = users.find((user) => user.id === id)

  // 如果使用者重複就跳出警告視窗以阻止加到清單中,some只判斷函式後回傳True或False
  if (list.some((user) => user.id === id)) {
    return alert('此使用者已經在收藏清單中!')
  }

  list.push(user)

  // 將用JSON.stringify轉換成字串的list放入localStorage
  localStorage.setItem('favoriteUsers', JSON.stringify(list))

  console.log(list)
}

// function給個名字會比較好debug
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-user')) {
    // 在按鈕上加上data-id後,可以在event.target.dataset找到所按的id(是字串)
    console.log(event.target.dataset)
    showUserModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return
  // 透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  // 更新畫面
  renderUserList(getUsersByPage(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 讓瀏覽器按下搜索鍵時不會刷新頁面
  event.preventDefault()

  // trim()能去掉頭尾空白, toLowerCase()全轉小寫, split(/\s+/)的作用是將字串分割成多個關鍵字，這些關鍵字以空白為分隔。
  // 括號內是正規表達式（regular expression）。正規表達式是一種用於搜索、匹配和處理文本的強大工具。在這裡，/\s+/ 是一個正規表達式，它的含義如下：
  // \s：表示匹配任何空白字符，包括空格、製表符（tab）、換行符等。
  // +：表示匹配前面的元素一次或多次，這裡是指一個或多個空白字符。
  // 因此，/\s+/ 整體上表示匹配一個或多個連續的空白字符。在 split 方法中，它被用來將字串分割成多個部分，每當遇到一個或多個空白字符時進行分割。/ / 是正規表達式中用來表示一個正規表達式的開始和結束的符號。
  const keywords = searchInput.value.trim().toLowerCase().split(/\s+/)

  // !代表反轉, false -> true
  // filter(function), 符合Function條件判斷的值才保留, 並形成新陣列, 如果function裡運算式只有一行return, 便可省略return成一行
  // 常用的還有map, filter, reduce
  // filteredUsers = users.filter(user => user.title.toLowerCase().includes(keyword))
  filteredUsers = users.filter(user => {
    // 對每個User的標題進行多個關鍵字的匹配, keywords.every 是一個陣列方法，它會對陣列中的每個元素應用一個測試函式，並在所有測試都返回 true 時結果為 true。
    return keywords.every(keyword => user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword));
  })

  if (filteredUsers.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的User`)
  }

  // 第二種方法用for-of迴圈, 把users陣列裡每一個值代入user運算
  // for (const user of users) {
  //   if (user.title.toLowerCase().includes(keyword)) {
  //     filteredUsers.push(user)
  //   }
  // }
  renderPaginator(filteredUsers.length)
  renderUserList(getUsersByPage(1))
})

axios
  .get(INDEX_URL)
  .then((response) => {
    // Array(80) 所以我們需要用 users.push() 的方式把資料放進去, 但丟進去後最外面會多一個陣列
    // 方法1 for of
    // for (let user of response.data.results) {
    //   users.push(user)
    // }
    // 方法2 加上...就能去掉最外面包的陣列, ...三個點點就是展開運算子，他的主要功用是「展開陣列元素」。

    users.push(...response.data.results)
    renderPaginator(users.length)
    renderUserList(getUsersByPage(1))
  })
  .catch((err) => console.log(err))
