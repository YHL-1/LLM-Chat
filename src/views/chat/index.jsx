import ChatInput from '../chat/ChatInput'
import ChatMessage from './ChatMessage'
import SettingsPanel from '../chat/SettingsPanel'
import PopupMenu from '../chat/PopupMenu'
import DialogEdit from '../chat/DialogEdit'
import {useChatStore} from '../../store/modules/chat'
import { messageHandle } from '../../utils/messageHandler'
import  createChatCompletion  from '../../utils/api'
import {useState,useRef,useEffect} from 'react'
import { useSettingStore, modelOptions } from '../../store/modules/setting'
import { useNavigate } from 'react-router-dom'
import {Button,Tooltip } from 'antd'
import './index.scss'

import settingIcon from "../../assets/images/设置.png"
import backIcon from "../../assets/images/返回.png"
import chatIcon from "../../assets/images/对话.png"
import editIcon from "../../assets/images/编辑.png"



export default function Chat (){
const currentChatId = useChatStore(s=>s.currentChatId)
const conversations=useChatStore(s=>s.conversations)
const addMessage=useChatStore(s=>s.addMessage)
const removeLastMessages=useChatStore(s=>s.removeLastMessages)
const loading=useChatStore(s=>s.isLoading)
const setLoading = useChatStore(s => s.setLoading)
const settingsStore = useSettingStore(s=>s.settings)
const createConversation=useChatStore(s=>s.createConversation)
const updateLastMessage=useChatStore(s=>s.updateLastMessage)

const currentConversation=conversations.find((item)=> item.id==currentChatId)
const currentMessages=currentConversation?.messages || []

const currentTitle=currentConversation?.title || 'LLM Chat'

const [settingVisible,setSettingVisible]=useState(false)
const closeSetting=function () {
  setSettingVisible(false)
}
const [dialogVisible, setDialogVisible] = useState(false)
const [dialogType, setDialogType] = useState('edit') // 'edit' or 'delete'
const closeDialog = () => {
    setDialogVisible(false)
}
const messagesContainer = useRef(null)

useEffect(
    () => {
        const dom=messagesContainer.current
        if(!dom) return
        dom.scrollTop=dom.scrollHeight
    },
    [currentMessages]
)

useEffect(() => {
    const dom=messagesContainer.current
      if(!dom) return
      dom.scrollTop=dom.scrollHeight
    if (!conversations?.length) {
      createConversation()
    }
},[])


const handleSend = async (messageContent) => {
  try {
        if (messageContent) {
            addMessage(messageHandle.formatMessage('user', messageContent.text, '', messageContent.files))
        }

        addMessage({...messageHandle.formatMessage('assistant','',''), loading: true})

        setLoading(true)

        const { conversations, currentChatId } = useChatStore.getState()
        const currentConv = conversations.find(c => c.id == currentChatId)
        const currentMessages = currentConv?.messages || []

        const messages=currentMessages?.map((msg)=>{
            // 无文件的消息直接返回文本内容
            if (!msg.files || msg.files.length === 0) {
                return { role: msg.role, content: msg.content }
            }
            // 有文件的消息构建多模态 content
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

        const hasImages = messages.some(msg =>
            Array.isArray(msg.content) && msg.content.some(c => c.type === 'image_url')
        )
        const modelConfig = modelOptions.find(m => m.value === settingsStore.model)
        if (hasImages && !modelConfig?.vision) {
            updateLastMessage('对话中存在图片，当前模型不支持图片识别，请切换到支持视觉的模型（如 Qwen3-VL-8B-Instruct）后重试。')
            return
        }

        const response=await createChatCompletion(messages,settingsStore)

        await messageHandle.handleResponse(
            response,
            settingsStore.stream,
            (content,reasoning_content,tokens,speed)=>{
                updateLastMessage(content,reasoning_content,tokens,speed)
            }
        )
    }catch(e){
        console.error('Failed to send message:', e)
        updateLastMessage('抱歉，发生了一些错误，请稍后重试。')
    }finally{
        setLoading(false)
    }
}
const handleRegenerate=async()=>{
  try{
        const lastUserMessage=currentMessages[currentMessages.length-2]
        removeLastMessages(2)
        await handleSend({text:lastUserMessage.content,files:lastUserMessage.files})
    }catch(e){
        console.error('Failed to regenerate message',e)
    }
}
const handleNewChat=()=>{
    createConversation()
}
const formatTitle=(title)=>{
    // ✅兜底，title为undefined不会调用title.length
    if(!title) return 'LLM Chat'
    return title.length>4? title.slice(0, 4) + '...' : title
}
const navigate=useNavigate()
const handleBack=async()=>{
    navigate('/')
}
  return (
  <>
    <div className="chat-container">
        <div className="chat-header">
            <div className="header-left">
                {/* React ref不能写字符串 ref="popupMenu" */}
                <PopupMenu />
                <Button className="new-chat-btn" icon="Plus" onClick={handleNewChat}>
                    新对话
                </Button>
                <div className="divider"></div>
                <div className="title-wrapper">
                    <h1 className="chat-title">{ formatTitle(currentTitle) }</h1>
                    <button className="edit-btn" onClick={
                        (e)=>{
                          e.stopPropagation()
                          setDialogVisible(true)
                          setDialogType('edit')
                        }
                      }>
                        <img src={editIcon} alt="edit" />
                    </button>
                </div>
            </div>
            <div className="header-right">
                <Tooltip title="设置" placement="top">
                    <button className="action-btn" onClick={()=>{setSettingVisible(true)}}>
                        <img src={settingIcon} alt="settings" />
                    </button>
                </Tooltip>
                <Tooltip title="回到首页" placement="top">
                    <button className="action-btn" onClick={handleBack}>
                        <img src={backIcon} alt="back" />
                    </button>
                </Tooltip>
            </div>
        </div>
         {/* 消息容器，显示对话消息  */}
        <div className="messages-container" ref={messagesContainer}>
             {currentMessages.length > 0 && currentMessages.map((message,index)=>(
              <ChatMessage key={message.id}
                    message={message}
                    isLastAssistantMessage={index === currentMessages.length - 1 && message.role === 'assistant'}
                    regenerate={handleRegenerate} />
            ))} 
            {currentMessages.length===0 && (
             <div className="empty-state">
                <div className="empty-content">
                    <img src={chatIcon} alt="chat" className="empty-icon" />
                    <h2>开始对话吧</h2>
                    <p>有什么想和我聊的吗？</p>
                </div>
              </div>)}
        </div>
         {/* 聊天输入框  */}
        <div className="chat-input-container">
            <ChatInput handleSend={handleSend} loading={loading}/>
        </div>
         {/* 设置面板  */}
        <SettingsPanel settingVisible={settingVisible} closeSetting={closeSetting} />
         {/* 添加对话框组件  */}
        <DialogEdit dialogVisible={dialogVisible} dialogType={dialogType} closeDialog={closeDialog}/>
    </div>
  </>)
}
