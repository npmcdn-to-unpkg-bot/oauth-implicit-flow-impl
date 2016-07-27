import {InitOptions} from './init-options';

export class AuthService {

    constructor(private _options: InitOptions) {
        if (!this._options.useIframe && !this.inIframe()) {
            this.processLoginState(location.hash);
        }
    }

    public processLoginState(locationHash) {
        let token;
        let params = this.parseHash(locationHash);
        if (params['access_token']) {
            token = this.parseToken(params['access_token']);
            //should probably also validate the signature, to check nonce validity.
            if (token.payload.nonce !== sessionStorage.getItem('nonce')) {
                throw new Error('Invalid nonce.');
            }
            sessionStorage.removeItem('nonce');
            sessionStorage.setItem('access_token',params['access_token']);
            //an accessToken has been provided in the hash.
            //validateToken()
            //if valid
            //storeLoginInfo(params);
            
        }
        else if(sessionStorage.getItem('access_token')){
            token = this.parseToken(sessionStorage.getItem('access_token'));
        }else {
            //request current token from server?
            //perhaps a valid session exists server side.
        }
        if (params['state'] !== undefined) {
            this.restoreState(params['state']);
        }
        //display username.
        if (token && document.getElementById('helloThingy')) {
            document.getElementById('helloThingy').innerHTML = 'hello ' + token.payload['name'];
        }
    }

    public login() {
        if (this._options.useIframe) {
            let authService = this;
            let iframeId = 'loginIframe';
            let iframe = document.getElementById(iframeId) || document.createElement('iframe');
            iframe.id = iframeId;
            iframe.setAttribute("class", "modal");
            iframe.setAttribute("src", this.getLoginUrl());
            document.body.appendChild(iframe);
            window.addEventListener('message', (message) => {
                let token = this.parseHash(message.data)['access_token'];
                if (token) {
                    document.body.removeChild(iframe);
                    authService.processLoginState(message.data);
                }
            }, false);
            iframe.onload = function() {
                parent.postMessage(this.contentWindow.location.hash, '*');
            };
        } else {
            window.location.assign(this.getLoginUrl());
        }
    }

    public logout() {
        sessionStorage.removeItem('access_token');
        if (this._options.useIframe) {
            //?
            window.location.assign(this.getLogoutUrl());
        } else {
            window.location.assign(this.getLogoutUrl());
        }
    }

    private getLoginUrl() {
        let options = this._options;
        let nonce = this.generateNonce();
        sessionStorage.setItem('nonce', nonce);

        let loginUrlTemplate =
            `${options.authServer}` +
            `/auth/realms/${options.realm}/protocol/openid-connect/auth` +
            `?scope=${encodeURIComponent(options.scope)}` +
            `&response_type=${encodeURIComponent(options.responseType)}` +
            `&state=${encodeURIComponent(this.serializeState())}` +
            `&redirect_uri=${encodeURIComponent(options.redirectUri)}` +
            `&client_id=${encodeURIComponent(options.clientId)}` +
            `&nonce=${encodeURIComponent(nonce)}`;

        return loginUrlTemplate;
    }

    private getLogoutUrl() {
        return this._options.authServer+'/auth/realms/demo/protocol/openid-connect/logout?redirect_uri='+encodeURIComponent(location.href);
    }

    private serializeState(): string {
        return btoa(window.location.hash);
    }

    private restoreState(bState) {
        try {
            window.location.hash = atob(bState);
        } catch (e) {
            console.error('couldn\'t parse state, but i dont care');
        }
    }

    private generateNonce() {
        return '42'; //:) just a test
    }

    private parseHash(locationHash) {
        // First, parse the query string
        var params = {}, queryString = locationHash.substring(1),
            regex = /([^&=]+)=([^&]*)/g, m; //say thank you google example.
        while (m = regex.exec(queryString)) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }

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
            //head: JSON.parse(atob(b6Head)),
            payload: JSON.parse(atob(b6Payload))
            // ,
            // signature: atob(b6SigVal)
        }
        return parsedToken;
    }

    private inIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }
}