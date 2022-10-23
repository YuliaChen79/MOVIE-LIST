const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input') 

//渲染movie list
function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    //需要title, image
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  });

  dataPanel.innerHTML = rawHTML
}

//將電影資料分頁
function getMoviesByPage(page) {
  //movies? "movies" : "filtermovies"
  const data = filteredMovies.length ? filteredMovies : movies
  //計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//渲染分頁數量
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template 
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

//點擊more按鈕後的function，跳出modal顯示電影資訊
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-data")
  const modalDescription = document.querySelector("#movie-modal-description")

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="image-fluid"></img>`
  })
}

//點擊+按鈕後的function，將電影收藏
function addToFavorite(id){
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []  //JSON.parse()用於將JSON資料轉為array或object型態，方便將資料推送進去
  const movie = movies.find((movie) => movie.id === id) //.find()在找到第一個符合條件的 item 後就回停下來回傳該 item
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  } //.some()會將陣列中的element一一丟入檢查是否有符合條件的資料，並回傳true / false
  list.push(movie) //將movie加進list陣列中 
  localStorage.setItem('favoriteMovies', JSON.stringify(list)) //因localStorage的key:value只能為string，所以需要再把JSON資料轉存為sting
}

//more按鈕及收藏按鈕的監聽事件
dataPanel.addEventListener('click' , function onPanelClicked(event){
  if (event.target.matches('.btn-show-movie')){
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//search監聽器表單事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  // if (!keyword.length) {
  //   return alert('請輸入有效字串！')
  // }
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

//分頁器監聽事件
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})


axios.get(INDEX_URL).then((response)=>{
  //將data.result丟入陣列中
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
  })