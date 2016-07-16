import { InitOptions } from './init-options';
export declare class AuthService {
    private _options;
    constructor(_options: InitOptions);
    processLoginState(): void;
    login(): void;
    logout(): void;
    private getLoginUrl();
    private getLogoutUrl();
    private serializeState();
    private restoreState(bState);
    private generateNonce();
    private parseHash();
    private parseToken(jws);
}
