  import { useState, useEffect } from 'react'
import {useChatStore} from '../../store/modules/chat'
import { WarningFilled } from '@ant-design/icons'
import { Modal,Button,Input } from 'antd'
export default function DialogEdit(props) {
const currentChatId = useChatStore(s=>s.currentChatId)
const conversations = useChatStore(s=>s.conversations)
const updateConversationTitle = useChatStore(s=>s.updateConversationTitle)
const removeConversation = useChatStore(s=>s.removeConversation)
const dialogVisible = props.dialogVisible
const closeDialog = props.closeDialog
const dialogType = props.dialogType // 'edit' or 'delete'
const targetId = props.targetId
const editTargetId = targetId || currentChatId
const [inputTitle, setInputTitle] = useState('')

// 对话框打开时预填充当前对话标题
useEffect(() => {
    if (dialogVisible && dialogType === 'edit') {
        const currentConv = conversations.find(c => c.id == editTargetId)
        setInputTitle(currentConv?.title || '')
    }
}, [dialogVisible, dialogType, editTargetId, conversations])

const handleConfirm = () => {
    if (dialogType == 'edit') {
        if (!inputTitle.trim()) {
            return
        }
        updateConversationTitle(
            editTargetId,
            inputTitle,
        )
    } else {
        removeConversation(editTargetId)
    }
    closeDialog()
    setInputTitle('')
}

const handleCancel = () => {
    closeDialog()
    setInputTitle('')
}

  return (
    <Modal
        open={dialogVisible}
        title={dialogType === 'edit' ? '编辑对话名称' : '确定删除对话?'}
        width="30%"
        maskClosable={false}
        closable={false}
        keyboard={false}
        footer={(
          <span className="dialog-footer">
                <Button onClick={handleCancel}>取消</Button>
                <Button
                    type="primary"
                    danger={dialogType === 'delete'}
                    onClick={handleConfirm}
                >
                    { dialogType === 'edit' ? '确定' : '删除' }
                </Button>
            </span>
        )}
    >
        {/* 编辑模式显示输入框 */}
        {dialogType === 'edit' && <Input
                value={inputTitle}
                placeholder="请输入对话名称"
                maxLength={50}
                onChange={(e) => setInputTitle(e.target.value)}
            />}
        {/* 删除模式显示警告文本 */}
        {dialogType === 'delete' &&
            <div className="delete-warning">
                <WarningFilled />
                <span>删除后，聊天记录将不可恢复。</span>
            </div>}
    </Modal>
  )
}



