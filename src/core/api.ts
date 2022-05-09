import { NewsDetail, NewsFeed } from "../types";
import { NEWS_URL, CONTENT_URL } from "../config";

export class Api {
    xhr : XMLHttpRequest;
    url : string;

    constructor(url : string) {
        this.xhr = new XMLHttpRequest();
        this.url = url;
    }

    // 콜백 헬을 해결할 fetch와 promise 방법
    // async를 붙이면 리턴 값으로 Promise객체를 반환한다는 의미가 됨
    // 마치 동기적으로 처리하는 것처럼 보이게 함
    protected async request<AjaxResponseType>() : Promise<AjaxResponseType> {
        const response = await fetch(this.url)
        return await response.json() as AjaxResponseType;
    }
}

export class NewsFeedApi extends Api {
    async getData() : Promise<NewsFeed[]> {
        return this.request<NewsFeed[]>();
    }
}

export class NewsDetailApi extends Api {
    async getData() : Promise<NewsDetail> {
        return this.request<NewsDetail>();
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