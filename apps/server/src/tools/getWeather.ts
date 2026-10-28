import { tool } from 'ai'
import { z } from 'zod'

import { getQWeatherConfig } from '../config/qweather.js'

interface QWeatherGeoLocation {
    name: string
    id: string
    lat: string
    lon: string
    adm1?: string
    adm2?: string
    country?: string
    tz?: string
}

interface QWeatherGeoResponse {
    code: string
    location?: QWeatherGeoLocation[]
}

interface QWeatherCurrentResponse {
    condition?: {
        text?: string
        code?: string
    }
    temperature?: {
        value?: number
        unit?: string
    }
    feelsLike?: {
        value?: number
        unit?: string
    }
    humidity?: number
    wind?: {
        direction?: {
            degree?: number
            compass?: string
        }
        speed?: {
            value?: number
            unit?: string
        }
        scale?: number
    }
    precipitation?: {
        amount?: {
            value?: number
            unit?: string
        }
        intensity?: {
            value?: number
            unit?: string
        }
        type?: string
    }
    pressure?: {
        value?: number
        unit?: string
    }
    visibility?: {
        value?: number
        unit?: string
    }
    dewPoint?: {
        value?: number
        unit?: string
    }
    cloudCover?: number
    uvIndex?: number
}

interface QWeatherProblemResponse {
    error?: {
        status?: number
        title?: string
        detail?: string
        invalidParams?: string[]
    }
}

const WIND_DIRECTIONS: Record<string, string> = {
    n: '北风',
    nne: '东北风',
    ne: '东北风',
    ene: '东北风',
    e: '东风',
    ese: '东南风',
    se: '东南风',
    sse: '东南风',
    s: '南风',
    ssw: '西南风',
    sw: '西南风',
    wsw: '西南风',
    w: '西风',
    wnw: '西北风',
    nw: '西北风',
    nnw: '西北风',
    vrb: '不定风',
    none: '无持续风向'
}

const PRECIPITATION_TYPES: Record<string, string> = {
    rain: '雨',
    snow: '雪',
    ice: '冰粒或冻雨',
    mixed: '混合降水',
    none: '无降水',
    unknown: '未知'
}

function round(value: number, digits = 1) {
    const factor = 10 ** digits

    return Math.round(value * factor) / factor
}

function toCoordinate(value: string): string {
    const parsed = Number(value)

    if (!Number.isFinite(parsed)) {
        throw new Error('和风天气返回了无效的坐标')
    }

    return parsed.toFixed(2)
}

async function readProblemDetail(response: Response) {
    try {
        const problem =
            (await response.json()) as QWeatherProblemResponse

        return (
            problem.error?.detail ??
            problem.error?.title ??
            `HTTP ${response.status}`
        )
    } catch {
        return `HTTP ${response.status}`
    }
}

async function requestQWeather<T>(
    path: string,
    params: Record<string, string>
): Promise<T> {
    const config = getQWeatherConfig()

    if (!config) {
        throw new Error(
            '天气服务未配置，请设置 QWEATHER_API_KEY 和 QWEATHER_API_HOST'
        )
    }

    const url = new URL(`${config.apiHost}${path}`)

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value)
    }

    const response = await fetch(url, {
        headers: {
            'X-QW-Api-Key': config.apiKey,
            Accept: 'application/json'
        },
        signal: AbortSignal.timeout(10_000)
    })

    if (!response.ok) {
        throw new Error(await readProblemDetail(response))
    }

    return (await response.json()) as T
}

export async function lookupCity(city: string) {
    const data = await requestQWeather<QWeatherGeoResponse>(
        '/geo/v2/city/lookup',
        {
            location: city,
            number: '5',
            lang: 'zh'
        }
    )

    if (data.code !== '200' || !data.location?.length) {
        return null
    }

    const target = city.trim().toLowerCase()

    return (
        data.location.find(
            item => item.name.trim().toLowerCase() === target
        ) ?? data.location[0]
    )
}

export async function fetchCurrentWeather(
    location: QWeatherGeoLocation
) {
    const latitude = toCoordinate(location.lat)
    const longitude = toCoordinate(location.lon)

    const data = await requestQWeather<QWeatherCurrentResponse>(
        `/weather/v1/current/${latitude}/${longitude}`,
        {
            localTime: 'true',
            lang: 'zh'
        }
    )

    const temperature = data.temperature?.value
    const weather = data.condition?.text

    if (temperature === undefined || !weather) {
        throw new Error('和风天气返回的数据不完整')
    }

    const humidity =
        typeof data.humidity === 'number'
            ? Math.round(data.humidity * 100)
            : undefined

    const cloudCover =
        typeof data.cloudCover === 'number'
            ? Math.round(data.cloudCover * 100)
            : undefined

    const precipitationType = data.precipitation?.type
        ? PRECIPITATION_TYPES[data.precipitation.type]
        : undefined

    return {
        city: location.name,
        province: location.adm1,
        locationId: location.id,
        latitude: Number(latitude),
        longitude: Number(longitude),
        temperature: round(temperature),
        weather,
        feelsLike:
            data.feelsLike?.value !== undefined
                ? round(data.feelsLike.value)
                : undefined,
        humidity,
        windDirection: data.wind?.direction?.compass
            ? WIND_DIRECTIONS[data.wind.direction.compass]
            : undefined,
        windScale: data.wind?.scale,
        windSpeed: data.wind?.speed?.value,
        precipitation: data.precipitation?.amount?.value,
        precipitationType,
        pressure: data.pressure?.value,
        visibilityKm:
            data.visibility?.value !== undefined
                ? round(data.visibility.value / 1000)
                : undefined,
        dewPoint:
            data.dewPoint?.value !== undefined
                ? round(data.dewPoint.value)
                : undefined,
        cloudCover,
        uvIndex: data.uvIndex,
        fetchedAt: new Date().toISOString(),
        source: '和风天气'
    }
}

export async function queryWeather(city: string) {
    try {
        const location = await lookupCity(city)

        if (!location) {
            return {
                success: false as const,
                city,
                message: `没有找到城市“${city}”`
            }
        }

        const weather = await fetchCurrentWeather(location)

        return {
            success: true as const,
            ...weather
        }
    } catch (error) {
        return {
            success: false as const,
            city,
            message:
                error instanceof Error
                    ? error.message
                    : '查询天气时发生未知错误'
        }
    }
}

export const getWeather = tool({
    description:
        '查询指定城市或经纬度坐标的实时天气。城市名示例：北京、上海；坐标示例：116.41,39.92',

    inputSchema: z.object({
        city: z
            .string()
            .min(1)
            .describe('要查询天气的城市名称或“经度,纬度”坐标')
    }),

    execute: ({ city }) => queryWeather(city)
})
