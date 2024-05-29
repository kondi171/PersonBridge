export type Biometrics = {
    fingerprint: string,
    voice: string,
    face: string
}

export type FriendRequests = {
    received: string[],
    sent: string[]
}

export type MessageReaction = {
    userID: string,
    emoticon: string
}

export type FriendSettings = {
    nickname: string,
    PIN: number
}

export type FriendAccessibility = {
    mute: boolean,
    ignore: boolean,
    block: boolean
};
