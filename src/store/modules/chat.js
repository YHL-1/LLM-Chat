import {create} from 'zustand'
import { persist } from 'zustand/middleware'

export const useChatStore=create(persist((set)=>({
    conversations: [
        {
            id: 1,
            title: 'Chat 1',
            messages: [],
            createDate: new Date(),
        },
        {
            id: 2,
            title: 'Chat 2',
            messages: [],
            createDate: new Date(),
        }
    ],

    currentChatId: 1,
    isLoading: false,


    setLoading: (isLo)=>set(()=>{return {isLoading: isLo}}),

    clearConversations: ()=>set(()=>{return {conversations: [{
            id: '1790309488509',
            title: 'New Chat',
            messages: [],
            createDate: new Date(),
        }],
    currentChatId:1790309488509}
    }),

    createConversation: ()=>set((state)=>{
        const newConversation={
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [],
            createDate: new Date(),
        }
        return {
            conversations: [newConversation, ...state.conversations],
            currentChatId: newConversation.id,
        }
    }),

    switchConversation: (conversationId)=>set(()=>{
        return {
            currentChatId: conversationId,
        }
    }),

    updateConversationTitle: (conversationId, newTitle)=>set((state)=>{
        const updatedConversations=state.conversations.map((conversation)=>{
            if(conversation.id==conversationId&&newTitle.trim()){
                return {
                    ...conversation,
                    title: newTitle,
                }
            }
            return conversation
        })

        return {
            conversations: updatedConversations
        }
    }),

    //添加消息到当前对话
    addMessage: (message)=>set((state) => {
        const newConversations=state.conversations.map((item)=>{
            if(item.id==state.currentChatId){
                return {...item,
                    messages: [...item.messages,{
                        ...message,
                        id:Date.now(),
                        timestamp: new Date().toISOString()}
                    ]
                }}
            return item
            })
            return {conversations: newConversations}
            }
        ),

    // 从当前对话移除最后 count 条消息
    removeLastMessages: (count)=>set((state)=>{
        const newConversations=state.conversations.map((item)=>{
            if(item.id==state.currentChatId){
                return {
                    ...item,
                    messages: item.messages.slice(0, Math.max(0, item.messages.length - count))
                }
            }
            return item
        })
        return {conversations: newConversations}
    }),

    removeConversation: (conversationId)=>set((state)=>{
        const updatedConversations=state.conversations.filter((conversation)=>conversation.id!=conversationId)
        let newCurrentChatId=state.currentChatId
        if(updatedConversations.length===0){
            const newConversation={
                id: Date.now().toString(),
                title: 'New Chat',
                messages: [],
                createDate: new Date(),
            }
            return {
                conversations: [newConversation],
                currentChatId: newConversation.id
            }
        }else if(state.currentChatId==conversationId){
            newCurrentChatId=updatedConversations[0].id
        }
        return {
            conversations: updatedConversations,
            currentChatId: newCurrentChatId
        }
    }),

    updateLastMessage : (
            content,
            reasoning_content,
            completion_tokens,
            speed
        ) => set((state)=>{
        const newConversations=state.conversations.map((item)=>{
            if(item.id==state.currentChatId){
                const msgs = [...item.messages]
                const lastIndex = msgs.length -1
                if(lastIndex < 0) return item
                const lastMsg = {...msgs[lastIndex]}
                lastMsg.content = content
                lastMsg.reasoning_content = reasoning_content
                lastMsg.completion_tokens = completion_tokens
                lastMsg.speed = speed
                lastMsg.loading = false
                msgs[lastIndex] = lastMsg
                return {
                    ...item,
                    messages: msgs
                }
            }
            return item
        })
        return {
            conversations: newConversations
        }
    })


}),{
    name: 'chat-storage',
    partialize: (state) => ({
        conversations: state.conversations,
        currentChatId: state.currentChatId,
    }),
    // 合并持久化状态时，确保 currentChatId 有效
    merge: (persistedState, currentState) => {
        const persisted = persistedState || {}
        const conversations = persisted.conversations || currentState.conversations
        let currentChatId = persisted.currentChatId ?? currentState.currentChatId
        // 确保 currentChatId 指向一个存在的对话
        if (!conversations.find(c => c.id == currentChatId)) {
            currentChatId = conversations[0]?.id ?? currentState.currentChatId
        }
        return {
            ...currentState,
            ...persisted,
            conversations,
            currentChatId,
        }
    }
}))