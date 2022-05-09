import View from "../core/view";
import { NewsDetailApi } from "../core/api";
import { NewsDetailComment, NewsStore } from "../types";

const template = `
    <div class="bg-gray-600 min-h-screen pb-8">
        <div class="bg-white text-xl">
            <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
                <div class="flex justify-start">
                <h1 class="font-extrabold">Hacker News</h1>
                </div>
                <div class="items-center justify-end">
                <a href="#/page/@current_page" class="text-gray-500">
                    <i class="fa fa-times"></i>
                </a>
                </div>
            </div>
            </div>
        </div>

        <div class="h-full border rounded-xl bg-white m-6 p-4 ">
            <h2>@news_content_title</h2>
            <div class="text-gray-400 h-20">
            @news_content_content
            </div>
            @comments
        </div>
    </div>
    `;

export default class NewsDetailView extends View {
    private store : NewsStore;

    constructor(containerId : string, store : NewsStore) {
      super(containerId, template);
      this.store = store;
    }
  
    // override render
    render = () => {
      // 해당 부분은 API가 호출 될때 결정되는 것들 이니까 render함수로 들어오게 됨
      // 앵커태그의 해시가 변경되었을때 이벤트가 발생한다.
      // 해시를 CONTENT_URL의 id란에 넣고 API를 호출해야함
      // 해시를 주소에서 가져와야 하는데 주소 맨끝에 해시가 붙어있으니까 코드는 다음과 같다
      const id = location.hash.substring(9);
      const api = new NewsDetailApi();
      const newsContent = api.getData(id); // api를 호출할때 id값이 필요해서 NewsFeedView와는 다르게 render에서 실행함.
  
      this.store.makeRead(Number(id));
      this.setTemplateData("comments", this.makeComment(newsContent.comments));
  
      this.setTemplateData('current_page', String(this.store.currentPage));
      this.setTemplateData('news_content_title', newsContent.title);
      this.setTemplateData('news_content_content', newsContent.content);
  
      this.updateView();
    }
  
    private makeComment = (comments : NewsDetailComment[]) : string => {  
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