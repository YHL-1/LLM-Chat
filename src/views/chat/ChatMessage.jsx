
import { useState,useMemo } from 'react'
 import { renderMarkdown } from '../../../src/utils/markdown'
import { DownOutlined, FileTextOutlined } from '@ant-design/icons'
import './ChatMessage.scss'
// 导入图片资源
import copyIcon from '../../assets/images/复制.png'
import successIcon from '../../assets/images/成功.png'
import likeIcon from '../../assets/images/赞.png'
import likeActiveIcon from '../../assets/images/赞2.png'
import dislikeIcon from '../../assets/images/踩.png'
import dislikeActiveIcon from '../../assets/images/踩2.png'
import regenerateIcon from '../../assets/images/重新生成.png'
import thinkingIcon from '../../assets/images/深度思考.png'
import isLoadingIcon from "../../assets/images/加载中.png"

export default function ChatMessage(props){
const message=props.message
const isLastAssistantMessage=props.isLastAssistantMessage
const regenerate=props.regenerate

// 点赞和踩的状态
const [isLiked,setIsLiked] = useState(false)
const [isDisliked,setIsDisliked] = useState(false)

// 添加复制状态
const [isCopied,setIsCopied] = useState(false)

// 添加展开/折叠状态控制
const [isReasoningExpanded,setIsReasoningExpanded]= useState(true)

// 切换展开/折叠状态
const toggleReasoning = () => {
    setIsReasoningExpanded( !isReasoningExpanded )
}

// 处理复制函数
const handleCopy = async () => {
    try {
        await navigator.clipboard.writeText(props.message.content)
        setIsCopied(true)

        // 1.5秒后恢复原始图标
        setTimeout(() => {
            setIsCopied(false)
        }, 2500)
    } catch (err) {
        console.error('复制失败:', err)
    }
}

// 处理点赞
const handleLike = () => {
    if (isDisliked) setIsDisliked(false)
    setIsLiked(!isLiked)
}

// 处理踩
const handleDislike = () => {
    if (isLiked.value) setIsLiked(false)
    setIsDisliked(!isDisliked)
}

// 事件委托：统一处理注入 HTML 中代码块按钮的点击
const handleCodeBlockAction = async (event) => {
    const btn = event.target.closest('[data-action]')
    if (!btn) return
    const codeBlock = btn.closest('.code-block')
    if (!codeBlock) return

    const action = btn.dataset.action

    // 复制代码
    if (action === 'copy') {
        const code = codeBlock.querySelector('code')?.textContent || ''
        try {
            await navigator.clipboard.writeText(code)
            // 短暂切换为成功图标作为反馈
            const img = btn.querySelector('img')
            if (img) {
                const originalSrc = img.src
                img.src = successIcon
                setTimeout(() => {
                    img.src = originalSrc
                }, 1500)
            }
        } catch (err) {
            console.error('复制失败:', err)
        }
    }

    // 切换明暗主题：更新当前代码块，并把偏好写入唯一的 code-theme 键，
    // 后续生成的代码块（含流式重渲染）自动遵循该偏好
    if (action === 'theme') {
        const isDark = codeBlock.classList.toggle('dark-theme')
        try {
            localStorage.setItem('code-theme', isDark ? 'dark' : 'light')
        } catch (err) {
            console.error('主题偏好保存失败:', err)
        }
        const img = btn.querySelector('img')
        if (img) {
            img.src = isDark
                ? img.dataset.lightIcon
                : img.dataset.darkIcon
        }
    }
}

// 将消息内容转换为 HTML
const renderedContent = useMemo(() => {
    return renderMarkdown(props.message.content)
},[props.message.content])

// 添加 reasoning_content 的渲染
const renderedReasoning = useMemo(() => {
    if (!props.message.reasoning_content) return ''
    return renderMarkdown(props.message.reasoning_content)
},[props.message.reasoning_content])
return (<>
     <div className={`message-item ${message.role === 'user' ? 'is-mine':''}`}>
        <div className="content">
           {/*文件预览区域 */}
            {message.files && message.files.length > 0 && <div className="files-container">
                {message.files.map((file)=>(
                <div key={file.url} className="file-item">
                    {/* <!-- 图片预览 --> */}
                    {file.type === 'image' && <div className="image-preview">
                        <img src={file.url} alt="file.name" />
                    </div>}
                    {/* <!-- 文件预览 --> */}
                    {file.type !== 'image' && <div className="file-preview">
                            <FileTextOutlined />
                        <span className="file-name">{ file.name }</span>
                        <span className="file-size">
                            { (file.size / 1024).toFixed(1) }KB
                        </span>
                    </div>}
                </div>))}
            </div>}

            {/* <!-- 消息内容 --> */}
            {message.loading && message.role === 'assistant' && <div className="thinking-text">
                <img src={isLoadingIcon} alt="loading" className="loading-icon" />
                <span>内容生成中...</span>
            </div>}
            {/* <!-- reasoning toggle button --> */}
            {message.reasoning_content && 
            <div className="reasoning-toggle" onClick={toggleReasoning}>
                <img src={thinkingIcon} alt="thinking" />
                <span>深度思考</span>
                <DownOutlined className={`toggle-icon${ isReasoningExpanded?'is-expanded':'' }`}/>
            </div>}
            {/* <!-- reasoning_content --> */}
            {message.reasoning_content && isReasoningExpanded &&<div className="reasoning markdown-body"
                onClick={handleCodeBlockAction}
                dangerouslySetInnerHTML={{__html:renderedReasoning}}></div>}
            {/* <!-- content --> */}
            <div className="bubble markdown-body"
                onClick={handleCodeBlockAction}
                dangerouslySetInnerHTML={{__html:renderedContent}}></div>
            {/* <!-- 只在 AI 助手消息中显示操作按钮和 tokens 信息 --> */}
            {message.role === 'assistant' && message.loading === false && 
            (<div className="message-actions">
                { isLastAssistantMessage && <button className="action-btn" onClick={regenerate} data-tooltip="重新生成">
                    <img src={regenerateIcon} alt="regenerate" />
                </button>}
                <button className="action-btn" onClick={handleCopy} data-tooltip="复制">
                    <img src={isCopied ? successIcon : copyIcon} alt="copy" />
                </button>
                <button className="action-btn" onClick={handleLike} data-tooltip="喜欢">
                    <img src={isLiked ? likeActiveIcon : likeIcon} alt="like" />
                </button>
                <button className="action-btn" onClick={handleDislike} data-tooltip="不喜欢">
                    <img src={isDisliked ? dislikeActiveIcon : dislikeIcon} alt="dislike" />
                </button>

                {/* <!-- 添加 tokens 信息 --> */}
                {message.completion_tokens &&<span className="tokens-info">
                    tokens: { message.completion_tokens }, speed:
                    { message.speed } tokens/s
                </span>}
            </div>)}
        </div>
    </div>
    </>)
}



