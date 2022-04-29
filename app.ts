// Typing 하는 방법 두 가지 : Type Alias , Interface
// Union 타입으로 선언을 해야하면 Interface는 쓰지 못함. Type Alias 사용해야한다.

// type alias
// type Store = {
//   currentPage : number;
//   feeds : NewsFeed[];
// }

// readonly를 사용해서 더 제약을 거는 이런 방식을 선호해야 함. (실수 방지, 안전)
// Interface

// 상속을 하는 두 가지 방법 : 클래스, 믹스인

interface Store {
  currentPage : number;
  feeds : NewsFeed[];
}

interface News {
  readonly id : number;
  readonly time_ago : string;
  readonly title : string;
  readonly url : string;
  readonly user : string;
  readonly content : string;
}

interface NewsFeed extends News { // News &를 인터섹션이라고 부른다 (앰퍼센트)
  readonly comments_count : number;
  readonly points : number;
  read? : boolean;
}

interface NewsDetail extends News {
  readonly comments : NewsDetailComment[];
}

interface NewsDetailComment extends News {
  readonly comments : NewsDetailComment[];
  readonly level : number;
}

const ajax : XMLHttpRequest = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const container : HTMLElement | null = document.getElementById('root');

const store : Store = {
    currentPage : 1,
    feeds : []
};

// 이런식으로 class화 시키는것이 현재 기능으로는 비효율적이긴 하지만 앞으로 커지는 기능에 대한 대비로 이렇게 하는 것이 좋다
// class Api {
//   url : string;
//   ajax : XMLHttpRequest;

//   constructor(url : string) {
//     this.url = url;
//     this.ajax = new XMLHttpRequest();
//   }

//   protected getRequest<AjaxResponseType>() : AjaxResponseType {
//     this.ajax.open('GET', this.url, false);
//     this.ajax.send();

//     // 경우에 따라서 반환하는 값이 NewsFeed[]일때도, NewsDetail일때도 있는 상황
//     return JSON.parse(this.ajax.response);
//   }
// }

function applyApiMixins(targetClass : any, baseClasses : any[]) {
  // 일단 이해하긴 어렵고 그냥 역할을 이용하면 좋을듯, 다중 상속을 지원하기 위함 (합성시키기)
  baseClasses.forEach(baseClass => {
    Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
      const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

      if (descriptor) {
        Object.defineProperty(targetClass.prototype, name, descriptor);
      }
    });
  });
}

// 믹스인 방법
// 이 방법으로 코드의 상속 구현이 유연해질 수 있다.
// extends는 다중상속을 지원하지 않음

class Api {
  getRequest<AjaxResponseType>(url : string) : AjaxResponseType {
    const ajax = new XMLHttpRequest();
    ajax.open('GET', url, false);
    ajax.send();

    // 경우에 따라서 반환하는 값이 NewsFeed[]일때도, NewsDetail일때도 있는 상황
    return JSON.parse(ajax.response);
  }
}

// class NewsFeedApi extends Api {
//   getData() : NewsFeed[] {
//     return this.getRequest<NewsFeed[]>();
//   }
// }

// 믹스인 방법
class NewsFeedApi {
  getData() : NewsFeed[] {
    return this.getRequest<NewsFeed[]>(NEWS_URL);
  }
}

// class NewsDetailApi extends Api {
//   getData() : NewsDetail {
//     return this.getRequest<NewsDetail>();
//   }
// }

// 믹스인 방법
class NewsDetailApi {
  getData(id : string) : NewsDetail {
    return this.getRequest<NewsDetail>(CONTENT_URL.replace('@id', id));
  }
}

// 믹스인
interface NewsFeedApi extends Api {}; // TypeScript 컴파일러에게 이 두가지가 합성될것임을 알려주는 코드
interface NewsDetailApi extends Api {};
applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);

// 제네릭을 이용하면 A,B,C,D 유형의 인풋값에 대해서 A유형엔 A유형으로 반환 할 수 있게 해준다,
const getData = <AjaxResponseType>(url : string) : AjaxResponseType => {
    ajax.open('GET', url, false);
    ajax.send();

    // 경우에 따라서 반환하는 값이 NewsFeed[]일때도, NewsDetail일때도 있는 상황
    return JSON.parse(ajax.response);
}

const updateView = (template : string) : void => {
  if (container) { // type guard
    container.innerHTML = template;
  } else {
    console.log("ERROR");
  }
}

const makeFirstFeedForReadState = (feeds : NewsFeed[]) : NewsFeed[] => {
    // 처음 피드 데이터를 받아오면서 read속성을 false값으로 초기화해서 부여하기 위한 함수
    for (let i = 0 ; i < feeds.length ; i++) {
        feeds[i].read = false;
    }
    return feeds;
}

const makeComment = (comments : NewsDetailComment[]) : string => {
  const commentString = [];

  for (let i = 0; i < comments.length ; i++) {
      const comment : NewsDetailComment = comments[i];
      commentString.push(`
      <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
        <div class="text-gray-400">
          <i class="fa fa-sort-down mr-2"></i>
          <strong>${comment.user}</strong> ${comment.time_ago}
        </div>
        <p class="text-gray-700">${comment.content}</p>
      </div>      
    `);

    if (comment.comments.length > 0) {
        commentString.push(makeComment(comment.comments));
    }
  }

  return commentString.join('');
}

const displayNewsFeed = () : void => {
    const api = new NewsFeedApi();
    let newsFeeds : NewsFeed[] = store.feeds;

    if (newsFeeds.length == 0) {
        newsFeeds = store.feeds = makeFirstFeedForReadState(api.getData());
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
    template = template.replace('@prev_page', String(store.currentPage - 1 > 1 ? store.currentPage - 1 : 1));
    template = template.replace('@next_page', String(store.currentPage + 1 > maxPageNumber ? maxPageNumber : store.currentPage + 1));

    updateView(template);
}

const displayNewsDetail = () : void => {
    // 앵커태그의 해시가 변경되었을때 이벤트가 발생한다.
    // 해시를 CONTENT_URL의 id란에 넣고 API를 호출해야함
    // 해시를 주소에서 가져와야 하는데 주소 맨끝에 해시가 붙어있으니까 코드는 다음과 같다
    const id = location.hash.substring(9);
    const api = new NewsDetailApi();

    for (let i = 0; i < store.feeds.length ; i++) {
        if (store.feeds[i].id == Number(id)) {
            store.feeds[i].read = true;
            break;
        }
    }

    const newsContent = api.getData(id);
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

    template = template.replace('@comments', makeComment(newsContent.comments));

    updateView(template);
}

const router = () : void => {
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

