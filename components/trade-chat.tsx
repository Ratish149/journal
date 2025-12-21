"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { journalApi } from "@/lib/api"
import { JournalEntry } from "@/types/journal"
import { format } from "date-fns"
import { Bot, Loader2, MessageSquare, Send, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface TradeChatProps {
  entry: JournalEntry
  onUpdate: (updatedEntry: JournalEntry) => void
}

export function TradeChat({ entry, onUpdate }: TradeChatProps) {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entry.chats, isOpen])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!message.trim() || sending) return

    const currentMessage = message
    setMessage("")
    setSending(true)

    try {
      const updatedEntry = await journalApi.sendMessage(entry.id, currentMessage)
      onUpdate(updatedEntry)
    } catch (error) {
      console.error("Failed to send message:", error)
      setMessage(currentMessage) // Restore message on failure
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-none">
      {/* Floating Chat Window */}
      {isOpen && (
        <Card className="w-[360px] md:w-[400px] h-[550px] bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] rounded-[24px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300 pointer-events-auto">
          <CardHeader className="border-b border-slate-100/60 bg-white/40 px-5 py-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-800">AI Assistant</CardTitle>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Online</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-9 w-9 p-0 hover:bg-slate-100 rounded-xl text-slate-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth bg-gradient-to-b from-transparent to-slate-50/30"
          >
            {entry.chats && entry.chats.length > 0 ? (
              entry.chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-300`}
                >
                  <div
                    className={`flex max-w-[85%] gap-2.5 ${
                      chat.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div className="space-y-1">
                      <div
                        className={`p-3.5 rounded-2xl shadow-sm text-[13px] leading-relaxed ${
                          chat.role === "user"
                            ? "bg-indigo-600 text-white rounded-tr-none"
                            : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                        }`}
                      >
                        {chat.content}
                      </div>
                      <div className={`text-[10px] text-slate-400 font-medium px-1 ${
                        chat.role === "user" ? "text-right" : "text-left"
                      }`}>
                        {format(new Date(chat.created_at), "h:mm a")}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100/50">
                  <MessageSquare className="h-10 w-10 text-indigo-300" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">Ask your mentor</h4>
                  <p className="text-slate-500 text-xs mt-1 max-w-[200px]">
                    How could I have handled this trade better?
                  </p>
                </div>
              </div>
            )}
            {sending && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="flex max-w-[85%] gap-2.5">
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
    
          <CardFooter className="p-4 pt-0 bg-white/40">
            <form onSubmit={handleSend} className="flex w-full gap-2 relative">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
                className="flex-1 h-11 bg-white border-slate-200/60 focus:ring-indigo-500/20 rounded-xl pr-10 text-xs shadow-sm"
              />
              <Button 
                type="submit" 
                disabled={sending || !message.trim()}
                className="absolute right-1 top-1 h-9 w-9 p-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all active:scale-95"
              >
                {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      {/* Floating Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto transition-all duration-500 ${
          isOpen 
            ? "bg-slate-800 hover:bg-slate-900 rotate-90 scale-90" 
            : "bg-indigo-600 hover:bg-indigo-700 scale-100 hover:scale-110"
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <Bot className="h-7 w-7 text-white" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 border-2 border-indigo-600 rounded-full" />
          </div>
        )}
      </Button>
    </div>
  )
}
