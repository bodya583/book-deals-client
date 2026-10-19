import api from './axiosInstance';

export interface UploadResponse {
  url: string;
  public_id: string;
  message: string;
}

export const uploadBookCover = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
