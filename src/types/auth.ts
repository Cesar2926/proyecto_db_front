export interface AuthLoginRequest {
    username: string;
    password?: string;
}

export interface AuthLoginResponse {
    jwt: string;
}
