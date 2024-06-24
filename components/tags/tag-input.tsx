import React, { useState } from 'react';
import { Input } from '../ui/input';

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    error?: string;
}

const TagInput: React.FC<TagInputProps> = ({ value, onChange, placeholder, error }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue) {
            e.preventDefault();
            onChange([...value, inputValue]);
            setInputValue('');
        }
    };

    return (
        <div>
            <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || "Ajouter un tag"}
                error={error}
            />
            <div>
                {value.map((tag, index) => (
                    <span key={index} className="mr-2 bg-gray-200 px-2 py-1 rounded">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default TagInput;