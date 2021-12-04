import TorinoAlbumsAPI from "./api/albums";
import TorinoFileSystemAPI from "./api/vfs";
import TorinoFilesAPI from "./api/blobs";
import {AlbumsAPI} from "./domain/albums";
import {FilesAPI} from "./domain/blobs";
import {FileSystemAPI} from "./domain/vfs";

export interface IServices {
  fs: FileSystemAPI;
  blobs: FilesAPI;
  albums: AlbumsAPI;
}

export const Services: IServices = {
  fs: new TorinoFileSystemAPI(),
  blobs: new TorinoFilesAPI(),
  albums: new TorinoAlbumsAPI(),
};
