import {keys, invert, Dictionary} from "lodash";

export const pictures: Dictionary<string> = {
  "image/jpeg": ".jpg",
  "image/pjpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

export const videos: Dictionary<string> = {
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  // "video/x-matroska": ".mkv",
};

export const audios: Dictionary<string> = {
  "audio/mpeg": ".mpeg",
  "audio/ogg": ".ogg",
  "audio/mp3": ".mp3",
  "audio/x-ms-wma": ".wma",
  "audio/amr": ".amr",
};

export const documents: Dictionary<string> = {
  "text/plain": ".txt",
  "text/html": ".html",
  "application/x-java-archive": ".jar",
  "application/vnd.oasis.opendocument.text": ".odt",
  "application/vnd.oasis.opendocument.presentation": ".odp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/pdf": ".pdf",
  "application/zip": ".zip",
  "application/x-7z-compressed": ".7z",
  "image/x-xcf": ".xcf",
  "image/svg+xml": ".svg",
  "video/mp4": ".mp4",
  "audio/mp3": ".mp3",
  "audio/x-ms-wma": ".wma",
  "video/x-msvideo": ".avi",
  "audio/ogg": ".ogg",
  "video/ogg": ".ogv",
  "audio/amr": ".amr",
};

export const picturesMime = keys(pictures);
export const audiosMime = keys(audios);
export const videosMime = keys(videos);
export const documentsMime = keys(documents);
export const pictures_i = invert(pictures);
export const documents_i = invert(documents);

export function mimeByExtension(ext: string): string {
  return pictures_i[ext] || documents_i[ext];
}

export function extensionByMime(mime: string): string {
  return pictures[mime] || documents[mime];
}

export function isImageMime(mime: string): boolean {
  return picturesMime.indexOf(mime) > -1;
}

export function isAudioMime(mime: string): boolean {
  return audiosMime.indexOf(mime) > -1;
}

export function isVideoMime(mime: string): boolean {
  return videosMime.indexOf(mime) > -1;
}
