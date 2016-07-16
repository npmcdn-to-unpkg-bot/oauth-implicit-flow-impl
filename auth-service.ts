import {InitOptions} from './init-options';

export class AuthService {

    constructor(private _options: InitOptions) {

        this.processLoginState();
    }

    public processLoginState() {
        var params = this.parseHash();
        if (params['access_token']) {
            if (params['nonce'] !== this._options.nonce) {
                throw new Error('Invalid nonce.');
            }
            this._options.nonce = undefined;
            //an accessToken has been provided in the hash.
            //validateToken()
            //if valid
            //storeLoginInfo(params);
            console.log(this.parseToken(params['access_token']));
        }
        else {
            //request current token from server?
            //perhaps a valid session exists server side.
        }
        if (params['state']) {
            this.restoreState(params['state']);
        }
    }

    public login() {
        if (this._options.useIframe) {
            let iframe = document.createElement('iframe');
            iframe.setAttribute("class", "modal");
            document.body.appendChild(iframe);
            iframe.onload = this.processLoginState.bind(this);
            iframe.contentWindow.location.assign(this.getLoginUrl());
        } else {
            window.location.assign(this.getLoginUrl());
        }
    }

    public logout() {
        if(this._options.useIframe){
            //?
        }else{
            window.location.assign(this.getLogoutUrl());
        }
    }

    private getLoginUrl() {        
        let options = this._options;
        options.nonce = this.generateNonce();

        let loginUrlTemplate =
            `${options.baseUrl}
            ?scope=${options.scope}
            &state=${this.serializeState()}
            &redirect_uri=${options.redirectUri}
            &client_id=${options.clientId}
            &nonce=${options.nonce}`;

        return loginUrlTemplate;
    }
    
    private getLogoutUrl(){
        return '';
    }

    private serializeState():string {
        return btoa(window.location.href);
    }
    
    private restoreState(bState) {
        window.location.href = atob(bState);
    }

    private generateNonce() {
        return 42;
    }

    private parseHash() {
        // First, parse the query string
        var params = {}, queryString = location.hash.substring(1),
            regex = /([^&=]+)=([^&]*)/g, m;
        while (m = regex.exec(queryString)) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        //say thank you google example.
        return params;
    }

    private parseToken(jws) {
        //thank you some crypto js library that I forgot the name of.
        if (jws.match(/^([^.]+)\.([^.]+)\.([^.]+)$/) == null) {
            throw "JWS is not a form of 'Head.Payload.SigValue'.";
        }
        var b6Head = RegExp.$1;
        var b6Payload = RegExp.$2;
        var b6SigVal = RegExp.$3;
        var parsedToken = {
            head: atob(b6Head),
            payload: atob(b6Payload),
            signature: atob(b6SigVal)
        }
        return parsedToken;
    }
}