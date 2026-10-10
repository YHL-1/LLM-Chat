import {useState} from 'react'
import {Upload,Input} from 'antd'
import {CloseOutlined,FileTextOutlined} from '@ant-design/icons'
import {useChatStore} from '../../store/modules/chat'
import { messageHandle } from '../../utils/messageHandler'

import fileIcon from "../../assets/images/附件.png"
import imageIcon from "../../assets/images/图片.png"
import sendIcon from "../../assets/images/发送.png"

import './ChatInput.scss'
export default function ChatInput(props){
const addMessage=useChatStore(s=>s.addMessage)
    const send=props.handleSend
    const loading=props.loading

const [inputValue,setInputValue] = useState('')
const [fileList, setFileList] = useState([])

const handleSend = async () => {

    if (!inputValue.trim() || loading) return

    // 发送前从 blob URL 读取文件内容
    const filesWithContent = await Promise.all(fileList.map(async (file) => {
        if (file.content) return file
        try {
            const response = await fetch(file.url)
            const blob = await response.blob()
            const isImage = file.type === 'image'
            const content = await new Promise((resolve) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result)
                if (isImage) {
                    reader.readAsDataURL(blob)
                } else {
                    reader.readAsText(blob)
                }
            })
            return { ...file, content }
        } catch (e) {
            console.error(`读取文件 ${file.name} 时出错:`, e)
            return file
        }
    }))

    addMessage(
            messageHandle.formatMessage('user', inputValue.trim(), '', filesWithContent)
    )

    send()

    setInputValue('')
    setFileList([])
}

const handleNewline = (e) => {
    e.preventDefault()
    setInputValue(inputValue+'\n')
}

const handleFileUpload = (file) => {
    if (!file) return false

    const isImage = file.type.startsWith('image/')
    const newFile = {
        name: file.name,
        url: URL.createObjectURL(file),
        type: isImage ? 'image' : 'file',
        size: file.size,
        content: null,
    }

    setFileList(prev => [...prev, newFile])
    return false
}

const handleFileRemove = (file) => {
    setFileList(prev => {
        const index = prev.findIndex((item) => item.url === file.url)
        if (index !== -1) {
            URL.revokeObjectURL(prev[index].url)
            return prev.filter((_, i) => i !== index)
        }
        return prev
    })
}
    return (<>
    <div className="chat-input-wrapper">
        {/* 文件预览区域 */}
        {fileList && fileList.length > 0 &&
        <div className="preview-area">
            {fileList.map((file)=>(
            <div className="preview-item" key={file.url}>
                {/* 图片预览 */}
                {file.type==='image' && <div className="image-preview">
                    <img src={file.url} alt={file.name} />
                    <div className="remove-btn" onClick={()=>handleFileRemove(file)}>
                        <CloseOutlined />
                    </div>
                </div>}
                {/* 文件预览 */}
                {file.type !== 'image' && (
                    <div className="file-preview">
                        <FileTextOutlined/>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">
                        { (file.size / 1024).toFixed(1) }KB
                    </span>
                    <div className="remove-btn" onClick={()=>handleFileRemove(file)}>
                        <CloseOutlined />
                    </div>
                </div>)}
            </div>
            ))}
        </div>}

        <Input.TextArea
            value={inputValue}
            autoSize={{ minRows: 1, maxRows: 6 }}
            placeholder="输入消息，Enter 发送，Shift + Enter 换行"
            style={{ resize: "none",
                border: 'none',
                boxShadow: 'none'
             }}
             onChange={(e)=>{
                setInputValue(e.target.value)
             }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    if(e.shiftKey){
                        handleNewline(e)
                        return
                    }
                    e.preventDefault()
                    handleSend()
                }
            }}
        />

        <div className="button-group">
            <Upload
                className="upload-btn"
               beforeUpload={handleFileUpload}
                showUploadList={false}
                accept=".pdf,.doc,.docx,.txt"
            >
                <button className="action-btn">
                    <img src={fileIcon} alt="link" />
                </button>
            </Upload>

            <Upload
                className="upload-btn"
                beforeUpload={handleFileUpload}
                showUploadList={false}
                accept="image/*"
            >
                <button className="action-btn">
                    <img src={imageIcon} alt="picture" />
                </button>
            </Upload>

            <div className="divider"></div>

            <button
                className="action-btn send-btn"
                disabled={props.loading}
                onClick={handleSend}
            >
                <img src={sendIcon} alt="send" />
            </button>
        </div>
    </div>
    </>)
}


