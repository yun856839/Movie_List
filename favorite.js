const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteNovies'))

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

//渲染電影清單
function renderMovieList(data) {
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
             <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
           </div>
          </div>
       </div>
     </div>`
  })
  dataPanel.innerHTML = rawHTML
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

//刪除收藏影片
function removeFromFavorite(id) {
  //一旦收藏清單是空的，就結束這個函式
  if (!movies) return

  //找到在'收藏清單中'要刪除影片的 INDEX 值
  const movieIndex = movies.findIndex(movie => movie.id === id)

  //傳入的 id 在收藏清單中不存在，就結束這個函式
  if (movieIndex === -1) return

  //splice(起始點, 欲刪除幾個)  
  movies.splice(movieIndex, 1)

  //放回 localStorage 中
  localStorage.setItem('favoriteNovies', JSON.stringify(movies))

  //為了即時反映在畫面上，重新渲染
  renderMovieList(movies)
}

//dataPanel 事件 當點擊到 MORE 或 + 時
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)