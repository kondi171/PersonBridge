export interface RegisterData {
    mail: string,
    name: string,
    lastname: string,
    password: string
}

export interface SearchResult {
    _id: string,
    mail: string,
    name: string,
    lastname: string,
    avatar: string,
}

export interface LoginData {
    mail: string,
    password: string
}