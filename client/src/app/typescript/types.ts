export type Message = {
    content: string,
    date: string,
    sender: string
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

export type SearchResult = {
    _id: string,
    mail: string,
    name: string,
    lastname: string,
    avatar: string,
}

export type CardData = {
    id: string,
    name: string,
    lastname: string,
    mail: string,
    avatar: string,
}
