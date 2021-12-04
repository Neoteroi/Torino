export interface FileUploadInput {
  container_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

export interface FileUploadData {
  file_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

export interface ContainerReadAuth {
  base_url: string;
  token: string;
}

export interface FileUploadTarget {
  base_url: string;
  file_id: string;
  file_name: string;
  token: string;
}

export interface FileUploadContext {
  uploading: boolean;
  onProgress: (bytesUploaded: number) => void;
}

export interface FilesAPI {
  uploadFile(
    file: File,
    data: FileUploadTarget,
    context: FileUploadContext
  ): Promise<FileUploadData>;

  initializeFileUpload(input: FileUploadInput): Promise<FileUploadTarget>;

  getContainerReadAuthContext(album_id: string): Promise<ContainerReadAuth>;
}
