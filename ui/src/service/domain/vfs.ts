export enum FileSystemNodeType {
  file = "file",
  folder = "folder",
}

export interface FileImageData {
  medium_image_name: string;
  small_image_name: string;
  image_width: number;
  image_height: number;
}

export interface FileSystemNode {
  id: string;
  node_type: FileSystemNodeType;
  name: string;
  type: string;
  icon: string | null;
  parent_id: string | null;
  etag: string;
  last_modified_time: Date;
  creation_time: Date;
  file_id: string | null;
  file_extension: string | null;
  file_size: number | null;
  hidden: boolean;
  image?: FileImageData;
}

export interface FileSystemNodePathFragment {
  id: string;
  name: string;
  parent_id: string | null;
}

export interface CreateNodeInput {
  name: string;
  album_id: string;
  parent_id: string | null;
  file_id?: string;
  file_size?: number;
  file_mime?: string;
  node_type: FileSystemNodeType;
}

export interface UpdateNodeInput {
  id: string;
  etag: string;
  name: string;
  parent_id: string | null;
}

export interface CopyOperationInput {
  album_id: string;
  source_parent_id: string | null;
  target_parent_id: string | null;
  nodes: UpdateNodeInput[];
}

export interface FileSystemAPI {
  getNodePath(folderId: string): Promise<FileSystemNodePathFragment[]>;

  deleteNodes(node_ids: string[]): Promise<void>;

  createNodes(input: CreateNodeInput[]): Promise<FileSystemNode[]>;

  moveNodes(input: CopyOperationInput): Promise<FileSystemNode[]>;

  pasteNodes(input: CopyOperationInput): Promise<FileSystemNode[]>;

  updateNode(input: UpdateNodeInput): Promise<FileSystemNode>;
}
