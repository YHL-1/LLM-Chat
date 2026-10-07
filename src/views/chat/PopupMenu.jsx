import {useState,useEffect} from 'react'
import {useChatStore} from '../../store/modules/chat'
import './PopupMenu.scss'
import { Button } from 'antd'
import DialogEdit from './DialogEdit'

import popupIcon from '../../assets/images/弹出框.png'
import chatIcon from '../../assets/images/对话.png'
import editIcon from '../../assets/images/编辑.png'
import delIcon from '../../assets/images/删除.png'

export default function PopupMenu() {
const [isVisible, setIsVisible] = useState(false)

const conversations=useChatStore(s=>s.conversations)
const currentChatId=useChatStore(s=>s.currentChatId)
const createConversation = useChatStore(s=>s.createConversation)
const switchConversation = useChatStore(s=>s.switchConversation)

const handleClick = (e) => {
    const wrapper = document.querySelector('.popup-wrapper')
    if (wrapper && wrapper.contains(e.target)) {
        setIsVisible(false)
    }
}

const [dialogVisible, setDialogVisible] = useState(false)
const [dialogType, setDialogType] = useState('edit') // 'edit' or 'delete'

const closeDialog = () => {
    setDialogVisible(false)
}


useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => {
        document.removeEventListener('click', handleClick)
    }
}, [])

const toggle = (e) => {
    e.stopPropagation()
    setIsVisible(!isVisible)
}

const handleNewChat = () => {
    createConversation()
    setIsVisible(false)
}

const handleSwitchChat = (conversationId) => {
    switchConversation(conversationId)
    setIsVisible(false)
}

const formatTitle = (title) => {
    return title.length > 6 ? `${title.slice(0, 4)}...` : title
}

    return (
<>    <div className="popup-wrapper">
        <button className="action-btn" onClick={toggle}>
            <img src={popupIcon} alt="" />
        </button>

            <div className={`popup-menu ${isVisible ? 'show' : ''}`}>
                <div className="menu-section">
                    <Button
                        className="new-chat-btn"
                        icon="Plus"
                        onClick={handleNewChat}
                    >
                        新对话
                    </Button>
                </div>
                <div className="divider"></div>
                <div className="menu-section">
                    <div className="section-title">历史对话</div>
                    <div className="history-list">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                className={`menu-item ${conversation.id===currentChatId ? 'active' : ''}`}
                                onClick={() => handleSwitchChat(conversation.id)}
                            >

                            <div className="item-content">
                                <img src={chatIcon} alt="" />
                                <span title={conversation.title}>
                                    {formatTitle(conversation.title)}
                                </span>
                            </div>
                            <div className="item-actions">
                                <button
                                    className="action-btn"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setDialogVisible(true)
                                        setDialogType('edit')
                                    }}
                                >
                                    <img
                                        src={editIcon}
                                        alt="edit"
                                    />
                                </button>
                                <button
                                    className="action-btn"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setDialogVisible(true)
                                        setDialogType('delete')
                                    }}
                                >
                                    <img
                                        src={delIcon}
                                        alt="delete"
                                    />
                                </button>
                            </div>
                           </div>
                        ))}  
                    </div>
                </div>
            </div>

        <DialogEdit dialogVisible={dialogVisible} closeDialog={closeDialog} dialogType={dialogType}/> 
    </div>
    </>
    )
}




