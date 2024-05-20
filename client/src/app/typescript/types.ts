import { MessageSender } from "./enums"

export type Message = {
    content: string,
    date: Date,
    sender: MessageSender,
    read: boolean
}

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

