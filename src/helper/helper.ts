import {Follow, UserInfo, Users} from "./follow"
import {sendMessage} from "../service/message"

const CookieStore = require('tough-cookie-filestore2')

interface People {
    data: Array<Users>
}

export const createInstagramInstance = async (instagram: any): Promise<Follow> => {
    const {
        USERNAME: username,
        PASSWORD: password
    } = process.env

    const cookie = new CookieStore(`${__dirname}/../../cookies.json`)
    const client = new instagram({username, password, cookieStore: cookie})
    await client.login()

    return new Follow(client)
}

export const pushData = (data: Array<Users>, people: People): void => {
    data.push(...(people.data.map(({id, username, full_name}: Users) => {
        return {id, username, full_name}
    })))
}

export const messageFor = (yourself: boolean, isPositive: boolean = true) => {
    const action = isPositive ? 'followed' : 'unfollowed'
    return (data: Array<Users>, userInfo: UserInfo) => {
        if (data.length === 0) {
            const msg = yourself
                ? `${instagramLink(userInfo.username)} did not <strong>${action.toLocaleUpperCase()}</strong> anyone since last run 😛`
                : `No one <strong>${action.toLocaleUpperCase()}</strong> to ${instagramLink(userInfo.username)} since last run 🤨`
            sendMessage(msg)
            return
        }

        data.map(({username, full_name}: Users) => {
            const follower = yourself ? userInfo.username : `${full_name} (${username})`
            const following = yourself ? `${full_name} (${username})` : userInfo.username
            const msg = `${instagramLink(follower)} <strong>${action.toLocaleUpperCase()}</strong> to ${instagramLink(following)}`

            sendMessage(msg)
        })
    }

}

const instagramLink = (text: string): string => {
    return `<a href="https://instagram.com/${getUsername(text)}">${text}</a>`
}

export const getUsername = (name: string) => {

    if (name.includes('(')) {
        const regEx = /\(([^)]+)\)/
        const username = regEx.exec(name)
        if (!username) {
            return name
        }
        return username.pop()
    }

    return name
}