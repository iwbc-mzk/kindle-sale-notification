export type DOMMessages = {
    type: "GET_CREDENTIALS"
}

export type DOMMessagesResponse = {
    credentials: credentials;
}

export type credentials = {
    access_key: string,
    password: string
}