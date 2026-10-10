import {SearchOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import githubIcon from '../../assets/images/github.png'
import './index.scss'
import SearchDialog from './searchDialog.jsx'

export default function Home() {
  const [showSearchDialog, setShowSearchDialog] = useState(false)

  const handleSearchClick = () => {
    setShowSearchDialog(true)
  }

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('search-dialog-overlay')) {
      setShowSearchDialog(false)
    }
  }

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      setShowSearchDialog(false)
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      setShowSearchDialog(true)
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-left">
          <span className="logo-text">LLM Chat</span>
        </div>
        <div className="header-right">
          <div className="search-container" onClick={handleSearchClick}>
            <div className="search-input">
              <SearchOutlined className="search-icon" />
              <input
                type="text"
                placeholder="搜索"
                readOnly
              />
              <div className="shortcut-key">⌘ K</div>
            </div>
          </div>
          <a
            href="https://github.com/YHL-1/LLM-Chat"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            <img
              src={githubIcon}
              alt="GitHub"
              className="github-icon"
            />
          </a>
        </div>
      </header>

      <main className="main-content">
        <div className="hero-section">
          <h1 className="title">欢迎使用 LLM Chat</h1>
          <p className="description">
            一个强大的 AI 聊天助手，基于大语言模型，为您提供智能对话体验
          </p>
          <div className="features">
            <div className="feature-item">
              <SearchOutlined className="feature-icon" />
              <h3>智能对话</h3>
              <p>自然流畅的对话体验，理解上下文</p>
            </div>
            <div className="feature-item">
              <FileTextOutlined className="feature-icon" />
              <h3>文件支持</h3>
              <p>支持多种格式文件上传，增强信息输入</p>
              <p className="note">
                支持文本文件内容读取和图片多模态识别
              </p>
            </div>
            <div className="feature-item">
              <SettingOutlined className="feature-icon" />
              <h3>个性化设置</h3>
              <p>可自定义的对话参数，满足不同场景需求</p>
              <p className="note" style={{ color: '#3f7af1' }}>
                支持 deepseek_r1 模型
              </p>
            </div>
          </div>

          <Link to="/chat" className="start-button">
            <span className="mirror-text">开始对话</span>
            <div className="liquid"></div>
          </Link>
        </div>
      </main>

      {showSearchDialog && (
        <div
          className="search-dialog-overlay"
          onClick={handleOverlayClick}
        >
          <div
            className="search-dialog-container"
            onClick={(e) => e.stopPropagation()}
          >
            <SearchDialog />
          </div>
        </div>
      )}
    </div>
  )
}
