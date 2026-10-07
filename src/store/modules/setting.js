import {create} from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingStore = create(persist((set) => ({
  settings: {
            model: 'deepseek-ai/DeepSeek-R1',
            apiKey: 'sk-fwfbzyvsducdytuludbkhwozxssbcgmpylhlvtsmsgfnaprr',
            stream: true,
            maxTokens: 4096,
            temperature: 0.7,
            topP: 0.7,
            topK: 50,
        },

    updateSetting: (key, value) => set((state) => ({
        settings: {
            ...state.settings,
            [key]: value,
        },
    }))
    }),{
        name: 'setting-storage', // 存储的名称
        partialize: (state) => ({ settings: state.settings }), // 只存储 settings 部分
    }
)
)

export const modelOptions = [
    {
        label: 'DeepSeek-R1',
        value: 'deepseek-ai/DeepSeek-R1',
        maxTokens: 16384,
    },
    {
        label: 'DeepSeek-V3',
        value: 'deepseek-ai/DeepSeek-V3',
        maxTokens: 4096,
    },
    {
        label: 'DeepSeek-V2.5',
        value: 'deepseek-ai/DeepSeek-V2.5',
        maxTokens: 4096,
    },
    {
        label: 'Qwen2.5-72B-Instruct-128K',
        value: 'Qwen/Qwen2.5-72B-Instruct-128K',
        maxTokens: 4096,
    },
    {
        label: 'QwQ-32B-Preview',
        value: 'Qwen/QwQ-32B-Preview',
        maxTokens: 8192,
    },
    {
        label: 'glm-4-9b-chat',
        value: 'THUDM/glm-4-9b-chat',
        maxTokens: 4096,
    },
    {
        label: 'glm-4-9b-chat(Pro)',
        value: 'Pro/THUDM/glm-4-9b-chat',
        maxTokens: 4096,
    },
    {
        label: 'Qwen2.5-7B-Instruct',
        value: 'Qwen/Qwen2.5-7B-Instruct',
        maxTokens: 4096,
    }
]
