import { NewsFeed, NewsStore } from './types';

export default class Store implements NewsStore {
    private feeds : NewsFeed[];
    private _currentPage : number;

    constructor() {
        this.feeds = [];
        this._currentPage = 1;
    }

    // getCurrentPage와 같은 함수를 만들어서 간단한 클래스 정보를 가져오는 것을 하기에 좀 애매하니까
    // getter / setter 라는 문법이 있다.
    get currentPage() : number {
        return this._currentPage;
    }

    set currentPage(page : number) {
        if (page <= 0)
            return;
        this._currentPage = page;
    }

    get nextPage() : number {
        return this._currentPage + 1;
    }

    get prevPage() : number {
        return this._currentPage - 1 > 1 ? this._currentPage - 1 : 1;
    }

    get numberOfFeeds() : number {
        return this.feeds.length;
    }

    get hasFeeds() : boolean {
        return this.feeds.length > 0;
    }

    getAllFeeds = () : NewsFeed[] => {
        return this.feeds;
    }

    getFeed = (position : number) : NewsFeed => {
        return this.feeds[position];
    }

    setFeeds = (feeds : NewsFeed[]) : void => {
        this.feeds = feeds.map(feed => ({
            ...feed, // spread operater
            read : false
        }))
    }

    makeRead = (id : number) : void => {
        const feed = this.feeds.find((feed : NewsFeed) => feed.id == id);

        if (feed) {
            feed.read = true;
        }
    }
}