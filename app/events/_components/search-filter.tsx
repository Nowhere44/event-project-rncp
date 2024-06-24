'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { Checkbox } from '@/components/ui/checkbox'
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
        <div className="flex flex-col md:flex-row gap-4">
            <Input
                type="text"
                placeholder="Rechercher un événement..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full md:w-[300px]"
            />
            <Select onValueChange={handleTagChange}>
                <SelectTrigger className="w-full md:w-[200px]">
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
            <DatePicker
                selected={date}
                onChange={(date: Date | null) => setDate(date)}
                placeholderText="Sélectionner une date"
                className="w-full md:w-[200px] p-2 border rounded"
            />
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
    )
}

export default SearchFilter