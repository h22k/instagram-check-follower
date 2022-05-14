import fs from "fs"
import {sendMessage} from "../service/message"
import ErrnoException = NodeJS.ErrnoException

export class File {
    public static async write(fileName: string, data: string | NodeJS.ArrayBufferView): Promise<void> {
        const dirPath = `${__dirname}/../../results`
        if (!fs.existsSync(dirPath)) {
            await fs.mkdirSync(dirPath)
        }
        await fs.writeFileSync(fileName, data)
    }

    public static errorMessage(fileName: string): void {
        sendMessage(`Error! I could not write to file [${fileName}]`)
    }

    public static successMessage(fileName: string): void {
        sendMessage(`${fileName} has been written! Continuing...`)
    }
}