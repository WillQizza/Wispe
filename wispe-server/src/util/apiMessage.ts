function errorApiMessage(message: string) {
    return {
        status: 'ERROR',
        message
    }
}

function apiMessage(data: any) {
    return {
        status: 'OK',
        data
    };
}

export {
    errorApiMessage,
    apiMessage
};