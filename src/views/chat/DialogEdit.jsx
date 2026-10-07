  import { useState} from 'react'
import {useChatStore} from '../../store/modules/chat'
import { WarningFilled } from '@ant-design/icons'
import { Modal,Button,Input } from 'antd'
export default function DialogEdit(props) {
const currentChatId = useChatStore(s=>s.currentChatId)
const updateConversationTitle = useChatStore(s=>s.updateConversationTitle)
const removeConversation = useChatStore(s=>s.removeConversation)
const dialogVisible = props.dialogVisible
const closeDialog = props.closeDialog
const dialogType = props.dialogType// 'edit' or 'delete'
const [inputTitle, setInputTitle] = useState('')

const handleConfirm = () => {
    if (dialogType == 'edit') {
        if (!inputTitle.trim()) {
            return
        }
        updateConversationTitle(
            currentChatId,
            inputTitle,
        )
    } else {
        removeConversation(currentChatId)
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
                    type={dialogType === 'edit' ? 'primary' : 'danger'}
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
                maxlength={50}
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



