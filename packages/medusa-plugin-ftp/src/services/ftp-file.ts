/* eslint-disable @typescript-eslint/no-explicit-any */
import { Lifetime } from "awilix";
import { AbstractFileService, Logger } from "@medusajs/medusa";
import {
    DeleteFileType,
    FileServiceGetUploadStreamResult,
    FileServiceUploadResult,
    GetUploadedFileType,
    IEventBusService,
    UploadStreamDescriptorType
} from "@medusajs/types";

import "multer";

import FtpClient from "ssh2-sftp-client";
import { SFTPWrapper } from "ssh2";
import { Transform } from "stream";
import sftp from "ssh2-sftp-client";

export interface FtpFileServiceOptions extends sftp.ConnectOptions {
    uploadPath?: string;
}

export default class FtpFileService extends AbstractFileService {
    static LIFE_TIME = Lifetime.SCOPED;
    protected readonly eventBusService_: IEventBusService;
    options: FtpFileServiceOptions;
    ftpClient: FtpClient;
    logger: Logger;

    constructor(
        container: { eventBusService: IEventBusService; logger: Logger },
        options: FtpFileServiceOptions
    ) {
        super(container);
        this.options = options;
        this.ftpClient = new FtpClient();
        this.logger = (container.logger ?? { debug: console.log }) as any;
        this.eventBusService_ = container.eventBusService;
    }

    async ftpConnect(): Promise<SFTPWrapper> {
        const sftpWrapper = await this.ftpClient.connect({
            host: this.options.host,
            port: this.options.port ?? 22,
            username: this.options.username,
            password: this.options.password,
            authHandler: ["password", "publickey"],
            debug: this.logger.debug
        });
        return sftpWrapper;
    }

    private async ftpDisconnect(): Promise<void> {
        await this.ftpClient.end();
    }

    private async ftpAction<X, Z>(
        action: (...args) => Promise<X>,
        ...args: unknown[]
    ): Promise<Z> {
        await this.ftpConnect();
        const result = await action.apply(this, args);
        await this.ftpDisconnect();
        const serverPath = this.options.uploadPath ?? "/";
        if (result) {
            return {
                key: args[0],
                url: `${serverPath}${args[0]}`
            } as Z;
        } else {
            throw new Error(`${args[0]} upload failed`);
        }
    }

    async upload(
        fileData: Express.Multer.File
    ): Promise<FileServiceUploadResult> {
        const result = await this.ftpAction<string, FileServiceUploadResult>(
            this.ftpClient.put,
            fileData.buffer,
            fileData.originalname
        );

        return result;
    }

    async uploadProtected(
        fileData: Express.Multer.File
    ): Promise<FileServiceUploadResult> {
        return this.upload(fileData);
    }
    async delete(fileData: DeleteFileType): Promise<void> {
        const result = await this.ftpAction<string, void>(
            this.ftpClient.delete,
            fileData.fileKey
        );
        return result;
    }
    async getUploadStreamDescriptor(
        fileData: UploadStreamDescriptorType
    ): Promise<FileServiceGetUploadStreamResult> {
        await this.ftpConnect();
        const result = this.ftpClient.createWriteStream(fileData.name);

        return {
            writeStream: result.pipe(new Transform()),
            fileKey: fileData.name,
            url: `${this.options.uploadPath ?? "/"}${fileData.name}`,
            promise: new Promise((resolve, reject) => {
                result.on("finish", resolve);
                result.on("error", reject);
            })
        };
    }
    async getDownloadStream(
        fileData: GetUploadedFileType
    ): Promise<NodeJS.ReadableStream> {
        await this.ftpConnect();
        const result = this.ftpClient.createReadStream(fileData.fileKey);
        return result;
    }
    async getPresignedDownloadUrl(
        fileData: GetUploadedFileType
    ): Promise<string> {
        const result = await this.ftpAction<
            string | Buffer | NodeJS.WritableStream,
            string
        >(this.ftpClient.get, fileData.fileKey);
        return result;
    }
}
