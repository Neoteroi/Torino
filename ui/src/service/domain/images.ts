import {ContainerReadAuth} from "./blobs";
import {FileSystemNode} from "./vfs";

export function getOriginalImageURL(
  node: FileSystemNode,
  auth: ContainerReadAuth
): string {
  return auth.base_url + `${node.file_id}${node.file_extension}?${auth.token}`;
}

export function getMediumSizeImageURL(
  node: FileSystemNode,
  auth: ContainerReadAuth
): string {
  const image = node.image;

  if (!image) return "";

  return auth.base_url + `${image.medium_image_name}?${auth.token}`;
}

export function getSmallSizeImageURL(
  node: FileSystemNode,
  auth: ContainerReadAuth
): string {
  const image = node.image;

  if (!image) return "";

  return auth.base_url + `${image.small_image_name}?${auth.token}`;
}
