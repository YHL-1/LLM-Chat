import './searchDialog.scss'
import ChatMessage from '../chat/ChatMessage.jsx'
import {useState, useRef} from 'react'
import enterIcon from '../../assets/images/回车.png'

import {useSettingStore} from '../../store/modules/setting.js'
import createChatCompletion from '../../utils/api.js'
import {messageHandle} from '../../utils/messageHandler.js'
export default function SearchDialog() {
const settingsStore = useSettingStore(s=>s.settings)
const [searchText, setSearchText] = useState('')
const [messages, setMessages] = useState([])
const [isLoading, setIsLoading] = useState(false)
const inputRef = useRef(null)

const aiMessage = 'Hi, 我是你的AI小助手，有什么问题都可以问我！'

const suggestedPrompts = [
    '如何快速上手Vue3框架',
    '入职字节跳动难吗？',
    '前端如何实现弹性布局',
    '喝酒脸红是会喝酒的表现吗？',
]

const handleSend = async (messageContent) => {
  try {
    const hasContent = messageContent && typeof messageContent === 'object' && 'text' in messageContent
    const text = hasContent ? messageContent.text : (inputRef.current?.value || searchText)
    const files = hasContent ? (messageContent.files || []) : []

    const userMessage = messageHandle.formatMessage('user', text, '', files)
    const assistantPlaceholder = {...messageHandle.formatMessage('assistant', '', ''), loading: true}
    const newMessages = [...messages, userMessage, assistantPlaceholder]
    setMessages(newMessages)
    setIsLoading(true)
    setSearchText('')

        const requestMessages = newMessages
            .filter(m => m.content || (m.files && m.files.length > 0))
            .map((msg) => {
                if (!msg.files || msg.files.length === 0) {
                    return { role: msg.role, content: msg.content }
                }
                const content = []
                if (msg.content) {
                    content.push({ type: 'text', text: msg.content })
                }
                for (const file of msg.files) {
                    if (file.type === 'image' && file.content) {
                        content.push({ type: 'image_url', image_url: { url: file.content } })
                    } else if (file.content) {
                        content.push({ type: 'text', text: `文件 ${file.name} 的内容:\n${file.content}` })
                    } else {
                        content.push({ type: 'text', text: `文件 ${file.name}（二进制格式，无法读取内容）` })
                    }
                }
                return { role: msg.role, content }
            })

        const response=await createChatCompletion(requestMessages,settingsStore)

        await messageHandle.handleResponse(
            response,
            settingsStore.stream,
            (content,reasoning_content,tokens,speed)=>{
                setMessages([...newMessages.slice(0, -1), messageHandle.formatMessage('assistant',content,reasoning_content,[],tokens,speed)])
            }
        )
    }catch(e){
        console.error('Failed to send message:', e)
        setMessages([...newMessages.slice(0, -1), messageHandle.formatMessage('assistant','抱歉，发生了一些错误，请稍后重试。')])
    }finally{
        setIsLoading(false)
    }
}
const handleRegenerate=async()=>{
  try{
        const lastUserMessage=messages[messages.length-2]
        const newMessages=messages.slice(0,-2)
        setMessages(newMessages)
        await handleSend({text:lastUserMessage.content,files:lastUserMessage.files})
    }catch(e){
        console.error('Failed to regenerate message',e)
    }
}

return (<>
    <div className="search-dialog">
        <div className="search-header">
            <div className="search-input">
                <input
                    ref={inputRef}
                    type="text"
                    value={searchText}
                    placeholder="提问"
                    autoFocus
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isLoading) {
                            handleSend()
                        }
                    }}
                />
                <button
                    className="action-btn"
                    onClick={() => handleSend()}
                    disabled={isLoading}
                >
                    <img src={enterIcon} alt="enter" />
                </button>
            </div>
        </div>

        <div className="dialog-content">
            {messages.length === 0 && <>
                <div className="initial-message">
                    { aiMessage }
                </div>

                <div className="suggested-prompts">
                    <div className="prompt-title">建议提示词</div>
                    <div className="prompt-list">
                        { suggestedPrompts.map((prompt) => (
                            <button
                                key={prompt}
                            className="prompt-item"
                            onClick={() => setSearchText(prompt)}
                        >
                            { prompt }
                        </button>
                        ))}
                    </div>
                </div>
            </>}
            {messages.length > 0 && <>
                { messages.map((message, index) => (
                    <ChatMessage
                        key={message.id}
                    message={message}
                    isLastAssistantMessage={
                        index === messages.length - 1 &&
                        message.role === 'assistant'
                    }
                    onRegenerate={handleRegenerate}
                />
                ))}
            </>}
        </div>
    </div>
</>
)}

