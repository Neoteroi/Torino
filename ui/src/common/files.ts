//
// Reusable code related to files.
//

import {uniqueId} from "lodash";
import {picturesMime} from "./mime";

export function getExtension(name: string): string {
  const m = name.match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[0] : "";
}

export class FileInfo {
  id: string;
  name: string;
  size: number;
  mime: string;
  lastModified: number;
  lastModifiedTime: Date;
  htmlFile: File;

  constructor(
    name: string,
    size: number,
    mime: string,
    lastModified: number,
    lastModifiedDate: Date,
    file: File
  ) {
    this.id = uniqueId("file");
    this.name = name;
    this.size = size;
    this.mime = mime;
    this.lastModified = lastModified;
    this.lastModifiedTime = lastModifiedDate;
    this.htmlFile = file;
  }

  getSizeRepr(): string {
    return formatFileSize(this.size);
  }

  get extension(): string {
    return getExtension(this.name);
  }

  static fromFile(file: File): FileInfo {
    return new FileInfo(
      file.name,
      file.size,
      file.type,
      file.lastModified,
      new Date(file.lastModified),
      file
    );
  }
}

export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
}

export function isImage(file: FileInfo): boolean {
  return picturesMime.indexOf(file.mime) > -1;
}

export function isVideo(file: FileInfo): boolean {
  return file.mime.indexOf("video/") > -1;
}

export function downloadURL(url: string, name: string): void {
  // window.open(url, "_self");
  // TODO: does the following work with IE and Edge?
  const link = document.createElement("a");
  link.download = name;
  link.href = url;
  link.style.visibility = "hidden";
  link.style.position = "absolute";
  link.style.left = "-9999px";

  document.body.appendChild(link);
  link.click();
}
