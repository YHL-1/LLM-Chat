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

const [inputValue,setInputValue] = useState('')
const [fileList, setFileList] = useState([])

const loading=false

const handleSend = () => {
    
    if (!inputValue.trim() || loading) return

    const messageContent = {
        text: inputValue.trim(),
        files: fileList,
    }

    addMessage(
            messageHandle.formatMessage('user',messageContent.text,'',messageContent.files)
    )

    send()

    setInputValue('')
    setFileList([])
}

const handleNewline = (e) => {
    e.preventDefault()
    setInputValue(inputValue+'\n')
}

const handleFileUpload = (uploadFile) => {
    const file = uploadFile.raw
    if (!file) return false

    fileList.push({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'file',
        size: file.size,
    })
    return false
}

const handleFileRemove = (file) => {
    if (fileList) {
        const index = fileList.findIndex((item) => item.url == file.url)
        if (index !== -1) {
            URL.revokeObjectURL(fileList[index].url)
            fileList.splice(index, 1)
        }
    }
}
    return (<>
    <div className="chat-input-wrapper">
        {/* 文件预览区域 */}
        {fileList && fileList.length > 0 && 
        <div className="preview-area">
            {fileList.map((file)=>(
            <div className="preview-item">
                {/* 图片预览 */}
                {file.type==='img' && <div className="image-preview">
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

        <Input
            value={inputValue}
            type="textarea"
            autosize={{ minRows: 1, maxRows: 6 }}
            placeholder="输入消息，Enter 发送，Shift + Enter 换行"
            style={{ resize: "none",
                border: 'none',       // 去掉边框
    boxShadow: 'none'
             }}
             onChange={(e)=>{
                setInputValue(e.target.value)
             }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    if(e.shiftKey){
                        handleNewline()
                    }
                    handleSend()
                }
            }}
        />

        <div className="button-group">
            <Upload
                className="upload-btn"
               beforeUpload={()=>false}
                showUploadList={[]}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
            >
                <button className="action-btn">
                    <img src={fileIcon} alt="link" />
                </button>
            </Upload>

            <Upload
                className="upload-btn"
                beforeUpload={()=>false}
                showUploadList={[]}
                onChange={handleFileUpload}
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


