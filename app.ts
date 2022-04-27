// type alias
type Store = {
  currentPage : number;
  feeds : NewsFeed[];
}

type NewsFeed = {
  id : number;
  comments_count : number;
  url : string;
  user : string;
  time_ago : string;
  points : number;
  title : string;
  read? : boolean;
}

const ajax : XMLHttpRequest = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const container : HTMLElement | null = document.getElementById('root');

const store : Store = {
    currentPage : 1,
    feeds : []
};

const getData = (url) => {
    ajax.open('GET', url, false);
    ajax.send();

    return JSON.parse(ajax.response);
}

const updateView = (template : string) => {
  if (container) { // type guard
    container.innerHTML = template;
  } else {
    console.log("ERROR");
  }
}

const makeFirstFeedForReadState = (feeds) => {
    // 처음 피드 데이터를 받아오면서 read속성을 false값으로 초기화해서 부여하기 위한 함수
    for (let i = 0 ; i < feeds.length ; i++) {
        feeds[i].read = false;
    }
    return feeds;
}

const displayNewsFeed = () => {
    let newsFeeds : NewsFeed[] = store.feeds;

    if (newsFeeds.length == 0) {
        newsFeeds = store.feeds = makeFirstFeedForReadState(getData(NEWS_URL));
    }

    let template = `
    <div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/@prev_page" class="text-gray-900">
                Previous
              </a>
              <a href="#/page/@next_page" class="text-gray-900 ml-4">
                Next
              </a>
            </div>
          </div> 
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        @news_list        
      </div>
    </div>
  `;

    const newsList = [];
    const maxPageNumber = newsFeeds.length / 10;
    for (let i = (store.currentPage - 1) * 10 ; i < store.currentPage * 10 ; i++) {
        newsList.push(`
            <div class="p-6 ${newsFeeds[i].read ? 'bg-green-600' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
            <div class="flex">
                <div class="flex-auto">
                <a href="#/detail/${newsFeeds[i].id}">${newsFeeds[i].title}</a>  
                </div>
                <div class="text-center text-sm">
                <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${newsFeeds[i].comments_count}</div>
                </div>
            </div>
            <div class="flex mt-3">
                <div class="grid grid-cols-3 text-sm text-gray-500">
                <div><i class="fas fa-user mr-1"></i>${newsFeeds[i].user}</div>
                <div><i class="fas fa-heart mr-1"></i>${newsFeeds[i].points}</div>
                <div><i class="far fa-clock mr-1"></i>${newsFeeds[i].time_ago}</div>
                </div>  
            </div>
            </div>    
      `);
    }
    template = template.replace('@news_list', newsList.join(''));
    template = template.replace('@prev_page', store.currentPage - 1 > 1 ? store.currentPage - 1 : 1);
    template = template.replace('@next_page', store.currentPage + 1 > maxPageNumber ? maxPageNumber : store.currentPage + 1);

    updateView(template);
}

const displayNewsDetail = () => {
    // 앵커태그의 해시가 변경되었을때 이벤트가 발생한다.
    // 해시를 CONTENT_URL의 id란에 넣고 API를 호출해야함
    // 해시를 주소에서 가져와야 하는데 주소 맨끝에 해시가 붙어있으니까 코드는 다음과 같다
    const id = location.hash.substring(9);

    for (let i = 0; i < store.feeds.length ; i++) {
        if (store.feeds[i].id == Number(id)) {
            store.feeds[i].read = true;
            break;
        }
    }

    const newsContent = getData(CONTENT_URL.replace('@id', id));
    let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>

        @comments

      </div>
    </div>
    `;

    const makeComment = (comments, called) => {
        const commentString = [];

        for (let i = 0; i < comments.length ; i++) {
            commentString.push(`
            <div style="padding-left: ${called * 40}px;" class="mt-4">
              <div class="text-gray-400">
                <i class="fa fa-sort-down mr-2"></i>
                <strong>${comments[i].user}</strong> ${comments[i].time_ago}
              </div>
              <p class="text-gray-700">${comments[i].content}</p>
            </div>      
          `);

          if (comments[i].comments.length > 0) {
              commentString.push(makeComment(comments[i].comments, called + 1));
          }
        }

        return commentString.join('');
    }

    template = template.replace('@comments', makeComment(newsContent.comments, 0));

    updateView(template);
}

const router = () => {
    const routePath = location.hash;
    if (routePath == '') {
        // #만 있으면 그냥 빈 문자열 ''로 나온다.
        displayNewsFeed();
    } else if (routePath.indexOf('/page') >= 0) {
        store.currentPage = Number(routePath.substring(7));
        displayNewsFeed();
    } else {
        displayNewsDetail();
    }
}

window.addEventListener('hashchange', router);

router();

