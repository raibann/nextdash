'use client'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { getUrlSuggestions } from '@/server/actions/page-actions'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useRef, useState, useCallback, useEffect } from 'react'

// Url input component with suggestions
type PagesUrlInputWithSuggestionsProps = {
  value: string
  onChange: (value: string) => void
  fieldState: {
    invalid: boolean
    error?: { message?: string }
  }
}

export default function PagesUrlInputWithSuggestions({
  value,
  onChange,
  fieldState,
}: PagesUrlInputWithSuggestionsProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const commandRef = useRef<HTMLDivElement>(null)

  // Fetch all pages once when component mounts
  const { data: allPagesData, isLoading: isSuggestionsLoading } = useQuery({
    queryKey: ['url-suggestions-all'],
    queryFn: getUrlSuggestions,
  })

  // Filter suggestions on client side based on input value
  const filteredPages = useMemo(() => {
    const allPages = allPagesData?.data || []

    if (!value || value.trim().length === 0) {
      return allPages
    }

    const searchLower = value.toLowerCase().trim()
    return allPages.filter(
      (page) =>
        page.url?.toLowerCase().includes(searchLower) ||
        (page.name && page.name.toLowerCase().includes(searchLower))
    )
  }, [value, allPagesData?.data])

  const allPages = allPagesData?.data || []

  const showSuggestions =
    isFocused && value.trim().length > 0 && allPages.length > 0

  // Ensure selected index is valid
  const validSelectedIndex =
    selectedIndex >= 0 && selectedIndex < filteredPages.length
      ? selectedIndex
      : -1

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      // Defer all updates to avoid render conflicts
      setTimeout(() => {
        onChange(suggestion)
        setIsFocused(false)
        setSelectedIndex(-1)
        inputRef.current?.focus()
      }, 0)
    },
    [onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || filteredPages.length === 0) {
        return
      }

      // Handle Escape key to close suggestions
      if (e.key === 'Escape') {
        setIsFocused(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        return
      }

      // Handle Arrow Down
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < filteredPages.length - 1 ? prev + 1 : 0
        )
        return
      }

      // Handle Arrow Up
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredPages.length - 1
        )
        return
      }

      // Handle Enter to select highlighted suggestion
      if (e.key === 'Enter' && validSelectedIndex >= 0) {
        e.preventDefault()
        const selectedPage = filteredPages[validSelectedIndex]
        if (selectedPage) {
          handleSuggestionClick(selectedPage.url || '')
        }
        return
      }
    },
    [showSuggestions, filteredPages, validSelectedIndex, handleSuggestionClick]
  )

  // Reset selected index when user starts typing (value changes)
  // Only reset if there was a selection, and do it in the next tick
  const handleInputChangeWithReset = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onChange(newValue)
      // Reset selection when typing (deferred to avoid render conflicts)
      if (selectedIndex >= 0) {
        setTimeout(() => {
          setSelectedIndex(-1)
        }, 0)
      }
    },
    [onChange, selectedIndex]
  )

  // Scroll selected item into view
  useEffect(() => {
    if (validSelectedIndex >= 0 && commandRef.current) {
      const selectedItem = commandRef.current.querySelector(
        `[data-selected="true"]`
      )
      if (selectedItem) {
        selectedItem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    }
  }, [validSelectedIndex])

  return (
    <div className='relative'>
      <Input
        ref={inputRef}
        id='page-Url'
        placeholder='Enter page Url (e.g., dashboard)'
        aria-invalid={fieldState.invalid}
        autoComplete='off'
        value={value}
        onChange={handleInputChangeWithReset}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsFocused(true)
        }}
        onBlur={() => {
          // Delay closing to allow clicking on suggestions
          setTimeout(() => {
            setIsFocused(false)
          }, 200)
        }}
      />
      {showSuggestions && (
        <div
          ref={commandRef}
          className='absolute z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md'
          onKeyDown={(e) => {
            // Prevent default to allow our Input to handle keyboard events
            if (
              e.key === 'ArrowDown' ||
              e.key === 'ArrowUp' ||
              e.key === 'Enter' ||
              e.key === 'Escape'
            ) {
              e.preventDefault()
            }
          }}
        >
          <Command shouldFilter={false}>
            <CommandList>
              {isSuggestionsLoading ? (
                <div className='p-2 text-sm text-muted-foreground'>
                  Loading suggestions...
                </div>
              ) : (
                <>
                  {filteredPages.length === 0 && value.trim().length > 0 ? (
                    <CommandEmpty>No suggestions found.</CommandEmpty>
                  ) : null}
                  {filteredPages.length > 0 && (
                    <CommandGroup>
                      {filteredPages.map((page, index) => (
                        <CommandItem
                          key={page.id}
                          value={page.url || ''}
                          onSelect={() => handleSuggestionClick(page.url || '')}
                          data-selected={index === validSelectedIndex}
                          className={
                            index === validSelectedIndex
                              ? 'bg-accent text-accent-foreground'
                              : ''
                          }
                        >
                          <div className='flex flex-col'>
                            <div className='font-medium'>{page.url || ''}</div>
                            {page.name && (
                              <div className='text-xs text-muted-foreground'>
                                {page.name}
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
