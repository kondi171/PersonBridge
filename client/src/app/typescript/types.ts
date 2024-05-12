export type User = {
    _id: string,
    name: string,
    lastname: string,
    mail: string,
    password: string,
    avatar: string,
    status: string,
    biometrics: {
        fingerprint: string,
        voice: string,
        face: string,
    },
    friends: Friend[],
    requests: {
        received: [],
        sent: []
    },
    blocked: [],
    chatbots: []
}

export type Friend = {
    id: string,
    settings: {
        nickname: string,
        PIN: string,
    },
    messages: Message[]
}

export type Message = {
    content: string,
    date: string,
    sender: string
}

export type FullName = {
    name: string,
    lastname: string
}