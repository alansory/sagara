import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, Globe, Menu, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  icon: React.ReactNode
  isNew?: boolean
}

const AirbnbHeader: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Homes")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const navRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const [underlineStyle, setUnderlineStyle] = useState({
    left: 0,
    width: 0,
  })

  // Update underline position based on active tab
  useEffect(() => {
    const activeElement = navRefs.current[activeTab]
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement
      setUnderlineStyle({
        left: offsetLeft,
        width: offsetWidth,
      })
    }
  }, [activeTab])

  // Handle clicks outside search to unfocus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const navItems: NavItem[] = [
    {
      label: "Homes",
      icon: (
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor">
          <path d="M16 1c8.284 0 15 6.716 15 15 0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15C1 7.716 7.716 1 16 1zm0 2C8.82 3 3 8.82 3 16s5.82 13 13 13 13-5.82 13-13S23.18 3 16 3zm-4.9 14.05V22h2v-3h2v3h2v-3h2v3h2v-4.95l-5-4.714-5 4.714z" />
        </svg>
      ),
    },
    {
      label: "Experiences",
      icon: (
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor">
          <path d="M16 0c1.494 0 2.713 1.082 2.968 2.496l.032.296V11.44l.558-.121c.323-.07.655-.106.992-.106 2.626 0 4.758 2.131 4.758 4.758 0 2.626-2.131 4.758-4.758 4.758-.338 0-.671-.036-.995-.108l-.555-.12v7.108c0 1.495-1.082 2.713-2.496 2.968l-.296.032H8.791c-1.494 0-2.713-1.082-2.968-2.496L5.791 28V16.6l-.555.12c-.323.07-.655.106-.992.106-2.626 0-4.758-2.131-4.758-4.758 0-2.626 2.131-4.758 4.758-4.758.338 0 .671.036.995.108l.555.12V4c0-1.495 1.082-2.713 2.496-2.968L8.592 1h7.408zm-1.282 17.757v-.001h-5.93l.002 10.244c0 .43.105.767.3.991a.93.93 0 0 0 .705.306h5.923v-5h-1v3.999h-4.92c-.364 0-.61-.347-.621-.752L9.174 27.5V19h5.544zM21.719 16a2.781 2.781 0 0 0-2.781 2.781 2.781 2.781 0 1 0 5.562 0A2.781 2.781 0 0 0 21.719 16zm-11.5 0a2.781 2.781 0 0 0-2.781 2.781 2.781 2.781 0 1 0 5.562 0A2.781 2.781 0 0 0 10.22 16zm5.5-14h-5.93c-.324 0-.576.127-.742.306-.166.179-.271.42-.279.706L8.765 3.067l.004 8.686 1.005.216.5.002h5.445V3zm1 0v9h5.93c.364 0 .61.347.621.752l.003.054v8.447h-5.544V12h-1v5h5.93c.324 0 .576-.127.742-.306.166-.179.271-.42.279-.706l.003-.055V3.067c0-.43-.105-.767-.3-.991a.93.93 0 0 0-.705-.306h-5.959z" />
        </svg>
      ),
      isNew: true,
    },
    {
      label: "Services",
      icon: (
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor">
          <path d="M26 2a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h20zm0 2H6a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-8.5 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM18 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM8 10a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3zm11.5 2.5c.405 0 .8.041 1.183.12l-3.196 2.932A4.47 4.47 0 0 1 16 19.5c-.412 0-.811-.056-1.19-.161l3.189-2.936c.474.064.97.097 1.5.097zm5.5-4.5a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
        </svg>
      ),
      isNew: true,
    },
  ]

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1000 1000"
              className="h-8 w-8 text-[#FF385C]"
              fill="currentColor"
            >
              <path d="M499.9 237.8c-75.6 0-137 61.3-137 137 0 75.6 61.3 137 137 137s137-61.3 137-137c0-75.7-61.4-137-137-137zm326.9 344.1c-2.2-55.8-33.3-107.7-83.1-139.1L611.4 334.6c-26.4-18-57.1-27.6-88-27.6s-61.6 9.5-88 27.6L303.2 443c-49.9 31.4-81.1 83.2-83.2 139.1-1.3 34.4 2.2 157.2 161.3 292.8 44.2 37.5 88.7 67.9 131.9 90.4h8.6c43.7-23.4 88.2-53.8 131.9-90.4 159.1-135.5 162.5-258.3 161.2-292.8l-.1-.2z" />
            </svg>
            <span className="ml-2 text-[#FF385C] font-bold text-xl hidden sm:inline">airbnb</span>
          </div>

          {/* Middle Navigation */}
          <nav className="hidden md:block">
            <div className="flex relative">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  ref={(el) => (navRefs.current[item.label] = el)}
                  onClick={() => setActiveTab(item.label)}
                  className={cn(
                    "px-6 py-2 relative flex items-center gap-1",
                    activeTab === item.label ? "text-black" : "text-gray-500",
                  )}
                >
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.isNew && (
                        <span className="bg-[#222222] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {/* Animated underline */}
              <div
                className="absolute bottom-0 h-[2px] bg-[#222222] transition-all duration-300 ease-in-out"
                style={{
                  left: `${underlineStyle.left}px`,
                  width: `${underlineStyle.width}px`,
                }}
              />
            </div>
          </nav>

          {/* Right Side Profile & Settings */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-sm font-medium hover:bg-gray-100 rounded-full px-4 py-2">
              Become a host
            </button>
            <button className="hover:bg-gray-100 p-2 rounded-full">
              <Globe className="h-5 w-5" />
            </button>
            <button className="flex items-center gap-2 border border-gray-300 rounded-full p-1 pl-3 pr-1 hover:shadow-md transition-shadow">
              <Menu className="h-4 w-4" />
              <div className="bg-gray-500 text-white rounded-full p-1">
                <User className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div
          ref={searchContainerRef}
          className={cn(
            "relative max-w-3xl mx-auto transition-all duration-200 ease-in-out mb-4",
            isSearchFocused ? "scale-105 shadow-xl" : "shadow-md",
          )}
        >
          <div
            className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden"
            onClick={() => setIsSearchFocused(true)}
          >
            <div className="flex-1 min-w-0 border-r border-gray-300 px-6 py-3">
              <div className="text-xs font-bold">Where</div>
              <input
                type="text"
                placeholder="Search destinations"
                className="w-full text-sm text-gray-900 focus:outline-none bg-transparent"
              />
            </div>
            <div className="hidden sm:block flex-1 min-w-0 border-r border-gray-300 px-6 py-3">
              <div className="text-xs font-bold">Check in</div>
              <div className="text-sm text-gray-500">Add dates</div>
            </div>
            <div className="hidden sm:block flex-1 min-w-0 border-r border-gray-300 px-6 py-3">
              <div className="text-xs font-bold">Check out</div>
              <div className="text-sm text-gray-500">Add dates</div>
            </div>
            <div className="hidden sm:block flex-1 min-w-0 px-6 py-3">
              <div className="text-xs font-bold">Who</div>
              <div className="text-sm text-gray-500">Add guests</div>
            </div>
            <button className="flex-shrink-0 bg-[#FF385C] text-white rounded-full p-3 m-2">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AirbnbHeader