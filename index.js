const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12 //1 頁 顯示 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

//新增
let nowPage = 1
let currentMode = 'card'
const changemode = document.querySelector('#change-mode')

//依 mode 渲染電影資料
function renderByMode() {
  const movieList = getMoviesByPage(nowPage)
  currentMode === 'card' ? renderMovieCardMode(movieList) : renderMovieListMode(movieList)
}

//渲染電影清單 Card mode
function renderMovieCardMode(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `<div class="col-sm-3">
     <div class="mb-2">
       <div class="card">
         <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
           <div class="card-body">
             <h5 class="card-title">${item.title}</h5>
           </div>
           <div class="card-footer">
             <button class="btn btn-primary btn-show-movie" data-toggle="modal"
               data-target="#movie-modal" data-id="${item.id}">More</button>
             <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
           </div>
          </div>
       </div>
     </div>`
  })
  dataPanel.innerHTML = rawHTML
}

//渲染電影清單 List mode
function renderMovieListMode(data) {
  let rawHTML = `<table class="table"><tbody>`
  data.forEach(item => {
    rawHTML += `
        <tr>
          <td>
              <h5 class="card-title">${item.title}</h5>
          </td>
          <td>
               <button class="btn btn-primary btn-show-movie" data-toggle="modal"
               data-target="#movie-modal" data-id="${item.id}">More</button>
             <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </td>
        </tr>
    `
  })
  rawHTML += `</tbody></table>`
  dataPanel.innerHTML = rawHTML
}

//有幾頁分頁放電影 (傳入電影數量)
function renderPaginator(amount) {
  // 80 / 12 = 6....8
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE) //ceil 無條件進位
  let rawHTML = ''
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

//電影分頁 輸入PAGE 回傳該頁電影
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  //如果 filteredMovies 有東西 則 filteredMovies 若為空 則 MOVIES

  //page 1 = movies 0 - 11
  //page 2 = movies 12 - 23
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE) // slice(起點,終點) 切割陣列一部分並回傳
}

//渲染MORE裡電影詳細資料
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(res => {
    const data = res.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

//收藏清單
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteNovies')) || []
  //取出 localStorage 中 favoriteNovies 值，但如果 localStorage.getItem 中 favoriteNovies 為空 則給我空陣列
  const movie = movies.find(movie => movie.id === id)

  //比對是否已加過
  if (list.some(movie => movie.id === id)) { //some 回傳 TRUE 或 FALSE
    return alert('此電影已在收藏清單中')
  }

  list.push(movie)
  localStorage.setItem('favoriteNovies', JSON.stringify(list)) //放回 localStorage 中
}

//dataPanel 事件 當點擊到 MORE 或 + 時
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//點擊分頁事件
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return // 點擊元素非 A 標籤 則結束
  nowPage = Number(event.target.dataset.page)
  renderByMode()
})


//FORM表單submit事件---搜尋功能---
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase() //把INPUT值變成小寫


  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword:' + keyword)
  }

  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
  renderPaginator(filteredMovies.length)
  nowPage = 1
  renderByMode()
})

//新增 模式切換監聽器
changemode.addEventListener('click', function onChangeModeClicked(event) {
  if (event.target.matches('.fa-th')) {
    currentMode = 'card'
  } else if (event.target.matches('.fa-bars')) {
    currentMode = 'list'
  }
  renderByMode()
})

// get api
axios.get(INDEX_URL).then((res) => {
  movies.push(...res.data.results) //...展開運算子
  renderPaginator(movies.length)
  renderByMode()
})