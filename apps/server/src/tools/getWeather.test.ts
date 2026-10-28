import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi
} from 'vitest'

import { queryWeather } from './getWeather.js'

const fetchMock = vi.fn()

beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv(
        'QWEATHER_API_HOST',
        'https://example.qweatherapi.com'
    )
    vi.stubEnv('QWEATHER_API_KEY', 'test-key')
})

afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
})

describe('queryWeather', () => {
    it('looks up the city and maps current weather', async () => {
        fetchMock
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        code: '200',
                        location: [
                            {
                                name: '北京',
                                id: '101010100',
                                lat: '39.90499',
                                lon: '116.40529',
                                adm1: '北京市'
                            }
                        ]
                    }),
                    { status: 200 }
                )
            )
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        condition: {
                            text: '晴',
                            code: '100'
                        },
                        temperature: {
                            value: 25.46
                        },
                        feelsLike: {
                            value: 26.14
                        },
                        humidity: 0.4,
                        wind: {
                            direction: {
                                compass: 'sw'
                            },
                            speed: {
                                value: 3.2
                            },
                            scale: 2
                        },
                        precipitation: {
                            amount: {
                                value: 0
                            },
                            type: 'none'
                        },
                        pressure: {
                            value: 1010
                        },
                        visibility: {
                            value: 20000
                        },
                        cloudCover: 0.1,
                        uvIndex: 4
                    }),
                    { status: 200 }
                )
            )

        const result = await queryWeather('北京')

        expect(result).toMatchObject({
            success: true,
            city: '北京',
            province: '北京市',
            locationId: '101010100',
            latitude: 39.9,
            longitude: 116.41,
            temperature: 25.5,
            weather: '晴',
            feelsLike: 26.1,
            humidity: 40,
            windDirection: '西南风',
            windScale: 2,
            windSpeed: 3.2,
            precipitation: 0,
            precipitationType: '无降水',
            pressure: 1010,
            visibilityKm: 20,
            cloudCover: 10,
            uvIndex: 4,
            source: '和风天气'
        })

        expect(fetchMock).toHaveBeenCalledTimes(2)

        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            expect.any(URL),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'X-QW-Api-Key': 'test-key'
                })
            })
        )

        const weatherUrl = fetchMock.mock.calls[1]?.[0]

        expect(weatherUrl.toString()).toContain(
            '/weather/v1/current/39.90/116.41'
        )
    })

    it('returns a friendly message when the city is not found', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(JSON.stringify({ code: '404' }), {
                status: 200
            })
        )

        await expect(queryWeather('不存在市')).resolves.toEqual(
            {
                success: false,
                city: '不存在市',
                message: '没有找到城市“不存在市”'
            }
        )
    })

    it('returns a message when the API is not configured', async () => {
        vi.stubEnv('QWEATHER_API_KEY', '')
        vi.stubEnv('QWEATHER_API_HOST', '')

        const result = await queryWeather('北京')

        expect(result).toEqual({
            success: false,
            city: '北京',
            message:
                '天气服务未配置，请设置 QWEATHER_API_KEY 和 QWEATHER_API_HOST'
        })
        expect(fetchMock).not.toHaveBeenCalled()
    })
})
