import {BaseURL} from ".";
import {ApplicationError, UserCancelledOperation} from "../../common/errors";
import {get, post} from "../../common/fetch";
import {
  FilesAPI,
  FileUploadTarget,
  FileUploadInput,
  FileUploadContext,
  FileUploadData,
  ContainerReadAuth,
} from "../domain/blobs";

function pad(i: number, length: number): string {
  let str = "" + i;
  while (str.length < length) {
    str = "0" + str;
  }
  return str;
}

export default class TorinoFilesAPI implements FilesAPI {
  uploadFile(
    file: File,
    data: FileUploadTarget,
    context: FileUploadContext
  ): Promise<FileUploadData> {
    return new Promise((resolve, reject) => {
      const normaliseProgress = (value: number) => (value * 100) / file.size;

      const fileSize = file.size;
      const fileType = file.type;
      let maxBlockSize = 4 * 1024 * 1024;
      let currentFilePointer = 0;
      let totalBytesRemaining = fileSize;

      if (fileSize < maxBlockSize) {
        maxBlockSize = fileSize;
      }
      const blockIdPrefix = "block-";
      const blockIds: string[] = [];
      let bytesUploaded = 0;

      const fileId = data.file_id;
      const baseUrl = data.base_url;
      const fileName = data.file_name;
      const sas = data.token;
      const submitUri = baseUrl + fileName + "?" + sas;

      const reader = new FileReader();

      reader.onloadend = function (evt) {
        const target = evt.target;
        if (target === null) {
          return;
        }
        if (target.readyState == FileReader.DONE) {
          const uri =
            submitUri + "&comp=block&blockid=" + blockIds[blockIds.length - 1];

          const requestData = new Uint8Array((target as any).result);

          if (!context.uploading) return reject(new UserCancelledOperation());

          fetch(uri, {
            method: "PUT",
            body: requestData,
            headers: {
              "x-ms-blob-type": "BlockBlob",
              "Content-Length": requestData.length.toString(),
            },
          }).then(
            function () {
              if (!context.uploading)
                return reject(new UserCancelledOperation());

              bytesUploaded += requestData.length;
              context.onProgress(normaliseProgress(bytesUploaded));
              uploadFileInBlocks();
            },
            function () {
              reject(
                new ApplicationError(
                  "Error while uploading the blob block",
                  500
                )
              );
            }
          );
        } else {
          reject(
            new ApplicationError("Error while reading the blob block", 500)
          );
        }
      };

      function commitBlockList(): void {
        const uri = submitUri + "&comp=blocklist";
        // eslint-disable-next-line quotes
        let requestBody = '<?xml version="1.0" encoding="utf-8"?><BlockList>';
        for (let i = 0; i < blockIds.length; i++) {
          requestBody += "<Latest>" + blockIds[i] + "</Latest>";
        }
        requestBody += "</BlockList>";

        fetch(uri, {
          method: "PUT",
          body: requestBody,
          headers: {
            "x-ms-blob-content-type": file.type,
            "Content-Length": requestBody.length.toString(),
          },
        }).then(
          function () {
            if (!context.uploading)
              return reject(new UserCancelledOperation());

            // file upload complete
            resolve({
              file_id: fileId,
              file_name: fileName,
              file_type: fileType,
              file_size: fileSize,
            });
          },
          function () {
            if (!context.uploading)
              return reject(new UserCancelledOperation());

            reject(
              new ApplicationError("Error while committing the blob", 500)
            );
          }
        );
      }

      function uploadFileInBlocks(): void {
        if (totalBytesRemaining > 0) {
          const fileContent = file.slice(
            currentFilePointer,
            currentFilePointer + maxBlockSize
          );
          const blockId = blockIdPrefix + pad(blockIds.length, 6);
          blockIds.push(btoa(blockId));
          reader.readAsArrayBuffer(fileContent);
          currentFilePointer += maxBlockSize;
          totalBytesRemaining -= maxBlockSize;
          if (totalBytesRemaining < maxBlockSize) {
            maxBlockSize = totalBytesRemaining;
          }
        } else {
          commitBlockList();
        }
      }

      uploadFileInBlocks();
    });
  }

  async initializeFileUpload(
    input: FileUploadInput
  ): Promise<FileUploadTarget> {
    return await post<FileUploadTarget>(
      `${BaseURL}/api/blobs/initialize-upload`,
      input
    );
  }

  async getContainerReadAuthContext(
    album_id: string
  ): Promise<ContainerReadAuth> {
    return await get<ContainerReadAuth>(
      `${BaseURL}/api/albums/${album_id}/container-context`
    );
  }
}
