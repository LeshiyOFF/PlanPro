import React from 'react'
import { IHelpBlockItemProps } from '@/types/help'

/**
 * Компонент отдельного блока справки
 * Отображает иконку с фоном, заголовок и описание
 */
export const HelpBlockItem: React.FC<IHelpBlockItemProps> = ({ block, index }) => {
  return (
    <div 
      key={index} 
      className="flex items-start gap-4 group"
    >
      {/* Иконка с цветным фоном */}
      <div 
        className={`
          mt-1 flex-shrink-0 p-2.5 rounded-xl 
          transition-all duration-200
          group-hover:scale-105 group-hover:shadow-md
          ${block.iconBg} ${block.iconColor}
        `}
      >
        {block.icon}
      </div>
      
      {/* Контент блока */}
      <div className="space-y-2 flex-1 min-w-0">
        <h4 className="text-sm font-black text-slate-900 leading-tight">
          {block.title}
        </h4>
        <div className="text-[13px] text-slate-600 leading-relaxed font-medium space-y-2">
          {block.content}
        </div>
      </div>
    </div>
  )
}

HelpBlockItem.displayName = 'HelpBlockItem'
