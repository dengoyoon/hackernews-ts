import View from "../core/view";
import { NewsFeedApi } from "../core/api";
import { NewsFeed } from "../types";

export default class NewsFeedView extends View{
    // 클래스로 뷰를 만드는 이유 : 필요한 것을 저장했다가 재사용해서 쓸 수 있기 때문
    private api : NewsFeedApi;
    private feeds : NewsFeed[];
  
    constructor(containerId: string) { // container는 즉 root를 의미한다.
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
      super(containerId, template); // 상속을 받으면 상위 클래스의 생성자를 실행시켜주어야 함.
      this.api = new NewsFeedApi();
      this.feeds = window.store.feeds;
  
      if (this.feeds.length == 0) {
        this.feeds = window.store.feeds = this.api.getData();
        this.makeFirstFeedForReadState();
      }    
    }
  
    // override render
    render = () : void => {
      window.store.currentPage = Number(location.hash.substring(7) || 1) // default 처리
      const maxPageNumber = this.feeds.length / 10;
      for (let i = (window.store.currentPage - 1) * 10 ; i < window.store.currentPage * 10 ; i++) {
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
      // 템플릿의 앵커 태그 안의 값들이 변경되면서 해당 버튼을 클릭했을때 hash 변경이 감지될 것.
      this.setTemplateData("prev_page", String(window.store.currentPage - 1 > 1 ? window.store.currentPage - 1 : 1));
      this.setTemplateData("next_page", String(window.store.currentPage + 1 > maxPageNumber ? maxPageNumber : window.store.currentPage + 1));
  
      this.updateView();
    }
  
    private makeFirstFeedForReadState = () : void => {
      // 처음 피드 데이터를 받아오면서 read속성을 false값으로 초기화해서 부여하기 위한 함수
      // 기존에는 input값과 output값이 있었는데 이제는 클래스의 내부 메서드가 되었으니까 값들을 그대로 참조할 수 있어서 지워줌
      for (let i = 0 ; i < this.feeds.length ; i++) {
          this.feeds[i].read = false;
      }
    }
  }