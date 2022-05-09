import { NewsDetail, NewsFeed } from "../types";
import { NEWS_URL, CONTENT_URL } from "../config";

export class Api {
    protected getRequest<AjaxResponseType>(url : string) : AjaxResponseType {
        const ajax = new XMLHttpRequest();
        ajax.open('GET', url, false);
        ajax.send();

        // 경우에 따라서 반환하는 값이 NewsFeed[]일때도, NewsDetail일때도 있는 상황
        return JSON.parse(ajax.response);
    }
}

export class NewsFeedApi extends Api {
    getData() : NewsFeed[] {
        return this.getRequest<NewsFeed[]>(NEWS_URL);
    }
}

// 믹스인 방법
export class NewsDetailApi extends Api {
    getData(id : string) : NewsDetail {
        return this.getRequest<NewsDetail>(CONTENT_URL.replace('@id', id));
    }
}


// // 믹스인
// function applyApiMixins(targetClass : any, baseClasses : any[]) {
//     baseClasses.forEach(baseClass => {
//       Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
//         const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);
  
//         if (descriptor) {
//           Object.defineProperty(targetClass.prototype, name, descriptor);
//         }
//       });
//     });
//   }

// interface NewsFeedApi extends Api {}; // TypeScript 컴파일러에게 이 두가지가 합성될것임을 알려주는 코드
// interface NewsDetailApi extends Api {};
// applyApiMixins(NewsFeedApi, [Api]);
// applyApiMixins(NewsDetailApi, [Api]);