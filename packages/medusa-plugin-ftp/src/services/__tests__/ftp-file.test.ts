/* eslint-disable @typescript-eslint/no-explicit-any */
import FtpFileService, { FtpFileServiceOptions } from "../ftp-file";
import FtpClient from "ssh2-sftp-client";
// import { SFTPWrapper } from "ssh2";
import {
    describe,
    jest,
    beforeEach,
    afterEach,
    expect,
    it
} from "@jest/globals";
import { config } from "dotenv";

let host;
let username;
let password;
let port;
const noMocks = process.env.NO_MOCKS;
config();
if (noMocks) {
    host = process.env.host;
    username = process.env.username;
    password = process.env.password;
    port = process.env.port;
} else {
    host = "localhost";
    username = "username";
    password = "password";
    port = 22;
}
describe("FtpFileService", () => {
    let ftpFileService: FtpFileService;
    let ftpClientMock: jest.Mocked<FtpClient>;

    const options: FtpFileServiceOptions = {
        host,
        port,
        username,
        password
    };

    const container = {
        eventBusService: {} as any, // Mock the eventBusService
        logger: { debug: console.log }
    } as any;

    beforeEach(() => {
        ftpClientMock = {
            connect: jest.fn().mockResolvedValue({} as never) // Mock the connect method
        } as any;

        ftpFileService = new FtpFileService(container, options);
        if (!noMocks) {
            ftpFileService.ftpClient = ftpClientMock;
        }
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("ftpConnect", () => {
        it("should return the SFTPWrapper instance", async () => {
            const result = await ftpFileService.ftpConnect();

            expect(result).toBeDefined();
        });
    });

    describe("upload", () => {
        it("should upload the file to the FTP server", async () => {
            const fileData = {
                buffer: Buffer.from("file content"),
                originalname: "example.txt"
            };

            const putMock = jest.fn().mockResolvedValue(true as never);
            ftpClientMock.put = putMock as any;

            const result = await ftpFileService.upload(fileData as any);

            expect(putMock).toHaveBeenCalledWith(
                fileData.buffer,
                fileData.originalname
            );
            expect(result).toEqual({
                key: fileData.originalname,
                url: "/example.txt"
            });
        });

        it("should throw an error if the upload fails", async () => {
            const fileData = {
                buffer: Buffer.from("file content"),
                originalname: "example.txt"
            };

            const putMock = jest.fn().mockResolvedValue(false as never);
            ftpClientMock.put = putMock as any;

            await expect(
                ftpFileService.upload(fileData as any)
            ).rejects.toThrowError(`${fileData.originalname} upload failed`);
        });
    });
    describe("upload", () => {
        let ftpFileService: FtpFileService;
        let ftpClientMock: jest.Mocked<FtpClient>;

        beforeEach(() => {
            const options: FtpFileServiceOptions = {
                host,
                port,
                username,
                password
            };

            const container = {
                eventBusService: {} as any, // Mock the eventBusService
                logger: { debug: console.log }
            } as any;

            ftpClientMock = {
                connect: jest.fn().mockResolvedValue({} as never), // Mock the connect method
                put: jest.fn().mockResolvedValue(true as never) // Mock the put method
            } as any;

            ftpFileService = new FtpFileService(container, options);
            if (!noMocks) {
                ftpFileService.ftpClient = ftpClientMock;
            }
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should upload the file to the FTP server", async () => {
            const fileData = {
                buffer: Buffer.from("file content"),
                originalname: "example.txt"
            };

            const result = await ftpFileService.upload(fileData as any);

            expect(ftpClientMock.put).toHaveBeenCalledWith(
                fileData.buffer,
                fileData.originalname
            );
            expect(result).toEqual({
                key: fileData.originalname,
                url: "/example.txt"
            });
        });

        it("should throw an error if the upload fails", async () => {
            const fileData = {
                buffer: Buffer.from("file content"),
                originalname: "example.txt"
            };

            ftpClientMock.put.mockResolvedValue("ok");

            await expect(
                ftpFileService.upload(fileData as any)
            ).rejects.toThrowError(`${fileData.originalname} upload failed`);
        });
    });

    describe("uploadProtected", () => {
        let ftpFileService: FtpFileService;
        let ftpClientMock: jest.Mocked<FtpClient>;

        beforeEach(() => {
            const options: FtpFileServiceOptions = {
                host,
                port,
                username,
                password
            };

            const container = {
                eventBusService: {} as any, // Mock the eventBusService
                logger: { debug: console.log }
            } as any;

            ftpClientMock = {
                connect: jest.fn().mockResolvedValue({} as never), // Mock the connect method
                put: jest.fn().mockResolvedValue(true as never) // Mock the put method
            } as any;

            ftpFileService = new FtpFileService(container, options);
            if (!noMocks) {
                ftpFileService.ftpClient = ftpClientMock;
            }
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should upload the file to the FTP server", async () => {
            const fileData = {
                buffer: Buffer.from("file content"),
                originalname: "example.txt"
            };

            const result = await ftpFileService.uploadProtected(
                fileData as any
            );

            expect(ftpClientMock.put).toHaveBeenCalledWith(
                fileData.buffer,
                fileData.originalname
            );
            expect(result).toEqual({
                key: fileData.originalname,
                url: "/example.txt"
            });
        });

        it("should throw an error if the upload fails", async () => {
            const fileData = {
                buffer: Buffer.from("file content"),
                originalname: "example.txt"
            };

            ftpClientMock.put.mockResolvedValue("ok");

            await expect(
                ftpFileService.uploadProtected(fileData as any)
            ).rejects.toThrowError(`${fileData.originalname} upload failed`);
        });
    });
    describe("upload", () => {
        let ftpFileService: FtpFileService;
        let ftpClientMock: jest.Mocked<FtpClient>;

        beforeEach(() => {
            const options: FtpFileServiceOptions = {
                host,
                port,
                username,
                password
            };

            const container = {
                eventBusService: {} as any, // Mock the eventBusService
                logger: { debug: console.log }
            } as any;

            ftpClientMock = {
                connect: jest.fn().mockResolvedValue({} as never), // Mock the connect method
                put: jest.fn().mockResolvedValue(true as never) // Mock the put method
            } as any;

            ftpFileService = new FtpFileService(container, options);
            if (!noMocks) {
                if (!noMocks) {
                    ftpFileService.ftpClient = ftpClientMock;
                }
            }
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should upload the file to the FTP server", async () => {
            const fileData = {
                buffer: Buffer.from("file content"),
                originalname: "example.txt"
            };

            const result = await ftpFileService.upload(fileData as any);

            expect(ftpClientMock.put).toHaveBeenCalledWith(
                fileData.buffer,
                fileData.originalname
            );
            expect(result).toEqual({
                key: fileData.originalname,
                url: "/example.txt"
            });
        });

        it("should throw an error if the upload fails", async () => {
            const fileData = {
                buffer: Buffer.from("file content"),
                originalname: "example.txt"
            };

            ftpClientMock.put.mockResolvedValue("ok");

            await expect(
                ftpFileService.upload(fileData as any)
            ).rejects.toThrowError(`${fileData.originalname} upload failed`);
        });
    });
    describe("getUploadStreamDescriptor", () => {
        let ftpFileService: FtpFileService;
        let ftpClientMock: jest.Mocked<FtpClient>;

        beforeEach(() => {
            const options: FtpFileServiceOptions = {
                host,
                port,
                username,
                password
            };

            const container = {
                eventBusService: {} as any, // Mock the eventBusService
                logger: { debug: console.log }
            } as any;

            ftpClientMock = {
                connect: jest.fn().mockResolvedValue({} as never), // Mock the connect method
                createWriteStream: jest
                    .fn()
                    .mockReturnValue({ pipe: jest.fn() }) // Mock the createWriteStream method
            } as any;

            ftpFileService = new FtpFileService(container, options);
            if (!noMocks) {
                if (!noMocks) {
                    ftpFileService.ftpClient = ftpClientMock;
                }
            }
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should create a write stream and return the upload stream descriptor", async () => {
            const fileData = {
                name: "example.txt"
            };

            const writeStreamMock = { pipe: jest.fn() };
            ftpClientMock.createWriteStream.mockReturnValue(
                writeStreamMock as any
            );

            const result = await ftpFileService.getUploadStreamDescriptor(
                fileData
            );

            expect(ftpClientMock.createWriteStream).toHaveBeenCalledWith(
                fileData.name
            );
            expect(result).toEqual({
                writeStream: writeStreamMock,
                fileKey: fileData.name,
                url: "/example.txt"
            });
        });
    });
    describe("getDownloadStream", () => {
        let ftpFileService: FtpFileService;
        let ftpClientMock: jest.Mocked<FtpClient>;

        beforeEach(() => {
            const options: FtpFileServiceOptions = {
                host,
                port,
                username,
                password
            };

            const container = {
                eventBusService: {} as any, // Mock the eventBusService
                logger: { debug: console.log }
            } as any;

            ftpClientMock = {
                connect: jest.fn().mockResolvedValue({} as never), // Mock the connect method
                createReadStream: jest.fn().mockReturnValue({}) // Mock the createReadStream method
            } as any;

            ftpFileService = new FtpFileService(container, options);
            if (!noMocks) {
                ftpFileService.ftpClient = ftpClientMock;
            }
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should return a readable stream for the specified file", async () => {
            const fileData = {
                fileKey: "example.txt"
            };

            const readStreamMock = {};
            ftpClientMock.createReadStream.mockReturnValue(
                readStreamMock as any
            );

            const result = await ftpFileService.getDownloadStream(
                fileData as any
            );

            expect(ftpClientMock.createReadStream).toHaveBeenCalledWith(
                fileData.fileKey
            );
            expect(result).toBe(readStreamMock);
        });

        describe("getPresignedDownloadUrl", () => {
            let ftpFileService: FtpFileService;
            let ftpClientMock: jest.Mocked<FtpClient>;

            beforeEach(() => {
                const options: FtpFileServiceOptions = {
                    host: "example.com",
                    port: 22,
                    username: "username",
                    password: "password"
                };

                const container = {
                    eventBusService: {} as any, // Mock the eventBusService
                    logger: { debug: console.log }
                } as any;

                ftpClientMock = {
                    connect: jest.fn().mockResolvedValue({} as never), // Mock the connect method
                    get: jest.fn().mockResolvedValue("example-url" as never) // Mock the get method
                } as any;

                ftpFileService = new FtpFileService(container, options);
                if (!noMocks) {
                    ftpFileService.ftpClient = ftpClientMock;
                }
            });

            afterEach(() => {
                jest.clearAllMocks();
            });

            it("should return the presigned download URL for the specified file", async () => {
                const fileData = {
                    fileKey: "example.txt"
                };

                const result = await ftpFileService.getPresignedDownloadUrl(
                    fileData
                );

                expect(ftpClientMock.get).toHaveBeenCalledWith(
                    fileData.fileKey
                );
                expect(result).toBe("example-url");
            });
        });
    });
});
