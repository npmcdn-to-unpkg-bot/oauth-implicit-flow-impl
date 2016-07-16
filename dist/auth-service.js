"use strict";
var AuthService = (function () {
    function AuthService(_options) {
        this._options = _options;
        this.processLoginState();
    }
    AuthService.prototype.processLoginState = function () {
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
        }
        if (params['state']) {
            this.restoreState(params['state']);
        }
    };
    AuthService.prototype.login = function () {
        if (this._options.useIframe) {
            var iframe = document.createElement('iframe');
            iframe.setAttribute("class", "modal");
            document.body.appendChild(iframe);
            iframe.onload = this.processLoginState.bind(this);
            iframe.contentWindow.location.assign(this.getLoginUrl());
        }
        else {
            window.location.assign(this.getLoginUrl());
        }
    };
    AuthService.prototype.logout = function () {
        if (this._options.useIframe) {
        }
        else {
            window.location.assign(this.getLogoutUrl());
        }
    };
    AuthService.prototype.getLoginUrl = function () {
        var options = this._options;
        options.nonce = this.generateNonce();
        var loginUrlTemplate = options.baseUrl + "\n            ?scope=" + options.scope + "\n            &state=" + this.serializeState() + "\n            &redirect_uri=" + options.redirectUri + "\n            &client_id=" + options.clientId + "\n            &nonce=" + options.nonce;
        return loginUrlTemplate;
    };
    AuthService.prototype.getLogoutUrl = function () {
        return '';
    };
    AuthService.prototype.serializeState = function () {
        return btoa(window.location.href);
    };
    AuthService.prototype.restoreState = function (bState) {
        window.location.href = atob(bState);
    };
    AuthService.prototype.generateNonce = function () {
        return 42;
    };
    AuthService.prototype.parseHash = function () {
        // First, parse the query string
        var params = {}, queryString = location.hash.substring(1), regex = /([^&=]+)=([^&]*)/g, m;
        while (m = regex.exec(queryString)) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        //say thank you google example.
        return params;
    };
    AuthService.prototype.parseToken = function (jws) {
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
        };
        return parsedToken;
    };
    return AuthService;
}());
exports.AuthService = AuthService;
//# sourceMappingURL=auth-service.js.map