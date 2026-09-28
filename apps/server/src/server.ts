import { buildApp } from './app.js'

const start = async () => {
    const app = buildApp()

    try {
        await app.listen({
            port: Number(process.env.PORT ?? 3000),
            host: process.env.HOST ?? '0.0.0.0'
        })

        app.log.info(
            'Server running at http://localhost:' +
            (process.env.PORT ?? 3000)
        )
    } catch (error) {
        app.log.error(error)
        process.exit(1)
    }
}

start()
