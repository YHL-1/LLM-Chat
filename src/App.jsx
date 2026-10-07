import { useEffect,useState,useMemo} from 'react'
import {useSettingStore,modelOptions} from "../../store/modules/setting";
import {shallow} from 'zustand/shallow'
import './SettingsPanel.scss'
import { QuestionCircleFilled } from '@ant-design/icons';
import { Drawer, Select, Switch, Input, Slider, InputNumber, Tooltip } from 'antd';

export default function SettingsPanel() {
const { settings, setSettings, updateSetting } = useSettingStore(
  (s) => ({
    settings: s.settings,
    setSettings: s.setSettings,
    updateSetting: s.updateSetting
  }),
  shallow
)

//控制抽屉展示
const [visible,setVisible] = useState(true)

//计算当前选中模型的最大tokens
const currentMaxTokens = useMemo(() => {
    const selectedModel = modelOptions.find(
        (item) => item.value == settings.model,
    )
    return selectedModel ? selectedModel.maxTokens : 4096
}, [settings.model])

//监听模型变化
useEffect(() => {
    const selectedModel = modelOptions.find(item => item.value === settings.model)
    if(selectedModel) {
      const newVal = Math.min(settings.maxTokens, selectedModel.maxTokens)
      updateSetting({key: 'maxTokens', value: newVal})
    }
  }, [settings.model])

// 打开抽屉
function openDrawer() {
    setVisible(true)
}

  return (
    <Drawer open={visible} title="设置" placement="right" width={350} onClose={() => setVisible(false)}>
        <div className="setting-container">
            {/* 模型选择*/}
            <div className="setting-item">
                <div className="setting-label">Model</div>
                <Select
                    value={settings.model}
                    onChange={(value) => setSettings(value)}
                    className="model-select"
                    placeholder="选择模型"
                    options={modelOptions.map((option) => ({
                        label: option.label,
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
                    <Switch onChange={(checked) => updateSetting({key: 'stream', value: checked})} />
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
                <Input
                    value={settings.apiKey}
                    onChange={(e) => updateSetting({key: 'apiKey', value: e.target.value})}
                    type="password"
                    placeholder="请输入 API Key"
                    show-password
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
                        onChange={(value) => updateSetting({key: 'maxTokens', value})}
                        min={1}
                        max={currentMaxTokens}
                        step={1}
                        tooltip={{open:false}}
                        className="setting-slider"
                    />
                    <InputNumber
                        value={settings.maxTokens}
                        onChange={(value) => updateSetting({key: 'maxTokens', value})}
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
                        onChange={(value) => updateSetting({key: 'temperature', value})}
                        min={0}
                        max={2}
                        step={0.1}
                        tooltip={{open:false}}
                        className="setting-slider"
                    />
                    <InputNumber
                        value={settings.temperature}
                        onChange={(value) => updateSetting({key: 'temperature', value})}
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
                        onChange={(value) => updateSetting({key: 'topP', value})}
                        min={0}
                        max={1}
                        step={0.1}
                        tooltip={{open:false}}
                        className="setting-slider"
                    />
                    <InputNumber
                        value={settings.topP}
                        onChange={(value) => updateSetting({key: 'topP', value})}
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
                        onChange={(value) => updateSetting({key: 'topK', value})}
                        min={1}
                        max={100}
                        step={1}
                        tooltip={{open:false}}
                        className="setting-slider"
                    />
                    <InputNumber
                        value={settings.topK}
                        onChange={(value) => updateSetting({key: 'topK', value})}
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
