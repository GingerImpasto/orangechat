export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UploadImageResponse {
  imageUrl: string | null;
  error?: string;
}
