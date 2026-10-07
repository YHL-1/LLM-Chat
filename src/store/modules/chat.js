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

    currentChatId: 1790309488509,
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
            if(conversation.id===conversationId&&newTitle.trim()){
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

    removeConversation: (conversationId)=>set((state)=>{
        const updatedConversations=state.conversations.filter((conversation)=>conversation.id!==conversationId)
        let newCurrentChatId=state.currentChatId
        if(updatedConversations.length===0){
            state.createConversation()
        }else if(state.currentChatId===conversationId){
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
            if(item.id===state.currentChatId){
                const msgs = [...item.messages]
                const lastIndex = msgs.length -1
                if(lastIndex < 0) return item
                const lastMsg = {...msgs[lastIndex]}
                lastMsg.content = content
                lastMsg.reasoning_content = reasoning_content
                lastMsg.completion_tokens = completion_tokens
                lastMsg.speed = speed
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


})))