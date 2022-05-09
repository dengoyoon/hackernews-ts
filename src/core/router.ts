import { RouteInfo } from '../types';
import View from './view'; 

export default class Router {
    // Router class 목적 : hash가 바뀌었을때 해당하는 페이지를 보여준다.
    private routeTable : RouteInfo[]; // 최초 시작시에 path와 page(view) 저장됨.
    private defaultRoute : RouteInfo | null; // 최초 시작시에 NewsFeedView 저장됨.

    constructor() {
        const routePath = location.hash;
        // 해시의 변경을 감지하고 변경되면 함수 실행.
        // window.addEventListener에서의 this context는 Router 인스턴스가 아니고 함수를 실행하는 주체인 이벤트가 됨 
        window.addEventListener('hashchange', this.route.bind(this));
        this.routeTable = [];
        this.defaultRoute = null;
    }

    setDefaultPage = (page : View) : void => {
        this.defaultRoute = {
            path : '',
            page : page
        }
    }

    addRoutePath = (path : string, page : View) : void => {
        this.routeTable.push({
            path : path, // 둘이 같으니까 그냥 path라고만 적어도 됨
            page : page,
        })
    }

    route = () : void => {
        const routePath = location.hash;
        // #만 있으면 그냥 빈 문자열 ''로 나온다.
        if(routePath == '' && this.defaultRoute) {
            // 디폴트 페이지인 NewsFeedView로 이동.
            // render함수를 실행시킴으로써 updateView가 실행되고 페이지가 innerHTHL로 그려지게 된다. 
            this.defaultRoute.page.render();
        }

        for (const routeInfo of this.routeTable) {
            if (routePath.indexOf(routeInfo.path) >= 0) {
                routeInfo.page.render();
                break;
            }
        }
    }
}