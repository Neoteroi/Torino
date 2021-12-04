import {BaseURL} from ".";
import {get, getOptional, post} from "../../common/fetch";
import {
  Album,
  AlbumDetails,
  AlbumsAPI,
  CreateAlbumInput,
  FileURL,
  UpdateAlbumInput,
} from "../domain/albums";
import {FileSystemNode} from "../domain/vfs";

export default class TorinoAlbumsAPI implements AlbumsAPI {
  getFileURL(node: FileSystemNode): Promise<FileURL> {
    return get<FileURL>(`${BaseURL}/api/albums/file/${node.id}`);
  }

  async getAlbums(): Promise<Album[]> {
    return get<Album[]>(`${BaseURL}/api/albums`);
  }

  async getAlbumById(id: string): Promise<AlbumDetails | null> {
    return getOptional<AlbumDetails>(`${BaseURL}/api/albums/${id}`);
  }

  async getAlbumNodes(
    id: string,
    folderId?: string
  ): Promise<FileSystemNode[]> {
    if (folderId) {
      return get<FileSystemNode[]>(`${BaseURL}/api/nodes/${folderId}/nodes`);
    }
    return get<FileSystemNode[]>(`${BaseURL}/api/albums/${id}/nodes`);
  }

  async createAlbum(input: CreateAlbumInput): Promise<Album> {
    return post<Album>(`${BaseURL}/api/albums`, input);
  }

  async updateAlbum(input: UpdateAlbumInput): Promise<Album> {
    return post<Album>(`${BaseURL}/api/albums/${input.id}`, input);
  }
}
