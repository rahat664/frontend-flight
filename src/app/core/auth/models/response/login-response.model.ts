export  interface LoginResponse {
    id: number;
    userId: string;
    name: string;
    phone: string;
    email: string;
    enabled: boolean;
    roles: [];
    accessToken: string;
    expiresAt: string;
}