"use strict";
var AuthService = (function () {
    function AuthService(_options) {
        this._options = _options;
        if (!this._options.useIframe && !this.inIframe()) {
            this.processLoginState(location.hash);
        }
    }
    AuthService.prototype.processLoginState = function (locationHash) {
        var params = this.parseHash(locationHash);
        if (params['access_token']) {
            var token = this.parseToken(params['access_token']);
            //should probably also validate the signature, to check nonce validity.
            if (token.payload.nonce !== sessionStorage.getItem('nonce')) {
                throw new Error('Invalid nonce.');
            }
            sessionStorage.removeItem('nonce');
            //an accessToken has been provided in the hash.
            //validateToken()
            //if valid
            //storeLoginInfo(params);
            if (document.getElementById('helloThingy')) {
                document.getElementById('helloThingy').innerHTML = 'hello ' + token.payload['name'];
            }
        }
        else {
        }
        if (params['state'] !== undefined) {
            this.restoreState(params['state']);
        }
    };
    AuthService.prototype.login = function () {
        var _this = this;
        if (this._options.useIframe) {
            var authService_1 = this;
            var iframeId = 'loginIframe';
            var iframe_1 = document.getElementById(iframeId) || document.createElement('iframe');
            iframe_1.id = iframeId;
            iframe_1.setAttribute("class", "modal");
            iframe_1.setAttribute("src", this.getLoginUrl());
            document.body.appendChild(iframe_1);
            window.addEventListener('message', function (message) {
                var token = _this.parseHash(message.data)['access_token'];
                if (token) {
                    document.body.removeChild(iframe_1);
                    authService_1.processLoginState(message.data);
                }
            }, false);
            iframe_1.onload = function () {
                parent.postMessage(this.contentWindow.location.hash, '*');
            };
        }
        else {
            window.location.assign(this.getLoginUrl());
        }
    };
    AuthService.prototype.logout = function () {
        if (this._options.useIframe) {
            //?
            window.location.assign(this.getLogoutUrl());
        }
        else {
            window.location.assign(this.getLogoutUrl());
        }
    };
    AuthService.prototype.getLoginUrl = function () {
        var options = this._options;
        var nonce = this.generateNonce();
        sessionStorage.setItem('nonce', nonce);
        var loginUrlTemplate = ("" + options.authServer) +
            ("/auth/realms/" + options.realm + "/protocol/openid-connect/auth") +
            ("?scope=" + encodeURIComponent(options.scope)) +
            ("&response_type=" + encodeURIComponent(options.responseType)) +
            ("&state=" + encodeURIComponent(this.serializeState())) +
            ("&redirect_uri=" + encodeURIComponent(options.redirectUri)) +
            ("&client_id=" + encodeURIComponent(options.clientId)) +
            ("&nonce=" + encodeURIComponent(nonce));
        return loginUrlTemplate;
    };
    AuthService.prototype.getLogoutUrl = function () {
        return '';
    };
    AuthService.prototype.serializeState = function () {
        return btoa(window.location.hash);
    };
    AuthService.prototype.restoreState = function (bState) {
        try {
            window.location.hash = atob(bState);
        }
        catch (e) {
            console.error('couldn\'t parse state, but i dont care');
        }
    };
    AuthService.prototype.generateNonce = function () {
        return '42'; //:) just a test
    };
    AuthService.prototype.parseHash = function (locationHash) {
        // First, parse the query string
        var params = {}, queryString = locationHash.substring(1), regex = /([^&=]+)=([^&]*)/g, m; //say thank you google example.
        while (m = regex.exec(queryString)) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
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
            //head: JSON.parse(atob(b6Head)),
            payload: JSON.parse(atob(b6Payload))
        };
        return parsedToken;
    };
    AuthService.prototype.inIframe = function () {
        try {
            return window.self !== window.top;
        }
        catch (e) {
            return true;
        }
    };
    return AuthService;
}());
exports.AuthService = AuthService;
//# sourceMappingURL=auth-service.js.map