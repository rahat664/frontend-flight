export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginPhoneRequest {
    phoneNumber: string;
}

export  interface LoginRequestUsingPhone {
    phoneNumber: string;
    otpCode: string;
}