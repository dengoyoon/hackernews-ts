export default abstract class View {
    // 원본 템플릿 : 이걸 안해놓으면 예를들어 템플릿 안에 @title이 있고 얘가 replace되면
    // @title이 아니라 그 값으로 대체 되기 때문에 한번 replace되고 나서 부터는 @title을 이용해서 replace 못하는 문제 발생
    private template : string;
    private renderTemplate : string; // 템플릿의 id가 replace될때 사용할 일시적인 템플릿
    private container : HTMLElement;
    private htmlList : string[];

    constructor(containerId : string, template : string) {
        const containerElement = document.getElementById(containerId);
        if (!containerElement) {
            throw "최상위 컨테이너가 없어 UI를 진행하지 못합니다.";
        }
        this.container = containerElement;
        this.template = template;
        this.renderTemplate = template;
        this.htmlList = [];
    }

    protected updateView = () : void => {
        if (this.container) { // type guard
            this.container.innerHTML = this.renderTemplate;
            this.renderTemplate = this.template; // 값이 replace되어 버린 @id들을 다시 원본 템플릿으로 살려놓기 위함
        } else {
            console.log("최상위 컨테이너가 없어 UI를 진행하지 못합니다.");
        }
    }

    protected addHtml = (htmlString : string) : void => {
        this.htmlList.push(htmlString);
    }

    protected getHtml = () : string => {
        const snapshot = this.htmlList.join('')
        this.clearHtmlList();
        return snapshot;
    }

    private clearHtmlList = () : void => {
        this.htmlList = [];
    }

    protected setTemplateData = (key : string, value : string) : void => {
        this.renderTemplate = this.renderTemplate.replace(`@${key}`, value);
    }

    // abstract : 자식 클래스들이 무조건 render를 override하게 만드는 키워드
    // 그리고 이 키워드를 쓰려면 View 클래스 자체에도 abstract 키워드가 붙어야 한다.
    abstract render() : void;
}