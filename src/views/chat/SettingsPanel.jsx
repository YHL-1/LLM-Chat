import { useEffect,useMemo} from 'react'
import {useSettingStore,modelOptions} from "../../store/modules/setting";
import './SettingsPanel.scss'
import { QuestionCircleFilled } from '@ant-design/icons';
import { Drawer, Select, Switch, Input, Slider, InputNumber, Tooltip, message } from 'antd';
import { useChatStore } from '../../store/modules/chat';

export default function SettingsPanel(props) {
//控制抽屉展示
const visible=props.settingVisible
const closeSetting=props.closeSetting

const settings = useSettingStore(s => s.settings)
const updateSetting = useSettingStore(s => s.updateSetting)

// //计算当前选中模型的最大tokens
const currentMaxTokens = useMemo(() => {
    const selectedModel = modelOptions.find(
        (item) => item.value == settings.model,
    )
    return selectedModel ? selectedModel.maxTokens : 4096
}, [settings.model])

//监听模型变化
useEffect(() => {
    console.log('settings.model changed:', settings.model)
    const selectedModel = modelOptions.find(item => item.value === settings.model)
    if(selectedModel) {
      updateSetting('maxTokens', Math.min(settings.maxTokens, selectedModel.maxTokens))
      updateSetting('model', settings.model)
    }
  }, [settings.model])

  return (
    <Drawer open={visible} title="设置" placement="right" size={350} onClose={() => closeSetting()}>
        <div className="setting-container">
            {/* 模型选择*/}
            <div className="setting-item">
                <div className="setting-label">Model</div>
                <Select
                    value={settings.model}
                    onChange={(value) => {
                        updateSetting('model', value)
                        const { conversations, currentChatId } = useChatStore.getState()
                        const currentConv = conversations.find(c => c.id == currentChatId)
                        const hasImages = currentConv?.messages?.some(msg =>
                            msg.files?.some(f => f.type === 'image')
                        )
                        const newModel = modelOptions.find(m => m.value === value)
                        if (hasImages && !newModel?.vision) {
                            message.warning('当前对话包含图片，该模型不支持图片识别，发送时将报错。请切换到支持视觉的模型。')
                        }
                    }}
                    className="model-select"
                    placeholder="选择模型"
                    options={modelOptions.map((option) => ({
                        label: (
                            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{option.label}</span>
                                {option.free && <span style={{ fontSize: '12px', color: '#52c41a', fontWeight: 500 }}>免费</span>}
                            </span>
                        ),
                        value: option.value,
                    }))}
                >
                </Select>
            </div>

            {/* 流式响应开关 */}
            <div className="setting-item">
                <div className="setting-label-row">
                    <div className="label-with-tooltip">
                        <span>流式响应</span>
                        <Tooltip
                            title="开启后将流式响应 AI 的回复"
                            placement="top"
                        >
                            <QuestionCircleFilled />
                        </Tooltip>
                    </div>
                    <Switch checked={settings.stream} onChange={(checked) => updateSetting('stream', checked)} />
                </div>
            </div>

            {/* API Key */}
            <div className="setting-item">
                <div className="setting-label-row">
                    <div className="label-with-tooltip">
                        <span>API Key</span>
                        <Tooltip title="设置 API Key" placement="top">
                            <QuestionCircleFilled />
                        </Tooltip>
                    </div>

                    <a
                        href="https://cloud.siliconflow.cn/account/ak"
                        target="_blank"
                        className="get-key-link"
                    >
                        获取 API Key
                    </a>
                </div>
                <Input.Password
                    value={settings.apiKey}
                    onChange={(e) => updateSetting('apiKey', e.target.value)}
                    placeholder="请输入 API Key"
                />
            </div>

            {/* Max Tokens */}
            <div className="setting-item">
                <div className="setting-label">
                    Max Tokens
                    <Tooltip title="生成文本的最大长度" placement="top">
                        <QuestionCircleFilled />
                    </Tooltip>
                </div>
                <div className="setting-control">
                    <Slider
                        value={settings.maxTokens}
                        onChange={(value) => updateSetting('maxTokens', value)}
                        min={1}
                        max={currentMaxTokens}
                        step={1}
                        tooltip={{open:false}}
                        className="setting-slider"
                    />
                    <InputNumber
                        value={settings.maxTokens}
                        onChange={(value) => updateSetting('maxTokens', value)}
                        min={1}
                        max={currentMaxTokens}
                        step={1}
                        style={{width: 120,marginLeft: 12}}
                    />
                </div>
            </div>

            {/* Temperature */}
            <div className="setting-item">
                <div className="setting-label">
                    Temperature
                    <Tooltip title="值越高，回答越随机" placement="top">
                        <QuestionCircleFilled />
                    </Tooltip>
                </div>
                <div className="setting-control">
                    <Slider
                        value={settings.temperature}
                        onChange={(value) => updateSetting('temperature', value)}
                        min={0}
                        max={2}
                        step={0.1}
                        tooltip={{open:false}}
                        className="setting-slider"
                    />
                    <InputNumber
                        value={settings.temperature}
                        onChange={(value) => updateSetting('temperature', value)}
                        min={0}
                        max={2}
                        step={0.1}
                        controls-position="right"
                    />
                </div>
            </div>

            {/* Top-P */}
            <div className="setting-item">
                <div className="setting-label">
                    Top-P
                    <Tooltip title="核采样阈值" placement="top">
                        <QuestionCircleFilled />
                    </Tooltip>
                </div>
                <div className="setting-control">
                    <Slider
                        value={settings.topP}
                        onChange={(value) => updateSetting('topP', value)}
                        min={0}
                        max={1}
                        step={0.1}
                        tooltip={{open:false}}
                        className="setting-slider"
                    />
                    <InputNumber
                        value={settings.topP}
                        onChange={(value) => updateSetting('topP', value)}
                        min={0}
                        max={1}
                        step={0.1}
                        controls-position="right"
                    />
                </div>
            </div>

            {/* Top-K */}
            <div className="setting-item">
                <div className="setting-label">
                    Top-K
                    <Tooltip title="保留概率最高的 K 个词" placement="top">
                        <QuestionCircleFilled />
                    </Tooltip>
                </div>
                <div className="setting-control">
                    <Slider
                        value={settings.topK}
                        onChange={(value) => updateSetting('topK', value)}
                        min={1}
                        max={100}
                        step={1}
                        tooltip={{open:false}}
                        className="setting-slider"
                    />
                    <InputNumber
                        value={settings.topK}
                        onChange={(value) => updateSetting('topK', value)}
                        min={1}
                        max={100}
                        step={1}
                        controls-position="right"
                    />
                </div>
            </div>
        </div>
    </Drawer>
  )
}