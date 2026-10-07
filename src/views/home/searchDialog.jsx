import './searchDialog.scss'
import ChatMessage from '../chat/ChatMessage.jsx'
import {useState} from 'react'
import enterIcon from '../../assets/images/回车.png'

import {useSettingStore} from '../../store/modules/setting.js'
import createChatCompletion from '../../utils/api.js'
import {messageHandle} from '../../utils/messageHandler.js'
export default function SearchDialog() {
const settingsStore = useSettingStore(s=>s.settings)
const [searchText, setSearchText] = useState('')
const [messages, setMessages] = useState([])
const [isLoading, setIsLoading] = useState(false)

const aiMessage = 'Hi, 我是你的AI小助手，有什么问题都可以问我！'

const suggestedPrompts = [
    '如何快速上手Vue3框架',
    '入职字节跳动难吗？',
    '前端如何实现弹性布局',
    '喝酒脸红是会喝酒的表现吗？',
]

const handleSend = async () => {
  try {
    const newMessages=[...messages,messageHandle.formatMessage('user',searchText),messageHandle.formatMessage('assistant','','')]
    setMessages(newMessages)
    setIsLoading(true)

        const lastMessage=messages[messages.length-1]
        if(lastMessage)
        setIsLoading(true)

        const requestMessages=newMessages?.map(({role,content})=>({role,content}))
        console.log(requestMessages)
        
        const response=await createChatCompletion(requestMessages,settingsStore)

        await messageHandle.handleResponse(
            response,
            true,
            (content,reasoning_content,tokens,speed)=>{
                setMessages([...newMessages,messageHandle.formatMessage('assistant',content,reasoning_content,tokens,speed)])
            }
        )
    }catch(e){
        console.error('Failed to send message:', e)
        setMessages([...messages,messageHandle.formatMessage('assistant','抱歉，发生了一些错误，请稍后重试。')])
    }finally{
        setIsLoading(false)
    }
}
const handleRegenerate=async()=>{
  try{
        const lastUserMessage=messages[messages?.length-2]
        setMessages(messages.slice(0,-2))
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
                    onClick={handleSend}
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

