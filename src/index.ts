import * as dotenv from 'dotenv'

dotenv.config()
process.argv.splice(0, 2)
const Instagram = require('instagram-web-api')
import {createInstagramInstance, getUsername} from './helper/helper'
import {sendMessage} from './service/message'

(async (): Promise<void> => {
    try {
        const follow = await createInstagramInstance(Instagram)
        await follow.init()
    } catch (e: any) {
        sendMessage(`The program has been crashed with: ${e.statusCode}`)
    }
})()
