export async function get<T>(
    url: string
): Promise<T> {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(
            `Request failed: ${response.status}`
        )
    }

    return response.json() as Promise<T>
}

export async function post<TRequest, TResponse>(
    url: string,
    body: TRequest
): Promise<TResponse> {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        throw new Error(
            `Request failed: ${response.status}`
        )
    }

    return response.json() as Promise<TResponse>
}