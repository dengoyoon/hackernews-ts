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

interface NewsFeed extends News {
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

function applyApiMixins(targetClass : any, baseClasses : any[]) {
  baseClasses.forEach(baseClass => {
    Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
      const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

      if (descriptor) {
        Object.defineProperty(targetClass.prototype, name, descriptor);
      }
    });
  });
}

class Api {
  getRequest<AjaxResponseType>(url : string) : AjaxResponseType {
    const ajax = new XMLHttpRequest();
    ajax.open('GET', url, false);
    ajax.send();

    // 경우에 따라서 반환하는 값이 NewsFeed[]일때도, NewsDetail일때도 있는 상황
    return JSON.parse(ajax.response);
  }
}

// 믹스인 방법
class NewsFeedApi {
  getData() : NewsFeed[] {
    return this.getRequest<NewsFeed[]>(NEWS_URL);
  }
}

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

class View {
  template : string;
  container : HTMLElement;
  htmlList : string[];

  constructor(containerId : string, template : string) {
    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
      throw "최상위 컨테이너가 없어 UI를 진행하지 못합니다.";
    }
    this.container = containerElement;
    this.template = template;
    this.htmlList = [];
  }

  updateView = () : void => {
    if (container) { // type guard
      container.innerHTML = this.template;
    } else {
      console.log("최상위 컨테이너가 없어 UI를 진행하지 못합니다.");
    }
  }

  addHtml = (htmlString : string) : void => {
    this.htmlList.push(htmlString);
  }

  getHtml = () : string => {
    return this.htmlList.join('')
  }

  setTemplateData = (key : string, value : string) : void => {
    this.template = this.template.replace(`@${key}`, value);
  }
}

class NewsFeedView extends View{
  // 클래스로 뷰를 만드는 이유 : 필요한 것을 저장했다가 재사용해서 쓸 수 있기 때문
  api : NewsFeedApi;
  feeds : NewsFeed[];

  constructor(containerId: string) {
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
    super(containerId, template);
    this.api = new NewsFeedApi();
    this.feeds = store.feeds;

    if (this.feeds.length == 0) {
        this.feeds = store.feeds = this.api.getData();
        this.makeFirstFeedForReadState();
    }

    
  }

  render() : void {
    const maxPageNumber = this.feeds.length / 10;
    for (let i = (store.currentPage - 1) * 10 ; i < store.currentPage * 10 ; i++) {
      // 구조 분해 할당 방법
      const { id, title, comments_count, user, points, time_ago, read } = this.feeds[i];
      this.addHtml(`
          <div class="p-6 ${read ? 'bg-green-600' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
          <div class="flex">
              <div class="flex-auto">
              <a href="#/detail/${id}">${title}</a>  
              </div>
              <div class="text-center text-sm">
              <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${comments_count}</div>
              </div>
          </div>
          <div class="flex mt-3">
              <div class="grid grid-cols-3 text-sm text-gray-500">
              <div><i class="fas fa-user mr-1"></i>${user}</div>
              <div><i class="fas fa-heart mr-1"></i>${points}</div>
              <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
              </div>  
          </div>
          </div>    
      `);
    }
    this.setTemplateData("news_list", this.getHtml());
    this.setTemplateData("prev_page", String(store.currentPage - 1 > 1 ? store.currentPage - 1 : 1));
    this.setTemplateData("next_page", String(store.currentPage + 1 > maxPageNumber ? maxPageNumber : store.currentPage + 1));

    this.updateView();
  }

  makeFirstFeedForReadState = () : void => {
    // 처음 피드 데이터를 받아오면서 read속성을 false값으로 초기화해서 부여하기 위한 함수
    // 기존에는 input값과 output값이 있었는데 이제는 클래스의 내부 메서드가 되었으니까 값들을 그대로 참조할 수 있어서 지워줌
    for (let i = 0 ; i < this.feeds.length ; i++) {
        this.feeds[i].read = false;
    }
  }
}

class NewsDetailView extends View {
  constructor(containerId : string) {
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
    super(containerId, template);
  }

  render() {
    // 해당 부분은 API가 호출 될때 결정되는 것들 이니까 render함수로 들어오게 됨
    // 앵커태그의 해시가 변경되었을때 이벤트가 발생한다.
    // 해시를 CONTENT_URL의 id란에 넣고 API를 호출해야함
    // 해시를 주소에서 가져와야 하는데 주소 맨끝에 해시가 붙어있으니까 코드는 다음과 같다
    const id = location.hash.substring(9);
    const api = new NewsDetailApi();
    const newsContent = api.getData(id);

    for (let i = 0; i < store.feeds.length ; i++) {
      if (store.feeds[i].id == Number(id)) {
          store.feeds[i].read = true;
          break;
      }
    }
    this.setTemplateData("comments", this.makeComment(newsContent.comments));
    this.updateView();
  }

  makeComment = (comments : NewsDetailComment[]) : string => {  
    for (let i = 0; i < comments.length ; i++) {
        const comment : NewsDetailComment = comments[i];
        this.addHtml(`
        <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-down mr-2"></i>
            <strong>${comment.user}</strong> ${comment.time_ago}
          </div>
          <p class="text-gray-700">${comment.content}</p>
        </div>      
      `);
  
      if (comment.comments.length > 0) {
          this.addHtml(this.makeComment(comment.comments));
      }
    }
  
    return this.getHtml();
  }
}

// 제네릭을 이용하면 A,B,C,D 유형의 인풋값에 대해서 A유형엔 A유형으로 반환 할 수 있게 해준다,
const getData = <AjaxResponseType>(url : string) : AjaxResponseType => {
    ajax.open('GET', url, false);
    ajax.send();

    // 경우에 따라서 반환하는 값이 NewsFeed[]일때도, NewsDetail일때도 있는 상황
    return JSON.parse(ajax.response);
}

const displayNewsDetail = () : void => {
    // // 앵커태그의 해시가 변경되었을때 이벤트가 발생한다.
    // // 해시를 CONTENT_URL의 id란에 넣고 API를 호출해야함
    // // 해시를 주소에서 가져와야 하는데 주소 맨끝에 해시가 붙어있으니까 코드는 다음과 같다
    // const id = location.hash.substring(9);
    // const api = new NewsDetailApi();

    // for (let i = 0; i < store.feeds.length ; i++) {
    //     if (store.feeds[i].id == Number(id)) {
    //         store.feeds[i].read = true;
    //         break;
    //     }
    // }

    // const newsContent = api.getData(id);
    // let template = `
    // <div class="bg-gray-600 min-h-screen pb-8">
    //   <div class="bg-white text-xl">
    //     <div class="mx-auto px-4">
    //       <div class="flex justify-between items-center py-6">
    //         <div class="flex justify-start">
    //           <h1 class="font-extrabold">Hacker News</h1>
    //         </div>
    //         <div class="items-center justify-end">
    //           <a href="#/page/${store.currentPage}" class="text-gray-500">
    //             <i class="fa fa-times"></i>
    //           </a>
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   <div class="h-full border rounded-xl bg-white m-6 p-4 ">
    //     <h2>${newsContent.title}</h2>
    //     <div class="text-gray-400 h-20">
    //       ${newsContent.content}
    //     </div>

    //     @comments

    //   </div>
    // </div>
    // `;

    // template = template.replace('@comments', makeComment(newsContent.comments));

    // updateView(template);
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

