import {FileSystemNode} from "./vfs";

export interface Album {
  id: string;
  storage_id: string;
  name: string;
  image_url: string;
  description: string | null;
  last_modified_time: string;
  creation_time: string;
  etag: string;
}

export interface CreateAlbumInput {
  name: string;
  storage_id: string | null;
  image_url: string;
  description: string | null;
  public: boolean;
}

export interface UpdateAlbumInput {
  id: string;
  name: string;
  image_url: string;
  description: string | null;
  public: boolean;
  etag: string;
}

export interface AlbumDetails extends Album {
  items: FileSystemNode[];
}

export interface FileURL {
  url: string;
}

export interface AlbumsAPI {
  getAlbums(): Promise<Album[]>;

  getAlbumById(id: string): Promise<AlbumDetails | null>;

  getAlbumNodes(id: string, folderId?: string): Promise<FileSystemNode[]>;

  getFileURL(node: FileSystemNode): Promise<FileURL>;

  createAlbum(input: CreateAlbumInput): Promise<Album>;

  updateAlbum(input: UpdateAlbumInput): Promise<Album>;
}
