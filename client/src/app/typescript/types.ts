export type FullName = {
    name: string,
    lastname: string
}

export type LoginData = {
    mail: string,
    password: string
}

export type RegisterData = {
    mail: string,
    name: string,
    lastname: string,
    password: string
}

export type UserInfo = {
    id: string,
    mail: string,
    name: string,
    lastname: string,
    avatar: string,
}

export type FriendAccessibility = {
    mute: boolean,
    ignore: boolean,
    block: boolean
}

export type FriendSettings = {
    nickname: string,
    PIN: number,
}

export type MessageReaction = {
    userID: string,
    emoticon: string
}

export type GroupInfo = {
    id: string
    name: string,
    avatar: string,
    participants: string[]
}

export type Participant = {
    id: string,
    nickname: string,
    avatar: string,
}

export type AccessibilityAction = 'mute' | 'ignore' | 'block';