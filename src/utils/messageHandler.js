export const messageHandle = {
    formatMessage(
        role,
        content,
        reasoning_content = '',
        files = [],
        completion_tokens = 0,
        speed = 0,
    ) {
        return {
            id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
            role,
            content,
            reasoning_content,
            files,
            completion_tokens,
            speed,
            loading: false,
        }
    },

    async handleStreamResponse(response, updateCallback) {
        const reader = response.body.getReader()

        const decoder = new TextDecoder()

        let accumulatedContent = ''
        let accumulatedReasoning = ''

        let buffer = ''

        const startTime = Date.now()

        const processLine = (rawLine) => {
            const line = rawLine.trim()
            if (!line || line === 'data: [DONE]') return
            if (!line.startsWith('data:')) return

            const jsonStr = line.slice(5).trim()
            let data
            try {
                data = JSON.parse(jsonStr)
            } catch (error) {
                console.warn('无法解析的 SSE 数据:', jsonStr, error)
                return
            }

            const delta = data.choices?.[0]?.delta || {}
            accumulatedContent += delta.content || ''
            accumulatedReasoning += delta.reasoning_content || ''

            const tokens = data.usage?.completion_tokens
            const elapsed = (Date.now() - startTime) / 1000
            updateCallback(
                accumulatedContent,
                accumulatedReasoning,
                tokens,
                tokens ? tokens / elapsed : 0,
            )
        }

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')

            buffer = lines.pop()
            lines.forEach(processLine)
        }

        if (buffer.trim()) processLine(buffer)
    },

    handleNormalResponse(response, updateCallback) {
        updateCallback(
            response.choices[0].message.content,
            response.choices[0].message.reasoning_content || '',
            response.usage.completion_tokens,
            response.speed,
        )
    },

    async handleResponse(
        response,
        isStream,
        updateCallback
    ) {
        if (isStream) {
            await this.handleStreamResponse(response, updateCallback)
        } else {
            await this.handleNormalResponse(response, updateCallback)
        }
    },
}
