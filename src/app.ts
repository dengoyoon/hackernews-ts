import Router from "./core/router";
import { NewsDetailView, NewsFeedView } from "./page";
import Store from "./store";

// 가능하면 이렇게 전역에서 사용할 수 있게 하는 요소는 만들지 않는게 좋음
// const store : Store = {
//   currentPage : 1,
//   feeds : []
// };
// declare global {
//   interface Window {
//     store : Store;
//   }
// }

// window.store = store

const store = new Store();
const router : Router = new Router();
const newsFeedView = new NewsFeedView('root', store);
const newsDetailView = new NewsDetailView('root', store);

router.setDefaultPage(newsFeedView);
router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/detail/', newsDetailView);

router.route();