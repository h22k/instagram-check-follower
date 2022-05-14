import fs from 'fs'

export class Path {

    public static getPathOfJsonFile(file: string): string {
        return `${__dirname}/../../results/${file}.json`
    }

    public static isExistsFile(path: string): boolean {
        return fs.existsSync(path)
    }
}