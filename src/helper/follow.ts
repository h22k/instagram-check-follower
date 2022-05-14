import {sayHiMessage, sendMessage} from "../service/message"
import {messageFor, pushData} from "./helper"
import {Path} from './path'
import {File} from "./file"

console.log(process.argv)

export interface UserInfo {
    id: string,
    username: string
}

interface Methods {
    follower: string,
    following: string
}

export interface Users {
    id: string,
    username: string,
    full_name: string
}

interface Difference {
    oldDifference: Array<Users>,
    newDifference: Array<Users>
}

export class Follow {
    private readonly client: any

    static methods: Methods = {
        follower: 'getFollowers',
        following: 'getFollowings'
    }

    constructor(client: any) {
        this.client = client
    }

    public async init(): Promise<void> {
        const profile = await this.getProfile()
        // console.log(profile)

        const userInfo: UserInfo = await this.userInfo(profile.username)
        // console.log(userInfo)
        await this.getFollowersAndFollowings(userInfo)

        const usernames = process.argv

        usernames.map(async e => {
            const userInfo: UserInfo = await this.userInfo(e)
            await this.getFollowersAndFollowings(userInfo)
        })
    }

    private async getFollowersAndFollowings(userInfo: UserInfo): Promise<void> {
        await this.checkFollowers(userInfo)
        await this.checkFollowings(userInfo)
    }

    private async checkFor(method: 'follower' | 'following', userInfo: UserInfo): Promise<Difference> {
        const FOLLOWER_FILE: string = Path.getPathOfJsonFile(`${userInfo.username}-${method}s`)
        const isFileExists: boolean = Path.isExistsFile(FOLLOWER_FILE)

        const data: Array<Users> = await this.checkingForGivenMethod(method, userInfo.id)

        if ( ! isFileExists) {
            sendMessage(`There is no old record (${method}) for ${userInfo.username}`)
            await File.write(FOLLOWER_FILE, JSON.stringify(data))
        }

        const OLD_RECORDS: Array<Users> = require(FOLLOWER_FILE)
        const oldDifference: Array<Users> = OLD_RECORDS.filter(({id}) => ! data.some(e => e.id === id))
        const newDifference: Array<Users> = data.filter(({id}) => ! OLD_RECORDS.some(e => e.id === id))

        if (oldDifference.length !== 0 || newDifference.length !== 0) {
            await File.write(FOLLOWER_FILE, JSON.stringify(data))
        }

        return {
            oldDifference,
            newDifference
        }
    }

    private async checkFollowers(userInfo: UserInfo): Promise<void> {
        await this.checkAll('follower', false, userInfo)
    }

    private async checkFollowings(userInfo: UserInfo): Promise<void> {
        await this.checkAll('following', true, userInfo)
    }

    private async checkAll(method: 'following' | 'follower', yourself: boolean, userInfo: UserInfo): Promise<void> {
        const followingsCheck = await this.checkFor(method, userInfo)

        const unfollow = messageFor(yourself, false)
        const follow = messageFor(yourself)

        unfollow(followingsCheck.oldDifference, userInfo)
        follow(followingsCheck.newDifference, userInfo)
    }

    private async checkingForGivenMethod(method: 'follower' | 'following', userId: string): Promise<Array<Users>> {
        const getMethodWithKey: string = Follow.methods[method]
        const datum = await this.client[getMethodWithKey]({userId, first: 50})

        let data: Array<Users> = []
        let {
            end_cursor: cursor,
            has_next_page: nextPage
        } = datum.page_info

        pushData(data, datum)

        while (nextPage) {
            const allFollowers = await this.client[getMethodWithKey]({userId, first: 50, after: cursor})
            const {page_info} = allFollowers
            cursor = page_info.end_cursor
            nextPage = page_info.has_next_page
            pushData(data, allFollowers)
        }

        return Array.from(new Set(data))
    }

    private async userInfo(username: string): Promise<any> {
        sendMessage(`Accessing ${username} information 👻`)

        return await this.client.getUserByUsername({username})
    }

    private async getProfile(): Promise<any> {
        const profile = await this.client.getProfile()
        Follow.sayHi(profile.first_name)

        return profile
    }

    private static sayHi(fullName: string): void {
        sayHiMessage(fullName)
    }
}