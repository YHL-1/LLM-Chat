const API_BASE_URL = 'https://api.siliconflow.cn/v1'

const createChatCompletion = async (messages,settings) => {
    const payload = {
        model: settings.model,
        messages: messages ,
        stream:settings.stream,
        max_tokens: settings.maxTokens,
        temperature: settings.temperature,
        top_p: settings.topP,
        top_k: settings.topK,
    }

    const options = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }

    try {
        const startTime = Date.now()
        const response = await fetch(`${API_BASE_URL}/chat/completions`, options)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        if (payload.stream) {
            return response
        } else {
            const data = await response.json()
            const duration = (Date.now() - startTime) / 1000
            data.speed = (data.usage.completion_tokens / duration).toFixed(2)
            return data
        }
    } catch (e) {
        console.error('chat API Error', e)
        throw e
    }
}

export default createChatCompletion
