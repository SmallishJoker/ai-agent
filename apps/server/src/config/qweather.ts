import 'dotenv/config'

function normalizeHost(value: string): string {
    const withScheme = /^https?:\/\//i.test(value)
        ? value
        : `https://${value}`

    return withScheme.replace(/\/+$/, '')
}

export interface QWeatherConfig {
    apiKey: string
    apiHost: string
}

export function getQWeatherConfig(): QWeatherConfig | null {
    const apiKey = process.env.QWEATHER_API_KEY?.trim()
    const apiHost = process.env.QWEATHER_API_HOST?.trim()

    console.log('QWeather API Key:', apiKey)
    console.log('QWeather API Host:', apiHost)

    if (!apiKey || !apiHost) {
        return null
    }

    return {
        apiKey,
        apiHost: normalizeHost(apiHost)
    }
}
