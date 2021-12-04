import {BaseURL} from ".";
import {get, del, patch, post} from "../../common/fetch";
import {
  CopyOperationInput,
  CreateNodeInput,
  FileSystemAPI,
  FileSystemNode,
  FileSystemNodePathFragment,
  UpdateNodeInput,
} from "../domain/vfs";

export default class TorinoFileSystemAPI implements FileSystemAPI {
  async getNodePath(folderId: string): Promise<FileSystemNodePathFragment[]> {
    return get<FileSystemNodePathFragment[]>(
      `${BaseURL}/api/nodes/${folderId}/path`
    );
  }

  async createNodes(input: CreateNodeInput[]): Promise<FileSystemNode[]> {
    return post<FileSystemNode[]>(`${BaseURL}/api/nodes`, input);
  }

  async updateNode(input: UpdateNodeInput): Promise<FileSystemNode> {
    return patch<FileSystemNode>(`${BaseURL}/api/nodes/${input.id}`, input);
  }

  async moveNodes(input: CopyOperationInput): Promise<FileSystemNode[]> {
    return post<FileSystemNode[]>(`${BaseURL}/api/nodes/move`, input);
  }

  async pasteNodes(input: CopyOperationInput): Promise<FileSystemNode[]> {
    return post<FileSystemNode[]>(`${BaseURL}/api/nodes/paste`, input);
  }

  async deleteNodes(node_ids: string[]): Promise<void> {
    return del<void>(`${BaseURL}/api/nodes`, node_ids);
  }
}
