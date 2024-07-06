'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { debounce } from 'lodash'

interface Tag {
    id: string;
    name: string;
}

interface SearchFilterProps {
    onFilterChange: (filters: any) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onFilterChange }) => {
    const [query, setQuery] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [date, setDate] = useState<Date | null>(null)
    const [isPaid, setIsPaid] = useState<boolean | null>(null)
    const [availableTags, setAvailableTags] = useState<Tag[]>([])
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch('/api/tags')
                if (response.ok) {
                    const data = await response.json()
                    setAvailableTags(data)
                }
            } catch (error) {
                console.error('Error fetching tags:', error)
            }
        }
        fetchTags()
    }, [])

    const debouncedFilterChange = useCallback(
        debounce((filters) => {
            onFilterChange(filters);
        }, 300),
        [onFilterChange]
    );

    useEffect(() => {
        const filters: any = {};
        if (query) filters.search = query;
        if (tags.length > 0) filters.category = tags.join(',');
        if (date) filters.date = date.toISOString();
        if (isPaid !== null) filters.isPaid = isPaid.toString();

        debouncedFilterChange(filters);

        // Mise à jour de l'URL
        const params = new URLSearchParams(searchParams)
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value as string)
            } else {
                params.delete(key)
            }
        })
        router.push(`?${params.toString()}`, { scroll: false })
    }, [query, tags, date, isPaid, debouncedFilterChange, router, searchParams])

    const handleTagChange = (tagName: string) => {
        setTags(prev =>
            prev.includes(tagName)
                ? prev.filter(t => t !== tagName)
                : [...prev, tagName]
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
                type="text"
                placeholder="Rechercher un événement..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Select onValueChange={handleTagChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent>
                    {availableTags.map(tag => (
                        <SelectItem key={tag.id} value={tag.name}>
                            {tag.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'dd MMMM yyyy', { locale: fr }) : <span>Sélectionner une date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date as Date | undefined}
                        onSelect={(newDate) => setDate(newDate || null)}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            <div className="flex items-center space-x-4 mr-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isPaid"
                        checked={isPaid === true}
                        onCheckedChange={(checked) => setIsPaid(checked ? true : null)}
                    />
                    <label htmlFor="isPaid">Payant</label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isFree"
                        checked={isPaid === false}
                        onCheckedChange={(checked) => setIsPaid(checked ? false : null)}
                    />
                    <label htmlFor="isFree">Gratuit</label>
                </div>
            </div>
        </div>
    )
}

export default SearchFilter